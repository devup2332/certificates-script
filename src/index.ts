import express from "express";
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
} from "./queries";
import { FETCH_COURSE, FETCH_USER } from "./graphql/queries/dc3";
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
  const { user_course_cl } = await client.request(GET_USERS_COURSE, {
    courseFb: "3A7TgfGxr3dU1fmdThQF",
  });
  const users_approved = user_course_cl.filter((c: any) => {
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

  while (index < users_approved.length - 1) {
    console.log("Start : " + index);
    const { user, course, created_at, last_update, completed_at } =
      users_approved[index];

    const tematicaName = stpsTematica?.stps_catalog.find(
      (t: any) => t.code === course.dc3_data_json.tematica
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
      course.dc3_data_json.instructorType &&
      course.dc3_data_json.instructorType > 0 &&
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
      user.business_name?.instructor?.full_name ??
      `${course?.created_by?.firstName ?? ""} ${
        course?.created_by?.lastName ?? ""
      }`;

    const fechaFinCurso = completed_at || last_update;

    const requestData = {
      name: user?.first_name,
      lastName: user?.last_name,
      curp: user?.curp,
      shcp: user?.business_name?.shcp,
      stps: stpsAgente,
      tematica: tematicaName?.description ?? course?.dc3_data_json?.tematica,
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

    const { data } = await axios.get<string>(dc3URL, {
      params: requestData,
    });
    const response = await axios.get(`https://server.lernit.app/${data}`, {
      responseType: "arraybuffer",
    });
    const dir = path.resolve(__dirname, "../dc3Certificates/");
    const filename = `/DC3-${user.full_name
      .trimStart()
      .trimEnd()
      .replace(/\s/g, "-")}-${course.name
      .trimStart()
      .trimEnd()
      .replace(/\s/g, "-")}.pdf`;
    await fs.writeFile(dir + filename, response.data);
    console.log("End : " + index);
    index++;
  }
};
// downloadDC3Certificates()

const downloadCertificates = async () => {
  console.log({ environments });
  const { user_course_cl } = await client.request(GET_USERS_COURSE, {
    courseFb: "VOmoAD13jn6kY6EDRtUc",
  });
  const users_approved = user_course_cl.filter((c: any) => {
    const approved =
      c.score >= c.course.min_score && c.progress >= c.course.min_progress;
    if (c.completed_at && approved) return true;
    return false;
  });
  console.log({
    user_course_cl: user_course_cl.length,
    approved: users_approved.length,
  });
  while (index < users_approved.length - 1) {
    console.log("Start", index);
    const { user, course, completed_at } = users_approved[index];
    const params = {
      name: user.full_name,
      course: course.name,
      date: moment(new Date(completed_at)).format("YYYY-MM-DD"),
      duration: `${course.duration} hrs`,
      modules: course.modules.length,
    };
    const searchParams = new URLSearchParams(params);
    const { data } = await axios.get(
      `${environments.CERT_SERVER_URL}/${environments.CERT_SERVER_ENDPOINT}?${searchParams}`
    );

    const certificate = await axios.get(data, {
      responseType: "arraybuffer",
    });
    const filename = `/Cert-${user.full_name
      .trimStart()
      .trimEnd()
      .replace(/\s/g, "-")}-${course.name
      .trimStart()
      .trimEnd()
      .replace(/\s/g, "-")
      .replace(":", "")}.png`;
    await fs.writeFile("certificates" + filename, certificate.data);
    index++;
  }
};
downloadCertificates();
