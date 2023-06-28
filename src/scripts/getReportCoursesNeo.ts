import { client } from "../graphql/client";
import { GET_COURSES_NEO } from "../graphql/queries/getCoursesNeo";
import { GET_USER_BY_ID } from "../graphql/queries/getUsersById";

export const getReportCoursesNeo = async (clientId: string) => {
  const { courses } = await client.request(GET_COURSES_NEO, { clientId });

  for (const course of courses) {
    const { dc3_data_json, instructors_json } = course;
    if (dc3_data_json && dc3_data_json.instructorName) {
      const { users } = await client.request(GET_USER_BY_ID, {
        userIds: instructors_json,
      });
      const { instructorName } = dc3_data_json;

      const index: number = users.findIndex(
        (u: any) =>
          `${u.first_name} ${u.last_name}`
            .toLowerCase()
            .trimEnd()
            .trimEnd()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "") ===
          instructorName
            .toLowerCase()
            .trimEnd()
            .trimEnd()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
      );

      if (index > 0) {
        console.log("No encontrado " + course.course_fb);
      }
    }
  }
};
