import { client } from "../graphql/client";
import { GET_USERS_LP_INFO } from "../graphql/queries/getInfoLps";
import moment from "moment";
import xlsx from "xlsx";

export const generateReportLpsPerInstance = async (instance: string) => {
  const { lps } = await client.request(GET_USERS_LP_INFO, {
    clientId: instance,
  });

  const wb = xlsx.utils.book_new();
  const validLps = lps.filter((lp: any) => lp.users_learning_path.length);
  for (const lp of validLps) {
    const {
      users_learning_path: users,
      name,
      courses_json,
      learning_path_fb,
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
      };
      user_courses_cl.forEach((uc: any) => {
        const { progress, course } = uc;
        if (!coursesIds.includes(course?.course_fb)) return;
        item[course.name] = progress;
      });
      data.push(item);
    }
    const ws = xlsx.utils.json_to_sheet(data);
    xlsx.utils.book_append_sheet(wb, ws, name.substring(0, 31));
    if (learning_path_fb === "ZcNfJWP1KQiwkJy2w8du") console.log({ data });
  }
  xlsx.writeFile(wb, `./report-${instance}.xlsx`);
};
