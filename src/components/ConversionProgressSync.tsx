// components/ConversionProgressSync.tsx
"use client";

import React from "react";
import type { ConversionJob } from "@/types/pdf-converter";

interface ConversionProgressSyncProps {
  result: ConversionJob;
  onDownloadFile: (jobId: string, filename: string) => void;
  onDownloadZip: (jobId: string) => void;
  onReset: () => void;
}

export const ConversionProgressSync: React.FC<ConversionProgressSyncProps> = ({
  result,
  onDownloadFile,
  onDownloadZip,
  onReset,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600";
      case "failed":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <svg
            className="w-5 h-5 text-green-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "failed":
        return (
          <svg
            className="w-5 h-5 text-red-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        );
      default:
        return (
          <svg
            className="w-5 h-5 text-gray-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
              clipRule="evenodd"
            />
          </svg>
        );
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
      {/* Status Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {getStatusIcon(result.status)}
          <div>
            <h3 className={`font-medium ${getStatusColor(result.status)}`}>
              {result.status.charAt(0).toUpperCase() + result.status.slice(1)}
            </h3>
            <p className="text-sm text-gray-600">{result.message}</p>
          </div>
        </div>

        <button
          onClick={onReset}
          className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
        >
          Reset
        </button>
      </div>

      {/* Success Progress Bar */}
      {result.status === "completed" && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Progress</span>
            <span className="font-medium text-green-600">
              {result.progress}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${result.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Error Display */}
      {result.status === "failed" && result.error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-sm text-red-800">{result.error}</p>
        </div>
      )}

      {/* Converted Files */}
      {result.converted_files && result.converted_files.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">
            ✅ Converted Files ({result.converted_files.length})
          </h4>

          <div className="space-y-2">
            {result.converted_files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-green-50 rounded-md border border-green-200"
              >
                <div className="flex items-center space-x-3">
                  <svg
                    className="w-5 h-5 text-green-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div>
                    <p className="font-medium text-green-900">
                      {file.converted_name}
                    </p>
                    <p className="text-sm text-green-700">
                      {file.format.toUpperCase()} • From: {file.original_name} •{" "}
                      {file.size_mb} MB
                    </p>
                  </div>
                </div>

                <button
                  onClick={() =>
                    onDownloadFile(result.job_id, file.converted_name)
                  }
                  className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors font-medium"
                >
                  Download
                </button>
              </div>
            ))}
          </div>

          {/* Download All Button */}
          {result.converted_files.length > 1 && (
            <button
              onClick={() => onDownloadZip(result.job_id)}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              📦 Download All as ZIP
            </button>
          )}
        </div>
      )}

      {/* Failed Files */}
      {result.failed_files && result.failed_files.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-red-900">
            ❌ Failed Files ({result.failed_files.length})
          </h4>

          <div className="space-y-2">
            {result.failed_files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-red-50 rounded-md border border-red-200"
              >
                <div className="flex items-center space-x-3">
                  <svg
                    className="w-5 h-5 text-red-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div>
                    <p className="font-medium text-red-900">
                      {file.original_name}
                    </p>
                    <p className="text-sm text-red-600">
                      Failed to convert to {file.format.toUpperCase()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary Statistics */}
      <div className="pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="text-center">
            <div className="font-semibold text-green-600">
              {result.converted_files?.length || 0}
            </div>
            <div className="text-gray-600">Converted</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-red-600">
              {result.failed_files?.length || 0}
            </div>
            <div className="text-gray-600">Failed</div>
          </div>
        </div>
      </div>
    </div>
  );
};
