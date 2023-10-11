import { gql } from "graphql-request";

export const GET_USERS_LP_INFO = gql`
  query GET_USERS_LP_INFO($clientId: String) {
    lps: learning_paths_cl(where: { client_id: { _eq: $clientId } }) {
      name
      learning_path_fb
      courses_json
      percentage_to_pass
      users_learning_path(
        where: { user_learningpath: { deleted: { _eq: false } } }
      ) {
        end_date
        created_at
        progress
        user_learningpath {
          full_name
          email
          additional_info_json
          user_courses_cl {
            score
            progress
            course {
              name
              course_fb
            }
          }
          user_role {
            name
          }
          user_ou {
            name
          }
        }
      }
    }
  }
`;
