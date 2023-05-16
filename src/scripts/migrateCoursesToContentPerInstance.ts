import { client } from "../graphql/client";
import { SAVE_NEW_ACTIVITY } from "../graphql/mutations/newActivity";
import { SAVE_NEW_COURSE } from "../graphql/mutations/newCourse";
import { SAVE_NEW_LESSON } from "../graphql/mutations/newLesson";
import { SAVE_NEW_MODULE } from "../graphql/mutations/newModule";
import { SAVE_NEW_QUESTION } from "../graphql/mutations/newQuestion";
import { SAVE_NEW_WEEK } from "../graphql/mutations/newWeek";
import {
  GET_COURSES_TO_MIGRATE_TO_CONTENT,
  GET_LESSONS_AND_MODULES_INFO_PER_COURSE,
} from "../graphql/queries/getCoursesToMigrateToContent";
import { makeid } from "../utils/makeId";

export const migrateCoursesToContentPerInstance = async (clientId: string) => {
  const { courses } = await client.request(GET_COURSES_TO_MIGRATE_TO_CONTENT, {
    clientId,
  });

  for (const course of courses) {
    const { course_fb, name } = course;
    const newCourseFb = makeid();
    const courseWithNewId = {
      ...course,
      course_fb: newCourseFb,
      client_id: "content",
      origin: clientId,
    };

    const { modules, lessons, activities, weeks } = await client.request(
      GET_LESSONS_AND_MODULES_INFO_PER_COURSE,
      { courseFb: course_fb }
    );
    const lessonsArray: any[] = [];
    const { new_course } = await client.request(SAVE_NEW_COURSE, {
      input: courseWithNewId,
    });
    console.log("Curso creado : " + name + " en Content");
    for (const module of modules) {
      const newModuleId = makeid();
      const moduleData = {
        ...module,
        course_fb: newCourseFb,
        module_fb: newModuleId,
      };

      const { newModule } = await client.request(SAVE_NEW_MODULE, {
        input: moduleData,
      });

      if (course.type === "SM") {
        const newWeeks = weeks?.filter(
          (w: any) => w.module_fb === module.module_fb
        );
        for (const week of newWeeks) {
          const newWeekId = makeid();
          const weekData = {
            ...week,
            course_fb: newCourseFb,
            module_fb: newModuleId,
            week_fb: newWeekId,
          };
          const response = await client.request(SAVE_NEW_WEEK, {
            input: weekData,
          });

          const newActivities = activities.filter(
            (act: any) => act.week_fb === week.week_fb
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

            await client.request(SAVE_NEW_ACTIVITY, {
              input: newActivity,
            });
            const newLessons = lessons.filter(
              (l: any) => l.activity_id === activity.activity_fb
            );
            newLessons.forEach((nl: any) => {
              lessonsArray.push({
                ...nl,
                course_fb: newCourseFb,
                module_id: newModule,
                activity_id: newActivityId,
              });
            });
          }
        }
      } else {
        const filteredLessons = lessons.filter(
          (l: any) => l.module_id === module.module_fb
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
      const questions = data.questions || [];
      const lessonId = makeid();
      delete data.questions;
      const newData = {
        ...data,
        lesson_fb: lessonId,
      };
      const { newLesson } = await client.request(SAVE_NEW_LESSON, {
        input: newData,
      });

      console.log("Creando Leccion : " + lesson.name + " en el curso " + name);
      if (questions.length > 0) {
        const newQuestions = questions.map((lq: any) => ({
          ...lq,
          lesson_fb: lessonId,
          question_fb: makeid(),
        }));
        const response = await await client.request(SAVE_NEW_QUESTION, {
          objects: newQuestions,
        });
      }
    }
  }
};
