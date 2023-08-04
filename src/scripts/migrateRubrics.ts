import { client } from "../graphql/client";
import { MIGRATE_ALL_RUBRICS } from "../graphql/mutations/migrateRubrics";
import { getRubrics } from "../utils/firebase";

export const migrateRubrics = async () => {
  const rubrics = await getRubrics();
  const objects = rubrics.map((r) => {
    const {
      criteria,
      clientId,
      description,
      gradesDescriptionTitles,
      name,
      userId,
    } = r;
    return {
      criteria,
      client_id: clientId,
      description,
      gradesDescriptionTitles,
      name,
      public: r.public,
      user_fb: userId,
    };
  });
  const response = await client.request(MIGRATE_ALL_RUBRICS, {
    objects,
    updateColumns: [
      "client_id",
      "criteria",
      "description",
      "gradesDescriptionTitles",
      "name",
      "public",
      "user_fb",
    ],
  });
  console.log({ response });
};
