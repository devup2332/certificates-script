import { client } from "../graphql/client";
import { GET_MP_COURSES_WITH_CUSTOM_VARIABLES } from "../graphql/queries/getMPCourses";
import { INSERT_COURSE_MP_TO_AN_INTANCE } from "../graphql/mutations/insertCourseMPToAnInstance";

export const assignMPCoursesToAnInstance = async (clientId: string) => {
  const coursesIds: string[] = [
    "LtWLI72xS7uDB4EhtaUt",
    "pBBp0DpnEzWZHc0oOVTp",
    "RKTaAQ073UkU1BhygwBK",
    "o1P7QTLwAbCPKoAluvX5",
  ];
  let variables: any = {
    whereVariables: {
      client_id: { _eq: "content" },
    },
  };

  if (coursesIds.length) {
    variables = {
      whereVariables: {
        course_fb: { _in: coursesIds },
      },
    };
  }
  const { courses } = await client.request(
    GET_MP_COURSES_WITH_CUSTOM_VARIABLES,
    variables,
  );
  let index = 1;

  console.log(`Courses to migrate are : ${courses.length}`);
  return;
  for (const course of courses) {
    const { course_fb, name, welcome_message } = course;
    const object = {
      client_fb: clientId,
      course_fb,
      available_in_client: true,
      roles_json: [],
      ous_json: [],
      lesson_privacy: false,
      min_progress: 100,
      min_score: 80,
      privacity: "private",
      topic_id: "025a2913-5eaf-4e1d-9006-b2b765f14f05",
      welcome_message: welcome_message || "",
      competencies_levels: [],
      restart_time: 0,
      available_dc3_marketplace: false,
    };

    await client.request(INSERT_COURSE_MP_TO_AN_INTANCE, {
      object,
    });

    console.log(`#${index} Course Inserted ${name}`);
    index++;
  }
};
