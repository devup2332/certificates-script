import { client } from "../graphql/client";
import xlsx from "xlsx";
import {
  GET_COURSES_INSTANCE,
  GET_COURSE_INTANCE_MARKETPLACE,
} from "../graphql/queries/getInfoCourses";

export const generateCoursesListPerInstance = async (clientId: string) => {
  const { courses_cl } = await client.request(GET_COURSES_INSTANCE, {
    clientId,
  });
  const { user_course_cl } = await client.request(
    GET_COURSE_INTANCE_MARKETPLACE,
    {
      clientId,
    }
  );
  const marketplaceCourses: any[] = [];
  user_course_cl.forEach((uc: any) => {
    const finded = marketplaceCourses.find((mk) => mk.name === uc.course.name);
    if (finded) return;
    marketplaceCourses.push({ name: uc.course.name });
  });
  const courses = [...courses_cl, ...marketplaceCourses].map((item) => ({
    Name: item.name,
  }));
  console.log({ courses: courses.length });

  const workSheet = xlsx.utils.json_to_sheet(courses);
  const workBook = xlsx.utils.book_new();
  workSheet["!cols"] = [
    {
      wch: 80,
    },
  ];

  xlsx.utils.book_append_sheet(workBook, workSheet, `Cursos ${clientId}`);
  xlsx.writeFile(workBook, `./cursos${clientId}.xlsx`, {});
};
