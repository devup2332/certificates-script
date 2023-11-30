import { gql } from "graphql-request";

export const GET_COURSES_INFO_BY_NAMES = gql`
  query GET_COURSES_INFO_BY_NAMES($names: [String!], $clientId: String) {
    courses: courses_cl(
      where: {
        name: { _in: $names }
        client_id: { _eq: $clientId }
        stage: { _gte: 7 }
        is_deleted: { _eq: false }
      }
    ) {
      name
      course_fb
      client_id
    }
  }
`;

export const GET_COURSES_BY_ARRAY_OF_IDS = gql`
  query GET_COURSES_INFO_BY_NAMES($ids: [String!], $clientId: String) {
    courses: courses_cl(
      where: {
        course_fb: { _in: $ids }
        client_id: { _eq: $clientId }
        stage: { _gte: 7 }
        is_deleted: { _eq: false }
      }
    ) {
      name
      course_fb
      client_id
    }
  }
`;
