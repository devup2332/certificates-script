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

export const GET_USERS_COURSE = gql`
  query GET_USERS_COURSE($courseFb: String) {
    user_course_cl(
      where: {
        course: { course_fb: { _eq: $courseFb } }
        _and: { user: { client_id: { _eq: "solintegra" } } }
      }
    ) {
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
        client {
          name
        }
        first_name
        last_name
        curp
        business_name {
          shcp
          name
          boss_name
          boss_name_workers
          instructor {
            full_name
          }
        }
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
        modules {
          id
          name
        }
        instructors_data
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
