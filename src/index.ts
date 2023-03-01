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
  GET_STPS_CATALOG,
  GET_USERS_COURSE,
  GET_USERS_COURSE_PER_COURSE,
  GET_USER_COURSES,
  INSERT_USER_COURSE,
  INSERT_USER_LESSON,
} from "./queries";
import { FETCH_COURSE, FETCH_USER } from "./graphql/queries/dc3";
import {
  GET_COURSES_INSTANCE,
  GET_COURSE_INTANCE_MARKETPLACE,
} from "./graphql/queries/getInfoCourses";
const client = new GraphQLClient(environments.GRAPHQL_BACKEND_URI, {
  headers: {
    "x-hasura-admin-secret": environments.GRAPHQL_BACKEND_SECRET,
    "Access-Control-Allow-Origin": "*",
  },
});

const dc3URL = "https://server.lernit.app/certificadoDC3";
let errors: number[] = [];

const clientId = "solintegra";
let index = 0;
export const LARGE_NAMED_DATE_FORMAT = `dd 'de' MMMM 'del' yyyy`;

const downloadDC3Certificates = async () => {
  const courses = [
    "3GgszneRj2qTBPVSN8tx",
    "SIq3N7QBPKpGyCeiYZdw",
    "pCeacexAw3QVaRIFmOKK",
    "fGkEhVytGtu7BHxEz50o",
    "TzXqcjxqAptTeLBYNaqY",
    "0znYjFscupYylaw1tD1h",
    "6sXxtF4ZThN51joulLFy",
    "qfpl5sxqQ62BtJVWsCky",
    "grYIciYrCW4UKeGrpYbm",
  ];
  const certs: any[] = [];
  const { user_course_cl } = await client.request(GET_USERS_COURSE_PER_COURSE, {
    coursesFb: courses,
  });
  const users_approved = user_course_cl.filter((c: any) => {
    const approved =
      c.score >= c.course.min_score && c.progress >= c.course.min_progress;
    if (c.completed_at && approved) return true;
    return false;
  });

  const dc3Users = users_approved.filter((u: any) => {
    const dc3Data = u.course?.dc3_data_json;
    return dc3Data !== null && dc3Data !== undefined && dc3Data !== false;
  });
  console.log({ dc3Users: dc3Users.length, certs });
  const stpsTematica = await client.request(GET_STPS_CATALOG, {
    catalogId: "tematica",
  });

  const { stps_catalog } = await client.request(GET_STPS_CATALOG, {
    catalogId: "ocupaciones",
  });

  while (index < dc3Users.length - 1) {
    console.log("Start : " + index);
    const { user, course, created_at, last_update, completed_at } =
      users_approved[index];

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
          : course?.dc3_data_json?.stps,
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
    console.log({ requestData });

    const { data } = await axios.get<string>(dc3URL, {
      params: requestData,
    });
    const response = await axios.get(`https://server.lernit.app/${data}`, {
      responseType: "arraybuffer",
    });
    const dir = path.resolve(__dirname, "../certificates/");
    const filename = `/${user.full_name
      .trimStart()
      .trimEnd()
      .replace(/\s/g, "-")}-${course.name
      .trimStart()
      .trimEnd()
      .replace("|", "")
      .replace(/\s/g, "-")}.pdf`;
    await fs.writeFile(dir + filename, response.data);
    index++;
  }
  console.log({ dc3Users: dc3Users.length });
};
downloadDC3Certificates();

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

const downloadCertificates = async () => {
  const courses = [
    "3GgszneRj2qTBPVSN8tx",
    "SIq3N7QBPKpGyCeiYZdw",
    "pCeacexAw3QVaRIFmOKK",
    "fGkEhVytGtu7BHxEz50o",
    "TzXqcjxqAptTeLBYNaqY",
    "0znYjFscupYylaw1tD1h",
    "6sXxtF4ZThN51joulLFy",
    "qfpl5sxqQ62BtJVWsCky",
    "grYIciYrCW4UKeGrpYbm",
  ];
  const { user_course_cl: users1 } = await client.request(
    GET_USERS_COURSE_PER_COURSE,
    { courseFb: courses[0] }
  );
  const { user_course_cl: users2 } = await client.request(
    GET_USERS_COURSE_PER_COURSE,
    { courseFb: courses[1] }
  );
  const { user_course_cl: users3 } = await client.request(
    GET_USERS_COURSE_PER_COURSE,
    { courseFb: courses[2] }
  );
  const users = [...users1, ...users2, ...users3];
  console.log({ users: users.length });
  const users_approved = users.filter((c: any) => {
    const approved =
      c.score >= c.course.min_score && c.progress >= c.course.min_progress;
    if (c.completed_at && approved) return true;
    return false;
  });
  console.log({ length: users.length, approved: users_approved.length });
  while (index < users_approved.length - 1) {
    console.log("Start", index);
    const { user, course, completed_at } = users_approved[index];
    const params = {
      clientId: "universidadexecon",
      userName: user.full_name,
      courseName: course.name,
      date: moment(new Date(completed_at)).format("YYYY-MM-DD"),
      duration: `${course.duration} hrs`,
    };
    const searchParams = new URLSearchParams(params);
    const { data } = await axios.get(
      `${environments.CERT_SERVER_URL}/${environments.CERT_SERVER_ENDPOINT}?${searchParams}`
    );
    console.log({ data });

    const certificate = await axios.get(
      `${environments.CERT_SERVER_URL}/${data}`,
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
    await fs.writeFile("certificates" + filename, certificate.data);
    index++;
  }
};
// downloadCertificates();

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
