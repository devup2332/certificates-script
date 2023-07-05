import { voldemortClient } from "../graphql/client";
import { client } from "../graphql/client";
import { DELETE_COMPETENCIES_PER_INSTANCE } from "../graphql/queries/deleteCompetenciesPerInstance";
import { GET_ALL_COMPETENCIES } from "../graphql/queries/getAllCompetencies";
import { GET_COMPETENCIES_PER_INSTANCE } from "../graphql/queries/getCompetenciesPerInstance";
import { GET_COMPETENIES_VOLDEMORT } from "../graphql/queries/voldemort/getCompetenciesVoldemort";

export const deleteAllCompetenciesLXP = async (clientId: string) => {
  const { courses } = await client.request(GET_ALL_COMPETENCIES, {
    clientId,
  });

  const { competenciesLXP } = await client.request(
    GET_COMPETENCIES_PER_INSTANCE,
    {
      clientId,
    }
  );

  const { competenciesVoldemort } = await voldemortClient.request(
    GET_COMPETENIES_VOLDEMORT,
    {
      clientId: "bb4140d8-e67c-4c11-a3ba-4dbc3b44b46a",
    }
  );
  const coursesLxpOnly = [];
  for (const course of courses) {
    const { competencies, course_fb } = course;
    if (!competencies) continue;
    const find = competencies?.filter((c: any) => {
      return c.competencies_fb.length === 20;
    });
    if (find.length === competencies?.length && find.length) {
      coursesLxpOnly.push(course_fb);
    }
  }
  const competenciesToDelete: string[] = competenciesLXP
    .filter((c: any) => {
      return c.competencies_fb.length === 20;
    })
    .map((c: any) => c.competencies_fb);
  const response = await client.request(DELETE_COMPETENCIES_PER_INSTANCE, {
    competencies: competenciesToDelete,
  });
  console.log({ response });
};
