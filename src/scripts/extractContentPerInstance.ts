import axios from "axios";
import html2pdf from "html-pdf-node";
import fs from "fs-extra";
import hb from "handlebars";
import path from "path";
import { client } from "../graphql/client";
import puppeteer from "puppeteer";
import { GET_DATA_INSTANCE } from "../graphql/queries/getDataInstance";
import xlsx from "xlsx";
import { environments } from "../environments";
import { normalizeName } from "../utils/normalizeString";

export const extractContentPerInstance = async (clientId: string) => {
  console.log("Getting Data");
  const { courses } = await client.request(GET_DATA_INSTANCE, {
    clientId,
  });
  console.log("Reading File");
  const wb = xlsx.readFile("Courses.xlsx");
  const sheets = wb.SheetNames;
  const data = xlsx.utils
    .sheet_to_json(wb.Sheets[sheets[0]])
    .map((i: any) => ({ name: i["Nombre del Curso "] }));
  const coursesToDownload: any[] = [];
  const forumTasks: any[] = [];
  let counter = 0;
  data.forEach((c: any) => {
    const finded = courses.filter((i: any) => {
      return i.name.trimEnd() === c.name.trimEnd();
    });
    if (finded.length) {
      coursesToDownload.push(finded[0]);
    }
  });

  const coursesNoScorm = coursesToDownload.filter((c: any) => {
    const { lessons: l } = c;
    const finded = l.filter((l: any) => l.type === "A");
    return !finded.length;
  });

  console.log("Data Ready");
  for (let i = 0; i < coursesNoScorm.length; i++) {
    const { lessons, name: courseName, course_fb } = coursesNoScorm[i];
    console.log(`${i}.- ${courseName} - ${course_fb}`);
    const courseNameReady = normalizeName(courseName);

    const courseFolderPath = path.resolve(
      __dirname,
      `../../coursesResources/${courseNameReady}-${course_fb}`
    );
    const courseFolderExist = await fs.pathExists(courseFolderPath);

    if (!courseFolderExist) {
      await fs.mkdirs(courseFolderPath);
    }

    for (const lesson of lessons) {
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
      } = lesson;

      console.log(`${name} - ${lesson_fb}`);
      const nameModuleReady = normalizeName(module?.name);

      const nameLessonReady = normalizeName(name || "Leccion sin nombre");

      const modulePath = `${courseFolderPath}/${nameModuleReady}-${module_id}`;
      if (["L", "H", "E", "V", "S"].includes(type)) {
        const modulePathExist = await fs.pathExists(modulePath);

        if (!modulePathExist) {
          await fs.mkdir(modulePath);
        }
      }
      if (type !== "L" && subtype !== "HTML") continue;
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
        continue;
        const lecturePathExist = await fs.pathExists(`${modulePath}/lecturas`);
        if (!lecturePathExist) {
          await fs.mkdir(`${modulePath}/lecturas`);
        }
        console.log("Downloading Lecture type PDF");
        const response = await axios.get(lecture.pdfUrl, {
          responseType: "arraybuffer",
        });
        await fs.writeFile(
          `${modulePath}/lecturas/lecture-${nameLessonReady}.pdf`,
          response.data
        );
        console.log("Download End");
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
        const html = lecture.htmlBlob;
        const browser = await puppeteer.launch({ headless: "new" });
        const page = await browser.newPage();
        await page.setContent(html);
        await page.pdf({
          path: `${modulePath}/lecturas/${nameLessonReady}-${lesson_fb}.pdf`,
        });
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

      // if ((type === "F" || type === "T") && description) {
      //   forumTasks.push({
      //     ...lesson,
      //     courseName,
      //     moduleName: module?.name || "",
      //   });
      // }
    }
  }

  // const coursesTypeScorm = xlsx.utils.json_to_sheet(
  //   coursesToDownload
  //     .filter((c: any) => {
  //       const { lessons: lc } = c;
  //       const f = lc.find((l: any) => l.type === "A");
  //       return f;
  //     })
  //     .map((c: any) => {
  //       return {
  //         "Id del curso": c.course_fb,
  //         "Nombre del Curso": c.name,
  //       };
  //     })
  // );
  // const coursesNoTypeScorm = xlsx.utils.json_to_sheet(
  //   coursesToDownload
  //     .filter((c: any) => {
  //       const { lessons: lc } = c;
  //       const find = lc.filter((l: any) => l.type === "A");
  //       return !find.length;
  //     })
  //     .map((c: any) => {
  //       return {
  //         "Id del curso": c.course_fb,
  //         "Nombre del Curso": c.name,
  //       };
  //     })
  // );
  // console.log({
  //   coursesToDownload: coursesToDownload.length,
  // });

  // const s = xlsx.utils.json_to_sheet(
  //   forumTasks.map((i) => ({
  //     "Id de la leccion": i.lesson_fb,
  //     "Nombre de la leccion": i.name,
  //     "Nombre del Modulo": i.moduleName,
  //     "Nombre del Curso": i.courseName,
  //   })),
  // );
  // const qs = xlsx.utils.json_to_sheet(
  //   questionsData.map((i) => ({
  //     "Id de la leccion": i.lessonId,
  //     "Tipo de Pregunta": i.qType,
  //     "Id de la pregunta": i.questionId,
  //     "Nombre de la leccion": i.lessonName,
  //     "Texto de la pregunta": i.textQuestion,
  //     "Imagen de la pregunta": i.imageUrl,
  //     Respuesta: i.answer,
  //   })),
  // );
  // const optsQ = xlsx.utils.json_to_sheet(
  //   optionsQuestions.map((i) => ({
  //     "Id de la pregunta": i.questionId,
  //     Texto: i.text,
  //     Explicacion: i.explain,
  //     Index: i.index,
  //   })),
  // );
  // const s2 = xlsx.utils.json_to_sheet(
  //   videos.map((v) => ({
  //     "Id de la leccion": v.lesson_fb,
  //     "Nombre de la leccion": v.name,
  //     "Nombre del Curso": v.courseName,
  //     "Nombre del modulo": v.moduleName,
  //     "Url del video":
  //       v.video.type === "Rotoplas" ? v.video.videoUrl : v.videoUrl,
  //   })),
  // );
  // const s3 = xlsx.utils.json_to_sheet(
  //   embedLessons.map((i) => ({
  //     "Id de la leccion": i.lesson_fb,
  //     "Nombre de la leccion": i.name,
  //     "Nombre del Curso": i.courseName,
  //     "Nombre del modulo": i.module.name,
  //     "Url del Recurso": i.embed_json.url,
  //   })),
  // );
  // const wbook = xlsx.utils.book_new();
  // const wbook2 = xlsx.utils.book_new();
  // xlsx.utils.book_append_sheet(wbook, s, "ForumTasks");
  // xlsx.utils.book_append_sheet(wbook, s2, "Videos");
  // xlsx.utils.book_append_sheet(wbook, s3, "Recursos Embebidos");
  // xlsx.utils.book_append_sheet(wbook, qs, "Preguntas de Evaluaciones");
  // xlsx.utils.book_append_sheet(wbook, optsQ, "Opciones de las Preguntas");
  // xlsx.utils.book_append_sheet(wbook2, coursesTypeScorm, "Cursos Scorms");
  // xlsx.utils.book_append_sheet(wbook2, coursesNoTypeScorm, "Cursos no Scorm");
  // xlsx.writeFile(wbook, "ForumTasks.xlsx");
  // xlsx.writeFile(wbook2, "CoursesScorm.xlsx");
};
