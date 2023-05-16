import { gql } from "graphql-request";

export const GET_COURSES_TO_MIGRATE_TO_CONTENT = gql`
  query GET_COURSES_TO_MIGRATE_TO_CONTENT($clientId: String) {
    courses: courses_cl(
      where: { client_id: { _eq: $clientId }, stage: { _gte: 7 } }
      limit: 2
    ) {
      topic_id
      image_url
      name
      type
      client_id
      course_fb
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
      origin
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

export const GET_LESSONS_AND_MODULES_INFO_PER_COURSE = gql`
  query GET_LESSONS_AND_MODULES_INFO_PER_COURSE($courseFb: String) {
    modules: module_cl(
      where: { course_fb: { _eq: $courseFb }, deleted_at: { _is_null: true } }
    ) {
      course_fb
      created_at
      deleted
      deleted_at
      description
      index
      module_fb
      name
      updated_at
      accreditation
    }
    weeks: weeks_tb(
      where: { course_fb: { _eq: $courseFb }, deleted_at: { _is_null: true } }
    ) {
      course_fb
      created_at
      deleted_at
      description
      image_url
      index
      module_fb
      name
      updated_at
      week_fb
    }
    activities: activity_tb(where: { course_fb: { _eq: $courseFb } }) {
      activity_fb
      course_fb
      created_at
      deleted_at
      description
      image_url
      index
      module_fb
      name
      type
      updated_at
      week_fb
    }
    lessons: lessons_cl(
      where: {
        course_fb: { _eq: $courseFb }
        stage: { _is_null: false }
        deleted_at: { _is_null: true }
      }
    ) {
      activity_id
      assign
      claps
      client_id
      competencies_json
      course_fb
      created_at
      created_by
      creating
      deleted_at
      description
      embed_json
      eval_attempts
      eval_question_to_evaluate
      hide
      hours
      html
      image_url
      index
      is_deleted
      is_individual
      is_post
      lecture
      lesson_fb
      message
      minutes
      module_id
      name
      privacy
      random
      resources_json
      rubric
      stage
      subtype
      topic_id
      type
      updated_at
      users_to_evaluate
      video
      weighing
      weight
      questions {
        answer
        back
        image_url
        index
        lesson_fb
        mins
        options
        secs
        text
        type
        question_fb
      }
    }
  }
`;
