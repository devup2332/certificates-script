import { gql } from "graphql-request";

export const GET_COURSES_TO_MIGRATE_TO_CONTENT = gql`
  query GET_COURSES_TO_MIGRATE_TO_CONTENT($clientId: String) {
    courses_cl(where: { client_id: { _eq: $clientId }, stage: { _gte: 7 } }) {
      name
    }
  }
`;
