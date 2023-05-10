import { client } from "../graphql/client";
import { RESET_USER_COURSE_STATUS } from "../graphql/mutations/courses";
import { GET_LEARNINGPATH_INFO } from "../graphql/queries/learningPaths";

export const deleteProgressLpsInstancePerCourse = async () => {
  const usersId = ["yItPRCQkqugJidVHeG0ohC3jukp2"];

  const { learning_paths_cl } = await client.request(GET_LEARNINGPATH_INFO, {
    learningpathFb: "XI10yxTYDLYQn0IxsW2A",
  });
  const { courses_json } = learning_paths_cl[0];

  const response = await client.request(RESET_USER_COURSE_STATUS, {
    usersId,
    coursesId: courses_json.map((c: any) => c.id),
  });
  console.log({ response });
};
