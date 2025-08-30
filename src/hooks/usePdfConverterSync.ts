// hooks/usePdfConverterSync.ts
import { useState, useCallback } from "react";
import { validateFiles } from "@/config/api";
import type {
  ConversionFormat,
  ConversionJob,
  ConvertedFile,
} from "@/types/pdf-converter";

interface UsePdfConverterSyncReturn {
  // State
  isConverting: boolean;
  result: ConversionJob | null;
  error: string | null;

  // Actions
  convertFiles: (
    files: File[],
    format: ConversionFormat
  ) => Promise<ConversionJob | null>;
  downloadFile: (jobId: string, filename: string) => void;
  downloadAllAsZip: (jobId: string) => void;
  resetState: () => void;

  // Computed
  isCompleted: boolean;
  isFailed: boolean;
  hasFiles: boolean;
  convertedFiles: ConvertedFile[];
  failedFiles: ConvertedFile[];
}

export const usePdfConverterSync = (): UsePdfConverterSyncReturn => {
  const [isConverting, setIsConverting] = useState(false);
  const [result, setResult] = useState<ConversionJob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [originalFileName, setOriginalFileName] = useState<string>("");
  const [conversionFormat, setConversionFormat] = useState<
    ConversionFormat | ""
  >("");

  const resetState = useCallback(() => {
    setIsConverting(false);
    setResult(null);
    setError(null);
    setOriginalFileName("");
    setConversionFormat("");
  }, []);

  // Helper function to generate proper download filename
  const generateDownloadFilename = useCallback(
    (originalName: string, format: ConversionFormat) => {
      // Remove .pdf extension and add new extension based on format
      const nameWithoutExt = originalName.replace(/\.pdf$/i, "");

      const extensionMap: Record<ConversionFormat, string> = {
        docx: "docx",
        excel: "xlsx",
        pptx: "pptx",
        image: "jpg",
        text: "txt",
      };

      const extension = extensionMap[format] || "docx";
      return `${nameWithoutExt}.${extension}`;
    },
    []
  );

  const convertFiles = useCallback(
    async (
      files: File[],
      format: ConversionFormat
    ): Promise<ConversionJob | null> => {
      setIsConverting(true);
      setError(null);
      setResult(null);

      // Store original file info for filename generation
      if (files.length > 0) {
        setOriginalFileName(files[0].name);
        setConversionFormat(format);
      }

      try {
        // Validate files before starting
        const validation = validateFiles(files);
        if (!validation.valid) {
          throw new Error(validation.error);
        }

        console.log(
          `🚀 Starting synchronous conversion of ${files.length} file(s) to ${format}`
        );

        // Prepare form data
        const formData = new FormData();
        files.forEach((file) => formData.append("files", file));

        // Map format to backend expected format
        const formatMapping: Record<ConversionFormat, string> = {
          docx: "docx",
          excel: "xlsx",
          pptx: "pptx",
          image: "jpg",
          text: "txt",
        };
        formData.append("format", formatMapping[format] || format);

        // Call synchronous endpoint
        const response = await fetch(
          process.env.NEXT_PUBLIC_MODAL_API_UPLOAD_SYNC!,
          {
            method: "POST",
            body: formData,
          }
        );

        if (!response.ok) {
          let errorMessage = `Conversion failed: ${response.status} ${response.statusText}`;
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorData.detail || errorMessage;
          } catch {
            // Ignore JSON parsing errors, use default message
          }
          throw new Error(errorMessage);
        }

        const data: ConversionJob = await response.json();
        console.log(`✅ Synchronous conversion completed:`, data);

        setResult(data);
        return data;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error occurred";
        console.error("PDF Conversion Error:", err);
        setError(errorMessage);
        return null;
      } finally {
        setIsConverting(false);
      }
    },
    []
  );

  const downloadFile = useCallback(
    (jobId: string, filename: string) => {
      try {
        console.log(`📥 Downloading file: ${filename} from job: ${jobId}`);

        // Generate proper filename using original name and conversion format
        const downloadFilename =
          originalFileName && conversionFormat
            ? generateDownloadFilename(
                originalFileName,
                conversionFormat as ConversionFormat
              )
            : filename.replace("_converted", ""); // Fallback to clean filename

        const url = `${process.env.NEXT_PUBLIC_MODAL_API_DOWNLOAD_SYNC}/${jobId}/${filename}`;
        const link = document.createElement("a");
        link.href = url;
        link.download = downloadFilename;
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();

        // Cleanup
        setTimeout(() => {
          document.body.removeChild(link);
        }, 100);

        console.log(`✅ Download initiated for: ${downloadFilename}`);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Download failed";
        console.error("Download Error:", err);
        setError(errorMessage);
      }
    },
    [originalFileName, conversionFormat, generateDownloadFilename]
  );

  const downloadAllAsZip = useCallback((jobId: string) => {
    try {
      console.log(`📦 Downloading all files as ZIP for job: ${jobId}`);

      // Generate a meaningful filename
      const timestamp = new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/[:.]/g, "-");
      const zipFilename = `converted_files_${timestamp}.zip`;

      const url = `${process.env.NEXT_PUBLIC_MODAL_API_DOWNLOAD_SYNC}/${jobId}/zip`;
      const link = document.createElement("a");
      link.href = url;
      link.download = zipFilename;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();

      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link);
      }, 100);

      console.log(`✅ ZIP download initiated: ${zipFilename}`);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "ZIP download failed";
      console.error("ZIP Download Error:", err);
      setError(errorMessage);
    }
  }, []);

  // Computed values
  const isCompleted = result?.status === "completed";
  const isFailed = result?.status === "failed" || !!error;
  const hasFiles = (result?.converted_files?.length || 0) > 0;
  const convertedFiles = result?.converted_files || [];
  const failedFiles = result?.failed_files || [];

  return {
    // State
    isConverting,
    result,
    error,

    // Actions
    convertFiles,
    downloadFile,
    downloadAllAsZip,
    resetState,

    // Computed
    isCompleted,
    isFailed,
    hasFiles,
    convertedFiles,
    failedFiles,
  };
};
