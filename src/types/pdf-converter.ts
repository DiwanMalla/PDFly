// types/pdf-converter.ts
export interface ConversionJob {
  job_id: string;
  status: "pending" | "processing" | "completed" | "failed";
  progress: number; // API does provide progress
  message: string;
  converted_files?: ConvertedFile[];
  failed_files?: ConvertedFile[];
  error?: string;
}

export interface ConvertedFile {
  original_name: string;
  converted_name: string;
  converted_path: string;
  size_mb: number;
  format: string;
}

export interface UploadResponse {
  job_id: string;
  message: string;
  files: string[];
}

export interface ConversionRequest {
  format: "docx" | "excel" | "pptx" | "image" | "text";
  files: File[];
}

export interface ApiError {
  error: string;
  details?: string;
}

export type ConversionFormat = "docx" | "excel" | "pptx" | "image" | "text";

export interface ConversionProgress {
  jobId: string;
  status: ConversionJob["status"];
  progress: number;
  message: string;
  convertedFiles: ConvertedFile[];
  failedFiles: ConvertedFile[];
  error?: string;
}
