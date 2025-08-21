export interface PDFPageInfo {
  pageNumber: number;
  thumbnail: string;
}

export const loadPDFPages = async (file: File): Promise<PDFPageInfo[]> => {
  try {
    // Dynamic import to avoid SSR issues
    const pdfjsLib = await import('pdfjs-dist');
    
    // Set up the worker - use a version that matches the library
    if (typeof window !== 'undefined') {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.js`;
    }

    // Validate file
    if (!file || file.type !== 'application/pdf') {
      throw new Error('Invalid file type. Please select a PDF file.');
    }

    if (file.size > 100 * 1024 * 1024) { // 100MB limit
      throw new Error('File too large. Please select a PDF under 100MB.');
    }

    console.log('Loading PDF pages for file:', file.name, 'Size:', (file.size / 1024 / 1024).toFixed(2) + 'MB');

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const numPages = pdf.numPages;

    console.log('PDF loaded successfully. Pages:', numPages);

    const pages: PDFPageInfo[] = [];

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      try {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 0.5 });

        // Create canvas for thumbnail
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        if (!context) {
          throw new Error('Failed to get canvas context');
        }

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

        console.log(`Processed page ${pageNum}/${numPages}`);
      } catch (pageError) {
        console.error(`Error processing page ${pageNum}:`, pageError);
        // Continue with other pages
      }
    }

    if (pages.length === 0) {
      throw new Error('No pages could be processed from the PDF');
    }

    console.log('Successfully loaded', pages.length, 'pages');
    return pages;
  } catch (error) {
    console.error('Error in loadPDFPages:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to load PDF pages');
  }
};
