import { gql } from "graphql-request";

export const SAVE_NEW_ACTIVITY = gql`
  mutation saveActivity($input: activity_tb_insert_input!) {
    newActivity: insert_activity_tb_one(object: $input) {
      activity_fb
    }
  }
`;
