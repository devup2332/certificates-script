import xlsx from "xlsx";
import { client } from "../graphql/client";
import { GET_COMPETENCIES_PER_INSTANCE } from "../graphql/queries/getCompetenciesPerInstance";
import { GET_COURSES_INSTANCE } from "../graphql/queries/getInfoCourses";
import { GET_TOPICS_INSTANCE } from "../graphql/queries/getTopicsInstance";
import { getLevelsPerInstance } from "../utils/getLevelsPerInstance";
export const syncCoursesByExcelV2 = async () => {
  const clientId = "universidadexecon";
  const wb = xlsx.readFile("data.xlsx");
  const coursesMP: any[] = xlsx.utils.sheet_to_json(wb.Sheets["coursesMP"]);
  const coursesClient: any[] = xlsx.utils.sheet_to_json(
    wb.Sheets["coursesClient"],
  );
  // console.log({ coursesClient });
  const { courses_cl: coursesHasuraMP } = await client.request(
    GET_COURSES_INSTANCE,
    {
      clientId: "content",
    },
  );

  const { competenciesLXP } = await client.request<
    Promise<{ competenciesLXP: any[] }>
  >(GET_COMPETENCIES_PER_INSTANCE, {
    clientId,
  });
  const { topicsInstance } = await client.request(GET_TOPICS_INSTANCE, {
    clientId,
  });
  const levelsInstance = await getLevelsPerInstance(clientId);

  // Syncing coursesMP

  const coursesNo: string[] = [];
  for (const courseMP of coursesMP) {
    const f = coursesHasuraMP.filter((c: any) => {
      const idCourse = courseMP["ID Curso"];
      if (idCourse) return c.course_fb === idCourse;
      return (
        c.name.trim().toLowerCase() ===
        courseMP["Nombre de Curso"].trim().toLowerCase()
      );
    });
    if (f.length === 0) continue;
    if (f.length > 1) continue;

    const competencias =
      courseMP["Competencia (as)"]?.split(",").map((c: string) => c.trim()) ||
      [];
    const levelsExcel = (courseMP["Niveles"] as string)?.split(",") || [];
    const compLvls: any[] = [];

    competencias.forEach((comp: string, i: number) => {
      const f = competenciesLXP.find((c) => {
        const name1 = (c.name as string).trim().toLowerCase();

        const name2 = comp.trim().toLowerCase();

        return name1 == name2;
      });
      if (!f) {
        const d = coursesNo.find((c) => c === courseMP["Nombre de Curso"]);
        if (!d) coursesNo.push(courseMP["Nombre de Curso"]);
        return;
      }
      const lvl = levelsInstance.find((l: any) => {
        const name1 = l.name
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .split("-")[0]
          .trim()
          .toLowerCase();
        const name2 = (
          levelsExcel.length === 1 ? levelsExcel[0] : levelsExcel[i]
        )
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .split("-")[0]
          .trim()
          .toLowerCase();
        return name1 === name2;
      });
      compLvls.push({
        levels: [
          {
            id: lvl.id,
            name: lvl.name,
          },
        ],
        competencieId: f.competencies_fb,
        competencieName: f.name,
      });
    });
    const topicSelected = topicsInstance?.find(
      (t: any) =>
        t.name.trim().toLowerCase() === courseMP["Tema"]?.trim().toLowerCase(),
    );
    if (!topicSelected) console.log({ name: courseMP['Nombre de Curso'] });
    // console.log({ compLvls: (compLvls as any)[1].levels, courseMP });
  }
  // console.log({ coursesNo: coursesNo });
};
