import { gql } from "graphql-request";

export const GET_ALL_FORUMS_AND_TASKS_INFO = gql`
  query GET_ALL_FORUMS_AND_TASKS_INFO {
    users_lessons_cl(
      where: {
        lesson: {
          type: { _in: ["F", "T"] }
          weight: { _eq: true }
          assign: { _eq: 0 }
        }
      }
    ) {
      lesson {
        name
        lesson_fb
      }
      user {
        user_fb
        email
      }
      score
    }
  }
`;
