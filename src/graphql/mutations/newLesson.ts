import { gql } from "graphql-request";

export const SAVE_NEW_LESSON = gql`
  mutation saveLesson($input: lessons_cl_insert_input!) {
    newLesson: insert_lessons_cl_one(object: $input) {
      lesson_fb
    }
  }
`;
