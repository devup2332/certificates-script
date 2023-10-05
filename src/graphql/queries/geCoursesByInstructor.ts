import { gql } from "graphql-request";

export const GET_COURSES_BY_INSTRUCTOR = gql`
  query GET_COURSES_BY_INSTRUCTOR($clientId: String) {
    courses: courses_cl(where: { client_id: { _eq: $clientId } }) {
      created_by_json
      name
      course_fb
      instructors_json
    }
  }
`;
