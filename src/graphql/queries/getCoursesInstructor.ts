import { gql } from "graphql-request";

export const GET_COURSES_INSTRUCTOR_INFO = gql`
  query GET_COURSES_INSTRUCTOR_INFO($clientId: String) {
    courses_cl(where: { client_id: { _eq: $clientId } }) {
      instructors_json
      course_fb
      name
    }
  }
`;
