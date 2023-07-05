import { gql } from "graphql-request";

export const DELETE_COMPETENCIES_PER_INSTANCE = gql`
  mutation DELETE_COMPETENCIES_PER_INSTANCE($competencies: [String]) {
    delete_competencies_cl(where: { competencies_fb: { _in: $competencies } }) {
      affected_rows
    }
  }
`;
