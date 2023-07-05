import { gql } from "graphql-request";

export const GET_COMPETENCIES_PER_INSTANCE = gql`
  query GET_COMPETENCIES_PER_INSTANCE($clientId: String) {
    competenciesLXP: competencies_cl(where: { client_id: { _eq: $clientId } }) {
      name
      created_at
      competencies_fb
    }
  }
`;
