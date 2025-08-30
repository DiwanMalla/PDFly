// services/pdf-converter-api.ts
import { API_CONFIG, getApiUrl, validateFiles } from "@/config/api";
import type {
  ConversionJob,
  UploadResponse,
  ConversionFormat,
  ApiError,
} from "@/types/pdf-converter";

class PdfConverterApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_CONFIG.BASE_URL;
    console.log(
      `🌐 PDF Converter API initialized with base URL: ${this.baseUrl}`
    );
  }

  // Health check
  async checkHealth(): Promise<{ status: string; message: string }> {
    try {
      const response = await fetch(getApiUrl("HEALTH"), {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(
          `Health check failed: ${response.status} ${response.statusText}`
        );
      }

      return response.json();
    } catch (error) {
      console.error("Health check error:", error);
      throw new Error(
        `Health check failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  // Upload files and start conversion
  async uploadAndConvert(
    files: File[],
    format: ConversionFormat
  ): Promise<UploadResponse> {
    // Validate files before upload
    const validation = validateFiles(files);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const formData = new FormData();

    // Add files
    files.forEach((file) => {
      formData.append("files", file);
    });

    // Add format - map to backend expected format
    const formatMapping: Record<ConversionFormat, string> = {
      docx: "docx",
      excel: "xlsx",
      pptx: "pptx",
      image: "jpg",
      text: "txt",
    };

    formData.append("output_format", formatMapping[format] || format);

    try {
      const response = await fetch(getApiUrl("UPLOAD"), {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        let errorMessage = `Upload failed: ${response.status} ${response.statusText}`;
        try {
          const errorData: ApiError = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          // Ignore JSON parsing errors, use default message
        }
        throw new Error(errorMessage);
      }

      return response.json();
    } catch (error) {
      console.error("Upload error:", error);
      throw new Error(
        `Upload failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  // Check conversion status
  async checkStatus(jobId: string): Promise<ConversionJob> {
    if (!jobId) {
      throw new Error("Job ID is required");
    }

    try {
      const statusUrl = `${this.baseUrl}${API_CONFIG.ENDPOINTS.STATUS}/${jobId}`;
      console.log(`🔍 Checking status at URL: ${statusUrl}`);

      const response = await fetch(statusUrl, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        let errorMessage = `Status check failed: ${response.status} ${response.statusText}`;
        try {
          const errorData: ApiError = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          // Ignore JSON parsing errors, use default message
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log(`📊 Raw API response:`, JSON.stringify(result, null, 2));

      return result;
    } catch (error) {
      console.error("Status check error:", error);
      throw new Error(
        `Status check failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  // Download converted file
  async downloadFile(jobId: string, filename?: string): Promise<Blob> {
    if (!jobId) {
      throw new Error("Job ID is required");
    }

    try {
      // If filename is provided, download specific file, otherwise download the conversion result
      const downloadUrl = filename
        ? `${this.baseUrl}${API_CONFIG.ENDPOINTS.DOWNLOAD}/${jobId}/${filename}`
        : `${this.baseUrl}${API_CONFIG.ENDPOINTS.DOWNLOAD}/${jobId}`;

      const response = await fetch(downloadUrl, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error(
          `Download failed: ${response.status} ${response.statusText}`
        );
      }

      return response.blob();
    } catch (error) {
      console.error("Download error:", error);
      throw new Error(
        `Download failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  // Download all files as ZIP
  async downloadZip(jobId: string): Promise<Blob> {
    if (!jobId) {
      throw new Error("Job ID is required");
    }

    try {
      const response = await fetch(
        `${this.baseUrl}${API_CONFIG.ENDPOINTS.DOWNLOAD}/${jobId}/zip`,
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        throw new Error(
          `ZIP download failed: ${response.status} ${response.statusText}`
        );
      }

      return response.blob();
    } catch (error) {
      console.error("ZIP download error:", error);
      throw new Error(
        `ZIP download failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  // Poll for completion with enhanced error handling
  async pollForCompletion(
    jobId: string,
    onProgress?: (job: ConversionJob) => void
  ): Promise<ConversionJob> {
    if (!jobId) {
      throw new Error("Job ID is required for polling");
    }

    let attempts = 0;

    console.log(`Starting polling for job ${jobId}...`);

    while (attempts < API_CONFIG.MAX_POLL_ATTEMPTS) {
      try {
        const job = await this.checkStatus(jobId);

        console.log(
          `Poll attempt ${attempts + 1}/${
            API_CONFIG.MAX_POLL_ATTEMPTS
          }: Status = ${job.status}, Message = ${job.message}`
        );

        if (onProgress) {
          onProgress(job);
        }

        if (job.status === "completed") {
          console.log(`Job ${jobId} completed successfully`);
          return job;
        }

        if (job.status === "failed") {
          console.error(`Job ${jobId} failed:`, job.error);
          throw new Error(job.error || "Conversion failed");
        }

        // Wait before next poll
        await new Promise((resolve) =>
          setTimeout(resolve, API_CONFIG.POLLING_INTERVAL)
        );
        attempts++;
      } catch (error) {
        console.error(`Polling error for job ${jobId}:`, error);

        // If it's a network error and we haven't reached max attempts, continue polling
        if (attempts < API_CONFIG.MAX_POLL_ATTEMPTS - 1) {
          console.log(`Retrying poll for job ${jobId} after error...`);
          await new Promise((resolve) =>
            setTimeout(resolve, API_CONFIG.POLLING_INTERVAL)
          );
          attempts++;
          continue;
        } else {
          throw error;
        }
      }
    }

    throw new Error(
      `Conversion timeout after ${API_CONFIG.MAX_POLL_ATTEMPTS} attempts - please try again`
    );
  }

  // Convenience method for complete conversion workflow
  async convertFiles(
    files: File[],
    format: ConversionFormat,
    onProgress?: (job: ConversionJob) => void
  ): Promise<{ job: ConversionJob; downloadBlob: Blob }> {
    // Step 1: Upload and start conversion
    console.log(`Starting conversion of ${files.length} files to ${format}...`);
    const uploadResponse = await this.uploadAndConvert(files, format);

    // Step 2: Poll for completion
    const job = await this.pollForCompletion(uploadResponse.job_id, onProgress);

    // Step 3: Download result
    console.log(`Downloading result for job ${job.job_id}...`);
    const downloadBlob = await this.downloadFile(job.job_id);

    return { job, downloadBlob };
  }
}

export const pdfConverterApi = new PdfConverterApiService();
