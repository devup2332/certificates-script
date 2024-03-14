import * as fs from 'fs';
import * as path from 'path';

// Directorio donde se encuentran los archivos JSON
const directoryPath = '/ruta/directorio';

// Email que estás buscando
const emailToFind = 'test@gmail.com';

// Función para buscar el email en los archivos JSON
export function searchEmailInFiles(directory: string, email: string): void {
    fs.readdir(directory, (err, files) => {
        if (err) {
            console.error('Error al leer el directorio:', err);
            return;
        }

        files.forEach(file => {
            const filePath = path.join(directory, file);

            if (path.extname(filePath) === '.json') {
           
                fs.readFile(filePath, 'utf8', (err, data) => {
                    if (err) {
                        console.error('Error al leer el archivo:', err);
                        return;
                    }

                    let jsonData;
                    try {
                        jsonData = JSON.parse(data);
                    } catch (jsonError) {
                        console.error('Error al analizar el archivo JSON:', jsonError);
                        return;
                    }

                    if (jsonData.users && Array.isArray(jsonData.users)) {
                        const userWithEmail = jsonData.users.find((user: { email: string }) => user.email === email);

                        if (userWithEmail) {
                            console.log('Email encontrado en el archivo:', filePath);
                        }
                    }
                });
            }
        });
    });
}
