import { gql } from "graphql-request";

export const MIGRATE_TOPICS_TO_INSTANCE = gql`
  mutation insert_new_topic($topics: [topic_cl_insert_input!]!) {
    insert_topic_cl(objects: $topics) {
      returning {
        name
        topic_fb
      }
    }
  }
`;
