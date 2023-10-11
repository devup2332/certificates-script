import { gql } from "graphql-request";

export const GET_INFO_COURSES_PER_INSTANCE = gql`
  query GET_INFO_COURSES_PER_INSTANCE($clientId: String) {
    courses: courses_cl(
      where: {
        client_id: { _eq: $clientId }
        stage: { _gte: 7 }
        origin: { _is_null: true }
        is_deleted: { _eq: false }
        type: { _eq: "OL" }
      }
    ) {
      name
      id: course_fb
      origin
      stage

      topic_id
      image_url
      type
      stage
      min_score
      min_progress
      competencies_json
      ous_json
      created_by_json
      instructors_json
      knowledge_json
      requirements_json
      roles_json
      skills_json
      tags_json
      description
      difficulty
      duration
      hide
      language
      privacity
      welcome_message
      reason
      video_json
      is_deleted
      dc3Available
      external_course_id
      min_attendance
      block_after_due_date
      price
      currency
      validity
      dc4Available
      dc3_data_json
      dc4_data_json
      dynamic_end_days
      external_url
    }
  }
`;

export const GET_INFO_COURSES_MP_TO_SYNC = gql`
  query GET_INFO_COURSES_MP_TO_SYNC($clientId: String) {
    coursesMP: courses_cl(
      where: {
        client_id: { _eq: "content" }
        origin: { _eq: $clientId }
        type: { _eq: "OL" }
        stage: { _gte: 7 }
        is_deleted: { _eq: false }
      }
    ) {
      name
      id: course_fb
      origin
      stage
      created_at
      client_id
    }
  }
`;
