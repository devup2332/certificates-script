import { gql } from "graphql-request";

export const GET_COMMENTS_FOR_ENTIRE_INSTANCE = gql`
  query GET_COMMENTS_FOR_ENTIRE_INSTANCE($clientId: String) {
    lessons_cl(where: { client_id: { _eq: $clientId } }) {
      comments {
        message
        status
        comment_fb
      }
    }
  }
`;
