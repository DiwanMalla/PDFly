// Client-side PDF utilities that work in the browser
export class PDFClientService {
  static async getBasicInfo(file: File): Promise<{
    name: string;
    size: number;
    sizeFormatted: string;
    type: string;
  }> {
    return {
      name: file.name,
      size: file.size,
      sizeFormatted: this.formatFileSize(file.size),
      type: file.type,
    };
  }

  static formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  static createPreviewUrl(file: File): string {
    return URL.createObjectURL(file);
  }

  static revokePreviewUrl(url: string): void {
    if (url.startsWith("blob:")) {
      URL.revokeObjectURL(url);
    }
  }

  static async validatePDF(
    file: File
  ): Promise<{ isValid: boolean; error?: string }> {
    try {
      // Basic PDF validation by checking file signature
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      // Check PDF signature (%PDF-)
      const pdfSignature = [0x25, 0x50, 0x44, 0x46, 0x2d]; // %PDF-
      const fileSignature = Array.from(uint8Array.slice(0, 5));

      const isValidSignature = pdfSignature.every(
        (byte, index) => byte === fileSignature[index]
      );

      if (!isValidSignature) {
        return { isValid: false, error: "File is not a valid PDF" };
      }

      // Check if file is not empty
      if (arrayBuffer.byteLength < 100) {
        return {
          isValid: false,
          error: "PDF file appears to be corrupted or empty",
        };
      }

      return { isValid: true };
    } catch (error) {
      return {
        isValid: false,
        error:
          error instanceof Error ? error.message : "Unknown validation error",
      };
    }
  }

  static async compressPDF(
    file: File,
    quality: "low" | "medium" | "high"
  ): Promise<{
    blob: Blob;
    originalSize: number;
    compressedSize: number;
    compressionRatio: string;
  }> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("quality", quality);

    const response = await fetch("/api/pdf/compress", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const contentType = response.headers.get("Content-Type") || "";
      let errorMsg = "Compression failed";

      if (contentType.includes("application/json")) {
        const error = await response.json();
        errorMsg = error.error || errorMsg;
      } else {
        const errorText = await response.text();
        errorMsg = errorText || errorMsg;
      }
      throw new Error(errorMsg);
    }

    const blob = await response.blob();
    const originalSize = parseInt(
      response.headers.get("X-Original-Size") || "0"
    );
    const compressedSize = parseInt(
      response.headers.get("X-Compressed-Size") || "0"
    );
    const compressionRatio = response.headers.get("X-Compression-Ratio") || "0";

    return {
      blob,
      originalSize,
      compressedSize,
      compressionRatio,
    };
  }

  static async convertPDF(
    file: File,
    format: string
  ): Promise<{
    blob: Blob;
    filename: string;
  }> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("format", format);

    const response = await fetch("/api/pdf/convert", {
      method: "POST",
      body: formData,
    });

    const contentType = response.headers.get("Content-Type") || "";

    if (!response.ok) {
      // Try to parse error as JSON, fallback to text
      let errorMsg = "Conversion failed";
      if (contentType.includes("application/json")) {
        const error = await response.json();
        errorMsg = error.error || errorMsg;
      } else {
        const errorText = await response.text();
        errorMsg = errorText || errorMsg;
      }
      throw new Error(errorMsg);
    }

    if (contentType.includes("application/json")) {
      // If API returns JSON, handle accordingly
      const data = await response.json();
      throw new Error(data.error || "Conversion failed");
    } else if (contentType.includes("text/plain")) {
      // For text extraction, return as Blob
      const text = await response.text();
      const blob = new Blob([text], { type: "text/plain" });
      const contentDisposition =
        response.headers.get("Content-Disposition") || "";
      const filenameMatch = contentDisposition.match(/filename="([^"]+)"/);
      const filename = filenameMatch ? filenameMatch[1] : `converted.txt`;
      return { blob, filename };
    } else {
      // For file downloads (PDF, DOCX, etc.)
      const blob = await response.blob();
      const contentDisposition =
        response.headers.get("Content-Disposition") || "";
      const filenameMatch = contentDisposition.match(/filename="([^"]+)"/);
      const filename = filenameMatch ? filenameMatch[1] : `converted.${format}`;
      return { blob, filename };
    }
  }

  static async mergePDFs(files: File[]): Promise<{
    blob: Blob;
    totalPages: number;
  }> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    const response = await fetch("/api/pdf/merge", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const contentType = response.headers.get("Content-Type") || "";
      let errorMsg = "Merge failed";

      if (contentType.includes("application/json")) {
        const error = await response.json();
        errorMsg = error.error || errorMsg;
      } else {
        const errorText = await response.text();
        errorMsg = errorText || errorMsg;
      }
      throw new Error(errorMsg);
    }

    const blob = await response.blob();
    const totalPages = parseInt(response.headers.get("X-Total-Pages") || "0");

    return {
      blob,
      totalPages,
    };
  }

  static async splitPDF(
    file: File,
    pageRanges?: string
  ): Promise<{
    blob?: Blob;
    info?: {
      message: string;
      files: { name: string; size: number }[];
      note: string;
    };
  }> {
    const formData = new FormData();
    formData.append("file", file);
    if (pageRanges) {
      formData.append("pageRanges", pageRanges);
    }

    const response = await fetch("/api/pdf/split", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const contentType = response.headers.get("Content-Type") || "";
      let errorMsg = "Split failed";

      if (contentType.includes("application/json")) {
        const error = await response.json();
        errorMsg = error.error || errorMsg;
      } else {
        const errorText = await response.text();
        errorMsg = errorText || errorMsg;
      }
      throw new Error(errorMsg);
    }

    const contentType = response.headers.get("Content-Type");

    if (contentType?.includes("application/pdf")) {
      const blob = await response.blob();
      return { blob };
    } else {
      const info = await response.json();
      return { info };
    }
  }

  static downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
