import { gql } from "graphql-request";

export const GET_MP_COURSES = gql`
  query GET_MP_COURSES($clientId: String) {
    courses: courses_cl(
      where: {
        client_id: { _eq: "content" }
        stage: { _gte: 7 }
        is_deleted: { _eq: false }
      }
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

export const GET_MP_COURSES_WITH_CUSTOM_VARIABLES = gql`
  query GET_MP_COURSES($whereVariables: courses_cl_bool_exp) {
    courses: courses_cl(where: $whereVariables) {
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
  }
`;
