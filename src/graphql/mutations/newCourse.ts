import { gql } from "graphql-request";

export const SAVE_NEW_COURSE = gql`
  mutation saveCourse($input: courses_cl_insert_input!) {
    newCourse: insert_courses_cl_one(object: $input) {
      course_fb
    }
  }
`;
