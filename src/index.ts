import express from "express";
import fs from "fs";
import path from "path";
import axios from "axios";
import { GraphQLClient } from "graphql-request";
import { environments } from "./environments";
import {
  GET_APPROVED_USERS_BY_CLIENTID,
  GET_APPROVED_USERS_IN_MARKETPLACE,
} from "./queries";

const server = express();
const client = new GraphQLClient(environments.GRAPHQL_BACKEND_URI, {
  headers: {
    "x-hasura-admin-secret": environments.GRAPHQL_BACKEND_SECRET,
    "Access-Control-Allow-Origin": "*",
  },
});
let errors: number[] = [];
const dd: any[] = []
let coursesToDownload: any[] = []

const clientId = "universidadchinoin";
let index = 0;

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
  coursesToDownload = [...certsToDownload]
  console.log(certsToDownload.length)
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
      )}-${c.course.name.replace(" ", "-")}`;
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

const downloadCertsErrors = async (data: any[]) => {
  const errorsFile = path.resolve(__dirname, "../src") + '/errors.json'
  fs.readFile(errorsFile, 'utf-8', (err, data) => {
    if (err) {
      console.log({ err })
    } else {
      errors = JSON.parse(data)
    }
  })
  index = 0;
  while (index <= data.length - 1) {
    const c = coursesToDownload[errors[index]];
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
    const dir = path.resolve(__dirname, "../certificates/certificates1/");
    const filename = `${c.user.full_name.replace(
      " ",
      "-"
    )}-${c.course.name.replace(" ", "-")}`;
    fs.writeFile(dir + filename, response.data, () => {
      console.log("Download finished" + index);
      index++;
    });
  }
};

downloadCertificates().then(() => {
  console.log({ errors });
  const dir = path.resolve(__dirname, "../src");
  const filename = '/errors.json'
  fs.writeFile(dir + filename, JSON.stringify(errors), 'utf-8', () => {
    console.log('Json wrote')
    downloadCertsErrors(errors);
  })
});

// const example = [1, 2, 3, 5, 6, 7, 8, 3, 5, 1, 2, 8, 6, 22, 12, 33]
// const dir = path.resolve(__dirname, "../src/");
// console.log(dir)
// const filename = '/errors.json'
// fs.writeFile(dir + filename, JSON.stringify(example), 'utf-8', () => {
//   console.log('example wrote')
// })