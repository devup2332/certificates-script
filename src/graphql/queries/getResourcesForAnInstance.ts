import { gql } from "graphql-request";

export const GET_ALL_RESOURCES_FOR_AN_INSTANCE = gql`
  query GET_ALL_RESOURCES_FOR_AN_INSTANCE($clientId: String) {
    courses_cl(where: { client_id: { _eq: $clientId } }) {
      name
      course_fb
      client_id
      created_by_json
    }

    resourcesWithoutCourse: lessons_cl(
      where: { client_id: { _eq: $clientId }, course_fb: { _is_null: true } }
    ) {
      type
      name
      client_id
      lesson_fb
      created_by
    }

    marketplace_data_tb(where: { client_fb: { _eq: $clientId } }) {
      courses_cl {
        name
        client_id
        created_by_json
      }
    }
  }
`;
