import { client } from "../graphql/client";
import axios from "axios";
import {
  GET_USER_COURSES,
  INSERT_USER_COURSE,
  INSERT_USER_LESSON,
} from "../queries";

export const syncUsers = async (emailDead: string, emailLive: string) => {
  const { users_cl: userDead } = await client.request(GET_USER_COURSES, {
    email: emailDead,
  });
  const { users_cl: userLive } = await client.request(GET_USER_COURSES, {
    email: emailLive,
  });

  const { client_id, user_fb } = userLive[0];

  const coursesMaped = userDead[0].user_courses_cl?.map((course: any) => {
    return {
      user_fb: userLive[0].user_fb,
      course_fb: course.course.course_fb,
      group_id: course.group_id,
      score: course.score,
      progress: course.progress,
      deleted: false,
      group_history: course.group_history || [],
      can_unsubscribe: course.can_unsubscribe,
    };
  });
  for (let i = 0; i < userDead[0].user_courses_cl.length; i++) {
    const { course, completed_at } = userDead[0].user_courses_cl[i];
    const completedResource = completed_at !== null;
    console.log({ course, completed_at, user_fb });

    if (completedResource) {
      await axios.post(
        `https://lernit-platform-qa-dot-lernit-platform-qa.uc.r.appspot.com/lxp/competencies/resource-finished/${client_id}/${user_fb}/${course.course_fb}/course`,
        null,
        {
          headers: {
            Authorization: `Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IjE2ZGE4NmU4MWJkNTllMGE4Y2YzNTgwNTJiYjUzYjUzYjE4MzA3NzMiLCJ0eXAiOiJKV1QifQ.eyJuYW1lIjoiRGllZ28gUm9qYXMiLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUFUWEFKeG1BQkhhYkZ5ekNTUmgxY3Y1aE5zT0RwcVVVU0x6VkdKcmlwNEQ9czk2LWMiLCJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vbGVybml0LXYyIiwiYXVkIjoibGVybml0LXYyIiwiYXV0aF90aW1lIjoxNjgwMDIwODk5LCJ1c2VyX2lkIjoiQmJjQXcxV0sxVWFDMklUTDdGbUpYcjVzN0lBMiIsInN1YiI6IkJiY0F3MVdLMVVhQzJJVEw3Rm1KWHI1czdJQTIiLCJpYXQiOjE2ODI0Mzg1NjMsImV4cCI6MTY4MjQ0MjE2MywiZW1haWwiOiJkaWVnby5yb2phc0BsYXB6by5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiZmlyZWJhc2UiOnsiaWRlbnRpdGllcyI6eyJlbWFpbCI6WyJkaWVnby5yb2phc0BsYXB6by5jb20iXX0sInNpZ25faW5fcHJvdmlkZXIiOiJwYXNzd29yZCJ9fQ.Z1GIiTapYJB2G6pQT7BDYs-z87Lr9BOvvuVtP9NXNghSLQSdpuXJTXMGDHclPrQ1CLyWEQKz2dci7VF-s9v8qbOXb4sbr9uDfGd0rXWhwLn2j1AHdRhQ3EZafK8OjvVK25Bfr5FtoNNusuCB4qGwdd6b5IKs2KNB8vuL62e0umNPptAaF1t9ZFrU3VZeLlWd6LaNU2PWvHRp9yuGLduBYldPV74-CFgyJ_-Mvmstr_jluCGjko0xlBtC7OMEmSFJRPQW7POqV1TWTgnVo6XFbYp8q6Pauek223M1JGwfQCC5rrZyiL3Oz41qEblJeWY6F9gRTFY70fWYFKElkt86Mw`,
          },
        }
      );
      console.log(
        "Recurso finalizado en Voldemort" + user_fb + ":" + course.course_fb
      );
    }
  }
  //
  // await client.request(INSERT_USER_COURSE, {
  //   input: coursesMaped,
  // });
  //
  // const lessonsToMigrate: any[] = [];
  // userDead[0].user_courses_cl?.forEach((cm: any) => {
  //   cm.user_lessons.forEach((i: any) =>
  //     lessonsToMigrate.push({ ...i, user_fb: userLive[0].user_fb })
  //   );
  // });
  // await client.request(INSERT_USER_LESSON, {
  //   input: lessonsToMigrate,
  // });
};
