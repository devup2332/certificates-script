import * as xlsx from 'xlsx';
import * as fs from 'fs';

// Función para leer una columna de Excel y convertirla en un arreglo
export function readExcelColumnAndConvertToArray(): string[] {
    
    const filePath = 'ids-grupo.xlsx'; // Reemplaza por la ruta a tu archivo de Excel
    const columnName = 'A' // Reemplaza por el nombre de la columna que deseas leer
    const outputFilePath = '/array-ids.json'; // Reemplaza por la ruta y el nombre del archivo de salida JSON
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const columnData: string[] = [];
    let rowIndex = 2; // Assuming data starts from row 2

    while (worksheet[columnName + rowIndex]) {
        const cell = worksheet[columnName + rowIndex];
        if (cell && cell.v) {
            columnData.push(String(cell.v)); // Convert to string
        }
        rowIndex++;
    }

    // Write the array to a new file
    fs.writeFileSync(outputFilePath, JSON.stringify(columnData, null, 4));

    return columnData;
}
