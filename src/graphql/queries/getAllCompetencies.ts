import { gql } from "graphql-request";

export const GET_ALL_COMPETENCIES = gql`
  query GET_ALL_COMPETENCIES($clientId: String) {
    courses: courses_cl(where: { client_id: { _eq: $clientId } }) {
      name
      client_id
      course_fb
      competencies {
        competencies_fb
        name
      }
    }
  }
`;
