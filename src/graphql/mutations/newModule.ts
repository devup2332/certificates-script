import { gql } from "graphql-request";

export const SAVE_NEW_MODULE = gql`
  mutation saveModule($input: module_cl_insert_input!) {
    newModule: insert_module_cl_one(object: $input) {
      module_fb
    }
  }
`;
