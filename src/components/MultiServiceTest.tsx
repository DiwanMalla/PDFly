// Multi-Service API Connection Test Component
// Tests multiple PDF conversion services and displays their status

"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface ServiceStatus {
  available: boolean;
  service: string;
  endpoint: string;
  info?: {
    name?: string;
    version?: string;
    capabilities?: string[];
    status?: string;
  };
  timestamp: string;
  error?: string;
  responseTime?: number;
}

interface TestResults {
  [serviceName: string]: ServiceStatus;
}

const services = [
  {
    id: "pdf2docx-wasm",
    name: "PDF2DOCX WebAssembly",
    endpoint: "/api/pdf/convert-professional?action=test-connection",
    icon: "🏆",
    description: "High-quality local conversion",
  },
  {
    id: "external-api",
    name: "External API (Modal)",
    endpoint: "/api/pdf/convert-external",
    icon: "🌐",
    description: "Cloud-based conversion service",
  },
  {
    id: "advanced-js",
    name: "Enhanced JavaScript",
    endpoint: "/api/pdf/convert-advanced?action=test-connection",
    icon: "🚀",
    description: "Advanced PDF→HTML→DOCX pipeline",
  },
];

export default function MultiServiceTest() {
  const [isTesting, setIsTesting] = useState(false);
  const [testResults, setTestResults] = useState<TestResults>({});
  const [isExpanded, setIsExpanded] = useState(false);

  const testAllServices = async () => {
    setIsTesting(true);
    setTestResults({});

    const results: TestResults = {};

    for (const service of services) {
      const startTime = Date.now();

      try {
        const response = await fetch(service.endpoint, {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        });

        const responseTime = Date.now() - startTime;

        if (response.ok) {
          const data = await response.json();
          results[service.id] = {
            available: data.success || data.available || false,
            service: service.name,
            endpoint: service.endpoint,
            info: data.info || {},
            timestamp: new Date().toISOString(),
            responseTime,
          };
        } else {
          results[service.id] = {
            available: false,
            service: service.name,
            endpoint: service.endpoint,
            timestamp: new Date().toISOString(),
            responseTime,
            error: `HTTP ${response.status}: ${response.statusText}`,
          };
        }
      } catch (error) {
        const responseTime = Date.now() - startTime;
        results[service.id] = {
          available: false,
          service: service.name,
          endpoint: service.endpoint,
          timestamp: new Date().toISOString(),
          responseTime,
          error: error instanceof Error ? error.message : "Connection failed",
        };
      }

      // Update results incrementally
      setTestResults({ ...results });
    }

    setIsTesting(false);
  };

  const getStatusColor = (status: ServiceStatus | undefined) => {
    if (!status) return "bg-gray-100";
    return status.available
      ? "bg-green-100 border-green-300"
      : "bg-red-100 border-red-300";
  };

  const getStatusIcon = (status: ServiceStatus | undefined) => {
    if (!status) return "⏳";
    return status.available ? "✅" : "❌";
  };

  const availableServices = Object.values(testResults).filter(
    (s) => s.available
  ).length;
  const totalTested = Object.keys(testResults).length;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden"
      >
        {/* Collapsed Header */}
        <div
          className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <motion.div
                className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center"
                animate={isTesting ? { rotate: 360 } : {}}
                transition={{ duration: 2, repeat: isTesting ? Infinity : 0 }}
              >
                <span className="text-white text-lg">
                  {isTesting ? "🔄" : "🔧"}
                </span>
              </motion.div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">
                  Conversion Services
                </h3>
                <p className="text-xs text-gray-500">
                  {totalTested > 0
                    ? `${availableServices}/${totalTested} available`
                    : "Click to test"}
                </p>
              </div>
            </div>
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              className="text-gray-400"
            >
              ▲
            </motion.div>
          </div>
        </div>

        {/* Expanded Content */}
        <motion.div
          initial={false}
          animate={{
            height: isExpanded ? "auto" : 0,
            opacity: isExpanded ? 1 : 0,
          }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <div className="p-4 border-t border-gray-100 space-y-4">
            {/* Test Button */}
            <motion.button
              onClick={testAllServices}
              disabled={isTesting}
              className={`w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200 ${
                isTesting
                  ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg hover:scale-105"
              }`}
              whileHover={!isTesting ? { scale: 1.02 } : {}}
              whileTap={!isTesting ? { scale: 0.98 } : {}}
            >
              {isTesting ? "Testing Services..." : "Test All Services"}
            </motion.button>

            {/* Service Status List */}
            <div className="space-y-2">
              {services.map((service) => {
                const status = testResults[service.id];
                return (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-3 rounded-xl border transition-all duration-200 ${getStatusColor(
                      status
                    )}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">{service.icon}</span>
                        <div>
                          <div className="font-medium text-sm text-gray-900">
                            {service.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {service.description}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg">{getStatusIcon(status)}</div>
                        {status?.responseTime && (
                          <div className="text-xs text-gray-500">
                            {status.responseTime}ms
                          </div>
                        )}
                      </div>
                    </div>

                    {status?.error && (
                      <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded">
                        {status.error}
                      </div>
                    )}

                    {status?.info && Object.keys(status.info).length > 0 && (
                      <div className="mt-2 text-xs text-gray-600">
                        <div className="font-medium">Service Info:</div>
                        {status.info.name && (
                          <div>Name: {status.info.name}</div>
                        )}
                        {status.info.version && (
                          <div>Version: {status.info.version}</div>
                        )}
                        {status.info.status && (
                          <div>Status: {status.info.status}</div>
                        )}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Summary */}
            {totalTested > 0 && (
              <div className="mt-4 p-3 bg-gray-50 rounded-xl">
                <div className="text-sm text-gray-700">
                  <div className="font-medium mb-1">Test Summary:</div>
                  <div className="text-xs space-y-1">
                    <div>✅ Available: {availableServices}</div>
                    <div>❌ Unavailable: {totalTested - availableServices}</div>
                    <div>🔧 Total Services: {totalTested}</div>
                    <div className="text-gray-500 mt-2">
                      Last tested: {new Date().toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
