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

export const validateResumePdf = async (path: string): Promise<void> => {
  if (!fs.existsSync(path)) {
    throw new Error('Selected file does not exist.');
  }

  if (!path.toLowerCase().endsWith('.pdf')) {
    throw new Error('Selected file must be a PDF.');
  }

  let extractedText = '';

  try {
    extractedText = await parsePdf(path);
  } catch (err: any) {
    throw new Error(`Could not read the PDF. ${err.message || String(err)}`);
  }

  if (!extractedText.trim()) {
    throw new Error('PDF contains no extractable text.');
  }
};
