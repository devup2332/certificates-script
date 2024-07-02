import knex from "knex";
import { environments } from "../environments";

export const knexLXP = knex({
  client: "pg",
  connection: {
    host: environments.DATABASE_HOST,
    port: 5432,
    user: environments.DATABASE_USER,
    password: environments.DATABASE_PASSWORD,
    database: environments.DATABASE_NAME,
  },
});

export const knexVDM = knex({
  client: "pg",
  connection: {
    host: environments.DATABASE_HOST_VDM,
    port: 5432,
    user: environments.DATABASE_USER_VDM,
    password: environments.DATABASE_PASSWORD_VDM,
    database: environments.DATABASE_NAME_VDM,
  },
});

export const knexLMS = knex({
  client: "pg",
  connection: {
    host: environments.DATABASE_HOST_LMS,
    port: 5432,
    user: environments.DATABASE_USER_LMS,
    password: environments.DATABASE_PASSWORD_LMS,
    database: environments.DATABASE_NAME_LMS,
  },
});