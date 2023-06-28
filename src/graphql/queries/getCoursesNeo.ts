import { gql } from "graphql-request";

export const GET_COURSES_NEO = gql`
  query GET_COURSES_NEO($clientId: String) {
    courses: courses_cl(
      where: {
        client_id: { _eq: $clientId }
        dc3_data_json: { _is_null: false }
      }
    ) {
      name
      course_fb
      instructors_data
      dc3_data_json
      instructors_json
    }
  }
`;
