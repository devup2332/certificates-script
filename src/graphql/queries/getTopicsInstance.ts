import { gql } from "graphql-request";

export const GET_TOPICS_INSTANCE = gql`
  query GET_TOPICS_INSTANCE($clientId: String) {
    topicsInstance: topic_cl(where: { client_id: { _eq: $clientId } }) {
      name
      topic_fb
      image_url
    }
  }
`;
