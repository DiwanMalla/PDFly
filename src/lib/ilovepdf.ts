// iLovePDF API Integration - Minimal Implementation
// Note: iLovePDF API does not support PDF to DOCX conversion
// The officepdf tool converts Office files TO PDF, not FROM PDF to Office formats

import ILovePDFApi from "@ilovepdf/ilovepdf-nodejs";

export interface ProcessingOptions {
  quality?: "low" | "medium" | "high" | "extreme";
  colorspace?: "color" | "grayscale";
  password?: string;
  orientation?: "portrait" | "landscape";
  margin?: number;
  pagesize?: "A4" | "letter" | "legal";
}

export class ILovePDFService {
  private static instance: ILovePDFService;
  private ilovepdf: ILovePDFApi;

  private constructor() {
    // Initialize with API credentials from environment
    this.ilovepdf = new ILovePDFApi(
      process.env.ILOVEPDF_PUBLIC_KEY!,
      process.env.ILOVEPDF_SECRET_KEY!
    );
  }

  public static getInstance(): ILovePDFService {
    if (!ILovePDFService.instance) {
      ILovePDFService.instance = new ILovePDFService();
    }
    return ILovePDFService.instance;
  }

  // PDF to DOCX conversion - iLovePDF limitation noted
  /* eslint-disable @typescript-eslint/no-unused-vars */
  async convertToDocx(_pdfBuffer: Buffer, _filename: string): Promise<Buffer> {
    /* eslint-enable @typescript-eslint/no-unused-vars */
    // iLovePDF API limitation: officepdf tool converts Office files TO PDF, not FROM PDF
    // There is no native PDF to DOCX conversion tool in iLovePDF API
    console.warn(
      "⚠️ iLovePDF API limitation: No PDF to DOCX conversion available"
    );
    console.log(
      "📖 officepdf tool converts Office files TO PDF, not FROM PDF to Office formats"
    );
    console.log(
      "🔄 Available alternatives: Use enhanced JavaScript conversion instead"
    );

    throw new Error(
      "iLovePDF API does not support PDF to DOCX conversion. " +
        "The officepdf tool only converts Office files TO PDF, not FROM PDF to Office formats. " +
        "Available PDF tools: compress, extract, merge, split, repair, protect, etc. " +
        "For PDF to DOCX conversion, please use the enhanced JavaScript converter."
    );
  }

  // Test API connection
  async testConnection(): Promise<boolean> {
    try {
      console.log("🔍 Testing iLovePDF API connection...");

      // Create a simple task to test connectivity
      const task = this.ilovepdf.newTask("compress");
      await task.start();

      // If we can start a task, the API is working
      console.log("✅ iLovePDF API connection successful");
      return true;
    } catch (error) {
      console.error("❌ iLovePDF connection test failed:", error);
      return false;
    }
  }
}

// Export singleton instance
export const ilovePdfService = ILovePDFService.getInstance();
export default ilovePdfService;
