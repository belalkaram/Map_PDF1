import * as pdfjsLib from 'pdfjs-dist';

// Configure worker to use local worker file
pdfjsLib.GlobalWorkerOptions.workerSrc = '/assets/pdf.worker.min.js';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB limit

export async function extractTextFromPDF(file: File): Promise<string[]> {
  // Validate file type
  if (!file.type || file.type !== 'application/pdf') {
    throw new Error('Please upload a valid PDF file.');
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File size exceeds 10MB limit. Please upload a smaller file.');
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    
    // Validate PDF header
    const header = new Uint8Array(arrayBuffer.slice(0, 5));
    const pdfHeader = '%PDF-';
    const headerString = new TextDecoder().decode(header);
    if (!headerString.startsWith(pdfHeader)) {
      throw new Error('Invalid PDF file format. Please upload a valid PDF.');
    }

    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;

    if (pdf.numPages === 0) {
      throw new Error('The PDF file appears to be empty.');
    }

    const textContent: string[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      try {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const text = content.items
          .map((item: any) => item.str)
          .join(' ')
          .trim();
        
        if (text) textContent.push(text);
      } catch (pageError) {
        console.warn(`Error processing page ${i}:`, pageError);
        // Continue processing other pages even if one fails
        continue;
      }
    }

    if (textContent.length === 0) {
      throw new Error('No readable text found in the PDF. The file might be scanned or protected.');
    }

    return textContent;
  } catch (error) {
    if (error instanceof Error) {
      throw error; // Re-throw already formatted errors
    }
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to process PDF file. Please ensure the file is not corrupted or password protected.');
  }
}