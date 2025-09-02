import { useState } from "react";

// Modal API Configuration
const MODAL_API_BASE_URL =
  "https://malladipin--pdf-converter-api-fastapi-app.modal.run";

// Types for API responses
interface ConvertedFile {
  original_name: string;
  converted_name: string;
  converted_path: string;
  size_mb: number;
  format: string;
  download_url: string;
}

interface FailedFile {
  filename: string;
  error: string;
}

interface APIResponse {
  job_id: string;
  status: "completed" | "processing" | "error";
  progress: number;
  message: string;
  converted_files: ConvertedFile[];
  failed_files: FailedFile[];
}

// Hook for Python PDF operations
export const usePythonPDFOperations = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState<
    string | null
  >(null);
  const [processingMessage, setProcessingMessage] = useState<string>("");

  // Convert PDF to different formats (DOCX, Excel, PowerPoint, Images)
  const convertPDF = async (
    files: File[],
    format: "docx" | "excel" | "pptx" | "images" | "text",
    options?: {
      use_ocr?: boolean;
      single_sheet?: boolean;
      image_format?: string;
      quality?: string;
      dpi?: number;
      include_formatting?: boolean;
      preserve_layout?: boolean;
    }
  ): Promise<APIResponse | null> => {
    setIsProcessing(true);
    setProgress(0);
    setError(null);
    setEstimatedTimeRemaining(null);
    setProcessingMessage("");

    try {
      const formData = new FormData();

      // Calculate estimated time based on file size and format
      const calculateEstimatedTime = (
        file: File,
        format: string,
        quality?: string
      ) => {
        const fileSizeMB = file.size / (1024 * 1024);
        let baseTimePerMB = 2; // seconds

        if (format === "images") {
          baseTimePerMB =
            quality === "ultra"
              ? 8
              : quality === "high"
              ? 6
              : quality === "medium"
              ? 4
              : 2;
        } else if (format === "excel") {
          baseTimePerMB = 4;
        } else if (format === "pptx") {
          baseTimePerMB = 5;
        } else if (format === "text") {
          baseTimePerMB = 1.5; // Text extraction is fast
        } else {
          baseTimePerMB = 3;
        }

        return Math.max(fileSizeMB * baseTimePerMB, 5); // minimum 5 seconds
      };

      // Handle images format differently (single file endpoint)
      if (format === "images") {
        if (files.length !== 1) {
          throw new Error("Images conversion only supports single file");
        }

        const file = files[0];
        const estimatedSeconds = calculateEstimatedTime(
          file,
          format,
          options?.quality
        );
        setEstimatedTimeRemaining(`~${Math.round(estimatedSeconds)} seconds`);
        setProcessingMessage("Initializing image conversion...");

        formData.append("file", file);

        // Add image-specific options
        if (options) {
          if (options.image_format) {
            formData.append("image_format", options.image_format);
          }
          if (options.quality) {
            formData.append("quality", options.quality);
          }
          if (options.dpi) {
            formData.append("dpi", options.dpi.toString());
          }
        }

        setProgress(20);
        setProcessingMessage("Uploading file...");

        const response = await fetch(`${MODAL_API_BASE_URL}/images-sync`, {
          method: "POST",
          body: formData,
        });

        setProgress(60);
        setProcessingMessage("Processing images...");

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.detail || `HTTP error! status: ${response.status}`
          );
        }

        const result: APIResponse = await response.json();
        setProgress(100);

        return result;
      } else if (format === "text") {
        // Handle text extraction format (single file endpoint like images)
        if (files.length !== 1) {
          throw new Error("Text extraction only supports single file");
        }

        const file = files[0];
        const estimatedSeconds = calculateEstimatedTime(file, format);
        setEstimatedTimeRemaining(`~${Math.round(estimatedSeconds)} seconds`);
        setProcessingMessage("Initializing text extraction...");

        formData.append("file", file);

        // Add text-specific options
        if (options) {
          if (options.include_formatting !== undefined) {
            formData.append(
              "include_formatting",
              options.include_formatting.toString()
            );
          }
          if (options.preserve_layout !== undefined) {
            formData.append(
              "preserve_layout",
              options.preserve_layout.toString()
            );
          }
        }

        setProgress(20);
        setProcessingMessage("Uploading file...");

        const response = await fetch(`${MODAL_API_BASE_URL}/text-sync`, {
          method: "POST",
          body: formData,
        });

        setProgress(60);
        setProcessingMessage("Extracting text...");

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.detail || `HTTP error! status: ${response.status}`
          );
        }

        const result: APIResponse = await response.json();
        setProgress(100);

        return result;
      } else {
        // Handle other formats (docx, excel, pptx)
        // Add files
        files.forEach((file) => {
          formData.append("files", file);
        });

        // Add format
        formData.append("format", format);

        // Add Excel-specific options
        if (format === "excel" && options) {
          if (options.use_ocr !== undefined) {
            formData.append("use_ocr", options.use_ocr.toString());
          }
          if (options.single_sheet !== undefined) {
            formData.append("single_sheet", options.single_sheet.toString());
          }
        }

        setProgress(20);

        const response = await fetch(`${MODAL_API_BASE_URL}/upload-sync`, {
          method: "POST",
          body: formData,
        });

        setProgress(60);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.detail || `HTTP error! status: ${response.status}`
          );
        }

        const result: APIResponse = await response.json();
        setProgress(100);

        return result;
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
      console.error("Conversion error:", err);
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  // Compress PDF
  const compressPDF = async (
    file: File,
    quality: "low" | "medium" | "high" = "medium"
  ): Promise<APIResponse | null> => {
    setIsProcessing(true);
    setProgress(0);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("quality", quality);

      setProgress(20);

      const response = await fetch(`${MODAL_API_BASE_URL}/compress-sync`, {
        method: "POST",
        body: formData,
      });

      setProgress(60);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.detail || `HTTP error! status: ${response.status}`
        );
      }

      const result: APIResponse = await response.json();
      setProgress(100);

      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
      console.error("Compression error:", err);
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  // Merge PDFs
  const mergePDFs = async (files: File[]): Promise<APIResponse | null> => {
    setIsProcessing(true);
    setProgress(0);
    setError(null);

    try {
      if (files.length < 2) {
        throw new Error("At least 2 PDF files are required for merging");
      }

      const formData = new FormData();

      // Add files
      files.forEach((file) => {
        formData.append("files", file);
      });

      setProgress(20);

      const response = await fetch(`${MODAL_API_BASE_URL}/merge-sync`, {
        method: "POST",
        body: formData,
      });

      setProgress(60);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.detail || `HTTP error! status: ${response.status}`
        );
      }

      const result: APIResponse = await response.json();
      setProgress(100);

      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
      console.error("Merge error:", err);
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  // Split PDF
  const splitPDF = async (
    file: File,
    pageRanges?: string
  ): Promise<APIResponse | null> => {
    setIsProcessing(true);
    setProgress(0);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      if (pageRanges) {
        formData.append("page_ranges", pageRanges);
      }

      setProgress(20);

      const response = await fetch(`${MODAL_API_BASE_URL}/split-sync`, {
        method: "POST",
        body: formData,
      });

      setProgress(60);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.detail || `HTTP error! status: ${response.status}`
        );
      }

      const result: APIResponse = await response.json();
      setProgress(100);

      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
      console.error("Split error:", err);
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  // Download file
  const downloadFile = async (
    jobId: string,
    filename: string,
    originalFilename?: string
  ): Promise<boolean> => {
    try {
      const response = await fetch(
        `${MODAL_API_BASE_URL}/download-sync/${jobId}/${filename}`
      );

      if (!response.ok) {
        throw new Error(`Download failed: ${response.status}`);
      }

      const blob = await response.blob();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = originalFilename || filename;

      document.body.appendChild(a);
      a.click();

      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      return true;
    } catch (err) {
      console.error("Download error:", err);
      setError(err instanceof Error ? err.message : "Download failed");
      return false;
    }
  };

  // Check API health
  const checkAPIHealth = async (): Promise<boolean> => {
    try {
      const response = await fetch(`${MODAL_API_BASE_URL}/health`);
      return response.ok;
    } catch {
      return false;
    }
  };

  // Utility function to format file size
  const formatFileSize = (sizeInMB: number): string => {
    if (sizeInMB < 0.1) {
      return `${(sizeInMB * 1024).toFixed(0)} KB`;
    }
    return `${sizeInMB.toFixed(2)} MB`;
  };

  // Utility function to get file extension from format
  const getFileExtension = (format: string): string => {
    const extensions: Record<string, string> = {
      docx: ".docx",
      excel: ".xlsx",
      pptx: ".pptx",
      pdf: ".pdf",
    };
    return extensions[format] || "";
  };

  // Clear error function
  const clearError = () => {
    setError(null);
  };

  return {
    // State
    isProcessing,
    progress,
    error,
    estimatedTimeRemaining,
    processingMessage,

    // Operations
    convertPDF,
    compressPDF,
    mergePDFs,
    splitPDF,
    downloadFile,
    clearError,

    // Utilities
    checkAPIHealth,
    formatFileSize,
    getFileExtension,
  };
};

// Export types for use in components
export type { ConvertedFile, FailedFile, APIResponse };
