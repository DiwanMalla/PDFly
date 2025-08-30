// API Connection Test Component
// Tests pdf2docx-wasm converter availability and displays status

"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface ConnectionStatus {
  available: boolean;
  service: string;
  info?: {
    name: string;
    version: string;
    capabilities: string[];
  };
  timestamp: string;
  error?: string;
}

export default function APIConnectionTest() {
  const [isTesting, setIsTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus | null>(null);

  const testConnection = async () => {
    setIsTesting(true);
    setConnectionStatus(null);

    try {
      const response = await fetch(
        "/api/pdf/convert-professional?action=test-connection"
      );

      if (response.ok) {
        const data = await response.json();
        setConnectionStatus(data);
      } else {
        setConnectionStatus({
          available: false,
          service: "pdf2docx-wasm",
          timestamp: new Date().toISOString(),
          error: "API connection failed",
        });
      }
    } catch (error) {
      setConnectionStatus({
        available: false,
        service: "pdf2docx-wasm",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-xl p-4 border border-gray-200 max-w-sm"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900 flex items-center">
            <span className="mr-2">🔌</span>
            API Status
          </h3>
          <motion.button
            onClick={testConnection}
            disabled={isTesting}
            className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 disabled:opacity-50"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isTesting ? "Testing..." : "Test"}
          </motion.button>
        </div>

        {connectionStatus && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-3 rounded-xl ${
              connectionStatus.available
                ? "bg-green-50 border border-green-200"
                : "bg-red-50 border border-red-200"
            }`}
          >
            <div className="flex items-center space-x-2">
              <span className="text-lg">
                {connectionStatus.available ? "✅" : "❌"}
              </span>
              <div>
                <div
                  className={`font-semibold ${
                    connectionStatus.available
                      ? "text-green-800"
                      : "text-red-800"
                  }`}
                >
                  {connectionStatus.available ? "Available" : "Unavailable"}
                </div>
                <div className="text-sm text-gray-600">
                  {connectionStatus.service}
                </div>
                {connectionStatus.error && (
                  <div className="text-xs text-red-600 mt-1">
                    {connectionStatus.error}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {isTesting && (
          <motion.div
            className="flex items-center space-x-2 text-blue-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <span className="text-sm font-medium">Testing connection...</span>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
