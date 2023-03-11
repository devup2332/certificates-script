import { gql } from "graphql-request";

export const RESET_USER_COURSE_STATUS = gql`
  mutation RESET_USER_COURSE_STATUS($usersId: [String], $coursesId: [String]) {
    delete_users_lessons_cl(
      where: {
        course: { course_fb: { _in: $coursesId } }
        user_fb: { _in: $usersId }
      }
    ) {
      affected_rows
    }
    update_user_course_cl(
      where: { user_fb: { _in: $usersId }, course_fb: { _in: $coursesId } }
      _set: { completed_at: null, score: 0, progress: 0, status: "in_progress" }
    ) {
      affected_rows
      returning {
        score
        progress
      }
    }
  }
`;
