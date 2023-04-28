import { GraphQLClient } from "graphql-request";
import { environments } from "../environments";

export const client = new GraphQLClient(environments.GRAPHQL_BACKEND_URI, {
  headers: {
    "x-hasura-admin-secret": environments.GRAPHQL_BACKEND_SECRET,
    "Access-Control-Allow-Origin": "*",
  },
});

export const voldemortClient = new GraphQLClient(
  environments.GRAPHQL_VOLDEMORT_BACKEND_URI,
  {
    headers: {
      "x-hasura-admin-secret": environments.GRAPHQL_VOLDEMORT_BACKEND_SECRET,
      "Access-Control-Allow-Origin": "*",
    },
  }
);
