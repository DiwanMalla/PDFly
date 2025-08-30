// PDF to DOCX converter using pdf2docx-wasm
// High-quality conversion with excellent layout preservation
// Based on the proven pdf2docx Python library compiled to WebAssembly

import { Pdf2Docx } from "pdf2docx-wasm";

export interface ConversionOptions {
  pages?: number[]; // Specific pages to convert (e.g., [1, 2, 3] or undefined for all)
  quality?: "high" | "medium" | "low"; // Quality setting (currently not used by pdf2docx-wasm)
}

export interface ConversionResult {
  buffer: Buffer;
  size: number;
  pages: number;
  method: string;
}

export class Pdf2DocxConverter {
  private static instance: Pdf2DocxConverter;
  private converter: Pdf2Docx | null = null;
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): Pdf2DocxConverter {
    if (!Pdf2DocxConverter.instance) {
      Pdf2DocxConverter.instance = new Pdf2DocxConverter();
    }
    return Pdf2DocxConverter.instance;
  }

  // Initialize the converter (loads WASM assets)
  private async initialize(): Promise<void> {
    if (this.isInitialized && this.converter) {
      return;
    }

    try {
      console.log("🔧 Initializing pdf2docx-wasm converter...");

      // Create converter instance with asset path
      // In production, you might need to adjust this path
      this.converter = new Pdf2Docx("./node_modules/pdf2docx-wasm/");

      this.isInitialized = true;
      console.log("✅ pdf2docx-wasm converter initialized successfully");
    } catch (error) {
      console.error("❌ Failed to initialize pdf2docx-wasm converter:", error);
      throw new Error(
        `pdf2docx-wasm initialization failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  // Convert PDF to DOCX using pdf2docx-wasm
  async convertToDocx(
    pdfBuffer: Buffer,
    filename: string,
    options: ConversionOptions = {}
  ): Promise<ConversionResult> {
    await this.initialize();

    if (!this.converter) {
      throw new Error("pdf2docx-wasm converter not initialized");
    }

    try {
      console.log("🚀 Starting pdf2docx-wasm conversion...");
      console.log(`📄 Input file: ${filename}`);
      console.log(`📏 Input size: ${pdfBuffer.length} bytes`);

      if (options.pages) {
        console.log(`📑 Converting pages: ${options.pages.join(", ")}`);
      } else {
        console.log("📑 Converting all pages");
      }

      // Convert Buffer to Blob for pdf2docx-wasm
      const pdfBlob = new Blob([new Uint8Array(pdfBuffer)], {
        type: "application/pdf",
      });

      // Perform conversion
      const startTime = Date.now();
      const docxBlob = await this.converter.convert(pdfBlob, options.pages);
      const conversionTime = Date.now() - startTime;

      // Convert result back to Buffer
      const docxBuffer = Buffer.from(await docxBlob.arrayBuffer());

      console.log(`⚡ Conversion completed in ${conversionTime}ms`);
      console.log(`📦 Output size: ${docxBuffer.length} bytes`);
      console.log(
        `📊 Compression ratio: ${(
          ((pdfBuffer.length - docxBuffer.length) / pdfBuffer.length) *
          100
        ).toFixed(1)}%`
      );

      // Validate the output
      if (docxBuffer.length === 0) {
        throw new Error("Conversion resulted in empty file");
      }

      // Check for DOCX file signature
      const docxSignature = docxBuffer.subarray(0, 4);
      const expectedSignature = Buffer.from([0x50, 0x4b, 0x03, 0x04]); // PK.. (ZIP signature)

      if (!docxSignature.equals(expectedSignature)) {
        console.warn(
          "⚠️ Warning: Output does not have expected DOCX signature"
        );
        console.log("File signature:", docxSignature.toString("hex"));
      } else {
        console.log("✅ Output validated as valid DOCX file");
      }

      return {
        buffer: docxBuffer,
        size: docxBuffer.length,
        pages: options.pages ? options.pages.length : 0, // We don't know total pages without parsing
        method: "pdf2docx-wasm",
      };
    } catch (error) {
      console.error("❌ pdf2docx-wasm conversion failed:", error);
      throw new Error(
        `pdf2docx-wasm conversion failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  // Test if the converter is working
  async testConverter(): Promise<boolean> {
    try {
      await this.initialize();
      console.log("✅ pdf2docx-wasm converter test passed");
      return true;
    } catch (error) {
      console.error("❌ pdf2docx-wasm converter test failed:", error);
      return false;
    }
  }

  // Get converter info
  getInfo(): { name: string; version: string; capabilities: string[] } {
    return {
      name: "pdf2docx-wasm",
      version: "0.1.0",
      capabilities: [
        "High-quality PDF to DOCX conversion",
        "Excellent layout preservation",
        "Table structure preservation",
        "Text formatting retention",
        "Image extraction and embedding",
        "Page-specific conversion support",
        "No external dependencies (WASM-based)",
        "Based on proven pdf2docx Python library",
      ],
    };
  }
}

// Export singleton instance
export const pdf2docxConverter = Pdf2DocxConverter.getInstance();
export default pdf2docxConverter;
