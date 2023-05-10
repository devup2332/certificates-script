import { gql } from "graphql-request";

export const SAVE_NEW_QUESTION = gql`
  mutation insertNewQuestions($objects: [lesson_questions_tb_insert_input!]!) {
    insert_lesson_questions_tb(objects: $objects) {
      returning {
        id
      }
    }
  }
`;
