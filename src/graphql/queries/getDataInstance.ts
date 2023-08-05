import { gql } from "graphql-request";

export const GET_DATA_INSTANCE = gql`
  query GET_DATA_INSTANCE($clientId: String) {
    courses: courses_cl(
      where: { client_id: { _eq: $clientId }, stage: { _gte: 7 } }
    ) {
      name
      course_fb
      lessons(
        where: {
          _or: [
            { stage: { _gte: 3 } }
            { stage: { _gte: 2 }, type: { _eq: "M" } }
            { stage: { _gte: 2 }, type: { _eq: "W" } }
          ]
        }
      ) {
        name
        html
        embed_json
        type
        image
        lecture
        subtype
        video
        lesson_fb
        videoalter
        module {
          name
        }
        module_id
        description
        image_url
      }
    }
  }
`;
