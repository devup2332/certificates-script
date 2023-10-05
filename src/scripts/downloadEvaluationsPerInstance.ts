import { client } from "../graphql/client";
import { GET_COURSES_POSTS_INFO } from "../graphql/queries/getUserLessonInfo";
import xlsx from "xlsx";
import axios from "axios";
import path from "path";
import fs from "fs-extra";
import { normalizeName } from "../utils/normalizeString";

export const downloadEvaluationsPerInstance = async (instance: string) => {
  const wb = xlsx.readFile("Courses.xlsx");
  const sheets = wb.SheetNames;
  const courseNames = xlsx.utils
    .sheet_to_json(wb.Sheets[sheets[0]])
    .map((i: any) => i["Nombre del curso"]);
  const { courses } = await client.request(GET_COURSES_POSTS_INFO, {
    clientId: instance,
    courseNames,
  });
  const mainFolderDir = path.resolve(__dirname, `../../usersPost/${instance}`);
  const mainFolderExist = await fs.pathExists(mainFolderDir);
  if (!mainFolderExist) await fs.mkdirs(`${mainFolderDir}`);

  for (const course of courses) {
    const { lessons, name } = course;
    for (const lesson of lessons) {
      const { lesson_posts } = lesson;
      if (!lesson_posts.length) continue;
      for (const postUser of lesson_posts) {
        try {
          const { message, post_fb } = postUser;
          const regExp = /(https?:\/\/[^\s]+)/g;
          const url = message.match(regExp) || [];
          if (!url.length) continue;
          const { data: buffer } = await axios.get(url[0], {
            responseType: "arraybuffer",
          });

          let typeFile = "";
          if (url[0].search(".doc") >= 0) typeFile = ".doc";
          if (url[0].search(".pdf") >= 0) typeFile = ".pdf";
          if (message.search("<img") >= 0) typeFile = ".jpg";

          const fileName = normalizeName(`${name}-${post_fb}${typeFile}`);
          const courseFolderName = normalizeName(name);
          const courseFolderDir = `${mainFolderDir}/${courseFolderName}`;
          const dir = `${courseFolderDir}/${fileName}`;
          const coursePathExist = await fs.pathExists(courseFolderDir);
          console.log({ fileName, courseFolderDir, courseFolderName });

          if (!coursePathExist) {
            console.log("Not");
            await fs.mkdir(courseFolderDir);
          }
          await fs.writeFile(dir, buffer);
        } catch {
          console.log(`Error in ${name} - ${postUser?.post_fb}`);
          continue;
        }
      }
    }
  }
};
