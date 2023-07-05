import axios from "axios";
import { client } from "../graphql/client";
import { GET_ALL_CLIENTS } from "../graphql/queries/getAllClients";
import { GET_USERS_PER_INSTANCE } from "../graphql/queries/getUsersPerInstance";
import { GET_USERS_INFO_BY_EMAIL } from "../graphql/queries/voldemort/getUsersInfo";

export const identifyUsersInOtherInstances = async () => {
  const { clients } = await client.request(GET_ALL_CLIENTS);

  for (const c of clients) {
    console.log(c.client_fb);
    if (c.client_fb === "universidadeacero") continue;
    const { users } = await client.request(GET_USERS_PER_INSTANCE, {
      clientId: c.client_fb,
    });

    for (const user of users) {
      const { email, user_fb } = user;
      if (!email) {
        continue;
      }
      const match = (email as string).includes("@deacero");
      if (match) {
        const response = await axios.post(
          "https://lernit-lxp-backend-dot-lernit-v2.uc.r.appspot.com/api/v1/release-user-by-email",
          {
            email,
            clientId: c.client_fb,
          },
          {
            headers: {
              "api-secret-key":
                "9DV4QzmxwsA1VMWtFZ0Lx3Fhx8d854xLn80hGOszlMknh4MMvmsLAzW319e8gKBF",
            },
          }
        );
        console.log({ response });
      }
    }
  }
};
