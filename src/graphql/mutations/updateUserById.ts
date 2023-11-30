import { gql } from "graphql-request";

export const UPDATE_USER_INFO_BY_ID = gql`
  mutation UPDATE_USER_INFO_BY_ID(
    $userId: String
    $newUserInfo: users_cl_set_input
  ) {
    update_users_cl(where: { user_fb: { _eq: $userId } }, _set: $newUserInfo) {
      affected_rows
    }
  }
`;
