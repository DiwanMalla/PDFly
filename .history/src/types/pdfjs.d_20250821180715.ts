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
