import { client } from "../graphql/client";
import { GET_ALL_REVIEWS_FOR_AN_INSTANCE } from "../graphql/queries/getAllReviewsForAnInstance";
import xlsx from "xlsx";
import moment from "moment";

export const getAllReviewsForAnInstance = async (clientId: string) => {
  const dateStart = new Date("2023-04-01T00:00:00.000Z");
  const dateEnd = new Date("2023-04-30T00:00:00.000Z");
  console.log({ dateStart, dateEnd, clientId });
  const { courses_cl, marketplace_data_tb } = await client.request(
    GET_ALL_REVIEWS_FOR_AN_INSTANCE,
    {
      clientId,
      dateStart,
      dateEnd,
    }
  );
  const sheets: any[] = [];
  const sheets2: any[] = [];
  const workbook = xlsx.utils.book_new();
  const workbook2 = xlsx.utils.book_new();

  courses_cl
    .filter((c: any) => c.course_reviews.length > 0)
    .forEach((c: any, index: number) => {
      const reviews = c.course_reviews.map((r: any) => {
        return {
          [c.name]: r.body,
        };
      });

      const sheetCourse = xlsx.utils.json_to_sheet(reviews);
      sheetCourse["!cols"] = [
        {
          wch: 200,
        },
      ];
      sheets.push({ sheet: sheetCourse, courseName: `Course ${index}` });
    });
  marketplace_data_tb
    .filter((c: any) => c.courses_cl.course_reviews.length > 0)
    .forEach((c: any, index: number) => {
      const reviews = c.courses_cl.course_reviews.map((r: any) => ({
        [c.courses_cl.name]: r.body,
      }));
      const sheetCourse = xlsx.utils.json_to_sheet(reviews);
      sheetCourse["!cols"] = [
        {
          wch: 200,
        },
      ];
      sheets2.push({ sheet: sheetCourse, courseName: `Course ${index}` });
    });

  sheets.forEach((s: any) =>
    xlsx.utils.book_append_sheet(workbook, s.sheet, s.courseName)
  );
  sheets2.forEach((s: any) =>
    xlsx.utils.book_append_sheet(workbook2, s.sheet, s.courseName)
  );
  xlsx.writeFile(workbook, "./Reviews Cursos Mazda.xlsx");
  xlsx.writeFile(workbook2, "./Reviews Marketplace Mazda.xlsx");
};
