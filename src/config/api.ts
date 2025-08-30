// config/api.ts
export const API_CONFIG = {
  // Modal.com production endpoint from env
  MODAL_BASE_URL:
    process.env.NEXT_PUBLIC_MODAL_API_BASE_URL ||
    "https://malladipin--pdf-converter-api-fastapi-app.modal.run",

  // Local development endpoint (if running locally)
  LOCAL_BASE_URL: "http://localhost:5000",

  // Use Modal by default, switch to local for development
  BASE_URL:
    process.env.NODE_ENV === "development"
      ? process.env.NEXT_PUBLIC_PDF_API_URL ||
        process.env.NEXT_PUBLIC_MODAL_API_BASE_URL ||
        "https://malladipin--pdf-converter-api-fastapi-app.modal.run"
      : process.env.NEXT_PUBLIC_MODAL_API_BASE_URL ||
        "https://malladipin--pdf-converter-api-fastapi-app.modal.run",

  ENDPOINTS: {
    UPLOAD: "/upload",
    STATUS: "/status",
    DOWNLOAD: "/download",
    HEALTH: "/health",
  },

  // Polling configuration
  POLLING_INTERVAL: 2000, // 2 seconds
  MAX_POLL_ATTEMPTS: 150, // 5 minutes total (150 * 2s)

  // File upload limits
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
  MAX_FILES: 10,
  ACCEPTED_TYPES: [".pdf"],
} as const;

// Helper functions for API configuration
export const getApiUrl = (
  endpoint: keyof typeof API_CONFIG.ENDPOINTS
): string => {
  return `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS[endpoint]}`;
};

export const isValidFileType = (filename: string): boolean => {
  return API_CONFIG.ACCEPTED_TYPES.some((type) =>
    filename.toLowerCase().endsWith(type)
  );
};

export const isValidFileSize = (size: number): boolean => {
  return size <= API_CONFIG.MAX_FILE_SIZE;
};

export const validateFiles = (
  files: File[]
): { valid: boolean; error?: string } => {
  if (files.length === 0) {
    return { valid: false, error: "No files provided" };
  }

  if (files.length > API_CONFIG.MAX_FILES) {
    return {
      valid: false,
      error: `Maximum ${API_CONFIG.MAX_FILES} files allowed`,
    };
  }

  for (const file of files) {
    if (!isValidFileType(file.name)) {
      return {
        valid: false,
        error: `Invalid file type: ${file.name}. Only PDF files are allowed.`,
      };
    }

    if (!isValidFileSize(file.size)) {
      return {
        valid: false,
        error: `File too large: ${file.name}. Maximum ${
          API_CONFIG.MAX_FILE_SIZE / (1024 * 1024)
        }MB allowed.`,
      };
    }
  }

  return { valid: true };
};
