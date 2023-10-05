import { gql } from "graphql-request";

export const GET_COURSES_POSTS_INFO = gql`
  query GET_COURSES_POSTS_INFO($clientId: String, $courseNames: [String]) {
    courses: courses_cl(
      where: { client_id: { _eq: $clientId }, name: { _in: $courseNames } }
    ) {
      name
      lessons {
        lesson_posts {
          message
          post_fb
        }
      }
    }
  }
`;
