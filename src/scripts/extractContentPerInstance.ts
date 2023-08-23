import axios from "axios";
import html2pdf from "html-pdf-node";
import fs from "fs-extra";
import hb, { ICompiler } from "handlebars";
import path from "path";
import { client } from "../graphql/client";
import puppeteer from "puppeteer";
import { GET_DATA_INSTANCE } from "../graphql/queries/getDataInstance";
import xlsx from "xlsx";
import { environments } from "../environments";
import { normalizeName } from "../utils/normalizeString";
import { lessonTypes } from "../DataTypes/lessonTypes";
import { ICourse } from "../interfaces/lesson";

export const extractContentPerInstance = async (clientId: string) => {
  console.log("-------GETTING DATA");
  const { courses } = await client.request<{ courses: ICourse[] }>(
    GET_DATA_INSTANCE,
    {
      clientId,
    }
  );
  console.log("-------READING FILE OF COURSES");
  const wb = xlsx.readFile("Courses.xlsx");
  const sheets = wb.SheetNames;
  const data = xlsx.utils
    .sheet_to_json(wb.Sheets[sheets[0]])
    .map((i: any) => ({ name: i["Nombre del Curso "] }));
  const coursesToDownload: ICourse[] = [];
  data.forEach((c: any) => {
    const finded = courses.filter((i: any) => {
      return (
        i.name.trimEnd().trimStart() === c.name.trimEnd().trimStart() &&
        i.users_course.length > 0
      );
    });
    if (finded.length === 1) {
      coursesToDownload.push(finded[0]);
    }
  });

  const coursesWithScorms = coursesToDownload.filter((c: any) => {
    const { lessons } = c;
    const lScorms = lessons.filter((l: any) => l.type === "A");
    return lScorms.length;
  });
  const coursesNoScorms = coursesToDownload.filter((c: any) => {
    const { lessons } = c;
    const lScorms = lessons.filter((l: any) => l.type === "A");
    return !lScorms.length;
  });
  const cTotal = [...coursesNoScorms, ...coursesWithScorms];
  console.log(`-------COURSES TO DOWNLOAD -----> ${cTotal.length}`);

  console.log("-------DATA READY");
  for (let i = 0; i < cTotal.length; i++) {
    const { lessons, name: courseName, course_fb } = coursesToDownload[i];
    console.log(`${i}.- ${courseName} - ${course_fb}`);
    if (!lessons.length) {
      console.log(
        `THIS COURSE DOSENT HAVE LESSONS ${courseName} - ${course_fb}`
      );
      continue;
    }
    const courseNameReady = normalizeName(courseName);

    const courseFolderPath = path.resolve(
      __dirname,
      `../../coursesResources/${i + 1}.- ${courseNameReady}-${course_fb}`
    );
    const courseFolderExist = await fs.pathExists(courseFolderPath);

    if (!courseFolderExist) {
      await fs.mkdirs(courseFolderPath);
    }

    const acceptedLessons = lessons.filter((l) => {
      return (
        ["L", "H", "E", "V", "S", "F", "T"].includes(l.type) ||
        (l.type === "A" && l.html)
      );
    });

    const w1 = xlsx.utils.book_new();
    const s1 = xlsx.utils.json_to_sheet(
      acceptedLessons
        .map((l) => {
          const { type, name, module, module_id, lesson_fb, index } = l;
          return {
            "Id de la leccion": lesson_fb,
            "Id del modulo": module_id,
            "Nombre de la leccion": name,
            "Nombre del Modulo": module.name,
            "Tipo de recurso": lessonTypes[type],
            Orden: index + 1,
          };
        })
        .sort((a, b) => a.Orden - b.Orden)
    );

    xlsx.utils.book_append_sheet(w1, s1, "Recursos");
    await xlsx.writeFile(w1, `${courseFolderPath}/Resources-${course_fb}.xlsx`);

    for (const lesson of acceptedLessons) {
      const {
        type,
        subtype,
        lecture,
        name,
        module,
        module_id,
        description,
        video,
        lesson_fb,
        questions,
        embed_json,
        html,
      } = lesson;

      console.log(`-------${name} - ${lesson_fb}`);
      const nameModuleReady = normalizeName(module?.name);

      const nameLessonReady = normalizeName(name || "Leccion sin nombre");

      const modulePath = `${courseFolderPath}/${nameModuleReady}-${module_id}`;
      const modulePathExist = await fs.pathExists(modulePath);

      if (!modulePathExist) {
        await fs.mkdir(modulePath);
      }
      if (type === "S") {
        const surveyDirExist = await fs.pathExists(`${modulePath}/encuestas`);
        if (!surveyDirExist) {
          await fs.mkdir(`${modulePath}/encuestas`);
        }
        const questionsData: any[] = [];
        const optionsData: any[] = [];
        for (const q of questions) {
          const { options, question_fb, text, image_url, answer } = q;
          let qType = "";
          switch (q.type) {
            case "MULTIPLE":
              qType = "Opcion Multiple";
              break;

            case "SURVEY":
              qType = "Opcion Multiple";
              break;

            case "PHOTO":
              qType = "Imagen";
              break;

            case "RELATION":
              qType = "Relacion";
              break;
            default:
              break;
          }

          questionsData.push({
            courseName,
            courseId: course_fb,
            qType,
            imageUrl: image_url,
            lessonId: lesson_fb,
            questionId: question_fb,
            lessonName: name,
            textQuestion: text,
            answer,
          });
          for (const opt of options) {
            optionsData.push({ ...opt, questionId: question_fb });
          }
        }
        const b1 = xlsx.utils.book_new();
        const dataForExcel = questionsData.map((q: any) => ({
          "Id de la leccion": lesson_fb,
          "Id de la pregunta": q.questionId,
          "Nombre de la Leccion": name,
          "Nombre del Curso": courseName,
          "Nombre del Modulo": module?.name || "",
          "Tipo de pregunta": q.qType,
          "Texto de la pregunta": q.textQuestion,
        }));
        const s1 = xlsx.utils.json_to_sheet(dataForExcel);
        const s2 = xlsx.utils.json_to_sheet(
          optionsData.map((opt: any) => ({
            "Id de la pregunta": opt.questionId,
            Text: opt.text,
            Explicacion: opt.explain,
            Indice: opt.index,
          }))
        );
        xlsx.utils.book_append_sheet(b1, s1, "Preguntas");
        xlsx.utils.book_append_sheet(b1, s2, "Opciones");
        xlsx.writeFile(
          b1,
          `${modulePath}/encuestas/${nameLessonReady}-${lesson_fb}.xlsx`
        );
      }
      if (type === "H") {
        const embededDirExist = await fs.pathExists(`${modulePath}/embeded`);
        if (!embededDirExist) {
          await fs.mkdir(`${modulePath}/embeded`);
        }
        const b1 = xlsx.utils.book_new();
        const s1 = xlsx.utils.json_to_sheet([
          {
            "Id de la leccion": lesson_fb,
            "Nombre de la Leccion": name,
            "Nombre del Curso": courseName,
            "Nombre del Modulo": module?.name || "",
            "Url del Recurso": embed_json.url,
          },
        ]);
        xlsx.utils.book_append_sheet(b1, s1, "Embebidos");
        await xlsx.writeFile(
          b1,
          `${modulePath}/embeded/${nameLessonReady}-${lesson_fb}.xlsx`
        );
      }

      if (type === "L" && subtype === "PDF" && lecture.pdfUrl) {
        const lecturePathExist = await fs.pathExists(`${modulePath}/lecturas`);
        if (!lecturePathExist) {
          await fs.mkdir(`${modulePath}/lecturas`);
        }
        console.log("-------DOWNLOADING LECTURE TYPE PDF");
        const response = await axios.get(lecture.pdfUrl, {
          responseType: "arraybuffer",
        });
        await fs.writeFile(
          `${modulePath}/lecturas/lecture-${nameLessonReady}.pdf`,
          response.data
        );
        console.log("-------DOWNLOAD END");
      }

      if (type === "A") {
        if (!html) {
          console.log(
            `ALERT!!!!! ${name}-${lesson_fb}-${course_fb} DOSENT HAVE SCORM HTML`
          );
          continue;
        }

        const scormPathExist = await fs.pathExists(`${modulePath}/scorms`);
        if (!scormPathExist) {
          await fs.mkdir(`${modulePath}/scorms`);
        }
        const url = `${environments.SERVER_SCORMS_URL}/${html.folderName}`;

        const response = await axios.get(url, { responseType: "arraybuffer" });
        await fs.writeFile(
          `${modulePath}/scorms/scorm-${nameLessonReady}-${lesson_fb}.zip`,
          response.data
        );
        console.log("Scorm Ready");
      }

      if (type === "E") {
        const evaluationDirExist = await fs.pathExists(
          `${modulePath}/evaluaciones`
        );
        if (!evaluationDirExist) {
          await fs.mkdir(`${modulePath}/evaluaciones`);
        }
        const questionsData: any[] = [];
        const optionsData: any[] = [];
        for (const q of questions) {
          const { options, question_fb, text, image_url, answer } = q;
          let qType = "";
          switch (q.type) {
            case "MULTIPLE":
              qType = "Opcion Multiple";
              break;

            case "SURVEY":
              qType = "Opcion Multiple";
              break;

            case "PHOTO":
              qType = "Imagen";
              break;

            case "RELATION":
              qType = "Relacion";
              break;
            default:
              break;
          }

          questionsData.push({
            courseName,
            courseId: course_fb,
            qType,
            imageUrl: image_url,
            lessonId: lesson_fb,
            questionId: question_fb,
            lessonName: name,
            textQuestion: text,
            answer,
          });
          for (const opt of options) {
            optionsData.push({ ...opt, questionId: question_fb });
          }
        }
        const b1 = xlsx.utils.book_new();
        const dataForExcel = questionsData.map((q: any) => ({
          "Id de la leccion": lesson_fb,
          "Id de la pregunta": q.questionId,
          "Nombre de la Leccion": name,
          "Nombre del Curso": courseName,
          "Nombre del Modulo": module?.name || "",
          "Tipo de pregunta": q.qType,
          "Texto de la pregunta": q.textQuestion,
          "Imagen de la pregunta": q.imageUrl,
          Respuesta: q.answer,
        }));
        const s1 = xlsx.utils.json_to_sheet(dataForExcel);
        const s2 = xlsx.utils.json_to_sheet(
          optionsData.map((opt: any) => ({
            "Id de la pregunta": opt.questionId,
            Text: opt.text,
            Explicacion: opt.explain,
            Indice: opt.index,
          }))
        );
        xlsx.utils.book_append_sheet(b1, s1, "Preguntas");
        xlsx.utils.book_append_sheet(b1, s2, "Opciones");
        xlsx.writeFile(
          b1,
          `${modulePath}/evaluaciones/${nameLessonReady}-${lesson_fb}.xlsx`
        );
      }

      if (type === "L" && subtype === "HTML") {
        const lecturePathExist = await fs.pathExists(`${modulePath}/lecturas`);
        if (!lecturePathExist) {
          await fs.mkdir(`${modulePath}/lecturas`);
        }
        console.log("-------DOWNLOADING LECTURE TYPE HTML");
        const html = lecture.htmlBlob;
        const browser = await puppeteer.launch({ headless: "new" });
        const page = await browser.newPage();
        await page.setContent(html);
        await page.pdf({
          path: `${modulePath}/lecturas/${nameLessonReady}-${lesson_fb}.pdf`,
        });
        await browser.close();
        console.log("-------DOWNLOAD END");
      }

      if (type === "V" && video) {
        const videosDirExist = await fs.pathExists(`${modulePath}/videos`);
        if (!videosDirExist) {
          await fs.mkdir(`${modulePath}/videos`);
        }
        const b1 = xlsx.utils.book_new();
        let s1: xlsx.WorkSheet;
        if (video.type === "Rotoplas") {
          s1 = xlsx.utils.json_to_sheet([
            {
              "Id de la leccion": lesson_fb,
              "Nombre de la Leccion": name,
              "Nombre del Curso": courseName,
              "Nombre del Modulo": module?.name || "",
              "Url del Video": video.videoUrl,
            },
          ]);
        }
        if (video.type === "Vimeo") {
          const { code } = video;
          const url = `https://api.vimeo.com/me/videos/${code}?fields=files`;
          const { data: vimeoData } = await axios.get(url, {
            headers: {
              Authorization: `bearer ${environments.VIMEO_ACCESS_TOKEN}`,
            },
          });
          for (const v of vimeoData.files) {
            if (v.rendition === "1080p")
              s1 = xlsx.utils.json_to_sheet([
                {
                  "Id de la leccion": lesson_fb,
                  "Nombre de la Leccion": name,
                  "Nombre del Curso": courseName,
                  "Nombre del Modulo": module?.name || "",
                  "Url del Video": v.link_secure,
                },
              ]);
          }
        }
        xlsx.utils.book_append_sheet(b1, s1!, "Videos");
        xlsx.writeFile(
          b1,
          `${modulePath}/videos/${nameLessonReady}-${lesson_fb}.xlsx`
        );
      }

      if (type === "T" && description) {
        const forosDirExist = await fs.pathExists(`${modulePath}/tareas`);
        if (!forosDirExist) {
          await fs.mkdir(`${modulePath}/tareas`);
        }
        console.log("-------DOWNLOADING TASK");
        const browser = await puppeteer.launch({ headless: "new" });
        const page = await browser.newPage();
        await page.setContent(description);
        await page.pdf({
          path: `${modulePath}/tareas/${nameLessonReady}-${lesson_fb}.pdf`,
        });
        await browser.close();
        console.log("-------DOWNLOAD END");
      }
      if (type === "F" && description) {
        const forosDirExist = await fs.pathExists(`${modulePath}/foros`);
        if (!forosDirExist) {
          await fs.mkdir(`${modulePath}/foros`);
        }
        console.log("-------DOWNLOADING FORO");
        const browser = await puppeteer.launch({ headless: "new" });
        const page = await browser.newPage();
        await page.setContent(description);
        await page.pdf({
          path: `${modulePath}/foros/${nameLessonReady}-${lesson_fb}.pdf`,
        });
        await browser.close();
        console.log("-------DOWNLOAD END");
      }
    }
  }
};
