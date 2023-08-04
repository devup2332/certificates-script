import admin, { ServiceAccount } from "firebase-admin";
import credentials from "./serviceAccount.json";

export class Firebase {
  admin: admin.app.App;
  constructor() {
    this.admin = admin.initializeApp({
      credential: admin.credential.cert(credentials as ServiceAccount),
    });
  }
}

export const getRubrics = async () => {
  const response = await new Firebase().admin
    .firestore()
    .collection("rubricas")
    .get();
  const list: any[] = [];
  response.forEach((d) => {
    const data = d.data();
    list.push(data);
  });
  return list;
};
