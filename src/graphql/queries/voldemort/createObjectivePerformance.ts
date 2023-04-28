import { gql } from "graphql-request";

export const CREATE_OBJECTIVE_PERFORMANCE = gql`
  mutation N($objects: [performance_objectives_insert_input!]!) {
    insert_performance_objectives(
      objects: $objects
      on_conflict: {
        constraint: performance_objectives_pkey
        update_columns: [creator_id, responsible_id]
      }
    ) {
      affected_rows
      returning {
        creator_id
        responsible_id
      }
    }
  }
`;
