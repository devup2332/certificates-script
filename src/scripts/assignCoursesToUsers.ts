import { client } from "../graphql/client";
import { GET_COURSES_PER_INSTANCE } from "../graphql/queries/getCoursesPerInstance";
import xlsx from "xlsx";
import { GET_USER_COURSES, INSERT_USER_COURSE } from "../queries";

export const assignCoursesToUser = async (clientId: string) => {
  const usersEmails = [
    "miryam_flores@tecmilenio.mx",
    "paulina.aguilar@tecmilenio.mx",
    "i.tenorio@tecmilenio.mx",
    "anais.aoyama@tecmilenio.mx",
    "ixchel.garcia@tecmilenio.mx",
    "karim.pluma@tecmilenio.mx",
    "elsa.resendez@tecmilenio.mx",
    "andreagissellegq@tecmilenio.mx",
    "r.juarez@tecmilenio.mx",
  ];
  const { courses } = await client.request(GET_COURSES_PER_INSTANCE, {
    clientId,
  });
  // const wb = xlsx.utils.book_new();
  // courses.forEach((course: any, index: number) => {
  //   let data = course.courses_groups.map((gc: any) => {
  //     return { [course.name]: gc.name };
  //   });
  //   if (!course.courses_groups.length) data = [{ [course.name]: 'Curso sin grupos' }];
  //   const s = xlsx.utils.json_to_sheet(data);
  //   xlsx.utils.book_append_sheet(wb, s, `Course ${index}`);
  // });
  // xlsx.writeFile(wb, "./courses.xlsx");

  const { users_cl } = await client.request(GET_USER_COURSES, {
    emails: usersEmails,
  });

  for (const u of users_cl) {
    const { user_courses_cl, user_fb, full_name, email } = u;
    const filteredCourses: any[] = courses.filter((c: any) => {
      const find = user_courses_cl.filter(
        (uc: any) => uc.course.course_fb === c.course_fb
      );
      return !find.length;
    });

    const input = filteredCourses.map((c: any) => {
      return { course_fb: c.course_fb, user_fb };
    });
    console.log({ input: input.length, email });
    const response = await client.request(INSERT_USER_COURSE, {
      input,
    });
    console.log(`User ${email} - ${full_name} `);
    console.log({ response });
  }
  // console.log({
  //   courses: users_cl.map((u: any) => {
  //     return { l: u.user_courses_cl.length, email: u.email };
  //   }),
  // });
};
