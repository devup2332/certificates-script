import xlsx from "xlsx";
import fs from "fs-extra";
import path from "path";
import moment from "moment";
import axios from "axios";
import { GraphQLClient } from "graphql-request";
import { environments } from "./environments";
import data1 from "../data/uinterceramic-1675425601777.json";
import data2 from "../data/uinterceramic-1675512003951.json";
import data3 from "../data/uinterceramic-1675598401761.json";
import data4 from "../data/uinterceramic-1676030401367.json";
import data5 from "../data/uinterceramic-1676635202444.json";
import data6 from "../data/uinterceramic-1676721603983.json";
import data7 from "../data/uinterceramic-1676808002372.json";
import data8 from "../data/uinterceramic-1677240001498.json";
import data9 from "../data/uinterceramic-1677326403387.json";
import data10 from "../data/uinterceramic-1677412801691.json";

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


export const generateExcel = async () => {
  const { courses_cl } = await client.request(GET_COURSES_INSTANCE, {
    clientId: "sanjacinto",
  });
  const { user_course_cl } = await client.request(
    GET_COURSE_INTANCE_MARKETPLACE,
    {
      clientId: "sanjacinto",
    }
  );
  const marketplaceCourses: any[] = [];
  user_course_cl.forEach((uc: any) => {
    const finded = marketplaceCourses.find((mk) => mk.name === uc.course.name);
    if (finded) return;
    marketplaceCourses.push({ name: uc.course.name });
  });
  const courses = [...courses_cl, ...marketplaceCourses].map((item) => ({
    Name: item.name,
  }));
  console.log({ courses });
  console.log({
    length: courses_cl.length,
    length2: marketplaceCourses.length,
    length3: courses.length,
  });

  const workSheet = xlsx.utils.json_to_sheet(courses);
  const workBook = xlsx.utils.book_new();
  workSheet["!cols"] = [
    {
      wch: 80,
    },
  ];

  xlsx.utils.book_append_sheet(workBook, workSheet, "Cursos Sanjacinto");
  xlsx.writeFile(workBook, "./cursosSanjacinto.xlsx", {});
};



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

export const getAllReviewsForAnInstance = async () => {
  console.log({ clientId });
  const dateStart = new Date("2023-03-01T00:00:00.000Z");
  const dateEnd = new Date("2023-03-31T00:00:00.000Z");
  console.log({ dateStart, dateEnd });
  const { courses_cl, marketplace_data_tb } = await client.request(
    GET_ALL_REVIEWS_FOR_AN_INSTANCE,
    {
      clientId,
      dateStart,
      dateEnd,
    }
  );
  console.log({
    courses_cl: courses_cl,
    marketplace_data_tb: marketplace_data_tb.map((c: any) => {
      return { course_reviews: c.courses_cl.course_reviews };
    }),
  });
  const sheets: any[] = [];
  const sheets2: any[] = [];
  const workbook = xlsx.utils.book_new();
  const workbook2 = xlsx.utils.book_new();

  courses_cl
    .filter((c: any) => c.course_reviews.length > 0)
    .forEach((c: any, index: number) => {
      const reviews = c.course_reviews.map((r: any) => {
        console.log({ ra: moment(r.created_at), date: r.created_at, r });
        return {
          [c.name]: r.body,
        };
      });

      const sheetCourse = xlsx.utils.json_to_sheet(reviews);
      sheetCourse["!cols"] = [
        {
          wch: 200,
        },
      ];
      sheets.push({ sheet: sheetCourse, courseName: `Course ${index}` });
    });
  marketplace_data_tb
    .filter((c: any) => c.courses_cl.course_reviews.length > 0)
    .forEach((c: any, index: number) => {
      const reviews = c.courses_cl.course_reviews.map((r: any) => ({
        [c.courses_cl.name]: r.body,
      }));
      const sheetCourse = xlsx.utils.json_to_sheet(reviews);
      sheetCourse["!cols"] = [
        {
          wch: 200,
        },
      ];
      sheets2.push({ sheet: sheetCourse, courseName: `Course ${index}` });
    });

  sheets.forEach((s: any) =>
    xlsx.utils.book_append_sheet(workbook, s.sheet, s.courseName)
  );
  sheets2.forEach((s: any) =>
    xlsx.utils.book_append_sheet(workbook2, s.sheet, s.courseName)
  );
  console.log(clientId);
  xlsx.writeFile(workbook, "./Reviews Cursos Mazda.xlsx");
  xlsx.writeFile(workbook2, "./Reviews Marketplace Mazda.xlsx");
};

export const generateExcelWithLogsPerInstance = () => {
  const { users } = data10;
  const sheet = xlsx.utils.json_to_sheet(users);
  const workbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(workbook, sheet, "users");
  xlsx.writeFile(workbook, `./excels/uinterceramic-1677412801691.xlsx`);
};
