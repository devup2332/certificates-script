import { client } from "../graphql/client";
import { SET_NEW_INSTRUCTORS } from "../graphql/mutations/setInstructors";
import { GET_COURSES_INSTRUCTOR_INFO } from "../graphql/queries/getCoursesInstructor";
import { GET_COURSES_INSTANCE } from "../graphql/queries/getInfoCourses";

export const setAsInstructorPerInstance = async (clientId: string) => {
  const ids = ["cisqCR11vBX3PVkMSMWBElKCmd32", "QLruvXl1Vva33QuFtDyuRHsAhv42"];
  const { courses_cl } = await client.request(GET_COURSES_INSTRUCTOR_INFO, {
    clientId,
  });

  for (let i = 0; i < courses_cl.length; i++) {
    const { instructors_json, course_fb, name } = courses_cl[i];
    console.log(`Updating Course ${name} ... ${i}`);
    if (instructors_json) {
      const instructors = [...instructors_json, ...ids];
      const noRepeted = [...new Set(instructors)];
      const input = { instructors_json: noRepeted };
      await client.request(SET_NEW_INSTRUCTORS, {
        input,
        courseFb: course_fb,
      });
    }
  }
};
