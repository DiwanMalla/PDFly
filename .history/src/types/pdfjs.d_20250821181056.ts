declare module "pdfjs-dist" {
  export interface PDFViewport {
    width: number;
    height: number;
  }

  export interface PDFPageProxy {
    getViewport(params: { scale: number }): PDFViewport;
    render(params: {
      canvasContext: CanvasRenderingContext2D;
      viewport: PDFViewport;
    }): { promise: Promise<void> };
  }

  export interface PDFDocumentProxy {
    numPages: number;
    getPage(pageNumber: number): Promise<PDFPageProxy>;
  }

  export interface DocumentInitParameters {
    data: ArrayBuffer | Uint8Array;
  }

  export interface PDFDocumentLoadingTask {
    promise: Promise<PDFDocumentProxy>;
  }

  export function getDocument(params: DocumentInitParameters): PDFDocumentLoadingTask;

  export interface GlobalWorkerOptionsType {
    workerSrc: string;
  }

  export const GlobalWorkerOptions: GlobalWorkerOptionsType;
}
