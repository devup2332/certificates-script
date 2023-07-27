import { client } from "../graphql/client";
import { GET_MP_COURSES } from "../graphql/queries/getMPCourses";
import { GET_OUS_PER_INSTANCE } from "../graphql/queries/getOusPerInstance";
import { GET_ROLES_PER_CLIENT } from "../graphql/queries/getRolesPerClient";
import { v4 as uuid } from "uuid";
import { MIGRATE_TOPICS_TO_INSTANCE } from "../graphql/mutations/migrateTopicsToInstance";
import { INSERT_COURSE_MP_TO_AN_INTANCE } from "../graphql/mutations/insertCourseMPToAnInstance";
import { GET_TOPICS_INSTANCE } from "../graphql/queries/getTopicsInstance";

export const assignMPCoursesToAnInstance = async (clientId: string) => {
  const { courses, topics, topicsClientId } = await client.request(
    GET_MP_COURSES,
    {
      clientId,
    },
  );
  const { roles } = await client.request(GET_ROLES_PER_CLIENT, {
    clientId,
  });
  const { ous } = await client.request(GET_OUS_PER_INSTANCE, {
    clientId,
  });

  const newTopics: any[] = [];

  topics.forEach((t: any) => {
    const id = uuid();
    const { name, image_url } = t;
    const topic = {
      image_url,
      name,
      client_id: clientId,
      topic_fb: id,
    };
    newTopics.push(topic);
  });

  // const { insert_topic_cl } = await client.request(MIGRATE_TOPICS_TO_INSTANCE, {
  //   topics: newTopics,
  // });
  //
  // console.log("TOPICS INSERTADOS");
  //
  const { topicsInstance } = await client.request(GET_TOPICS_INSTANCE, {
    clientId,
  });

  for (const course of courses) {
    const { course_fb, min_score, min_progress, welcome_message, topic } =
      course;
    const roles_json = roles.map((r: any) => r.role_fb);
    const ous_json = ous.map((ou: any) => ou.ou_fb);
    const topicF = topicsInstance.filter((t: any) => {
      return t.name === topic.name;
    });
    // console.log({ topicF });
    const object = {
      client_fb: clientId,
      course_fb,
      available_in_client: true,
      roles_json,
      lesson_privacy: false,
      min_progress: min_progress || 0,
      min_score: min_score || 0,
      ous_json,
      privacity: "public",
      topic_id: topicF[0].topic_fb,
      welcome_message: welcome_message || "",
      competencies_levels: [],
      restart_time: 0,
      available_dc3_marketplace: false,
    };
    // console.log({ object });

    const response = await client.request(INSERT_COURSE_MP_TO_AN_INTANCE, {
      object,
    });

    console.log("CURSO INSERTADO", { response });

    // console.log({ object });
  }
  // console.log({ courses: courses.length, clientId, topics });
};
