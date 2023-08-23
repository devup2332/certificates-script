import { client } from "../graphql/client";
import xlsx from "xlsx";
import { GET_COURSES_INSTRUCTOR_INFO } from "../graphql/queries/getCoursesInstructor";
import { knexClient } from "../database/knex";

export const removeInstructor = async (clientId: string) => {
  const ids = ["0CYBB2xpgTX2FNmoQ06bKjuHQCC2"];
  const wb = xlsx.readFile("List.xlsx");
  const sh = wb.SheetNames;
  const courses = xlsx.utils
    .sheet_to_json(wb.Sheets[sh[0]])
    .map((i: any) => ({ id: i.ID, name: i["Nombre del curso"] }));
  const { courses_cl } = await client.request(GET_COURSES_INSTRUCTOR_INFO, {
    clientId,
  });
  let counter = 0;
  for (const c of courses_cl) {
    console.log(`Course ${counter}`);
    const { instructors_json, course_fb } = c;
    const f = courses.filter((i: any) => i.id === course_fb);
    if (!f.length) {
      const incl = instructors_json.includes(ids[0]);
      if (incl) {
        const newInstructors = instructors_json.filter(
          (i: string) => i !== ids[0]
        );
        const noRepeted = [...new Set(newInstructors)];
        await knexClient("courses_cl")
          .where("course_fb", "=", course_fb)
          .where("client_id", "=", clientId)
          .update({
            instructors_json: JSON.stringify(noRepeted),
          });
        counter++;

      }
    }
  }
  console.log({ counter });
};
