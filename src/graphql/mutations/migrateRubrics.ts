import { gql } from "graphql-request";

export const MIGRATE_ALL_RUBRICS = gql`
  mutation MIGRATE_ALL_RUBRICS(
    $objects: [rubrics_cl_insert_input!]!
    $updateColumns: [rubrics_cl_update_column!]
  ) {
    rubric: insert_rubrics_cl(
      objects: $objects
      on_conflict: {
        update_columns: $updateColumns
        constraint: rubrics_cl_pkey
      }
    ) {
      returning {
        rubric_fb
      }
    }
  }
`;
