import axios from 'axios';
import xlsx from 'xlsx';


const excelFile = 'usuarios-a-liberar.xlsx'

interface ExcelData {
    email: string,
    clientId: string,
}

const deleteAndReleaseUsers = async (i: any) => {
    try {
    const response = await axios.post(
        "https://lernit-lxp-backend-dot-lernit-v2.uc.r.appspot.com/api/v1/release-user-by-email",
        {
          email: i.email,
          clientId: i.clientId,
        },
        {
          headers: {
            "api-secret-key":
              "9DV4QzmxwsA1VMWtFZ0Lx3Fhx8d854xLn80hGOszlMknh4MMvmsLAzW319e8gKBF",
          },
        }
      );
       return response.status;
    } catch (error: any) {
        console.log('Error al liberar el usuario -->', i.email, 'Error:', error.response.status, error.response.statusText, error.response.data);
    }
}

export const checkInformationOfExcel = async () => {
    const workbook = xlsx.readFile(excelFile);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const datos: ExcelData[] = xlsx.utils.sheet_to_json(worksheet, { header: ['email', 'clientId'] });
  
    let usersCount = 0;
    let userWithError: any[] = [];

   
        for (const i of datos) {
            try {
            console.log('dato', i);
               await new Promise(resolve => setTimeout(resolve, 500));
               const releaseStatus = await deleteAndReleaseUsers(i);
               releaseStatus === 200 ? usersCount++ : userWithError.push(i);
        } catch(error: any) {
                userWithError.push(i);
                console.log('Error al liberar el usuario -->', error.response.status, error.response.statusText, error.response.data);
        }
    }  
    console.log('usersCount', usersCount);
    console.log('userWithError', userWithError);
    
};