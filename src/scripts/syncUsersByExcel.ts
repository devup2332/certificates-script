import { parse } from "date-fns";
import xlsx from "xlsx";
import { client, voldemortClient } from "../graphql/client";
import { GET_USERS_INFO_TO_SYNC } from "../graphql/queries/getUsersInfoToSync";
import { CREATE_OBJECTIVE_PERFORMANCE } from "../graphql/queries/voldemort/createObjectivePerformance";
import { GET_USERS_INFO_BY_EMAIL } from "../graphql/queries/voldemort/getUsersInfo";
import { syncUsers } from "./syncUsers";

export const syncUsersByExcel = async () => {
  const wb = xlsx.readFile("Usuarios Gonher.xlsx");
  const data = xlsx.utils.sheet_to_json(wb.Sheets["Usuarios duplicados"]);
  const pairs: any[][] = [];
  const rest: any[] = [];
  data.forEach((user: any, index: number) => {
    const email = user.Email;
    const finded: any[] = data.filter((u: any) => {
      return email.split("@")[0] === u.Email.split("@")[0];
    });

    const f = pairs.filter((p: any) => {
      const i1 = p[0];
      const i2 = p[1];
      if (
        i1?.Email.split("@")[0] !== email?.split("@")[0] &&
        i2?.Email.split("@")[0] !== email?.split("@")[0]
      ) {
        return false;
      }
      return true;
    });
    if (!f.length && finded.length === 2) {
      return pairs.push(finded);
    }
    if (f.length === 0) {
      rest.push(finded[0]);
    }
  });
  pairs.push(rest);

  const sleep = (time: number) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve("End");
      }, time);
    });
  };
  console.log({ pairs });

  for (let i = 58; i < pairs.length; i++) {
    const p = pairs[i];
    const userLive = p.filter((u: any) => {
      return u.Destino === "SE QUEDA";
    })[0];
    const userDead = p.filter((u: any) => {
      return u.Destino === "SE VA";
    })[0];
    console.log({ index: i });
    await syncUsers(userDead.Email, userLive.Email);
    //
    // const responseLive = await voldemortClient.request(
    //   GET_USERS_INFO_BY_EMAIL,
    //   {
    //     email: userLive.Email,
    //   }
    // );
    // const responseDead = await voldemortClient.request(
    //   GET_USERS_INFO_BY_EMAIL,
    //   {
    //     email: userDead.Email,
    //   }
    // );
    // if (
    //   responseDead.users[0].performanceObjectivesByResponsibleId.length > 0 &&
    //   responseLive.users[0].performanceObjectivesByResponsibleId.length > 0 &&
    //   ![24, 71, 87].includes(i)
    // ) {
    //   const objects =
    //     responseDead.users[0].performanceObjectivesByResponsibleId.map(
    //       (i: any) => {
    //         return {
    //           creator_id:
    //             i.creator_id === i.responsible_id
    //               ? responseLive.users[0].id
    //               : i.creator_id,
    //           responsible_id: responseLive.users[0].id,
    //           name: i.name,
    //           description: i.description || "",
    //           weights: i.weights,
    //           type: i.type,
    //           is_objective: i.is_objective,
    //           period_id: i.period_id,
    //           client_id: i.client_id,
    //           measurement_type: i.measurement_type,
    //           resources: [],
    //         };
    //       }
    //     );
    //   console.log({
    //     responseLive: responseLive.users[0],
    //     responseDead: responseDead.users[0],
    //     i,
    //   });
    //   const response = await voldemortClient.request(
    //     CREATE_OBJECTIVE_PERFORMANCE,
    //     {
    //       objects,
    //     }
    //   );
    //   console.log({ response, i, responseDead, responseLive });
    // }
  }
};
