import { gql } from "graphql-request";

export const GET_COURSES_INSTANCE = gql`
  query GET_COURSES_INSTANCE($clientId: String) {
    courses_cl(
      where: {
        client_id: { _eq: $clientId }
        stage: { _gte: 7 }
        is_deleted: { _eq: false }
      }
    ) {
      name
      course_fb
    }
  }
`;

export const GET_COURSE_INTANCE_MARKETPLACE = gql`
  query GET_COURSES_INSTANCE_MARKETPLACE($clientId: String) {
    user_course_cl(
      where: {
        user: { client_id: { _eq: $clientId } }
        _and: { course: { client_id: { _eq: "content" } } }
      }
    ) {
      course {
        name
      }
    }
  }
`;
