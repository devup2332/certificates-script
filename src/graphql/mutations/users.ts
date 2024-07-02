import { gql } from "graphql-request";

export const UPDATE_REVIVE_USER = gql`
    mutation updateReviveUsers($clientId: String!, $email: String!) {
        update_users_cl(where: {client_id: {_eq: $clientId}, email: {_eq: $email}}, _set: {deleted: false, disabled: false}) {
        affected_rows
  }
}
`
