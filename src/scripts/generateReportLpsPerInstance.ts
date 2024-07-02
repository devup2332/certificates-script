import { client } from "../graphql/client";
import { GET_USERS_LP_INFO } from "../graphql/queries/getInfoLps";
import moment from "moment";
import xlsx from "xlsx";
import path from "path";
import fs from "fs-extra";

const groupByMethod = (array: any[], key: string) => {
  const data: any[] = [];
  for (const item of array) {
    const g = (item[key] as string) || "Sin Condicion";
    const fIndex = data.findIndex((i: any) => i[g]);
    if (fIndex >= 0) {
      data[fIndex][g].push({ ...item });
      continue;
    }
    const newItem = {
      [g]: [{ ...item }],
    };
    data.push(newItem);
  }
  return data;
};

export const generateReportLpsPerInstance = async (instance: string) => {
  const dateStart = new Date("2020-01-01T00:00:00.000Z");
  const dateEnd = new Date("2024-05-31T00:00:00.000Z");
  const { lps } = await client.request(GET_USERS_LP_INFO, {
    clientId: instance,
    dateStart,
    dateEnd,
  });
  const newDb: any[] = [];

  const validLps = lps.filter((lp: any) => lp.users_learning_path.length);
  for (const lp of validLps) {
    const {
      users_learning_path: users,
      name,
      courses_json,
      percentage_to_pass,
    } = lp;
    const data: any[] = [];
    for (const user of users) {
      const { user_learningpath, created_at, progress } = user;
      const {
        additional_info_json,
        user_role,
        full_name,
        email,
        user_ou,
        user_courses_cl,
      } = user_learningpath;
      const id = user_role?.name.split(" - ")[0];
      const dealer = user_role?.name;
      const coursesIds: string[] = courses_json.map((c: any) => c.id);
      let sum = 0;
      user_courses_cl.forEach((uc: any) => {
        const { score, course } = uc;
        if (!coursesIds.includes(course?.course_fb)) return;
        sum += Number(score);
      });
      const totalScore = sum / coursesIds.length;
      let userStatusLp = "";
      if (progress === 0) {
        userStatusLp = "Inactivo";
      }
      if (progress < percentage_to_pass && progress > 0) {
        userStatusLp = "En Progreso";
      }
      if (progress >= percentage_to_pass) {
        userStatusLp = "Aprobado";
      }
      const item: any = {
        Grupo: additional_info_json?.["Grupo_Dlr"] || "",
        ID: id,
        Nombre: full_name,
        Correo: email,
        Puesto: user_ou?.name,
        Dealer: dealer,
        "Estatus del participante": userStatusLp,
        "Fecha de Inscripción": moment(created_at).format("MM-DD-YYYY"),
        Avance: progress,
        Calificación: Math.round(totalScore),
        LP: name,
      };
      user_courses_cl.forEach((uc: any) => {
        const { progress, course } = uc;
        if (!coursesIds.includes(course?.course_fb)) return;
        item[course.name] = progress;
      });
      data.push(item);
      newDb.push(item);
    }
  }
  const groups = groupByMethod(newDb, "Grupo");
  for (const group of groups) {
    const [nameG] = Object.keys(group);
    const items = group[nameG];

    const orderedByLP = groupByMethod(items, "LP");
    console.log({ orderedByLP });
    const bb = xlsx.utils.book_new();

    for (const lp of orderedByLP) {
      const vals: any = Object.values(lp)[0];
      const [name] = Object.keys(lp);
      console.log({ lp });
      const d = vals.map((i: any) => {
        delete i.LP;
        return i;
      });
      const lpSheep = xlsx.utils.json_to_sheet(d);
      xlsx.utils.book_append_sheet(bb, lpSheep, name.substring(0, 31));
    }
    const pathReportsFile = await fs.pathExists(
      path.resolve(__dirname, "../../reports")
    );
    if (!pathReportsFile)
      await fs.mkdir(path.resolve(__dirname, "../../reports"));
    await xlsx.writeFile(bb, `./reports/report-${nameG}.xlsx`);
  }
};
