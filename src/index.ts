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

const sleep = (time: number) => {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, time)
  })
}

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

      await sleep(500)
      const c = certsToDownload[errors[index]];
      const params = new URLSearchParams({
        clientId,
        userName: c.user?.full_name.trimStart().trimEnd().replace(/\s/g, "-") || "",
        courseName: c.course?.name.trimStart().trimEnd().replace(/\s/g, '-') || "",
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
        console.log("Download finished error: " + errors[index] + ' - ' + index);
        index++;
      });
    } catch (err) {
      // console.log(err)
      console.log('Error', {
        name: certsToDownload[errors[index]].user.full_name,
        course: certsToDownload[errors[index]].course.name
      })
      index++
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



const dir = path.resolve(__dirname, "../src");
const filename = '/errors.json'
fs.readFile(dir + filename, 'utf-8', (err, data) => {
  if (err) {
    console.log({ err })
  } else {
    const response = JSON.parse(data)
    console.log({ response })
    downloadCertsErrors(response)
  }
})