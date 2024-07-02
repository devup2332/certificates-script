import { gql } from "graphql-request";

export const UPDATE_USER_LESSONS = gql`
  mutation UPDATE_USER_LESSONS($usersId: [String], $lessonsId: [String]) {
    update_users_lessons_cl(
      where: { user_fb: { _in: $usersId }, lesson_fb: { _in: $lessonsId } }
      _set: { score: 100 }
    ) {
      affected_rows
    }
  }
`;


export const DELETE_USER_LESSONS = gql`
  mutation deleteUserLessons($userId: String!, $courseId: String!) {
    delete_users_lessons_cl(where: {user_fb: {_eq: $userId}, course_id: {_eq: $courseId}}) {
      affected_rows
    }
  }
`