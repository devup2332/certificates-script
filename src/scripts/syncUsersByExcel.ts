import { parse } from "date-fns";
import xlsx from "xlsx";
import { client, voldemortClient } from "../graphql/client";
import { GET_USERS_INFO_TO_SYNC } from "../graphql/queries/getUsersInfoToSync";
import { CREATE_OBJECTIVE_PERFORMANCE } from "../graphql/queries/voldemort/createObjectivePerformance";
import { GET_USERS_INFO_BY_EMAIL } from "../graphql/queries/voldemort/getUsersInfo";
import { syncUsers } from "./syncUsers";

export const syncUsersByExcel = async () => {
  const wb = xlsx.readFile("data.xlsx");
  const data = xlsx.utils.sheet_to_json(wb.Sheets["users"]);
  const pairs: any[][] = [];
  const rest: any[] = [];
  data.forEach((user: any) => {
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

  for (let i = 0; i < pairs.length; i++) {
    const p = pairs[i];
    const userLive = p.filter((u: any) => {
      return u.Destino === "SE QUEDA";
    })[0];
    const userDead = p.filter((u: any) => {
      return u.Destino === "SE VA";
    })[0];
    console.log({ index: i });
    await syncUsers(userDead.Email, userLive.Email);
  }
};
