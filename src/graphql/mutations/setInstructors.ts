import { gql } from "graphql-request";

export const SET_NEW_INSTRUCTORS = gql`
  mutation SET_NEW_INSTRUCTORS(
    $input: courses_cl_set_input!
    $courseFb: String
  ) {
    update_courses_cl(where: { course_fb: { _eq: $courseFb } }, _set: $input) {
      returning {
        course_fb
      }
    }
  }
`;
