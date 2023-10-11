import { client } from "../graphql/client";
import { UPDATE_COURSE_INFO } from "../graphql/mutations/updateCourseInfo";
import {
  GET_INFO_COURSES_MP_TO_SYNC,
  GET_INFO_COURSES_PER_INSTANCE,
} from "../graphql/queries/getInfoCoursesToSync";
import xlsx from "xlsx";
import { migrateCoursesToContentPerInstance } from "./migrateCoursesToContentPerInstance";

export const syncCoursesTecMilenio = async (instance: string) => {
  const { courses } = await client.request(GET_INFO_COURSES_PER_INSTANCE, {
    clientId: instance,
  });

  const { coursesMP } = await client.request(GET_INFO_COURSES_MP_TO_SYNC, {
    clientId: instance,
  });

  const coursesToCreate = courses.filter((c: any) => {
    const f = coursesMP.filter((ct: any) => ct.name === c.name);
    return !f.length;
  });

  const coursesToUpdate = courses.filter((c: any) => {
    const f = coursesMP.filter((ct: any) => ct.name === c.name);
    return f.length === 1;
  });
  let index = 0;
  const ids = coursesToCreate.map((c: any) => c.id);

  await migrateCoursesToContentPerInstance("tecmilenio",ids);


  //   for (const course of coursesToUpdate) {
  //     const { name, id, ...allData } = course;
  //     const f = coursesMP.filter((c: any) => c.name === name);
  //     const { id: idC } = f[0];

  //     console.log(
  //       `${index}.- Updating course ${name} - Tec : ${id} , Content : ${idC}`
  //     );
  //     delete allData.name;
  //     delete allData.id;
  //     delete allData.origin;
  //     delete allData.client_id;
  //     const newInfo = {
  //       ...allData,
  //     };
  //     const response = await client.request(UPDATE_COURSE_INFO, {
  //       courseId: idC,
  //       newInfo,
  //     });
  //     console.log({ response });
  //     index++;
  //   }

  //   console.log({
  //     coursesToUpdate: coursesToUpdate.length,
  //     coursesToCreate: coursesToCreate.length,
  //   });

  console.log({ coursesMP: coursesMP.length, courses: courses.length });
};
