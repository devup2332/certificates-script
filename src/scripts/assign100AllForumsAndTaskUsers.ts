import { client } from "../graphql/client";
import { UPDATE_USER_LESSONS } from "../graphql/mutations/lessons";
import { GET_ALL_FORUMS_AND_TASKS_INFO } from "../graphql/queries/lessons";

export const assign100AllForumsAndTasksUsers = async () => {
  const { users_lessons_cl } = await client.request(
    GET_ALL_FORUMS_AND_TASKS_INFO
  );
  console.log({ users_lessons_cl });
  const usersId = users_lessons_cl
    .filter((uc: any) => uc.score !== 100)
    .map((uc: any) => uc.user?.user_fb)
    .filter((id?: string) => id);

  console.log({ usersId: usersId.length });
  const lessonsId = users_lessons_cl.map((uc: any) => uc.lesson.lesson_fb);
  const response = await client.request(UPDATE_USER_LESSONS, {
    usersId,
    lessonsId,
  });
  console.log({ response });
};
