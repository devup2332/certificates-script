import axios from "axios";
import fs from "fs-extra";
import path from "path";
import { client } from "../graphql/client";
import { GET_DATA_INSTANCE } from "../graphql/queries/getDataInstance";
import xlsx from "xlsx";

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

    const courseFolderPath = path.resolve(
      __dirname,
      `../../coursesResources/${courseName.trimStart().trimEnd()}-${course_fb}`,
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
      } = lesson;

      const modulePath = `${courseFolderPath}/${module?.name
        .trimStart()
        .trimEnd()
        .replace("/", "")}-${module_id}`;

      const modulePathExist = await fs.pathExists(modulePath);

      if (!modulePathExist) {
        await fs.mkdir(modulePath);
      }

      if (type === "L" && subtype === "PDF" && lecture.pdfUrl) {
        continue;
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

      if (type === "L" && subtype === "HTML") {
        const urlRegex = /(https?:\/\/firebasestorage[^\s]+)/g;
        const urls = lecture.htmlBlob.match(urlRegex);
      }

      if (type === "V" && video) {
        videos.push({ ...lesson, courseName, moduleName: module.name });
      }

      if ((type === "F" || type === "T") && description) {
        forumTasks.push({ ...lesson, courseName });
      }
      console.log(counter);
      counter++;
    }
  }
  const s = xlsx.utils.json_to_sheet(
    forumTasks.map((i) => ({
      id: i.lesson_fb,
      "Nombre de la leccion": i.name,
      "Nombre del Curso": i.courseName,
    })),
  );
  const s2 = xlsx.utils.json_to_sheet(
    videos.map((v) => ({
      id: v.lesson_fb,
      "Nombre de la leccion": v.name,
      "Nombre del Curso": v.courseName,
      "Nombre del modulo": v.moduleName,
      "Url del video": v.video.type === "Rotoplas" ? v.video.videoUrl : "",
    })),
  );
  const wbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(wbook, s, "ForumTasks");
  xlsx.utils.book_append_sheet(wbook, s2, "Videos");
  xlsx.writeFile(wbook, "ForumTasks.xlsx");
};
