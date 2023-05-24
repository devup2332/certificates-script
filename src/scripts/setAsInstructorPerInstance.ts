import { knexClient } from "../database/knex";
import { sleep } from "../utils/sleep";

export const setAsInstructorPerInstance = async (clientId: string) => {
  const ids = ["cisqCR11vBX3PVkMSMWBElKCmd32", "QLruvXl1Vva33QuFtDyuRHsAhv42"];

  const response = await knexClient
    .select("instructors_json", "course_fb", "name", "client_id")
    .from("courses_cl")
    .where("client_id", "=", clientId)
    .where("stage", ">", 7);

  console.log({ courses_cl: response.length });
  const errors = [];

  for (let i = 0; i < 1; i++) {
    const { instructors_json, course_fb, name } = response[i];
    console.log(`Updating Course ${name} ... ${i}`);
    if (instructors_json) {
      try {
        const instructors = [...instructors_json, ...ids];
        const noRepeted = [...new Set(instructors)];
        const response = await knexClient("courses_cl")
          .where("course_fb", "=", course_fb)
          .update({
            instructors_json: JSON.stringify(noRepeted),
          });
        console.log({ response });
        await sleep(500);
      } catch (err: any) {
        errors.push(course_fb);
        console.log(`Error in course ${name}`, { ...err });
      }
    }
  }

  console.log({ errors });
};
