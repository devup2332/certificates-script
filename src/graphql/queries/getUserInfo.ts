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
