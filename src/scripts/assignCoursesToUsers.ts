import { client } from "../graphql/client";
import { GET_COURSES_PER_INSTANCE } from "../graphql/queries/getCoursesPerInstance";

export const assignCoursesToUser = async (clientId: string) => {
  const { coursesIds } = await client.request(GET_COURSES_PER_INSTANCE, {
    clientId,
  });
  console.log({ coursesIds: coursesIds.length });
};
