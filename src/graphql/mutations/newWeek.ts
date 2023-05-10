import { gql } from "graphql-request";

export const SAVE_NEW_WEEK = gql`
  mutation saveWeek($input: weeks_tb_insert_input!) {
    newWeek: insert_weeks_tb_one(object: $input) {
      week_fb
    }
  }
`;
