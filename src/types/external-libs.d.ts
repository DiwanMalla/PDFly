/* eslint-disable @typescript-eslint/no-explicit-any */

// Type declarations for external libraries without official types

declare module "pdfjs-dist/legacy/build/pdf.min.js" {
  export function getDocument(config: any): { promise: Promise<any> };
  export const GlobalWorkerOptions: any;
  // Add other exports as needed
}

declare module "html-docx-js/dist/html-docx" {
  export function asBlob(html: string): Blob;
  // Add other exports as needed
}

declare module "pdf-poppler" {
  export function convert(buffer: Buffer, options?: any): Promise<any>;
  // Add other exports as needed
}

declare module "turndown" {
  class TurndownService {
    constructor(options?: any);
    turndown(html: string): string;
  }
  export = TurndownService;
}
