const API_BASE = "https://malladipin--pdf-converter-api-fastapi-app.modal.run";

interface UploadResponse {
  job_id: string;
  status: string;
  message?: string;
  error?: string;
}

interface StatusResponse {
  job_id: string;
  status: "pending" | "processing" | "completed" | "failed";
  progress?: number;
  message?: string;
  error?: string;
  output_files?: string[];
}

interface ConversionResult {
  success: boolean;
  blob?: Blob;
  error?: string;
  jobId?: string;
}

interface ApiInfo {
  service: string;
  endpoint: string;
  status: string;
  [key: string]: unknown;
}

export class ExternalPdfApi {
  // Upload files to the external API
  static async uploadFiles(
    files: File[],
    outputFormat: string = "docx"
  ): Promise<UploadResponse> {
    try {
      // Validate files before upload
      if (!files || files.length === 0) {
        throw new Error("No files provided for upload");
      }

      for (const file of files) {
        if (!file.type.includes("pdf")) {
          throw new Error(
            `Invalid file type: ${file.type}. Only PDF files are supported.`
          );
        }
        if (file.size === 0) {
          throw new Error(`File ${file.name} is empty`);
        }
        if (file.size > 50 * 1024 * 1024) {
          // 50MB limit
          throw new Error(`File ${file.name} is too large (max 50MB)`);
        }
      }

      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));
      formData.append("output_format", outputFormat);

      console.log(`Uploading ${files.length} file(s) to external API...`);

      const response = await fetch(`${API_BASE}/upload`, {
        method: "POST",
        body: formData,
        headers: {
          // Don't set Content-Type for FormData, let browser set it with boundary
        },
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error");
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${errorText}`
        );
      }

      const result = await response.json();
      console.log("Upload result:", result);

      return result;
    } catch (error) {
      console.error("Upload failed:", error);
      throw new Error(
        `Upload failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  // Check conversion status
  static async checkStatus(jobId: string): Promise<StatusResponse> {
    try {
      console.log(`Checking status for job: ${jobId}`);

      const response = await fetch(`${API_BASE}/status/${jobId}`);

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error");
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${errorText}`
        );
      }

      const result = await response.json();
      console.log(`Job ${jobId} status:`, result);

      return result;
    } catch (error) {
      console.error("Status check failed:", error);
      throw new Error(
        `Status check failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  // Download converted files
  static async downloadFiles(jobId: string): Promise<Blob> {
    try {
      const response = await fetch(`${API_BASE}/download/${jobId}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.blob();
    } catch (error) {
      console.error("Download failed:", error);
      throw new Error(
        `Download failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  // Complete conversion workflow with polling
  static async convertFiles(
    files: File[],
    outputFormat: string = "docx"
  ): Promise<ConversionResult> {
    try {
      // Step 1: Upload files
      const uploadResult = await this.uploadFiles(files, outputFormat);

      if (!uploadResult.job_id) {
        return {
          success: false,
          error: uploadResult.error || "Failed to get job ID from upload",
        };
      }

      const jobId = uploadResult.job_id;

      // Step 2: Poll for completion
      const maxAttempts = 60; // 5 minutes max (5s intervals)
      let attempts = 0;

      console.log(`Starting polling for job ${jobId}...`);

      while (attempts < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 seconds

        console.log(
          `Polling attempt ${attempts + 1}/${maxAttempts} for job ${jobId}`
        );
        const status = await this.checkStatus(jobId);
        console.log(
          `Job ${jobId} status response:`,
          JSON.stringify(status, null, 2)
        );

        if (status.status === "completed") {
          console.log(`Job ${jobId} completed successfully`);

          // Check if there were failed files even in completed status
          if (
            status.error?.includes("File not found") ||
            status.message?.includes("failed_files")
          ) {
            console.log(`Job ${jobId} completed but with failed files`);
            return {
              success: false,
              error:
                "File upload failed on external server. Please try again or use a different conversion method.",
              jobId,
            };
          }

          // Step 3: Download result
          console.log(`Downloading result for job ${jobId}...`);
          try {
            const blob = await this.downloadFiles(jobId);
            console.log(
              `Successfully downloaded blob for job ${jobId}, size: ${blob.size} bytes`
            );
            return {
              success: true,
              blob,
              jobId,
            };
          } catch (downloadError) {
            console.error(`Download failed for job ${jobId}:`, downloadError);
            return {
              success: false,
              error: `Download failed: ${
                downloadError instanceof Error
                  ? downloadError.message
                  : "Unknown error"
              }`,
              jobId,
            };
          }
        } else if (status.status === "failed") {
          console.log(`Job ${jobId} failed:`, status.error);
          // Check for specific error types
          let errorMessage = status.error || "Conversion failed";

          if (
            status.error?.includes("libGL") ||
            status.error?.includes("OpenGL") ||
            status.error?.includes("cannot open shared object file")
          ) {
            errorMessage =
              "External API missing graphics libraries. Please try a different conversion method.";
          } else if (status.error?.includes("File not found")) {
            errorMessage =
              "File upload failed on external server. Please try again or use a different conversion method.";
          }

          return {
            success: false,
            error: errorMessage,
            jobId,
          };
        } else {
          console.log(
            `Job ${jobId} still in progress, status: ${status.status}`
          );
        }

        attempts++;
      }

      return {
        success: false,
        error: "Conversion timeout - job did not complete within 5 minutes",
        jobId,
      };
    } catch (error) {
      console.error("Conversion workflow failed:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  // Test API connectivity
  static async testConnection(): Promise<{
    available: boolean;
    info?: ApiInfo;
    error?: string;
  }> {
    try {
      // Try to hit a health endpoint or upload endpoint with minimal data
      const response = await fetch(`${API_BASE}/health`, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        return {
          available: true,
          info: {
            service: "External PDF API",
            endpoint: API_BASE,
            status: "Connected",
            ...data,
          },
        };
      } else {
        return {
          available: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
        };
      }
    } catch (error) {
      return {
        available: false,
        error: error instanceof Error ? error.message : "Connection failed",
      };
    }
  }
}

export default ExternalPdfApi;
