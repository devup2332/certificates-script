import { gql } from "graphql-request";

export const GET_ALL_REVIEWS_FOR_AN_INSTANCE = gql`
  query GET_ALL_REVIEWS_FOR_AN_INSTANCE(
    $clientId: String
    $dateStart: timestamptz
    $dateEnd: timestamptz
  ) {
    courses_cl(where: { client_id: { _eq: $clientId } }) {
      name
      course_fb
      course_reviews(
        where: { created_at: { _gte: $dateStart, _lte: $dateEnd } }
      ) {
        id
        body
        created_at
      }
    }

    marketplace_data_tb(where: { client_fb: { _eq: $clientId } }) {
      courses_cl {
        name
        course_fb
        course_reviews(
          where: {
            user_review: {
              client_id: { _eq: $clientId }
              created_at: { _gte: $dateStart, _lte: $dateEnd }
            }
          }
        ) {
          id
          body
          created_at
        }
      }
    }
  }
`;
