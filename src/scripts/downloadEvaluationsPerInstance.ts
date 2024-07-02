import { client } from "../graphql/client";
import { GET_COURSES_POSTS_INFO } from "../graphql/queries/getUserLessonInfo";
import xlsx from "xlsx";
import axios from "axios";
import path from "path";
import fs from "fs-extra";
import { normalizeName } from "../utils/normalizeString";

export const downloadEvaluationsPerInstance = async (instance: string) => {
  const startDate = new Date("2024-05-01T00:00:00.000Z");
  const endDate = new Date("2024-05-31T00:00:00.000Z");
  const { lessons } = await client.request(GET_COURSES_POSTS_INFO, {
    clientId: instance,
    startDate,
    endDate,
  });
  const mainFolderDir = path.resolve(__dirname, `../../usersPost/${instance}`);
  const mainFolderExist = await fs.pathExists(mainFolderDir);
  if (!mainFolderExist) await fs.mkdirs(`${mainFolderDir}`);
  const lessonWithPosts = lessons.filter((l: any) => l.lesson_posts.length > 0);
  console.log({ lessonWithPosts, lessons });

  for (const lesson of lessonWithPosts) {
    const {
      course: { name },
    } = lesson;

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

        if (!coursePathExist) {
          await fs.mkdir(courseFolderDir);
        }
        await fs.writeFile(dir, buffer);
      } catch {
        console.log(`Error in ${name} - ${postUser?.post_fb}`);
        continue;
      }
    }
  }
};
