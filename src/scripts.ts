import xlsx from "xlsx";
import fs from "fs-extra";
import path from "path";
import moment from "moment";
import axios from "axios";
import { GraphQLClient } from "graphql-request";
import { environments } from "./environments";

import {
  GET_QUESTIONS_LESSON,
  GET_STPS_CATALOG,
  GET_USERS_COURSE_PER_INSTANCE,
  GET_USER_COURSES,
  GET_USER_COURSES_DC3_MARKETPLACE_PER_INSTANCE,
  GET_USER_COURSES_DC3_PER_INSTANCE,
  INSERT_USER_COURSE,
  INSERT_USER_LESSON,
} from "./queries";

import {
  GET_COURSES_INSTANCE,
  GET_COURSE_INTANCE_MARKETPLACE,
} from "./graphql/queries/getInfoCourses";
import { GET_COMMENTS_FOR_ENTIRE_INSTANCE } from "./graphql/queries/comments";
import { Lesson } from "./interfaces";
import { DELETE_COMMENTS_FOR_AND_INSTANCE } from "./graphql/mutations/comments";
import { GET_LEARNINGPATH_INFO } from "./graphql/queries/learningPaths";
import { RESET_USER_COURSE_STATUS } from "./graphql/mutations/courses";
import { format } from "date-fns";
import { GET_ALL_FORUMS_AND_TASKS_INFO } from "./graphql/queries/lessons";
import { GET_ALL_RESOURCES_FOR_AN_INSTANCE } from "./graphql/queries/getResourcesForAnInstance";
import { GET_ALL_REVIEWS_FOR_AN_INSTANCE } from "./graphql/queries/getAllReviewsForAnInstance";
const client = new GraphQLClient(environments.GRAPHQL_BACKEND_URI, {
  headers: {
    "x-hasura-admin-secret": environments.GRAPHQL_BACKEND_SECRET,
    "Access-Control-Allow-Origin": "*",
  },
});

const dc3URL = "https://server.lernit.app/certificadoDC3";

const clientId = "universidadExecon";
let index = 0;
export const LARGE_NAMED_DATE_FORMAT = `dd 'de' MMMM 'del' yyyy`;

export const syncQuestionsForOneLesson = async () => {
  const { lessons_cl } = await client.request(GET_QUESTIONS_LESSON, {
    lessonFb: "xQiUxJYE2BPuFGtc7rtL",
  });
  const users = lessons_cl[0].users;
  const payload: any[] = [];
  users.forEach((item: any) => {
    const { summary, user } = item;

    if (!summary) return;
    const summ = summary
      .map((opt: any) => {
        // console.log({ opt });
        if (
          opt.id === "Z52Ip6jH3v2YS570NUQv" ||
          opt.id === "LeXnFKLFMJagxUDcUnc2"
        ) {
          const id = opt.id === "Z52Ip6jH3v2YS570NUQv" ? 96416 : 97599;
          // console.log({ id: opt.id });
          return { ...opt, id };
        }
      })
      .filter((i: any) => i !== undefined);
    if (summ.length === 0) return;
    const lesson = {
      ...item,
    };
    lesson.summary = summ;
    lesson["user_fb"] = user.user_fb;
    delete lesson.user;
    payload.push(lesson);
  });
  const response = await client.request(INSERT_USER_LESSON, {
    input: payload,
  });
  console.log({ response });
};

export const deleteCommentsForEnireInstance = async () => {
  const { lessons_cl } = await client.request<
    Promise<{ lessons_cl: Lesson[] }>
  >(GET_COMMENTS_FOR_ENTIRE_INSTANCE, {
    clientId: "uconstrurama",
  });
  const commentsToDelete: string[] = [];
  const lessonsHaveComments: any[] = [];
  lessons_cl.forEach((l) => {
    if (l.comments.length > 0) {
      lessonsHaveComments.push(l);
      l.comments.forEach((c: any) => commentsToDelete.push(c.comment_fb));
    }
  });
  console.log({
    commentsToDelete: commentsToDelete.length,
    lessonsHaveComments: lessonsHaveComments.length,
  });

  const response = await client.request(DELETE_COMMENTS_FOR_AND_INSTANCE, {
    commentsFb: commentsToDelete,
  });
  console.log({ response });
};

export const generateExcelForAllResourcesPerInstance = async () => {
  const { courses_cl, resourcesWithoutCourse, marketplace_data_tb } =
    await client.request(GET_ALL_RESOURCES_FOR_AN_INSTANCE, {
      clientId,
    });

  const cursosXlsx = courses_cl.map((item: any) => ({
    Nombre: item.name,
    "Creado por": `${item.created_by_json?.firstName} ${item.created_by_json?.lastName}`,
  }));
  const resources = resourcesWithoutCourse.map((item: any) => ({
    Nombre: item.name,
    "Creado por": `${item.created_by?.firstName || "TALENTHOS MEXICO"} ${
      item.created_by?.lastName || ""
    }`,
  }));
  const marketplaceCourses = marketplace_data_tb.map((item: any) => ({
    Nombre: item.courses_cl.name,
    "Creado por": `${item.courses_cl.created_by_json?.firstName} ${item.courses_cl.created_by_json?.lastName}`,
  }));

  console.log({ marketplaceCourses });
  const sheet1 = xlsx.utils.json_to_sheet(cursosXlsx);

  const sheet2 = xlsx.utils.json_to_sheet(resources);
  const sheet3 = xlsx.utils.json_to_sheet(marketplaceCourses);
  const workbook = xlsx.utils.book_new();
  sheet1["!cols"] = [
    {
      wch: 100,
    },
    {
      wch: 100,
    },
  ];
  sheet2["!cols"] = [
    {
      wch: 100,
    },
    {
      wch: 100,
    },
  ];
  sheet3["!cols"] = [
    {
      wch: 100,
    },
    {
      wch: 100,
    },
  ];
  xlsx.utils.book_append_sheet(workbook, sheet1, "Cursos");
  xlsx.utils.book_append_sheet(workbook, sheet2, "Recursos Individuales");
  xlsx.utils.book_append_sheet(workbook, sheet3, "Marketplace");

  xlsx.writeFile(workbook, "./Reporte General de Recursos.xlsx");
};


export const generateExcelWithLogsPerInstance = () => {
  const { users } = data10;
  const sheet = xlsx.utils.json_to_sheet(users);
  const workbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(workbook, sheet, "users");
  xlsx.writeFile(workbook, `./excels/uinterceramic-1677412801691.xlsx`);
};
