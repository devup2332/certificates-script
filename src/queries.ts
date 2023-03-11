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

export const GET_USER_COURSES_DC3_PER_INSTANCE = gql`
  query GET_USER_COURSES_DC3_PER_INSTANCE($clientId: String) {
    user_course_cl(
      where: {
        course: {
          client_id: { _eq: $clientId }
          dc3_data_json: { _is_null: false }
        }
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
        email
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
        course_fb
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

export const GET_USERS_COURSE_PER_INSTANCE = gql`
  query GET_USERS_COURSE_PER_INSTANCE($clientId: String) {
    user_course_cl(
      where: {
        user: { client_id: { _eq: $clientId } }
        course: { dc3_data_json: { _is_null: true } }
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
        email
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
        course_fb
        min_progress
        client_id
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

export const GET_USER_COURSES = gql`
  query GET_USER_COURSES($userFb: String) {
    user_course_cl(where: { user: { user_fb: { _eq: $userFb } } }) {
      score
      progress
      group_id
      group_history
      can_unsubscribe
      course {
        name
        course_fb
      }
      user_lessons {
        completed
        course_id
        lesson_fb
        module_id
        type
        user_fb
        score
      }
    }
  }
`;

export const INSERT_USER_COURSE = gql`
  mutation INSERT_USER_COURSE($input: [user_course_cl_insert_input!]!) {
    dataResult: insert_user_course_cl(
      objects: $input
      on_conflict: {
        constraint: user_course_cl_course_fb_user_fb_key
        update_columns: [
          score
          progress
          group_history
          can_unsubscribe
          group_id
        ]
      }
    ) {
      affected_rows
    }
  }
`;

export const INSERT_USER_LESSON = gql`
  mutation INSERT_USER_LESSON($input: [users_lessons_cl_insert_input!]!) {
    newUserLesson: insert_users_lessons_cl(
      objects: $input
      on_conflict: {
        update_columns: [summary]
        constraint: users_lessons_cl_pkey
      }
    ) {
      affected_rows
    }
  }
`;

export const GET_QUESTIONS_LESSON = gql`
  query GET_QUESTIONS_LESSON($lessonFb: String) {
    lessons_cl(where: { lesson_fb: { _eq: $lessonFb } }) {
      users {
        lesson_fb
        module_id
        course_id
        completed
        evaluated_at
        score
        number_of_times
        duration
        type
        summary
        user {
          full_name
          user_fb
        }
      }
      questions {
        answer
        id
        question_fb
      }
    }
  }
`;

export const UPSERT_USER_LESSON = gql`
  mutation UPSERT_USER_LESSON($payload: [users_lessons_cl_insert_input!]!) {
    userLesson: insert_users_lessons_cl(
      objects: $input
      on_conflict: {
        constraint: users_lessons_cl_pkey
        update_columns: [
          module_id
          course_id
          type
          completed
          evaluated_at
          score
          number_of_times
          duration
          summary
        ]
      }
    ) {
      userId: user_fb
      lessonId: lesson_fb
      moduleId: module_id
      courseId: course_id
      type
      isCompleted: completed
      evaluatedAt: evaluated_at
      score
      numberOfTimes: number_of_times
      summary
      duration
    }
  }
`;
