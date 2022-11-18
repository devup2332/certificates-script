import { gql } from "graphql-request";

export const USER_DATA_FRAGMENT = gql`
  fragment userData on users_cl {
    id: user_fb
    clientId: client_id
    firstName: first_name
    lastName: last_name
    fullName: full_name
    email
    imageUrl: image_url
    heroUrl: hero_url
    type
    role
    ou
    curp
    OUs: ou_json
    deleted
    createdAt: created_at
    updatedAt: updated_at
    platformLite
    tutorial: tutorial_json
    onboard
    bio
    birthday
    ask_change_pw
    topics_json
    performance
    user_boss {
      id: boss_fb
      user {
        full_name
      }
    }
    user_lessons {
      lesson {
        name
        type
        lesson_fb
      }
    }
    user_ou {
      name
    }
    user_role {
      name
    }
    notfication_settings_json
    notifications_count
    competencies_json
    additionalInfo: additional_info_json
    business_name {
      uuid
      name
      shcp
      boss_name
      boss_name_workers
      instructor {
        full_name
      }
    }
  }
`;


export const COURSE_DATA_FRAGMENT = gql`
  fragment courseData on courses_cl {
    bienvenida: welcome_message
    clientId: client_id
    competenciesIds: competencies_json
    competencies_levels
    createdAt: created_at
    createdBy: created_by_json
    description
    difficulty
    duration
    hide
    id: course_fb
    imageUrl: image_url
    instructorIds: instructors_json
    mentors {
      course_fb
      user_fb
      filters_jsonb
      id
      user {
        firstName: first_name
        id: user_fb
        imageUrl: image_url
        last_name
        type
      }
    }
    knowledge: knowledge_json
    language
    # lastModuleVisit:
    name
    price
    currency
    privacity
    progress: min_progress
    score: min_score
    attendance: min_attendance
    reason
    requirements: requirements_json
    skills: skills_json
    stage
    tags: tags_json
    topicId: topic_id
    type
    updatedAt: updated_at
    OUs: ous_json
    roles: roles_json
    courseGroups: courses_groups {
      OUS: ous_json
      roles: roles_json
      mentors {
        user_fb
      }
    }
    # userCounter:
    validity
    video: video_json
    dc3Available
    dc4Available
    dc3Data: dc3_data_json
    dc4Data: dc4_data_json
    applyDueDate: block_after_due_date
    dynamicEndDays: dynamic_end_days
    attributes: attributes_json
  }
`;

export const FETCH_USER = gql`
  query getUser($userId: String!, $clientId: String!) {
    users: users_cl(where: { user_fb: { _eq: $userId } }, limit: 1) {
      ...userData
      acceptedTnC: agreed_tnc(args: { subdomain: $clientId })
      acceptedAd: agreed_ad(args: { subdomain: $clientId })
    }
  }

  ${USER_DATA_FRAGMENT}
`;


export const FETCH_COURSE = gql`
  query FecthCourse($courseId: String!) {
    courses: courses_cl(where: { course_fb: { _eq: $courseId } }) {
      ...courseData
    }
  }
  ${COURSE_DATA_FRAGMENT}
`;
