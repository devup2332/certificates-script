import { gql } from "graphql-request";

export const GET_ROLES_PER_CLIENT = gql`
  query GET_ROLES_PER_CLIENT($clientId: String) {
    roles: role_cl(where: { client_id: { _eq: $clientId } }) {
      role_fb
      name
    }
  }
`;
