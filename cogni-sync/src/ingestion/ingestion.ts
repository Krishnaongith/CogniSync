import {
  SUPPORTED_TYPES,
  MAX_FILE_SIZE_BYTES,
  MAX_PASTE_CHARS,
  IngestionError,
  IngestionResult,
} from '../types/index';

// --- Validation ---

export function validateFile(file: File): IngestionError | null {
  if (!(SUPPORTED_TYPES as readonly string[]).includes(file.type)) {
    return {
      code: 'UNSUPPORTED_TYPE',
      message:
        'This file type is not supported. Please upload a PDF, DOCX, PPTX, XLSX, or TXT file.',
    };
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      code: 'FILE_TOO_LARGE',
      message: 'File size exceeds the 100 MB limit. Please upload a smaller file.',
    };
  }
  return null;
}

export function validatePaste(text: string): IngestionError | null {
  if (text.length > MAX_PASTE_CHARS) {
    return {
      code: 'PASTE_TOO_LONG',
      message: 'Text exceeds the 80,000 character limit. Please shorten your input.',
    };
  }
  return null;
}

// --- Extractors ---

async function extractFromPdf(file: File): Promise<string> {
  const pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const pages: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ');
    pages.push(pageText);
  }
  return pages.join('\n');
}

async function extractFromDocx(file: File): Promise<string> {
  const mammoth = await import('mammoth');
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}

async function extractFromXlsx(file: File): Promise<string> {
  const XLSX = await import('xlsx');
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });

  const sheets: string[] = [];
  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const csv = XLSX.utils.sheet_to_csv(sheet);
    sheets.push(csv);
  }
  return sheets.join('\n');
}

async function extractFromPptx(file: File): Promise<string> {
  const JSZip = (await import('jszip')).default;
  const arrayBuffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(arrayBuffer);

  // PPTX slides live at ppt/slides/slide1.xml, slide2.xml, etc.
  const slideFiles = Object.keys(zip.files)
    .filter(name => /^ppt\/slides\/slide\d+\.xml$/.test(name))
    .sort((a, b) => {
      const numA = parseInt(a.match(/\d+/)?.[0] ?? '0');
      const numB = parseInt(b.match(/\d+/)?.[0] ?? '0');
      return numA - numB;
    });

  if (slideFiles.length === 0) {
    throw new Error('No slides found in PPTX');
  }

  const slideTexts: string[] = [];
  for (const slideName of slideFiles) {
    const xml = await zip.files[slideName].async('string');
    // Extract all <a:t> text nodes (DrawingML text runs)
    const matches = xml.match(/<a:t[^>]*>([^<]*)<\/a:t>/g) ?? [];
    const text = matches
      .map(m => m.replace(/<[^>]+>/g, ''))
      .filter(t => t.trim().length > 0)
      .join(' ');
    if (text.trim()) slideTexts.push(text.trim());
  }

  return slideTexts.join('\n\n');
}

async function extractFromPlainText(file: File): Promise<string> {
  return file.text();
}

// --- Main extraction dispatcher ---

export async function extractTextFromFile(file: File): Promise<IngestionResult> {
  const validationError = validateFile(file);
  if (validationError) {
    throw validationError;
  }

  try {
    let text: string;

    switch (file.type) {
      case 'application/pdf':
        text = await extractFromPdf(file);
        break;
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        text = await extractFromDocx(file);
        break;
      case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
        text = await extractFromXlsx(file);
        break;
      case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
        text = await extractFromPptx(file);
        break;
      case 'text/plain':
        text = await extractFromPlainText(file);
        break;
      default:
        throw new Error(`Unhandled MIME type: ${file.type}`);
    }

    return {
      text,
      sourceType: 'file',
      fileName: file.name,
    };
  } catch (err) {
    // Re-throw IngestionErrors as-is (e.g. from validateFile)
    if (err && typeof err === 'object' && 'code' in err) {
      throw err;
    }
    const extractionError: IngestionError = {
      code: 'EXTRACTION_FAILED',
      message: "We couldn't extract text from this file. Please paste the text directly.",
    };
    throw extractionError;
  }
}
