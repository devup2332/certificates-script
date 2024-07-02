import { client } from "../graphql/client";
import admin from "../utils/firebase" 
import { GET_DELETED_USERS_BY_CLIENT } from "../graphql/queries/getUserInfo";
import { readExcelSheet } from "../utils/methods";
import { UPDATE_REVIVE_USER } from "../graphql/mutations/users";


const excelFile = 'usuarios-a-revivir.xlsx'

export const reviveUsers = async (clientId: string) => {
    const data = readExcelSheet(excelFile, 'Usuarios');
    const notf: any[] = [];

    const { users: allUsers } = await client.request(GET_DELETED_USERS_BY_CLIENT, {
        clientId,
    });

    const processRow = async (excelInfo: any, index: number) => {
        return new Promise<void>(async (resolve) => {
            const name = excelInfo['Nombre del participante'];
            const email = excelInfo['Correo'];
            const user = allUsers.find((u: any) => u.email === email);
            
                if (!user) {
                    console.log(`User not found ${email}`);
                    notf.push(`Correo no encontrado ->${email}`, 'fila--->', ++index);
                } else {
                    console.log(`---------------------------------------------------------------------------------`);
                    try {
                        await admin.auth().updateUser(user.user_fb, { email: user.email, disabled: false });
                        console.log(`Usuario actualizado en firebase ${user.email} - ${user.user_fb}`);

                        const { update_users_cl: data } = await client.request(UPDATE_REVIVE_USER, {
                            clientId,
                            email: user.email,
                        });
                        console.log(`Se revivio el usuario ${user.email} con ${data.affected_rows} registros actualizados en BD`);
                    } catch (error: any) {
                        console.log('error', error);
                        if (error.errorInfo.code === 'auth/email-already-exists') {
                            notf.push(`Error al actualizar usuario ${email} email ya existe en otro registro de firebase`, 'fila--->', ++index);
                        }
                        else if (error.errorInfo.code === 'auth/user-not-found') {
                            notf.push(`Error al actualizar usuario ${email} usuario no encontrado en firebase`, 'fila--->', ++index);
                        }
                    }
                }

                setTimeout(() => {
                    resolve();
                }, 2000);
            })
        }


    const processData = async (data: any) => {
        for (let [index, excelInfo] of data.entries()) {
            await processRow(excelInfo, index);
        }
        console.log('Procesamiento completado');
        console.log('Errores -->', notf);
    }

    processData(data);
}