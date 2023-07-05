import { gql } from "graphql-request";

export const GET_ALL_CLIENTS = gql`
  query GET_ALL_CLIENTS {
    clients: clients_cl {
      client_fb
      name
    }
  }
`;
