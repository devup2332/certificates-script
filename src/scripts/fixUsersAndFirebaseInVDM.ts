import { knexLMS,knexVDM } from "../database/knex";
import admin from "../utils/firebase" 

// Ejemplo de arreglo de users

const users = [
  {
    user_id: '8a6f3995-28c4-482c-9338-50b2bede8f21',
    emailMazda: 'ggonzalez@mazdasantaanita.com',
    emailPlasencia: 'gerardo.gonzalez@academiaplasencia.com',
    user_auth_id: 'do7rUueOJsM8761qQh2AuEu9w7B2',
    subdomain: 'academiaplasencia',
    client_id: 'a4cf83fe-93d8-4028-9b5c-97d7aa581776',
  },

  {
    user_id: '9dc8ddcd-96ec-4d5c-a60f-eb707c017fac',
    emailMazda: 'ggonzalez@mazdasantaanita.com',
    emailPlasencia: 'gerardo.gonzalez@academiaplasencia.com',
    user_auth_id: 'kJWFRrEpppZlaMsj8VV8NgIpVxH2',
    subdomain: 'mazda',
    client_id: '8f2c5da4-4ae5-4b39-a994-5f123254807f',
  },
  
];


export const fixUsersAndFirebaseInVDM = async () => {

  for (const user of users) {
    try {
      if (user.subdomain === 'mazda') {
        const fbUser = await admin.auth().createUser({
          email: user.emailMazda,
          displayName: user.emailMazda,
          uid: user.user_auth_id,
          emailVerified: true,
          password: 'mazda123',
        });
        console.log(
          `Usuario Mazda se crea en Firebase ${user.emailMazda} - ${user.user_auth_id}`,
        );

        // Cambio de correo en VDM
        const respVDM = await knexVDM('users')
          .update({ email: user.emailMazda })
          .where({ id: user.user_id });

        // Cambio de correo en LMS
        const respLXP = await knexLMS('users')
          .update({ email: user.emailMazda })
          .where({ id: user.user_id });
      } else {
        await admin
          .auth()
          .updateUser(user.user_auth_id, { email: user.emailPlasencia });
        console.log(
          `Usuario Mazda se actualiza en Firebase ${user.emailPlasencia} - ${user.user_auth_id}`,
        );

        // Cambio de correo en VDM
        const respVDM = await knexVDM('users')
          .update({ email: user.emailPlasencia })
          .where({ id: user.user_id });

        // Cambio de correo en LMS
        const respLXP = await knexLMS('users')
          .update({ email: user.emailPlasencia })
          .where({ id: user.user_id });
      }
    } catch (error) {
      console.error('Error adding user:', error);
    }
  }

  knexVDM.destroy();
  knexLMS.destroy();
};
