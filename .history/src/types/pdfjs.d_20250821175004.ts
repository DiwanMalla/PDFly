declare module 'pdfjs-dist' {
  export interface PDFPageProxy {
    getViewport(params: { scale: number }): any;
    render(params: { canvasContext: CanvasRenderingContext2D; viewport: any }): { promise: Promise<void> };
  }

  export interface PDFDocumentProxy {
    numPages: number;
    getPage(pageNumber: number): Promise<PDFPageProxy>;
  }

  export interface PDFSource {
    data: ArrayBuffer | Uint8Array;
  }

  export interface GetDocumentParameters {
    (source: PDFSource): { promise: Promise<PDFDocumentProxy> };
  }

  export const getDocument: GetDocumentParameters;

  export interface GlobalWorkerOptions {
    workerSrc: string;
  }

  export const GlobalWorkerOptions: GlobalWorkerOptions;
}
