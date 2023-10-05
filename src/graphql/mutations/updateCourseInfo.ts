import { gql } from "graphql-request";

export const UPDATE_COURSE_INFO = gql`
  mutation UPDATE_COURSE_INFO(
    $courseId: String
    $newInfo: courses_cl_set_input
  ) {
    update_courses_cl(
      where: { course_fb: { _eq: $courseId } }
      _set: $newInfo
    ) {
      affected_rows
    }
  }
`;
