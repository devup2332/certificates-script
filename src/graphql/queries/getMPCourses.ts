import { gql } from "graphql-request";

export const GET_MP_COURSES = gql`
  query GET_MP_COURSES($clientId: String) {
    courses: courses_cl(
      where: { client_id: { _eq: "content" }, stage: { _gte: 7 } }
      limit: 10
      offset: 3
    ) {
      name
      course_fb
      topic_id
      topic {
        name
        topic_fb
      }
      welcome_message
      min_score
      min_progress
    }
    topics: topic_cl(where: { client_id: { _eq: "content" } }) {
      name
      topic_fb
      image_url
    }
    topicsClientId: topic_cl(where: { client_id: { _eq: $clientId } }) {
      name
      topic_fb
      image_url
    }
  }
`;
