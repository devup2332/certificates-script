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
  GET_APPROVED_USERS_BY_CLIENTID,
  GET_APPROVED_USERS_IN_MARKETPLACE,
  GET_STPS_CATALOG,
} from "./queries";
import { FETCH_COURSE, FETCH_USER } from "./graphql/queries/dc3";

const server = express();
const client = new GraphQLClient(environments.GRAPHQL_BACKEND_URI, {
  headers: {
    "x-hasura-admin-secret": environments.GRAPHQL_BACKEND_SECRET,
    "Access-Control-Allow-Origin": "*",
  },
});

const dc3URL = "https://server.lernit.app/certificadoDC3";
let errors: number[] = [];
const dd: any[] = [];
let coursesToDownload: any[] = [];

const clientId = "universidadchinoin";
let index = 0; //42

const downloadCertificates = async () => {
  const { user_course_cl } = await client.request(
    GET_APPROVED_USERS_BY_CLIENTID,
    {
      clientId,
    }
  );
  const { user_course_cl: marketplace_courses } = await client.request(
    GET_APPROVED_USERS_IN_MARKETPLACE,
    {
      clientId,
    }
  );
  const mkApproved = marketplace_courses.filter((c: any) => {
    const approved =
      c.score >= c.course.min_score && c.progress >= c.course.min_progress;
    if (c.completed_at && approved) return true;
    return false;
  });
  const response = user_course_cl.filter((c: any) => {
    const approved =
      c.score >= c.course.min_score && c.progress >= c.course.min_progress;
    if (c.completed_at && approved) return true;
    return false;
  });
  const dc3 = response.filter((c: any) => {
    return c.course.dc3_data_json;
  });

  console.log({ l: mkApproved.length, l2: response.length, l3: dc3.length });

  const certsToDownload = [...response, ...mkApproved];
  coursesToDownload = [...certsToDownload];
  console.log(certsToDownload.length);
  while (index <= certsToDownload.length - 1) {
    try {
      const c = certsToDownload[index];
      const params = new URLSearchParams({
        clientId,
        userName: c.user?.full_name || "",
        courseName: c.course?.name || "",
      });
      const { data } = await axios.get(
        `${environments.CERT_SERVER_URL}/${environments.CERT_SERVER_ENDPOINT}?${params}`
      );
      const certUrl = `${environments.CERT_SERVER_URL}/${data}`;

      const response = await axios.get(certUrl, {
        responseType: "arraybuffer",
      });
      const dir = path.resolve(__dirname, "../certificatesChinoin");
      const filename = `/${c.user.full_name.replace(
        " ",
        "-"
      )}-${c.course.name.replace(" ", "-")}.pdf`;
      fs.writeFile(dir + filename, response.data, () => {
        console.log("Download finished : " + index);
        index++;
      });
    } catch (err) {
      errors.push(index);
      console.log("Error at : " + index);
      index++;
    }
  }
};

// downloadCertificates()

const sleep = (time: number) => {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, time);
  });
};

const downloadCertsErrors = async (errors: number[]) => {
  const { user_course_cl } = await client.request(
    GET_APPROVED_USERS_BY_CLIENTID,
    {
      clientId,
    }
  );
  const { user_course_cl: marketplace_courses } = await client.request(
    GET_APPROVED_USERS_IN_MARKETPLACE,
    {
      clientId,
    }
  );
  const mkApproved = marketplace_courses.filter((c: any) => {
    const approved =
      c.score >= c.course.min_score && c.progress >= c.course.min_progress;
    if (c.completed_at && approved) return true;
    return false;
  });
  const response = user_course_cl.filter((c: any) => {
    const approved =
      c.score >= c.course.min_score && c.progress >= c.course.min_progress;
    if (c.completed_at && approved) return true;
    return false;
  });
  const dc3 = response.filter((c: any) => {
    return c.course.dc3_data_json;
  });

  console.log({ l: mkApproved.length, l2: response.length, l3: dc3.length });

  const certsToDownload = [...response, ...mkApproved];
  while (index <= errors.length - 1) {
    try {
      await sleep(500);
      const c = certsToDownload[errors[index]];
      const params = new URLSearchParams({
        clientId,
        userName:
          c.user?.full_name.trimStart().trimEnd().replace(/\s/g, "-") || "",
        courseName:
          c.course?.name.trimStart().trimEnd().replace(/\s/g, "-") || "",
      });
      const { data } = await axios.get(
        `${environments.CERT_SERVER_URL}/${environments.CERT_SERVER_ENDPOINT}?${params}`
      );
      const certUrl = `${environments.CERT_SERVER_URL}/${data}`;

      const response = await axios.get(certUrl, {
        responseType: "arraybuffer",
      });
      const dir = path.resolve(__dirname, "../certificatesChinoin");
      const filename = `/${c.user.full_name.replace(
        /\s/g,
        "-"
      )}-${c.course.name.replace(" ", "-")}`;
      fs.writeFile(dir + filename, response.data, () => {
        console.log(
          "Download finished error: " + errors[index] + " - " + index
        );
        index++;
      });
    } catch (err) {
      // console.log(err)
      console.log("Error", {
        name: certsToDownload[errors[index]].user.full_name,
        course: certsToDownload[errors[index]].course.name,
      });
      index++;
    }
  }
};

// downloadCertificates().then(() => {
//   console.log({ errors });
//   const dir = path.resolve(__dirname, "../src");
//   const filename = '/errors.json'
//   fs.writeFile(dir + filename, JSON.stringify(errors), 'utf-8', () => {
//     console.log('Json wrote')
//     downloadCertsErrors(errors);
//   })
// });

// const example = [1, 2, 3, 5, 6, 7, 8, 3, 5, 1, 2, 8, 6, 22, 12, 33]
// const dir = path.resolve(__dirname, "../src/");
// console.log(dir)
// const filename = '/errors.json'
// fs.writeFile(dir + filename, JSON.stringify(example), 'utf-8', () => {
//   console.log('example wrote')
// })

// const dir = path.resolve(__dirname, "../src");
// const filename = "/errors.json";
// fs.readFile(dir + filename, "utf-8", (err, data) => {
//   if (err) {
//     console.log({ err });
//   } else {
//     const response = JSON.parse(data);
//     console.log({ response });
//     downloadCertsErrors(response);
//   }
// });

const downloadDC3Certificates = async () => {
  const { user_course_cl } = await client.request(
    GET_APPROVED_USERS_BY_CLIENTID,
    {
      clientId,
    }
  );
  const { user_course_cl: marketplace_courses } = await client.request(
    GET_APPROVED_USERS_IN_MARKETPLACE,
    {
      clientId,
    }
  );
  const stpsTematica = await client.request(GET_STPS_CATALOG, {
    catalogId: "tematica",
  });

  const { stps_catalog } = await client.request(GET_STPS_CATALOG, {
    catalogId: "ocupaciones",
  });

  const mkApproved = marketplace_courses.filter((c: any) => {
    const approved =
      c.score >= c.course.min_score && c.progress >= c.course.min_progress;
    if (c.completed_at && approved) return true;
    return false;
  });
  const response = user_course_cl.filter((c: any) => {
    const approved =
      c.score >= c.course.min_score && c.progress >= c.course.min_progress;
    if (c.completed_at && approved) return true;
    return false;
  });
  const dc3 = response.filter((c: any) => {
    return c.course.dc3_data_json;
  });

  const marketDC3 = mkApproved.filter((c: any) => {
    return c.course.dc3_data_json;
  });

  const certs = [...dc3, ...marketDC3];
  console.log({ dc3: dc3.length, all: certs.length });

  while (index < certs.length - 1) {
    const c = certs[index];

    const tematicaName = stpsTematica?.stps_catalog.find(
      (t: any) => t.code === c.course.dc3_data_json.tematica
    );
    const ocupacionName = stps_catalog?.find(
      (t: any) => t.code == c.user?.additional_info_json?.clave_ocupacion
    );
    let stpsAgente = "";

    if (c.course.type === "RG") {
      stpsAgente = `${c.course?.created_by?.firstName ?? ""} ${c.course?.created_by?.lastName ?? ""
        }`;
    } else if (
      c.course.dc3_data_json.instructorType &&
      c.course.dc3_data_json.instructorType > 0 &&
      c.course.dc3_data_json?.stps &&
      c.course.dc3_data_json.stps !== ""
    ) {
      stpsAgente = c.course?.dc3_data_json?.stps;
    } else {
      stpsAgente = `${c.course?.created_by?.firstName ?? ""} ${c.course?.created_by?.lastName ?? ""
        }`;
    }

    const instructorName = `${c.course?.created_by?.firstName ?? ""} ${c.course?.created_by?.lastName ?? ""
      }`;

    const fechaFinCurso = c.completed_at || c.last_update;

    const requestData = {
      name: c.user.first_name,
      lastName: c.user.last_name,
      curp: c.user.curp,
      shcp: "PFA800109TG4",
      stps: stpsAgente,
      tematica: tematicaName?.description ?? c.course?.dc3_data_json?.tematica,
      razonSocial: "PRODUCTOS FARMACEUTICOS SA DE CV",
      instructorName:
        c.course?.dc3_data_json?.instructorType &&
          c.course?.dc3_data_json?.instructorType > 0
          ? instructorName
          : c.course?.dc3_data_json?.stps,
      bossName: "MAGALLY SANCHEZ AGUILAR",
      workersBossName: "ADRIANA BELLO DIAZ",
      logo: "universidadchinoin",
      ocupacion: ocupacionName?.description ?? c.user?.user_ou?.name,
      puesto: c.user.user_role.name,
      nombreEmpresa: "Universidad Chinoin",
      courseName: c.course.name,
      duration: c.course.duration,
      inicioCurso: c.created_at
        ? moment(c.created_at).format("YYYY-MM-DD")
        : moment(c.last_update).format("YYYY-MM-DD"),
      finCurso: fechaFinCurso,
    };
    console.log(requestData);

    const { data } = await axios.get<string>(dc3URL, {
      params: requestData,
    });
    const response = await axios.get(`https://server.lernit.app/${data}`, {
      responseType: "arraybuffer",
    });
    const dir = path.resolve(__dirname, "../dc3Certificates/");
    const filename = `/DC3-${c.user.full_name
      .trimStart()
      .trimEnd()
      .replace(/\s/g, "-")}-${c.course.name
        .trimStart()
        .trimEnd()
        .replace(/\s/g, "-")}.pdf`;
    await fs.writeFile(dir + filename, response.data);
    console.log("End : " + index);
    index++;
  }
};

downloadDC3Certificates();
