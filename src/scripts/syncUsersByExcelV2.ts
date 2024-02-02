import xlsx from "xlsx";
import axios from "axios";
import { environments } from "../environments";
import { client } from "../graphql/client";
import { GET_USER_BY_EMAIL } from "../graphql/queries/getUserInfo";
import { UPDATE_USER_INFO_BY_ID } from "../graphql/mutations/updateUserById";
import { sleep } from "../utils/sleep";


export const syncUsersByExcelV2 = async (clientId: string) => {
  const wb = xlsx.readFile("data.xlsx");
  const users: any[] = xlsx.utils.sheet_to_json(wb.Sheets["users"]);
  let index = 0;

  for (const userExcel of users) {
    console.log(index);
    const status1 = (userExcel["Estado"] as string).trim();
    const email1 = (userExcel["Email"] as string).trim();
    switch (status1) {
      case "SE ELIMINA":
        await deleteUserFromInstance(email1);
        break;

      case "Se elimina/ pero homologar datos a nuevo usuario ":
        await deleteUserFromInstance(email1);
        break;
      case "SE CONSERVA":
        break;
    }
    console.log(`Deleting second case`);

    const status2 = (userExcel["Comentarios"] as string).trim();
    const email2 = (userExcel["Email a conservar"] as string).trim();

    switch (status2) {
      case "SE ELIMINA":
        await deleteUserFromInstance(email2);
        break;

      case "Dominio no corresponde":
        await deleteUserFromInstance(email2);
        break;
      case "Se elimina/ pero homologar datos a nuevo usuario ":
        await deleteUserFromInstance(email1);
        break;
      default:
        break;
    }
    index++;
  }
};

export const deleteUserFromInstance = async (email: string) => {
  const { users } = await client.request(GET_USER_BY_EMAIL, {
    email,
  });
  if (users.length === 0) return;
  const { user_fb } = users[0];
  try {
    await client.request(UPDATE_USER_INFO_BY_ID, {
      userId: user_fb,
      newUserInfo: {
        deleted: true,
        disabled: true,
        deleted_at: new Date(),
      },
    });
  } catch (err) {
    console.log(`There was a problem deleting user from hasura ${email}`);
  }
  console.log(`User ${email} deleted from Hasura`);
  const url = `${environments.CLOUDFUNCTIONS_URL}/deleteUser`;

  try {
    await axios.get(url, {
      params: {
        unknown: environments.SECRET_WORD,
        id: user_fb,
      },
    });
  } catch (err) {
    console.log(`There was a problem deleting user from auth ${email}`);
  }
  console.log(`User ${email} deleted from firebase Auth`);
};
