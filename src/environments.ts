import dotenv from "dotenv";

dotenv.config();

export const environments = {
  GRAPHQL_BACKEND_URI: process.env.GRAPHQL_BACKEND_URI || "",
  GRAPHQL_BACKEND_SECRET: process.env.GRAPHQL_BACKEND_SECRET || "",
  GRAPHQL_VOLDEMORT_BACKEND_URI: process.env.GRAPHQL_VOLDEMORT_BACKEND_URI || "",
  GRAPHQL_VOLDEMORT_BACKEND_SECRET: process.env.GRAPHQL_VOLDEMORT_BACKEND_SECRET || "",
  PORT: process.env.PORT || "8000",
  CERT_SERVER_URL: process.env.CERT_SERVER_URL || "",
  CERT_SERVER_ENDPOINT: process.env.CERT_SERVER_ENDPOINT || "",
  CERT_LWL_PDF: process.env.CERT_LWL_PDF || "",
  CERT_DC3_SERVER: process.env.CERT_DC3_SERVER || ""
};

console.log({ environments });
