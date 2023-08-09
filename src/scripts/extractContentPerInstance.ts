import axios from "axios";
import fs from "fs-extra";
import path from "path";
import { client } from "../graphql/client";
import { GET_DATA_INSTANCE } from "../graphql/queries/getDataInstance";
import xlsx from "xlsx";
import { environments } from "../environments";

export const extractContentPerInstance = async (clientId: string) => {
  const { courses } = await client.request(GET_DATA_INSTANCE, {
    clientId,
  });
  const wb = xlsx.readFile("Courses.xlsx");
  const sheets = wb.SheetNames;
  const data = xlsx.utils
    .sheet_to_json(wb.Sheets[sheets[0]])
    .map((i: any) => ({ name: i["Nombre del Curso "] }));
  const coursesToDownload: any[] = [];
  const forumTasks: any[] = [];
  const videos: any[] = [];
  const questionsData: any[] = [];
  const embedLessons: any[] = [];
  const optionsQuestions: any[] = [];
  let counter = 0;
  data.forEach((c: any) => {
    const finded = courses.filter((i: any) => {
      return i.name.trimEnd() === c.name.trimEnd();
    });
    if (finded.length) {
      coursesToDownload.push(finded[0]);
    }
  });

  for (const course of coursesToDownload) {
    const { lessons, name: courseName, course_fb } = course;
    const hasLectureLessons = lessons.find(
      (l: any) => l.type === "L" && l.subtype === "PDF",
    );

    const courseFolderPath = path.resolve(
      __dirname,
      `../../coursesResources/${courseName.trimStart().trimEnd()}-${course_fb}`,
    );
    if (hasLectureLessons) {
      const courseFolderExist = await fs.pathExists(courseFolderPath);

      if (!courseFolderExist) {
        await fs.mkdirs(courseFolderPath);
      }
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
      } = lesson;

      if (type === "H") {
        embedLessons.push({ ...lesson, courseName });
      }

      if (type === "L" && subtype === "PDF" && lecture.pdfUrl) {
        continue;
        const modulePath = `${courseFolderPath}/${module?.name
          .trimStart()
          .trimEnd()
          .replace("/", "")}-${module_id}`;

        const modulePathExist = await fs.pathExists(modulePath);

        if (!modulePathExist) {
          await fs.mkdir(modulePath);
        }
        const lecturePathExist = await fs.pathExists(`${modulePath}/lectures`);
        if (!lecturePathExist) {
          await fs.mkdir(`${modulePath}/lectures`);
        }
        console.log("Downloading Lecture type PDF");
        const response = await axios.get(lecture.pdfUrl, {
          responseType: "arraybuffer",
        });
        await fs.writeFile(
          `${modulePath}/lectures/lecture-${name}.pdf`,
          response.data,
        );
        console.log("Download End");
      }

      if (type === "E") {
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
            optionsQuestions.push({ ...opt, questionId: question_fb });
          }
        }
      }

      if (type === "L" && subtype === "HTML") {
        forumTasks.push({ ...lesson, courseName, moduleName: module.name });
      }

      if (type === "V" && video) {
        // if (video.type === "Rotoplas")
        //   videos.push({ ...lesson, courseName, moduleName: module.name });
        // if (video.type === "Vimeo") {
        //   const { code } = video;
        //   const url = `https://api.vimeo.com/me/videos/${code}?fields=files`;
        //   const { data: vimeoData } = await axios.get(url, {
        //     headers: {
        //       Authorization: `bearer ${environments.VIMEO_ACCESS_TOKEN}`,
        //     },
        //   });
        //   for (const v of vimeoData.files) {
        //     if (v.rendition === "1080p")
        //       videos.push({
        //         ...lesson,
        //         courseName,
        //         moduleName: module.name,
        //         videoUrl: v.link_secure,
        //       });
        //   }
        // }
      }

      if ((type === "F" || type === "T") && description) {
        forumTasks.push({
          ...lesson,
          courseName,
          moduleName: module?.name || "",
        });
      }
      console.log(counter);
      counter++;
    }
  }

  const coursesTypeScorm = xlsx.utils.json_to_sheet(
    coursesToDownload
      .filter((c: any) => {
        const { lessons: lc } = c;
        const f = lc.find((l: any) => l.type === "A");
        return f;
      })
      .map((c: any) => {
        return {
          "Id del curso": c.course_fb,
          "Nombre del Curso": c.name,
        };
      }),
  );
  const coursesNoTypeScorm = xlsx.utils.json_to_sheet(
    coursesToDownload
      .filter((c: any) => {
        const { lessons: lc } = c;
        const find = lc.filter((l: any) => l.type === "A");
        return !find.length;
      })
      .map((c: any) => {
        return {
          "Id del curso": c.course_fb,
          "Nombre del Curso": c.name,
        };
      }),
  );
  console.log({
    coursesToDownload: coursesToDownload.length,
  });

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
  const wbook2 = xlsx.utils.book_new();
  // xlsx.utils.book_append_sheet(wbook, s, "ForumTasks");
  // xlsx.utils.book_append_sheet(wbook, s2, "Videos");
  // xlsx.utils.book_append_sheet(wbook, s3, "Recursos Embebidos");
  // xlsx.utils.book_append_sheet(wbook, qs, "Preguntas de Evaluaciones");
  // xlsx.utils.book_append_sheet(wbook, optsQ, "Opciones de las Preguntas");
  xlsx.utils.book_append_sheet(wbook2, coursesTypeScorm, "Cursos Scorms");
  xlsx.utils.book_append_sheet(wbook2, coursesNoTypeScorm, "Cursos no Scorm");
  // xlsx.writeFile(wbook, "ForumTasks.xlsx");
  xlsx.writeFile(wbook2, "CoursesScorm.xlsx");
};
