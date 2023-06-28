import { gql } from "graphql-request";

export const NEW_COMPETENCIE = gql`
  mutation NEW_COMPETENCIE($objects: [competencies_cl_insert_input!]!) {
    insert_competencies_cl(objects: $objects) {
      returning {
        name
        competencies_fb
      }
    }
  }
`;
