import { gql } from "graphql-request";

export const CREATE_NEW_USER_COURSE = gql`
  mutation INSERT_USER_COURSE($input: [user_course_cl_insert_input!]!) {
    insert_user_course_cl(
      objects: $input
      on_conflict: { constraint: user_course_cl_course_fb_user_fb_key }
    ) {
      affected_rows
    }
  }
`;
