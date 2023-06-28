import { gql } from "graphql-request";

export const GET_USER_BY_ID = gql`
  query GetUserInfoById($userIds: [String!]) {
    users: users_cl(where: { user_fb: { _in: $userIds } }) {
      user_fb
      email
      first_name
      full_name
      last_name
      numero_empleado
    }
  }
`;
