import { gql } from "graphql-request";

export const GET_USER_INFO = gql`
  query GET_USER_INFO($userId: String) {
    users: users_cl(where: { user_fb: { _eq: $userId } }) {
      email
      image_url
      user_fb
      last_name
      first_name
      full_name
    }
  }
`;

export const GET_USER_BY_EMAIL = gql`
  query GET_USER_BY_EMAIL($email: String) {
    users: users_cl(where: { email: { _eq: $email } }) {
      id
      email
      user_fb
      full_name
      first_name
      last_name
    }
  }
`;


export const GET_USERS_BY_CLIENT = gql`
  query GET_USER_BY_EMAIL_AND_CLIENT( $clientId: String) {
    users: users_cl(where: { client_id: { _eq: $clientId }, deleted: { _eq: false } }) {
      id
      email
      user_fb
      full_name
      first_name
      last_name
    }
  }
`;

export const GET_DELETED_USERS_BY_CLIENT = gql`
  query GET_USER_BY_EMAIL_AND_CLIENT( $clientId: String) {
    users: users_cl(where: { client_id: { _eq: $clientId }, deleted: { _eq: true } }) {
      id
      email
      user_fb
      full_name
      first_name
      last_name
    }
  }
`;
