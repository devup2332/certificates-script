import knex from "knex";
import { environments } from "../environments";

export const knexClient = knex({
  client: "pg",
  connection: {
    host: environments.DATABASE_HOST,
    port: 5432,
    user: environments.DATABASE_USER,
    password: environments.DATABASE_PASSWORD,
    database: environments.DATABASE_NAME,
  },
});
