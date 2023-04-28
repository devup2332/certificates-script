import { client } from "../graphql/client";
import {
  GET_STPS_CATALOG,
  GET_USER_COURSES_DC3_PER_INSTANCE,
} from "../queries";
import xlsx from "xlsx";
import fs from "fs-extra";
import moment from "moment";
import axios from "axios";
import { environments } from "../environments";

export const downloadDC3CertificatesForAnInstance = async (
  clientId: string
) => {
  const dateStart = new Date("2022-01-01T00:00:00.000Z");
  const dateEnd = new Date();
  const { user_course_cl } = await client.request(
    GET_USER_COURSES_DC3_PER_INSTANCE,
    {
      clientId,
      dateEnd,
      dateStart,
    }
  );
  const approvedUsers = user_course_cl.filter((c: any) => {
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

  const usersCertsExcel: any[] = [];
  approvedUsers.forEach((uc: any) => {
    const findedIndex = usersCertsExcel.findIndex((i) => {
      return i.Id === uc.user_fb;
    });
    if (findedIndex < 0) {
      usersCertsExcel.push({
        Id: uc.user_fb,
        Email: uc.user.email,
        Name: uc.user.full_name,
        Certs: 1,
      });
      return;
    }
    usersCertsExcel[findedIndex].Certs = ++usersCertsExcel[findedIndex].Certs;
  });
  const sheet = xlsx.utils.json_to_sheet(usersCertsExcel);
  const workbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(workbook, sheet, "Certificates");
  xlsx.writeFile(workbook, `./CertsCounterDc3-${clientId}.xlsx`);

  const stpsTematica = await client.request(GET_STPS_CATALOG, {
    catalogId: "tematica",
  });

  const { stps_catalog } = await client.request(GET_STPS_CATALOG, {
    catalogId: "ocupaciones",
  });

  console.log({
    approvedUsers: approvedUsers.length,
    user_course_cl: user_course_cl.length,
    type: "DC3",
  });
  const pathFolder = `DC3Certificates/${clientId}`;
  if (!fs.existsSync(pathFolder)) {
    fs.mkdirsSync(pathFolder);
  }
  for (let i = 0; i < approvedUsers.length; i++) {
    console.log("Start : " + i);
    const {
      user,
      course,
      created_at,
      last_update,
      completed_at,
      user_fb,
      course_fb,
    } = approvedUsers[i];

    const tematicaName = stpsTematica?.stps_catalog.find(
      (t: any) => t.code === course.dc3_data_json?.tematica
    );
    const ocupacionName = stps_catalog?.find(
      (t: any) => t.code == user?.additional_info_json?.clave_ocupacion
    );
    let stpsAgente = "";

    if (course.type === "RG") {
      stpsAgente = `${course?.created_by?.firstName ?? ""} ${
        course?.created_by?.lastName ?? ""
      }`;
    } else if (
      course.dc3_data_json?.instructorType &&
      course.dc3_data_json?.instructorType > 0 &&
      course.dc3_data_json?.stps &&
      course.dc3_data_json.stps !== ""
    ) {
      stpsAgente = course?.dc3_data_json?.stps;
    } else {
      stpsAgente = `${course?.created_by?.firstName ?? ""} ${
        course?.created_by?.lastName ?? ""
      }`;
    }

    const instructorName =
      user.business_name?.instructor?.full_name ||
      (course?.dc3_data_json?.instructorType &&
        course?.dc3_data_json?.instructorType === 1)
        ? `${course?.created_by?.firstName ?? ""} ${
            course?.created_by?.lastName ?? ""
          }`
        : course?.dc3_data_json?.instructorName;
    const fechaFinCurso = completed_at || last_update;
    const firstName = user?.first_name;
    const lastName = user?.last_name;

    const requestData = {
      name: firstName,
      lastName: lastName,
      curp: user?.curp,
      shcp: user?.business_name?.shcp,
      stps: stpsAgente,
      tematica: tematicaName?.description || course?.dc3_data_json?.tematica,
      razonSocial: user?.business_name?.name,
      instructorName:
        course?.dc3_data_json?.instructorType &&
        course?.dc3_data_json?.instructorType > 0
          ? instructorName
          : course?.dc3_data_json?.stps
          ? course?.dc3_data_json.stps
          : course.instructors_data[0].firstName,
      bossName: user?.business_name?.boss_name,
      workersBossName: user?.business_name?.boss_name_workers,
      logo: user?.client_id,
      ocupacion: ocupacionName?.description ?? user?.user_ou?.name,
      puesto: user.user_role.name,
      nombreEmpresa: user.client?.name,
      courseName: course.name,
      duration: course.duration,
      inicioCurso: created_at
        ? moment(created_at).format("YYYY-MM-DD")
        : moment(last_update).format("YYYY-MM-DD"),
      finCurso: fechaFinCurso,
    };

    const { data } = await axios.get<string>(environments.CERT_DC3_SERVER, {
      params: requestData,
    });
    const response = await axios.get(`https://server.lernit.app/${data}`, {
      responseType: "arraybuffer",
    });
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
      fs.mkdir(userFilePath);
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
    const file = userFilePath + filename;
    await fs.writeFile(file, response.data);
  }
};
