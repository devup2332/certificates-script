import { gql } from "graphql-request";

export const GET_COMPETENIES_VOLDEMORT = gql`
  query GET_COMPETENIES_VOLDEMORT($clientId: uuid) {
    competenciesVoldemort: competencies(
      where: { client_id: { _eq: $clientId } }
    ) {
      name
      general_evaluation
      id
    }
  }
`;
