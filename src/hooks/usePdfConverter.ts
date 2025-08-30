// hooks/usePdfConverter.ts
import { useState, useCallback } from "react";
import { pdfConverterApi } from "@/services/pdf-converter-api";
import { validateFiles } from "@/config/api";
import type {
  ConversionProgress,
  ConversionFormat,
} from "@/types/pdf-converter";

interface UsePdfConverterReturn {
  // State
  isUploading: boolean;
  isConverting: boolean;
  progress: ConversionProgress | null;
  error: string | null;

  // Actions
  convertFiles: (files: File[], format: ConversionFormat) => Promise<void>;
  downloadFile: (convertedName: string) => Promise<void>;
  downloadAllAsZip: () => Promise<void>;
  resetState: () => void;

  // Computed
  isCompleted: boolean;
  isFailed: boolean;
  hasFiles: boolean;
  progressPercentage: number;
}

export const usePdfConverter = (): UsePdfConverterReturn => {
  const [isUploading, setIsUploading] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState<ConversionProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  const resetState = useCallback(() => {
    setIsUploading(false);
    setIsConverting(false);
    setProgress(null);
    setError(null);
  }, []);

  const convertFiles = useCallback(
    async (files: File[], format: ConversionFormat) => {
      try {
        setIsUploading(true);
        setError(null);
        setProgress(null);

        // Validate files before starting
        const validation = validateFiles(files);
        if (!validation.valid) {
          throw new Error(validation.error);
        }

        console.log(
          `Starting conversion of ${files.length} file(s) to ${format}`
        );

        // Upload and start conversion
        const uploadResponse = await pdfConverterApi.uploadAndConvert(
          files,
          format
        );

        console.log(`Conversion job started: ${uploadResponse.job_id}`);

        // Switch from uploading to converting
        setIsUploading(false);
        setIsConverting(true);

        // Set initial progress state
        setProgress({
          jobId: uploadResponse.job_id,
          status: "pending",
          progress: 0, // Will be updated from API
          message: "Conversion started...",
          convertedFiles: [],
          failedFiles: [],
        });

        // Poll for completion with progress updates
        const finalJob = await pdfConverterApi.pollForCompletion(
          uploadResponse.job_id,
          (job) => {
            console.log(
              `🔄 Hook received job update:`,
              JSON.stringify(job, null, 2)
            );
            console.log(
              `Progress update: ${job.progress}% - Status: ${job.status} - ${job.message}`
            );

            setProgress({
              jobId: job.job_id,
              status: job.status,
              progress: job.progress,
              message: job.message,
              convertedFiles: job.converted_files || [],
              failedFiles: job.failed_files || [],
              error: job.error,
            });
          }
        );

        if (finalJob.status === "failed") {
          throw new Error(finalJob.error || "Conversion failed");
        }

        console.log(`Conversion completed successfully: ${finalJob.job_id}`);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error occurred";
        console.error("PDF Conversion Error:", err);
        setError(errorMessage);

        // Set error state in progress as well
        if (progress) {
          setProgress((prev) =>
            prev
              ? {
                  ...prev,
                  status: "failed",
                  progress: 0,
                  error: errorMessage,
                }
              : null
          );
        }
      } finally {
        setIsUploading(false);
        setIsConverting(false);
      }
    },
    [progress]
  );

  const downloadFile = useCallback(
    async (convertedName: string) => {
      if (!progress?.jobId) {
        throw new Error("No active conversion job");
      }

      try {
        console.log(`Downloading file: ${convertedName}`);
        const blob = await pdfConverterApi.downloadFile(
          progress.jobId,
          convertedName
        );

        // Create download link
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = convertedName;
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();

        // Cleanup
        setTimeout(() => {
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }, 100);

        console.log(`File downloaded successfully: ${convertedName}`);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Download failed";
        console.error("Download Error:", err);
        setError(errorMessage);
        throw err;
      }
    },
    [progress?.jobId]
  );

  const downloadAllAsZip = useCallback(async () => {
    if (!progress?.jobId) {
      throw new Error("No active conversion job");
    }

    try {
      console.log(`Downloading all files as ZIP for job: ${progress.jobId}`);
      const blob = await pdfConverterApi.downloadZip(progress.jobId);

      // Generate a meaningful filename
      const timestamp = new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/[:.]/g, "-");
      const zipFilename = `converted_files_${timestamp}.zip`;

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = zipFilename;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();

      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);

      console.log(`ZIP file downloaded successfully: ${zipFilename}`);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "ZIP download failed";
      console.error("ZIP Download Error:", err);
      setError(errorMessage);
      throw err;
    }
  }, [progress?.jobId]);

  // Computed values
  const isCompleted = progress?.status === "completed";
  const isFailed = progress?.status === "failed" || !!error;
  const hasFiles = (progress?.convertedFiles?.length || 0) > 0;
  const progressPercentage = progress?.progress || 0;

  return {
    // State
    isUploading,
    isConverting,
    progress,
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
    progressPercentage,
  };
};
