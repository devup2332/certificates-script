import { gql } from "graphql-request";

export const GET_OUS_PER_INSTANCE = gql`
  query GET_OUS_PER_INSTANCE($clientId: String) {
    ous: ou_cl(where: { client_id: { _eq: $clientId } }) {
      ou_fb
      name
    }
  }
`;
