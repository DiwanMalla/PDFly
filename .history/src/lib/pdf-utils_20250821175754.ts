import * as pdfjsLib from 'pdfjs-dist';

// Set up the worker
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = '//unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
}

export interface PDFPageInfo {
  pageNumber: number;
  thumbnail: string;
}

export const loadPDFPages = async (file: File): Promise<PDFPageInfo[]> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const numPages = pdf.numPages;

    const pages: PDFPageInfo[] = [];

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 0.5 });

      // Create canvas for thumbnail
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d')!;
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      // Render page to canvas
      await page.render({ canvasContext: context, viewport }).promise;

      // Convert to thumbnail
      const thumbnail = canvas.toDataURL('image/jpeg', 0.8);

      pages.push({
        pageNumber: pageNum,
        thumbnail,
      });
    }

    return pages;
  } catch (error) {
    console.error('Error in loadPDFPages:', error);
    throw new Error('Failed to load PDF pages');
  }
};
