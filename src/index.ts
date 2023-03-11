import express from "express";
import xlsx from "xlsx";
import stream from "stream";
import fs, { createWriteStream } from "fs-extra";
import path from "path";
import moment from "moment";
import subDays from "date-fns/subDays";
import axios from "axios";
import { GraphQLClient } from "graphql-request";
import { environments } from "./environments";
import {
  GET_APPROVED_USERS_IN_MARKETPLACE,
  GET_QUESTIONS_LESSON,
  GET_STPS_CATALOG,
  GET_USERS_COURSE_PER_INSTANCE,
  GET_USER_COURSES,
  GET_USER_COURSES_DC3_PER_INSTANCE,
  INSERT_USER_COURSE,
  INSERT_USER_LESSON,
} from "./queries";
import { FETCH_COURSE, FETCH_USER } from "./graphql/queries/dc3";
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
import { UPDATE_USER_LESSONS } from "./graphql/mutations/lessons";
const client = new GraphQLClient(environments.GRAPHQL_BACKEND_URI, {
  headers: {
    "x-hasura-admin-secret": environments.GRAPHQL_BACKEND_SECRET,
    "Access-Control-Allow-Origin": "*",
  },
});

const dc3URL = "https://server.lernit.app/certificadoDC3";
let errors: number[] = [];

const clientId = "azelis";
let index = 0;
export const LARGE_NAMED_DATE_FORMAT = `dd 'de' MMMM 'del' yyyy`;

const downloadDC3CertificatesForAnInstance = async () => {
  const clientId = "azelis";
  const certs: any[] = [];
  const { user_course_cl } = await client.request(
    GET_USER_COURSES_DC3_PER_INSTANCE,
    {
      clientId,
    }
  );
  const approvedUsers = user_course_cl.filter((c: any) => {
    const approved =
      c.score >= c.course.min_score && c.progress >= c.course.min_progress;
    if (c.completed_at && approved) return true;
    return false;
  });

  const stpsTematica = await client.request(GET_STPS_CATALOG, {
    catalogId: "tematica",
  });

  const { stps_catalog } = await client.request(GET_STPS_CATALOG, {
    catalogId: "ocupaciones",
  });

  console.log({
    approvedUsers: approvedUsers.length,
    user_course_cl: user_course_cl.length,
  });
  while (index < approvedUsers.length) {
    console.log("Start : " + index);
    const { user, course, created_at, last_update, completed_at } =
      approvedUsers[index];

    console.log({ dc3: course.dc3_data_json });
    const tematicaName = stpsTematica?.stps_catalog.find(
      (t: any) => t.code === course.dc3_data_json?.tematica
    );
    const ocupacionName = stps_catalog?.find(
      (t: any) => t.code == user?.additional_info_json?.clave_ocupacion
    );
    let stpsAgente = "";

    if (course.type === "RG") {
      stpsAgente = `${course?.created_by?.firstName ?? ""} ${
        course?.created_by?.lastName ?? ""
      }`;
    } else if (
      course.dc3_data_json?.instructorType &&
      course.dc3_data_json?.instructorType > 0 &&
      course.dc3_data_json?.stps &&
      course.dc3_data_json.stps !== ""
    ) {
      stpsAgente = course?.dc3_data_json?.stps;
    } else {
      stpsAgente = `${course?.created_by?.firstName ?? ""} ${
        course?.created_by?.lastName ?? ""
      }`;
    }

    const instructorName =
      user.business_name?.instructor?.full_name ||
      (course?.dc3_data_json?.instructorType &&
        course?.dc3_data_json?.instructorType === 1)
        ? `${course?.created_by?.firstName ?? ""} ${
            course?.created_by?.lastName ?? ""
          }`
        : course?.dc3_data_json?.instructorName;
    const fechaFinCurso = completed_at || last_update;
    const firstName = user?.first_name;
    const lastName = user?.last_name;

    const requestData = {
      name: firstName,
      lastName: lastName,
      curp: user?.curp,
      shcp: user?.business_name?.shcp,
      stps: stpsAgente,
      tematica: tematicaName?.description || course?.dc3_data_json?.tematica,
      razonSocial: user?.business_name?.name,
      instructorName:
        course?.dc3_data_json?.instructorType &&
        course?.dc3_data_json?.instructorType > 0
          ? instructorName
          : course?.dc3_data_json?.stps
          ? course?.dc3_data_json.stps
          : course.instructors_data[0].firstName,
      bossName: user?.business_name?.boss_name,
      workersBossName: user?.business_name?.boss_name_workers,
      logo: user?.client_id,
      ocupacion: ocupacionName?.description ?? user?.user_ou?.name,
      puesto: user.user_role.name,
      nombreEmpresa: user.client?.name,
      courseName: course.name,
      duration: course.duration,
      inicioCurso: created_at
        ? moment(created_at).format("YYYY-MM-DD")
        : moment(last_update).format("YYYY-MM-DD"),
      finCurso: fechaFinCurso,
    };

    const { data } = await axios.get<string>(dc3URL, {
      params: requestData,
    });
    const response = await axios.get(`https://server.lernit.app/${data}`, {
      responseType: "arraybuffer",
    });
    const dir = path.resolve(__dirname, "../DC3Certificates/");
    const filename = `/${user.full_name
      .trimStart()
      .trimEnd()
      .replace(/\s/g, "-")}-${course.name
      .trimStart()
      .trimEnd()
      .replace("|", "")
      .replace(/\s/g, "-")}.pdf`;
    await fs.writeFile(dir + filename, response.data);
    console.log("Ended", index);
    index++;
  }
};
// downloadDC3CertificatesForAnInstance();

const generateExcel = async () => {
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
// generateExcel();

const downloadCertificatesPerInstance = async () => {
  const { user_course_cl } = await client.request(
    GET_USERS_COURSE_PER_INSTANCE,
    { clientId: "azelis" }
  );
  const usersApproved = user_course_cl.filter((c: any) => {
    const approved =
      c.score >= c.course.min_score && c.progress >= c.course.min_progress;
    if (c.completed_at && approved) return true;
    return false;
  });
  console.log({ approved: usersApproved.length });
  while (index < usersApproved.length) {
    console.log("Start", index);
    const { user, course, completed_at } = usersApproved[index];
    let response;
    if (course.client_id === "content") {
      console.log("Content");
      const params = {
        name: user.full_name,
        course: course.name,
        date: format(new Date(completed_at), "dd MM yyyy"),
        ucid: user.user_fb,
        duration: course.duration + " hrs",
        modules: course.modules.length,
      };
      const searchParams = new URLSearchParams(params);
      const { data } = await axios.get(
        `${environments.CERT_SERVER_URL}/${environments.CERT_LWL_PDF}?${searchParams}`
      );
      response = data;
    } else {
      console.log("Normal");
      const params = {
        clientId,
        userName: user.full_name,
        courseName: course.name,
        date: moment(new Date(completed_at)).format("YYYY-MM-DD"),
        duration: `${course.duration} hrs`,
      };
      const searchParams = new URLSearchParams(params);
      const { data } = await axios.get(
        `${environments.CERT_SERVER_URL}/${environments.CERT_SERVER_ENDPOINT}?${searchParams}`
      );
      response = data;
    }
    const certificate = await axios.get(
      `${environments.CERT_SERVER_URL}/${response}`,
      {
        responseType: "arraybuffer",
      }
    );
    const filename = `/Cert-${user.full_name
      .trimStart()
      .trimEnd()
      .replace(/\s/g, "-")}-${course.name
      .trimStart()
      .trimEnd()
      .replace(/\s/g, "-")
      .replace(":", "")}.pdf`;
    await fs.writeFile(
      course.client_id === "content"
        ? "certsMarketplace" + filename
        : "certificates" + filename,
      certificate.data
    );
    index++;
  }
};
// downloadCertificatesPerInstance();

const syncUsers = async () => {
  const { user_course_cl: coursesToMigrate } = await client.request(
    GET_USER_COURSES,
    {
      userFb: "OncEF4QlFoRrYT32Z6WlV5Jsb3p2",
    }
  );

  const coursesMaped = coursesToMigrate.map((course: any) => {
    return {
      user_fb: "bbIVFfMzINSYhd3v5gnUCZyi9d12",
      course_fb: course.course.course_fb,
      group_id: course.group_id,
      score: course.score,
      progress: course.progress,
      deleted: false,
      group_history: course.group_history || [],
      can_unsubscribe: course.can_unsubscribe,
    };
  });
  console.log({ coursesMaped });

  await client.request(INSERT_USER_COURSE, {
    input: coursesMaped,
  });

  const lessonsToMigrate: any[] = [];
  coursesToMigrate.forEach((cm: any) => {
    cm.user_lessons.forEach((i: any) =>
      lessonsToMigrate.push({ ...i, user_fb: "bbIVFfMzINSYhd3v5gnUCZyi9d12" })
    );
  });
  await client.request(INSERT_USER_LESSON, {
    input: lessonsToMigrate,
  });
};

// syncUsers();

const syncQuestionsForOneLesson = async () => {
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

// syncQuestionsForOneLesson();

const deleteCommentsForEnireInstance = async () => {
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
// deleteCommentsForEnireInstance();

const deleteProgressLpsInstancePerCourse = async () => {
  const { learning_paths_cl } = await client.request(GET_LEARNINGPATH_INFO, {
    learningpathFb: "XI10yxTYDLYQn0IxsW2A",
  });
  const { users_json, courses_json } = learning_paths_cl[0];

  const response = await client.request(RESET_USER_COURSE_STATUS, {
    usersId: users_json,
    coursesId: courses_json.map((c: any) => c.id),
  });
  console.log({ users_json });
  console.log({ response });
};

// deleteProgressLpsInstancePerCourse();

const assign100AllForumsAndTasksUsers = async () => {
  const { users_lessons_cl } = await client.request(
    GET_ALL_FORUMS_AND_TASKS_INFO
  );
  console.log({ users_lessons_cl });
  const usersId = users_lessons_cl
    .filter((uc: any) => uc.score !== 100)
    .map((uc: any) => uc.user?.user_fb)
    .filter((id?: string) => id);

  console.log({ usersId: usersId.length });
  const lessonsId = users_lessons_cl.map((uc: any) => uc.lesson.lesson_fb);
  // const response = await client.request(UPDATE_USER_LESSONS, {
  //   usersId,
  //   lessonsId,
  // });
  // console.log({ response });
};

assign100AllForumsAndTasksUsers();
