import { client } from '../graphql/client';
import { DELETE_USER_COURSE, DELETE_USER_LEARNING_PATH } from '../graphql/mutations/courses';
import { DELETE_USER_LESSONS } from '../graphql/mutations/lessons';
import { GET_COURSES_INSTANCE, GET_COURSE_INTANCE_MARKETPLACE } from '../graphql/queries/getInfoCourses';
import { GET_ALL_LPS_BY_CLIENT } from '../graphql/queries/getInfoLps';
import { GET_USERS_BY_CLIENT } from '../graphql/queries/getUserInfo';
import { normalizeString, readExcelSheet } from '../utils/methods';

const excelFile = 'usuarios-a-eliminar-avance-y-cursos.xlsx'

export const deleteCoursesAndProgressInUsers = async (clientId: string) => {
    const data = readExcelSheet(excelFile, 'Cursos');
    const notf: any[] = [];

    const { courses_cl: coursesInstance } = await client.request(GET_COURSES_INSTANCE, {
        clientId,
    });
    const { courses_cl: coursesMP } = await client.request(
        GET_COURSES_INSTANCE,
        {
            clientId: "content",
        }
    );
    
    const { users: allUsers } = await client.request(GET_USERS_BY_CLIENT, {
        clientId,
    });

    const { learning_paths_cl: allLPs } = await client.request(GET_ALL_LPS_BY_CLIENT, {
        clientId,
    });
    

    const processRow = async (excelInfo: any, index: number) => {
        return new Promise<void>(async (resolve) => {
            const name = excelInfo['Nombre del curso'];
            const lpName = excelInfo['Nombre del LP'];
            const email = excelInfo['Correo'];
            console.log('-------------------------------------------------------------------------------------------------')
            console.log('Borrando el usuario -->', email, 'en la fila -->', ++index)
            const course = [...coursesMP, ...coursesInstance].find(
                (c) => normalizeString(c.name) === normalizeString(name),
            );
            const lp = allLPs.find((l: any) => normalizeString(l.name) === normalizeString(lpName));

            if (!course) {
                console.log(`Course not found ${name}`);
                notf.push(`Nombre de Curso no encontrado ->${name}`, 'fila--->', ++index);
            } else {
                console.log(`Course FOUND ${name}`);
                const user = allUsers.find((u: any) => u.email === email);
                if (!user) {
                    console.log(`User not found ${email}`);
                    notf.push(`Correo no encontrado ->${email}`, 'fila--->', ++index);
                } else {
                    console.log(`User FOUND ${email}`);
                    console.log('Procediendo a eliminar su avance definitivamente course->', course.course_fb, 'user->', user.user_fb)
                    const data = await client.request(DELETE_USER_LESSONS, {
                        userId: user.user_fb,
                        courseId: course.course_fb,
                    })
                    console.log('Affected Arrows Lessons--->', data)

                    const dataCourse = await client.request(DELETE_USER_COURSE, {
                        userId: user.user_fb,
                        courseId: course.course_fb,
                    })

                    console.log('Affected Arrow Data Course--->', dataCourse)
                    
                    if (lp) {
                        console.log('Procediendo a eliminar su learning path->', lp.learning_path_fb, 'user->', user.user_fb)
                        console.log('LP FOUND', lp.name)
                        const dataLP = await client.request(DELETE_USER_LEARNING_PATH, {
                            clientId,
                            lpId: lp.learning_path_fb,
                            userId: user.user_fb,
                        })
                        console.log('Affected Arrow Data Learning Path--->', dataLP)
                    } else {
                        console.log('LP not found')
                        if( lpName !== 'NA'){
                        notf.push(`LP no encontrado ->${lpName}`, 'fila--->', ++index);
                        }
                    }
                }
            }

            setTimeout(() => {
                resolve();
            }, 2000);
        });
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

