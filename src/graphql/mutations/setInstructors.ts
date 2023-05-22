import { gql } from "graphql-request";

export const SET_NEW_INSTRUCTORS = gql`
  mutation SET_NEW_INSTRUCTORS($input: jsonb, $courseFb: String) {
    update_courses_cl(
      where: { course_fb: { _eq: $courseFb } }
      _set: { instructors_json: $input }
    ) {
      returning {
        course_fb
      }
    }
  }
`;
