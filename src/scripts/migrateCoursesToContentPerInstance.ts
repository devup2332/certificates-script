import { knexLXP } from "../database/knex";
import {
  ActivitiesFields,
  CourseFields,
  LessonsFields,
  ModulesFields,
  QuestionsFields,
} from "../database/schemas";
import { makeid } from "../utils/makeId";

export const migrateCoursesToContentPerInstance = async (
  clientId: string,
  idCourses?: string[],
) => {
  const coursesIds: any[] = [
    "zE9IevNrOws69El1fBFI",
    "3uRvWpmCROQXz3GPXKjM",
    "xMdVmwP9H2mK0Dkd5wfS",
    "TyDZFkfaL3fnyO5A3m0c",
  ];

  const courses = await knexLXP
    .select(CourseFields)
    .from("courses_cl")
    .whereIn("course_fb", idCourses || coursesIds)
    .where("client_id", "=", clientId)
    .where("is_deleted", "=", false)
    .where("stage", ">=", "7");

  console.log({
    coursesToMigrate: courses.length,
  });
  for (const course of courses) {
    const { course_fb, name, type } = course;
    const newCourseFb = makeid();
    const courseWithNewId = {
      ...course,
      course_fb: newCourseFb,
      client_id: "content",
      origin: clientId,
    };

    for (const key in courseWithNewId) {
      if (typeof courseWithNewId[key] === "object" && courseWithNewId[key]) {
        const p = JSON.stringify(courseWithNewId[key]);
        courseWithNewId[key] = p;
      }
    }
    const modules = await knexLXP
      .select(ModulesFields)
      .from("module_cl")
      .where("course_fb", "=", course_fb);

    const lessons = await knexLXP
      .select(LessonsFields)
      .from("lessons_cl")
      .where("course_fb", course_fb)
      .whereNotNull("stage")
      .whereNull("deleted_at");

    const activities = await knexLXP
      .select(ActivitiesFields)
      .from("activity_tb")
      .where("course_fb", course_fb);

    const weeks = await knexLXP
      .from("weeks_tb")
      .where("course_fb", course_fb)
      .whereNull("deleted_at");

    const lessonsArray: any[] = [];
    await knexLXP.into("courses_cl").insert(courseWithNewId);

    console.log("Curso creado : " + name + " en Market Place");
    for (const module of modules) {
      const newModuleId = makeid();
      const moduleData = {
        ...module,
        course_fb: newCourseFb,
        module_fb: newModuleId,
      };

      for (const key in moduleData) {
        if (typeof moduleData[key] === "object" && moduleData[key]) {
          const p = JSON.stringify(moduleData[key]);
          moduleData[key] = p;
        }
      }

      await knexLXP.into("module_cl").insert(moduleData);

      if (type === "SM") {
        console.log(`Course type SM ${name}`);
        const newWeeks = weeks?.filter(
          (w: any) => w.module_fb === module.module_fb,
        );
        for (const week of newWeeks) {
          const newWeekId = makeid();
          const weekData = {
            ...week,
            course_fb: newCourseFb,
            module_fb: newModuleId,
            week_fb: newWeekId,
          };

          for (const key in weekData) {
            if (typeof weekData[key] === "object" && weekData[key]) {
              const p = JSON.stringify(weekData[key]);
              weekData[key] = p;
            }
          }

          await knexLXP.into("weeks_tb").insert(weekData);

          const newActivities = activities.filter(
            (act: any) => act.week_fb === week.week_fb,
          );

          for (const activity of newActivities) {
            const newActivityId = makeid();
            const newActivity = {
              ...activity,
              course_fb: newCourseFb,
              module_fb: newModuleId,
              week_fb: newWeekId,
              activity_fb: newActivityId,
            };

            for (const key in newActivity) {
              if (typeof newActivity[key] === "object" && newActivity[key]) {
                const p = JSON.stringify(newActivity[key]);
                newActivity[key] = p;
              }
            }

            await knexLXP.into("activity_tb").insert(newActivity);
            const newLessons = lessons.filter(
              (l: any) => l.activity_id === activity.activity_fb,
            );
            newLessons.forEach((nl: any) => {
              lessonsArray.push({
                ...nl,
                course_fb: newCourseFb,
                module_id: newModuleId,
                activity_id: newActivityId,
              });
            });
          }
        }
      } else {
        const filteredLessons = lessons.filter(
          (l: any) => l.module_id === module.module_fb,
        );
        filteredLessons.forEach((l: any) => {
          lessonsArray.push({
            ...l,
            course_fb: newCourseFb,
            module_id: newModuleId,
          });
        });
      }
    }
    console.log("Insertando Lessons :" + name);
    for (const lesson of lessonsArray) {
      const data = { ...lesson };
      const questions =
        (await knexLXP
          .select(QuestionsFields)
          .from("lesson_questions_tb")
          .where("lesson_fb", lesson.lesson_fb)) || [];
      const lessonId = makeid();
      const newData = {
        ...data,
        lesson_fb: lessonId,
      };

      for (const key in newData) {
        if (typeof newData[key] === "object" && newData[key]) {
          const p = JSON.stringify(newData[key]);
          newData[key] = p;
        }
      }
      await knexLXP.into("lessons_cl").insert(newData);

      console.log("Creando Leccion : " + lesson.name + " en el curso " + name);
      if (questions.length > 0) {
        const newQuestions = questions.map((lq: any) => ({
          ...lq,
          lesson_fb: lessonId,
          question_fb: makeid(),
        }));
        newQuestions.forEach((q: any) => {
          for (const key in q) {
            if (typeof q[key] === "object" && q[key]) {
              const p = JSON.stringify(q[key]);
              q[key] = p;
            }
          }
        });
        await knexLXP.into("lesson_questions_tb").insert(newQuestions);
      }
    }
  }
};
