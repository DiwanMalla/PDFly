"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navigation from "@/components/Navigation";
import { usePdfConverterSync } from "@/hooks/usePdfConverterSync";
import { ConversionProgressSync } from "@/components/ConversionProgressSync";
import type { ConversionFormat } from "@/types/pdf-converter";

const ConvertPage: React.FC = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [convertTo, setConvertTo] = useState<ConversionFormat | "">("");

  // Use the synchronous PDF converter hook
  const {
    isConverting,
    result,
    error,
    convertFiles,
    downloadFile,
    downloadAllAsZip,
    resetState,
    isCompleted,
  } = usePdfConverterSync();

  useEffect(() => {
    const storedFileBlob = sessionStorage.getItem("initialFileBlob");
    const storedFileData = sessionStorage.getItem("initialFile");

    if (storedFileBlob && storedFileData) {
      try {
        const fileData = JSON.parse(storedFileData);

        // Check if we have base64 data
        if (storedFileBlob.startsWith("data:")) {
          // Convert base64 to blob
          fetch(storedFileBlob)
            .then((res) => res.blob())
            .then((blob) => {
              const file = new File([blob], fileData.name, {
                type: "application/pdf",
              });

              // Create a new blob URL for preview
              const newPreviewUrl = URL.createObjectURL(file);

              setPreviewUrl(newPreviewUrl);
              setUploadedFile(file);
            })
            .catch((error) => {
              console.error("Error converting base64 to blob:", error);
              // Clear corrupted data
              sessionStorage.removeItem("initialFile");
              sessionStorage.removeItem("initialFileBlob");
            });
        } else {
          // Legacy handling - assume it's already a blob URL
          setPreviewUrl(storedFileBlob);
          const file = new File([], fileData.name, { type: "application/pdf" });
          setUploadedFile(file);
        }

        // Clean up sessionStorage after loading
        setTimeout(() => {
          sessionStorage.removeItem("initialFile");
          sessionStorage.removeItem("initialFileBlob");
        }, 1000);
      } catch (error) {
        console.error("Error parsing stored file data:", error);
        // Clear corrupted data
        sessionStorage.removeItem("initialFile");
        sessionStorage.removeItem("initialFileBlob");
      }
    }
  }, []);

  const handleConvert = async () => {
    if (!uploadedFile || !convertTo) return;

    // Extra safety check for DOCX only
    if (convertTo !== "docx") {
      alert(
        "Only DOCX conversion is currently available. Other formats are coming soon!"
      );
      return;
    }

    try {
      // Reset any previous state
      resetState();

      // Convert the format to the expected API format
      const apiFormat = convertTo as ConversionFormat;

      // Start conversion using Modal API
      await convertFiles([uploadedFile], apiFormat);
    } catch (error) {
      console.error("Conversion error:", error);
      // Error is already handled by the hook
    }
  };

  const formatOptions = [
    {
      id: "docx" as const,
      name: "Word Document",
      desc: "Convert to DOCX format",
      icon: "📄",
      available: true,
    },
    {
      id: "excel" as const,
      name: "Excel Spreadsheet",
      desc: "Coming soon - Convert to XLSX format",
      icon: "📊",
      available: false,
    },
    {
      id: "pptx" as const,
      name: "PowerPoint",
      desc: "Coming soon - Convert to PPTX format",
      icon: "📈",
      available: false,
    },
    {
      id: "image" as const,
      name: "Images",
      desc: "Coming soon - Extract as JPG files",
      icon: "🖼️",
      available: false,
    },
    {
      id: "text" as const,
      name: "Text File",
      desc: "Coming soon - Extract text to TXT",
      icon: "📝",
      available: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div
            className="inline-flex items-center space-x-3 mb-6"
            whileHover={{ scale: 1.05 }}
          >
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg neon-blue">
              <span className="text-3xl">🔄</span>
            </div>
            <div className="text-left">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Convert PDF
              </h1>
              <p className="text-lg text-gray-600 font-medium">
                Transform your PDF to any format you need
              </p>
            </div>
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column - Upload & Settings */}
          <div className="xl:col-span-1 space-y-6">
            {/* File Upload Section */}
            {!uploadedFile ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card rounded-3xl p-8 text-center border-2 border-dashed border-blue-300/50 hover:border-blue-400/70 transition-all duration-300"
              >
                <motion.div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center floating">
                  <span className="text-4xl">📄</span>
                </motion.div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Upload Your PDF
                </h3>
                <p className="text-gray-600 mb-6">
                  Drag and drop your PDF file here or click to browse
                </p>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setUploadedFile(file);
                      const url = URL.createObjectURL(file);
                      setPreviewUrl(url);
                    }
                  }}
                  className="hidden"
                  id="pdf-upload"
                />
                <label
                  htmlFor="pdf-upload"
                  className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-300 btn-futuristic"
                >
                  Choose PDF File
                </label>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-3xl p-6 border border-green-200/50 shadow-lg"
              >
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">✅</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">File Ready</h3>
                    <p className="text-sm text-gray-600 truncate">
                      {uploadedFile.name}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setUploadedFile(null);
                    setPreviewUrl("");
                    setConvertTo("");
                    resetState();
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Choose Different File
                </button>
              </motion.div>
            )}

            {/* Format Selection */}
            {uploadedFile && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-3xl p-6 shadow-lg"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <span className="mr-3">🎯</span>
                  Select Output Format
                </h2>

                <div className="grid grid-cols-1 gap-3">
                  {formatOptions.map((option) => (
                    <motion.label
                      key={option.id}
                      whileHover={{ scale: option.available ? 1.02 : 1 }}
                      whileTap={{ scale: option.available ? 0.98 : 1 }}
                      className={`flex items-center space-x-4 p-4 rounded-2xl transition-all duration-200 border-2 ${
                        !option.available
                          ? "bg-gray-50 border-gray-200 cursor-not-allowed opacity-60"
                          : convertTo === option.id
                          ? "bg-gradient-to-r from-blue-50 to-purple-50 border-blue-400 shadow-md cursor-pointer"
                          : "bg-white/50 border-gray-200 hover:border-blue-300 hover:bg-white/80 cursor-pointer"
                      }`}
                    >
                      <input
                        type="radio"
                        name="format"
                        value={option.id}
                        checked={convertTo === option.id}
                        disabled={!option.available}
                        onChange={(e) => {
                          const selectedFormat = e.target.value;
                          if (selectedFormat !== "docx") {
                            alert(
                              "Coming soon! Only DOCX conversion is currently available. More formats will be added soon."
                            );
                            return;
                          }
                          setConvertTo(selectedFormat as ConversionFormat | "");
                        }}
                        className="w-5 h-5 text-blue-600 disabled:cursor-not-allowed"
                      />
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          option.available
                            ? "bg-gradient-to-br from-blue-100 to-purple-100"
                            : "bg-gray-200"
                        }`}
                      >
                        <span className="text-xl">{option.icon}</span>
                      </div>
                      <div className="flex-1">
                        <div
                          className={`font-semibold ${
                            option.available ? "text-gray-900" : "text-gray-500"
                          }`}
                        >
                          {option.name}
                          {!option.available && (
                            <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                              Coming Soon
                            </span>
                          )}
                        </div>
                        <div
                          className={`text-sm ${
                            option.available ? "text-gray-500" : "text-gray-400"
                          }`}
                        >
                          {option.desc}
                        </div>
                      </div>
                    </motion.label>
                  ))}
                </div>

                {/* Conversion Info */}
                {convertTo && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-sm">🚀</span>
                      </div>
                      <div>
                        <div className="font-semibold text-blue-900">
                          Modal API Conversion
                        </div>
                        <div className="text-sm text-blue-700">
                          Professional cloud-based conversion with perfect
                          layout preservation
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {!isConverting && !isCompleted && convertTo && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleConvert}
                    className="mt-6 w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-2xl font-bold text-lg hover:shadow-xl transition-all duration-300 btn-futuristic neon-blue"
                  >
                    <span className="flex items-center justify-center space-x-2">
                      <span>🚀</span>
                      <span>Start Conversion</span>
                    </span>
                  </motion.button>
                )}
              </motion.div>
            )}
          </div>

          {/* Middle Column - Preview */}
          <div className="xl:col-span-1">
            {previewUrl && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-3xl overflow-hidden shadow-lg sticky top-24"
              >
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4">
                  <h3 className="text-lg font-bold text-white flex items-center">
                    <span className="mr-2">👁️</span>
                    PDF Preview
                  </h3>
                </div>
                <div className="p-6">
                  <iframe
                    src={previewUrl}
                    className="w-full h-96 border-0 rounded-xl"
                    title="PDF Preview"
                  />
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Column - Processing & Results */}
          <div className="xl:col-span-1 space-y-6">
            {/* Converting Animation */}
            {isConverting && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-3xl shadow-lg"
              >
                <div className="bg-gradient-to-r from-orange-500 to-yellow-500 p-4">
                  <h3 className="text-lg font-bold text-white flex items-center">
                    <span className="mr-2">�</span>
                    Converting PDF
                  </h3>
                </div>
                <div className="p-6 text-center">
                  <motion.div
                    className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-orange-400 to-yellow-400 rounded-full flex items-center justify-center"
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    <span className="text-2xl">📤</span>
                  </motion.div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    Uploading your PDF...
                  </h4>
                  <p className="text-gray-600">
                    Please wait while we upload your file to our servers
                  </p>
                </div>
              </motion.div>
            )}

            {/* Show results when conversion is complete */}
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-3xl shadow-lg overflow-hidden"
              >
                <div className="bg-gradient-to-r from-green-600 to-blue-600 p-4">
                  <h3 className="text-lg font-bold text-white flex items-center">
                    <span className="mr-2">✅</span>
                    Conversion Results
                  </h3>
                </div>
                <div className="p-6">
                  <ConversionProgressSync
                    result={result}
                    onDownloadFile={(jobId, filename) =>
                      downloadFile(jobId, filename)
                    }
                    onDownloadZip={(jobId) => downloadAllAsZip(jobId)}
                    onReset={() => {
                      resetState();
                      setConvertTo("");
                    }}
                  />
                </div>
              </motion.div>
            )}

            {/* Show error state separately if there's an error but no result */}
            {error && !result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-3xl p-8 shadow-lg border border-red-200/50"
              >
                <div className="text-center mb-6">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-red-400 to-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-3xl">❌</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Conversion Failed
                  </h3>
                  <p className="text-gray-600 mb-4">
                    We encountered an issue while converting your file
                  </p>
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                </div>

                <motion.button
                  onClick={resetState}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-2xl font-bold text-lg hover:shadow-xl hover:scale-105 transition-all duration-300 btn-futuristic"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="flex items-center justify-center space-x-2">
                    <span>�</span>
                    <span>Try Again</span>
                  </span>
                </motion.button>
              </motion.div>
            )}

            {/* Instructions when no file is selected */}
            {!uploadedFile && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-3xl p-8 text-center shadow-lg"
              >
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">📋</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Get Started
                </h3>
                <p className="text-gray-600 mb-4">
                  Upload a PDF file and select your desired output format to
                  begin conversion.
                </p>
                <div className="space-y-2 text-sm text-gray-500">
                  <div className="flex items-center justify-center space-x-2">
                    <span>✓</span>
                    <span>Professional quality conversion</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <span>✓</span>
                    <span>Cloud-based processing</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <span>✓</span>
                    <span>Perfect layout preservation</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConvertPage;
