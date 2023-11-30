import { gql } from "graphql-request";

export const GET_COURSES_POSTS_INFO = gql`
  query GET_COURSES_POSTS_INFO(
    $clientId: String
    $startDate: timestamptz
    $endDate: timestamptz
  ) {
    lessons: lessons_cl(
      where: {
        _or: [
          { client_id: { _eq: "content" } }
          { client_id: { _eq: $clientId } }
        ]
        type: { _in: ["T", "F"] }
      }
    ) {
      name
      client_id
      course {
        name
        course_fb
      }
      lesson_fb
      lesson_posts(
        where: {
          created_at: { _gte: $startDate, _lte: $endDate }
          user: { client_id: { _eq: $clientId } }
        }
      ) {
        message
        post_fb
      }
    }
  }
`;
