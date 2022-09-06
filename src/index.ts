import dotenv from "dotenv";
import express from "express";
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

server.get("/certificates/:clientId", async (req, res) => {
  const { clientId } = req.params;
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
  const params = new URLSearchParams({
    clientId,
    userName: "Diego Rojas",
    courseName: "Welcome Lernit",
  });
  const { data } = await axios.get(
    `${environments.CERT_SERVER_URL}/${environments.CERT_SERVER_ENDPOINT}?${params}`
  );
  const certUrl = `${environments.CERT_SERVER_URL}/${data}`;
  console.log({ certUrl });

  return res.status(200).json({ dc3 });
});

server.listen(environments.PORT, () => {
  console.log(`Serve ready on port ${environments.PORT}`);
});
