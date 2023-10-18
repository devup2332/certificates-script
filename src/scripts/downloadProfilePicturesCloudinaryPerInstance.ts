import axios from "axios";
import path from "path";
import fs from "fs-extra";
import xlsx from "xlsx";


interface ExcelData {
  URL: string;
  firstName: string;
  lastName: string;
}

const errorUsers: any = [];

const archivoExcel = 'C:/Users/rolis/Documents/Book1.xlsx';
const carpetaDestino = 'C:/Users/rolis/Documents/ProfilePictures';

const descargarImagen = async (url: string, nombreArchivo: string, carpetaDestino: string) => {
  try {
    const response = await axios.get(url, { responseType: 'stream' });
    const nombreCompletoArchivo = path.join(carpetaDestino, nombreArchivo.endsWith('.jpg') ? nombreArchivo : `${nombreArchivo}.jpg`);
    response.data.pipe(fs.createWriteStream(nombreCompletoArchivo));
    return new Promise<string>((resolve, reject) => {
      response.data.on('end', () => resolve(nombreCompletoArchivo));
      response.data.on('error', (error: any) => reject(error));
    });
  } catch (error: any) {
    console.error('Error al descargar la imagen:', `${error.response.status} ${error.response.statusText} ---> ${nombreArchivo}`);
    errorUsers.push(nombreArchivo);
    return null;
  }
};

if (!fs.existsSync(carpetaDestino)) {
  fs.mkdirSync(carpetaDestino);
}

export const downloadProfilePicturesCloudinaryPerInstance = async () => {
  const workbook = xlsx.readFile(archivoExcel);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const datos: ExcelData[] = xlsx.utils.sheet_to_json(worksheet, { header: ['URL', 'firstName', 'lastName'] });

  for (const dato of datos) {
    const url = dato.URL;
    const nombreArchivo = `${dato.firstName} ${dato.lastName}`;
    const archivoDescargado = await descargarImagen(url, nombreArchivo, carpetaDestino);
    if (archivoDescargado) {
      console.log(`Imagen descargada: ${archivoDescargado}`);
    }
  }
  console.log('Usuarios con errores: ', errorUsers);  

};


  
