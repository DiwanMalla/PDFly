export interface PDFPageInfo {
  pageNumber: number;
  thumbnail: string;
}

// Load PDF.js from CDN to avoid Node.js dependencies
const loadPDFJS = async () => {
  if (typeof window === 'undefined') {
    throw new Error('PDF.js can only be used in the browser');
  }

  // Check if PDF.js is already loaded
  const windowWithPDFJS = window as typeof window & { pdfjsLib?: unknown };
  if (windowWithPDFJS.pdfjsLib) {
    return windowWithPDFJS.pdfjsLib;
  }

  // Load PDF.js from CDN
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.onload = () => {
      const pdfjsLib = windowWithPDFJS.pdfjsLib;
      if (pdfjsLib) {
        // Set up worker
        const pdfjs = pdfjsLib as { GlobalWorkerOptions: { workerSrc: string } };
        pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        resolve(pdfjsLib);
      } else {
        reject(new Error('Failed to load PDF.js'));
      }
    };
    script.onerror = () => reject(new Error('Failed to load PDF.js script'));
    document.head.appendChild(script);
  });
};

export const loadPDFPages = async (file: File): Promise<PDFPageInfo[]> => {
  try {
    // Validate file first
    if (!file || file.type !== "application/pdf") {
      throw new Error("Invalid file type. Please select a PDF file.");
    }

    if (file.size > 100 * 1024 * 1024) {
      // 100MB limit
      throw new Error("File too large. Please select a PDF under 100MB.");
    }

    // Load PDF.js from CDN
    const pdfjsLib = await loadPDFJS() as {
      getDocument: (options: { data: ArrayBuffer }) => { promise: Promise<{ numPages: number; getPage: (pageNum: number) => Promise<any> }> }
    };

    console.log(
      "Loading PDF pages for file:",
      file.name,
      "Size:",
      (file.size / 1024 / 1024).toFixed(2) + "MB"
    );

    const arrayBuffer = await file.arrayBuffer();

    // Configure PDF.js document loading
    const loadingTask = pdfjsLib.getDocument({
      data: arrayBuffer,
    });

    const pdf = await loadingTask.promise;
    const numPages = pdf.numPages;

    console.log("PDF loaded successfully. Pages:", numPages);

    if (numPages === 0) {
      throw new Error("PDF contains no pages");
    }

    const pages: PDFPageInfo[] = [];

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      try {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 0.5 });

        // Create canvas for thumbnail
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        if (!context) {
          throw new Error("Failed to get canvas context");
        }

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // Render page to canvas with error handling
        await page.render({
          canvasContext: context,
          viewport,
        }).promise;

        // Convert to thumbnail with good quality
        const thumbnail = canvas.toDataURL("image/jpeg", 0.8);

        pages.push({
          pageNumber: pageNum,
          thumbnail,
        });

        console.log(`Processed page ${pageNum}/${numPages}`);
      } catch (pageError) {
        console.error(`Error processing page ${pageNum}:`, pageError);
        // Continue with other pages instead of failing completely
        continue;
      }
    }

    if (pages.length === 0) {
      throw new Error("No pages could be processed from the PDF");
    }

    console.log("Successfully loaded", pages.length, "pages");
    return pages;
  } catch (error) {
    console.error("Error in loadPDFPages:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to load PDF pages");
  }
};
