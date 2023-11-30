import xlsx from "xlsx";
import { client } from "../graphql/client";
import { GET_COMPETENCIES_PER_INSTANCE } from "../graphql/queries/getCompetenciesPerInstance";
import {
  GET_COURSES_BY_ARRAY_OF_IDS,
  GET_COURSES_INFO_BY_NAMES,
} from "../graphql/queries/getInfoCoursesByNames";
import { GET_TOPICS_INSTANCE } from "../graphql/queries/getTopicsInstance";
import { getLevelsPerInstance } from "../utils/getLevelsPerInstance";
import { INSERT_COURSE_MP_TO_AN_INTANCE } from "../graphql/mutations/insertCourseMPToAnInstance";

export const bulkUploadOfCourses = async (clientId: string) => {
  const coursesNotFounded = [
    "syBcT0asfMopxcyOzDas",
    "SjvWFiY1mSFAuMrbpMhQ",
    "DRqZPqWgcgKOTe9Kahn4",
    "PkQ6l7VN0fLg6kYRnoFp",
    "RIiRZbnpgx5HM1VyLsbr",
    "oJjziZdkzkc64kwRmoL4",
    "akVVZvJ3XniLrMuSkJXZ",
    "ANIAcktQj34xACsw40Cg",
    "rU27TXvIgJnLOytVVHOn",
    "cyyY2n6aPku2Aglgtyfk",
    "axelhR0kxdWtxUlWsKM6",
    "LeQw206eAhfokBx3E4xd",
    "sbam37lAe9GfOElYcOBE",
    "GCXpZL5l0suCzsK0eFEM",
    "JtTYqOxZE0vyTNns2VlJ",
    "xLCGuWFBpyoUcFXgVka0",
  ];
  const wb = xlsx.readFile("courses.xlsx");
  const coursesExcel: any[] = xlsx.utils.sheet_to_json(wb.Sheets["courses"]);
  const names = coursesExcel.map((i: any) => i["Nombre de Curso"]);
  const { competenciesLXP } = await client.request(
    GET_COMPETENCIES_PER_INSTANCE,
    {
      clientId: "onecard",
    }
  );
  // console.log({ competenciesLXP });
  const levels = await getLevelsPerInstance("onecard");

  const { topicsInstance } = await client.request(GET_TOPICS_INSTANCE, {
    clientId: "onecard",
  });
  const { courses } = await client.request(GET_COURSES_INFO_BY_NAMES, {
    names,
    clientId,
  });

  const { courses: remainingCourses } = await client.request(
    GET_COURSES_BY_ARRAY_OF_IDS,
    {
      ids: coursesNotFounded,
      clientId,
    }
  );

  courses.push(...remainingCourses);
  let i = 0;

  const coursesFounded: any[] = [];

  coursesExcel.forEach((cExcel: any) => {
    const f = courses.filter((c: any) => {
      return c.name.trim() === cExcel["Nombre de Curso"].trim();
    });
    if (!f.length) return;
    const { course_fb } = f[0];
    if (f.length) {
      const compLvls: any[] = [];
      const lvl = levels.find(
        (l: any) =>
          l.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "") ===
          cExcel["Niveles"]
      );
      const eComp = cExcel["Competencia (as)"]
        .split(",")
        .map((i: string) => i.trim());
      eComp.forEach((c: string) => {
        const comp = competenciesLXP.find((cLxp: any) => {
          console.log({ cLxp, c });
          return cLxp.name === c;
        });
        if (!comp) return;
        compLvls.push({
          levels: [
            {
              id: lvl.id,
              name: lvl.name,
            },
          ],
          competencieId: comp.competencies_fb,
          competencieName: comp.name,
        });
      });
      coursesFounded.push({
        ...cExcel,
        id: course_fb,
        privacyLessons:
          cExcel["Privacidad de lecciones"].trim() !== "Mostrar lecciones",
        min_score: cExcel["Calificación mínina ptos"],
        min_progress: cExcel["Avance para aprobar curso"],
        privacity: cExcel["Privacidad"] === "Privado" ? "private" : "public",
        topicName: cExcel["Tema"],
        welcomeMessage: cExcel["Mensaje de Bienvenida"],
        compLvls,
      });
    }
  });

  for (const cE of coursesFounded) {
    const {
      id,
      privacyLessons,
      min_score,
      min_progress,
      privacity,
      topicName,
      welcomeMessage,
      compLvls,
    } = cE;
    const { topic_fb: topic_id } = topicsInstance.find(
      (t: any) => t.name === topicName
    );
    const hasuraData = {
      course_fb: id,
      client_fb: "onecard",
      available_in_client: true,
      roles_json: [],
      lesson_privacy: privacyLessons,
      min_score,
      min_progress,
      ous_json: [],
      privacity,
      topic_id,
      welcome_message: welcomeMessage,
      restart_time: 24,
      available_dc3_marketplace: false,
      competencies_levels: compLvls,
    };
    const response = await client.request(INSERT_COURSE_MP_TO_AN_INTANCE, {
      object: hasuraData,
    });
    console.log({ response });
  }
};
