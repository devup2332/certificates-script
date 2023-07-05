import { gql } from "graphql-request";

export const GET_COURSES_PER_INSTANCE = gql`
  query GET_COURSES_PER_INSTANCE($clientId: String) {
    courses: courses_cl(
      where: {
        client_id: { _eq: $clientId }
        type: { _eq: "OL" }
        stage: { _gte: 7 }
      }
    ) {
      course_fb
      name
    }
  }
`;
