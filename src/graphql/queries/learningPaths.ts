import { gql } from "graphql-request";

export const GET_LEARNINGPATH_INFO = gql`
  query GET_LEARNINGPATH_INFO($learningpathFb: String) {
    learning_paths_cl(
      where: { learning_path_fb: { _eq: $learningpathFb } }
    ) {
      name
      learning_path_fb
      courses_json
      users_json
    }
  }
`;
