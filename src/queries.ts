import { gql } from "graphql-request";

export const GET_STPS_CATALOG = gql`
  query getStpsCatalog($catalogId: String!) {
    stps_catalog(where: { catalog: { _eq: $catalogId } }) {
      catalog
      code
      description
      id
    }
  }
`;

export const GET_APPROVED_USERS_BY_CLIENTID = gql`
  query GET_APPROVED_USERS($clientId: String) {
    user_course_cl(where: { user: { client_id: { _eq: $clientId } } }) {
      created_at
      last_update
      score
      status
      progress
      completed_at
      user {
        full_name
        client_id
        user_fb
        first_name
        last_name
        curp
        user_ou {
          name
        }
        additional_info_json
        user_role {
          name
        }
      }
      course {
        duration
        min_score
        min_progress
        name
        created_at
        created_by: created_by_json
        type
        dc3_data_json
      }
    }
  }
`;

export const GET_APPROVED_USERS_IN_MARKETPLACE = gql`
  query GET_APPROVED_USERS($clientId: String) {
    user_course_cl(
      where: {
        user: { client_id: { _eq: $clientId } }
        course: { client_id: { _eq: "content" } }
      }
    ) {
      score
      status
      progress
      completed_at
      user {
        full_name
        client_id
        user_fb
      }
      course {
        min_score
        min_progress
        name
        dc3_data_json
      }
    }
  }
`;
