import { gql } from "graphql-request";

export const GET_USERS_PER_INSTANCE = gql`
  query GET_USERS_PER_INSTANCE($clientId: String) {
    users: users_cl(where: { client_id: { _eq: $clientId } }) {
      email
      full_name
      user_fb
      client_id
    }
  }
`;
