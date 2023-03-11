import { gql } from "graphql-request";

export const DELETE_COMMENTS_FOR_AND_INSTANCE = gql`
  mutation DELETE_COMMENTS_FOR_AND_INSTANCE($commentsFb: [String]) {
    delete_comments(where: { comment_fb: { _in: $commentsFb } }) {
      affected_rows
    }
  }
`;
