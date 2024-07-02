import * as xlsx from 'xlsx';
interface CustomObject {
  [key: string]: string;
}

export const normalizeString = (text: any) => {
    const str = String(text);
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace('.', '')
      .trim()
      .toLowerCase();
  };
  


export const readExcelSheet = (excelToReadDir: string, sheetName: string) => {
  const wb = xlsx.readFile(excelToReadDir);
  const data: object[] = xlsx.utils.sheet_to_json(wb.Sheets[sheetName]);
  return data as CustomObject[];
};