import { gql } from "graphql-request";

export const GET_USERS_INFO_BY_EMAIL = gql`
  query GET_USERS_INFO_BY_EMAIL($email: String) {
    users(where: { email: { _eq: $email } }) {
      id
      performanceObjectivesByResponsibleId {
        id
        description
        name
        creator_id
        responsible_id
        client_id
        weights
        type
        measurement_type
        resources
        period_id
        client_ou {
          id
        }
        is_objective
      }
      email
      full_name
      first_name
      last_name
    }
  }
`;
