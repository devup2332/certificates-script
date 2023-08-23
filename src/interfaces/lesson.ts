export type ILessonType = "A" | "V" | "E" | "L" | "H" | "S" | "F" | "T";

export interface IModule {
  name: string;
}

export interface IQuestion {
  id: number;
  question_fb: string;
  type: string;
  image_url: string;
  answer: number;
  text: string;
  options: any[];
}

export interface ICourse {
  name: string;
  course_fb: string;
  type: string;
  users_course: any[];
  lessons: ILesson[];
}
export interface ILesson {
  name: string;
  stage: number;
  type: ILessonType;
  html: any;
  embed_json: any;
  index: number;
  image_url: string;
  lecture: any;
  subtype?: "HTML" | "PDF";
  video: any;
  lesson_fb: string;
  questions: IQuestion[];
  videoalter: any;
  module: IModule;
  module_id: string;
  description: string;
}
