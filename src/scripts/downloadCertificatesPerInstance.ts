import { client } from "../graphql/client";
import { GET_USERS_COURSE_PER_INSTANCE } from "../queries";
import xlsx from "xlsx";
import path from "path";
import { format } from "date-fns";
import { environments } from "../environments";
import axios from "axios";
import moment from "moment";
import { v4 as uuid } from "uuid";
import fs from "fs-extra";

export const downloadCertificatesPerInstance = async (clientId: string) => {
  try {
    const dateStart = new Date("2023-10-27T00:00:00.000Z");
    const dateEnd = new Date("2023-11-27T00:00:00.000Z");
    const { user_course_cl } = await client.request(
      GET_USERS_COURSE_PER_INSTANCE,
      { dateStart, dateEnd, clientId },
    );
    const usersApproved = user_course_cl.filter((c: any) => {
      let approved;
      if (c.course.min_score !== null && c.course.min_progress !== null) {
        approved =
          c.score >= c.course.min_score && c.progress >= c.course.min_progress;
      } else {
        approved =
          c.score >= c.course.min_score || c.progress >= c.course.min_progress;
      }
      if (c.completed_at && approved) return true;
      return false;
    });
    //Generating Excel counter
    const usersCertsExcel: any[] = [];
    usersApproved.forEach((uc: any) => {
      const findedIndex = usersCertsExcel.findIndex((i) => {
        return i.Id === uc.user_fb;
      });
      if (findedIndex < 0) {
        usersCertsExcel.push({
          Id: uc.user_fb,
          Name: uc.user.full_name,
          Email: uc.user.email,
          Certs: 1,
        });
        return;
      }
      usersCertsExcel[findedIndex].Certs = ++usersCertsExcel[findedIndex].Certs;
    });
    console.log({ usersApproved: usersApproved.length });
    const sheet = xlsx.utils.json_to_sheet(usersCertsExcel);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, sheet, "Certificates");
    xlsx.writeFile(workbook, `./CertsCounter-${clientId}.xlsx`);

    console.log({
      certs: usersApproved.length,
      clientId,
      type: "Normal Certs",
    });
    const pathFolder = path.resolve(
      __dirname,
      `../../certificates/${clientId}/`,
    );
    const exist = await fs.pathExists(pathFolder);
    if (!exist) {
      await fs.mkdirs(pathFolder);
    }
    for (let i = 0; i < usersApproved.length; i++) {
      console.log("Start", i);
      const { user, course, completed_at, user_fb, course_fb } =
        usersApproved[i];
      let response;
      if (course.client_id === "content") {
        console.log("Content");
        const params = {
          name: user.full_name
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(".", ""),
          course: course.name.normalize("NFD").replace(/[\u0300-\u036f]/g, ""),
          date: format(new Date(completed_at), "dd MM yyyy"),
          ucid: user.user_fb,
          duration: course.duration + " hrs",
          modules: course.modules.length,
        };
        const searchParams = new URLSearchParams(params);
        const { data } = await axios.get(
          `${environments.CERT_SERVER_URL}${environments.CERT_LWL_PDF}?${searchParams}`,
        );
        response = data;
      } else {
        console.log("Normal");
        const params = {
          clientId,
          userName: user.full_name,
          courseName: course.name,
          date: moment(new Date(completed_at)).format("YYYY-MM-DD"),
        };
        const searchParams = new URLSearchParams(params);
        const { data } = await axios.get(
          `${environments.CERT_SERVER_URL}${environments.CERT_SERVER_ENDPOINT}?${searchParams}`,
        );
        response = data;
      }
      const certificate = await axios.get(
        `${environments.CERT_SERVER_URL}/${response}`,
        {
          responseType: "arraybuffer",
        },
      );

      const userFilePath = `${pathFolder}/${user.full_name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trimStart()
        .replace("?", "-")
        .replace("|", "-")
        .trimEnd()
        .replace(/\s/g, "-")
        .replace(":", "")}-${user_fb}`;
      if (!fs.existsSync(userFilePath)) {
        await fs.mkdir(userFilePath);
      }
      const filename = `/${course.name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trimStart()
        .replace("?", "-")
        .replace("|", "-")
        .trimEnd()
        .replace(/\s/g, "-")
        .replace(":", "")}-${course_fb}.pdf`;
      await fs.writeFile(userFilePath + filename, certificate.data);
    }
    console.log({ certs: usersApproved.length, clientId });
  } catch (err) {
    console.log({ err });
  }
};
