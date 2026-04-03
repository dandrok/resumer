import fs from 'fs';
import { PDFParse } from 'pdf-parse';

export const parsePdf = async (path: string): Promise<string> => {
  const dataBuffer = fs.readFileSync(path);
  
  // Using the modern pdf-parse v2.4.5 API
  const parser = new PDFParse({ data: dataBuffer });
  const result = await parser.getText();
  
  // result.text contains the concatenated text from all pages
  return result.text;
};
