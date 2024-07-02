import { ServiceAccount } from "firebase-admin";
import * as admin from "firebase-admin";
import credentials from "./serviceAccount.json";

class Firebase {
  admin: admin.app.App;
  constructor() {
    if (!admin.apps.length) {
      this.admin = admin.initializeApp({
        credential: admin.credential.cert(credentials as ServiceAccount),
      });
    } else {
      this.admin = admin.app();
    }
  }
}
const firebaseInstance = new Firebase();
export { firebaseInstance };

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

export default firebaseInstance.admin;
