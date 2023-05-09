import { client } from "../graphql/client";
import { GET_COURSES_TO_MIGRATE_TO_CONTENT } from "../graphql/queries/getCoursesToMigrateToContent";

export const migrateCoursesToContentPerInstance = async (clientId: string) => {
  const { courses_cl } = await client.request(
    GET_COURSES_TO_MIGRATE_TO_CONTENT,
    {
      clientId,
    }
  );
  console.log({ courses_cl: courses_cl.length });
};
