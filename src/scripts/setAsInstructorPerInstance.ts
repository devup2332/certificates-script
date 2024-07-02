import { knexLXP } from "../database/knex";
import { sleep } from "../utils/sleep";

export const setAsInstructorPerInstance = async (clientId: string) => {
  const ids = ["0CYBB2xpgTX2FNmoQ06bKjuHQCC2"];

  const response = await knexLXP
    .select("instructors_json", "course_fb", "name", "client_id", "is_deleted")
    .from("courses_cl")
    .where("client_id", "=", clientId)
    .where("is_deleted", "=", false)
    .where("stage", ">", 7);
  console.log({ response });

  console.log({ courses_cl: response.length });
  const errors = [];

  for (let i = 0; i < response.length; i++) {
    const { instructors_json, course_fb, name } = response[i];
    console.log(`Updating Course ${name} ... ${i}`);
    if (instructors_json) {
      try {
        const instructors = [...instructors_json, ...ids];
        const noRepeted = [...new Set(instructors)];
        await knexLXP("courses_cl")
          .where("course_fb", "=", course_fb)
          .update({
            instructors_json: JSON.stringify(noRepeted),
          });
        console.log({ course_fb, name });
      } catch (err: any) {
        errors.push(course_fb);
        console.log(`Error in course ${name}`, { ...err });
      }
    }
  }

  console.log({ errors });
};
