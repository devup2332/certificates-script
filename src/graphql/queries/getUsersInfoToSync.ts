import { gql } from "graphql-request";

export const GET_USERS_INFO_TO_SYNC = gql`
  query GET_USERS_INFO_TO_SYNC($usersEmail: [String]) {
    users_cl(where: { email: { _in: $usersEmail } }) {
      user_fb
      full_name
      email
      performance_objectives {
        name
        id
        client_id
      }
      user_courses_cl {
        score
        course {
          name
        }
      }
    }
  }
`;
