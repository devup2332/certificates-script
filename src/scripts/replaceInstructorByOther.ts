import { client } from "../graphql/client";
import { UPDATE_COURSE_INFO } from "../graphql/mutations/updateCourseInfo";
import { GET_COURSES_BY_INSTRUCTOR } from "../graphql/queries/geCoursesByInstructor";
import { GET_USER_INFO } from "../graphql/queries/getUserInfo";

export const replaceInstructorByOther = async (
  clientId: string,
  userId: string,
  newInstructorId: string,
  secondaryInstructor: string,
) => {
  const { courses } = await client.request(GET_COURSES_BY_INSTRUCTOR, {
    clientId,
  });

  const coursesByUser = courses.filter(
    (c: any) => c.created_by_json.uid === userId,
  );

  const { users } = await client.request(GET_USER_INFO, {
    userId: newInstructorId,
  });

  for (const course of coursesByUser) {
    console.log(`Updating course ${course.name} - ${course.course_fb}`);
    const newInstructorsIds = course.instructors_json.filter(
      (i: string) => i !== userId,
    );
    const response = await client.request(UPDATE_COURSE_INFO, {
      courseId: course.course_fb,
      newInfo: {
        created_by_json: {
          uid: newInstructorId,
          imageUrl: users[0].image_url,
          lastName: users[0].last_name,
          firstName: users[0].first_name,
        },
        instructors_json: [
          ...newInstructorsIds,
          newInstructorId,
          secondaryInstructor,
        ],
      },
    });
    console.log({ response });
  }
};
