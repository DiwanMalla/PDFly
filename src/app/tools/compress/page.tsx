"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navigation from "@/components/Navigation";
import { ArrowLeft } from "@/components/ui/Icons";
import { PDFClientService } from "@/lib/pdf-client";

const CompressPage: React.FC = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [compressionLevel, setCompressionLevel] = useState("medium");
  const [originalSize, setOriginalSize] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [compressedResult, setCompressedResult] = useState<{
    size: string;
    savings: string;
    blob?: Blob;
  } | null>(null);
  const [hasSettingsChanged, setHasSettingsChanged] = useState(false);

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
              setOriginalSize(fileData.size);
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
          setOriginalSize(fileData.size);
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

  const handleCompress = async () => {
    if (!uploadedFile) return;

    setIsProcessing(true);
    setProgress(0);
    setHasSettingsChanged(false);

    try {
      setProgress(20);

      // Use the PDF client service for compression
      const result = await PDFClientService.compressPDF(
        uploadedFile,
        compressionLevel as "low" | "medium" | "high"
      );

      setProgress(80);

      setCompressedResult({
        size: PDFClientService.formatFileSize(result.compressedSize),
        savings: `${result.compressionRatio}%`,
        blob: result.blob,
      });

      setProgress(100);

      setTimeout(() => {
        setIsProcessing(false);
      }, 500);
    } catch (error) {
      console.error("Compression error:", error);
      setIsProcessing(false);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      alert(`Failed to compress PDF: ${errorMessage}`);
    }
  };

  // TODO: Later disable download without signin
  const handleDownload = () => {
    if (!compressedResult?.blob || !uploadedFile) return;

    const url = URL.createObjectURL(compressedResult.blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `compressed_${uploadedFile.name}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Reset when compression settings change
  const handleCompressionChange = (value: string) => {
    setCompressionLevel(value);
    if (compressedResult) {
      setHasSettingsChanged(true);
      // Don't clear result immediately, just mark as changed
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-6">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => window.history.back()}
              className="mr-6 p-3 rounded-2xl bg-white/80 backdrop-blur-sm border border-gray-200/50 hover:bg-white hover:shadow-lg transition-all duration-300"
            >
              <ArrowLeft className="w-6 h-6 text-gray-700" />
            </motion.button>
            <div className="text-left">
              <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-700 via-purple-600 to-indigo-700 bg-clip-text text-transparent mb-2">
                Compress PDF
              </h1>
              <p className="text-xl text-gray-600 font-medium">
                Reduce file size while maintaining perfect quality
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Column - Controls */}
          <div className="space-y-8">
            {/* File Upload Section */}
            {!uploadedFile && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative"
              >
                <div className="glass-card p-8 text-center border-2 border-dashed border-blue-300/50 hover:border-blue-400/70 transition-all duration-300">
                  <div className="floating-icon w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl">
                    <span className="text-4xl text-white">🗜️</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">
                    Upload Your PDF
                  </h3>
                  <p className="text-gray-600 mb-8 text-lg">
                    Drag and drop your PDF file here or click to browse
                  </p>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setUploadedFile(file);
                        setOriginalSize(
                          (file.size / (1024 * 1024)).toFixed(2) + " MB"
                        );
                        const url = URL.createObjectURL(file);
                        setPreviewUrl(url);
                      }
                    }}
                    className="hidden"
                    id="pdf-upload"
                  />
                  <label
                    htmlFor="pdf-upload"
                    className="neon-button inline-flex items-center space-x-3 cursor-pointer"
                  >
                    <span className="text-lg">📁</span>
                    <span>Choose PDF File</span>
                  </label>
                </div>
              </motion.div>
            )}

            {/* Compression Settings */}
            {uploadedFile && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-8"
              >
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                    <span className="mr-3 text-2xl">⚙️</span>
                    Compression Settings
                  </h2>
                  {hasSettingsChanged && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm rounded-full font-medium shadow-lg"
                    >
                      Settings changed
                    </motion.span>
                  )}
                </div>

                {/* File Info */}
                <div className="mb-8 p-5 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl border border-gray-200/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">📄</span>
                      <div>
                        <p className="font-semibold text-gray-800">
                          {uploadedFile.name}
                        </p>
                        <p className="text-sm text-gray-500">Original file</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-gray-800">
                        {originalSize}
                      </p>
                      <p className="text-xs text-gray-500">File size</p>
                    </div>
                  </div>
                </div>

                {/* Compression Options */}
                <div className="space-y-4 mb-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-6">
                    Choose Compression Level
                  </h3>

                  {[
                    {
                      value: "low",
                      name: "Low Compression",
                      desc: "Best quality, ~25% size reduction",
                      savings: "25%",
                      color: "emerald",
                    },
                    {
                      value: "medium",
                      name: "Medium Compression",
                      desc: "Balanced quality and size",
                      savings: "50%",
                      color: "blue",
                    },
                    {
                      value: "high",
                      name: "High Compression",
                      desc: "Smallest file, ~75% size reduction",
                      savings: "75%",
                      color: "purple",
                    },
                  ].map((option) => (
                    <motion.label
                      key={option.value}
                      whileHover={{ scale: 1.02 }}
                      className={`flex items-center space-x-4 p-5 rounded-2xl cursor-pointer transition-all duration-300 border-2 ${
                        compressionLevel === option.value
                          ? `border-${option.color}-400 bg-gradient-to-r from-${option.color}-50 to-${option.color}-100 shadow-lg`
                          : "border-gray-200 hover:border-gray-300 bg-white hover:shadow-md"
                      }`}
                    >
                      <input
                        type="radio"
                        name="compression"
                        value={option.value}
                        checked={compressionLevel === option.value}
                        onChange={(e) =>
                          handleCompressionChange(e.target.value)
                        }
                        className="w-5 h-5 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 text-lg">
                          {option.name}
                        </div>
                        <div className="text-gray-600">{option.desc}</div>
                      </div>
                      <div
                        className={`text-${option.color}-600 font-bold text-xl px-4 py-2 bg-${option.color}-100 rounded-xl`}
                      >
                        ~{option.savings}
                      </div>
                    </motion.label>
                  ))}
                </div>

                {/* Compress Button */}
                {!isProcessing && (!compressedResult || hasSettingsChanged) && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCompress}
                    className="neon-button w-full text-lg py-4"
                  >
                    <span className="text-xl mr-3">🚀</span>
                    {hasSettingsChanged ? "Compress Again" : "Compress PDF"}
                  </motion.button>
                )}
              </motion.div>
            )}

            {/* Processing State */}
            {isProcessing && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card p-8 text-center"
              >
                <div className="floating-icon w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="w-10 h-10 border-3 border-white border-t-transparent rounded-full"
                  />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">
                  Compressing Your PDF
                </h3>
                <p className="text-gray-600 mb-6 text-lg">
                  Please wait while we optimize your file...
                </p>

                <div className="w-full bg-gray-200 rounded-full h-4 mb-4 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-4 rounded-full transition-all duration-500 shadow-inner"
                  />
                </div>
                <p className="text-lg font-bold text-gray-700">
                  {progress}% Complete
                </p>
              </motion.div>
            )}

            {/* Results */}
            {compressedResult && !hasSettingsChanged && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-8 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50"
              >
                <div className="text-center mb-8">
                  <div className="floating-icon w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center">
                    <span className="text-3xl text-white">✅</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    Compression Complete!
                  </h3>
                  <p className="text-gray-600 text-lg">
                    Your PDF has been successfully optimized
                  </p>
                </div>

                {/* Stats */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 space-y-4 mb-8 border border-white/50">
                  <div className="flex justify-between items-center text-lg">
                    <span className="text-gray-600">Original size:</span>
                    <span className="font-bold text-gray-800">
                      {originalSize}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-lg">
                    <span className="text-gray-600">Compressed size:</span>
                    <span className="font-bold text-green-600">
                      {compressedResult.size}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between items-center text-xl">
                      <span className="text-gray-600">Space saved:</span>
                      <span className="font-bold text-green-600 text-2xl">
                        {compressedResult.savings}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Download Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDownload}
                  className="neon-button w-full text-lg py-4 mb-6 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  <span className="text-xl mr-3">📥</span>
                  Download Compressed PDF
                </motion.button>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    onClick={() => (window.location.href = "/tools/split")}
                    className="flex items-center justify-center space-x-2 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-white hover:shadow-md transition-all duration-300"
                  >
                    <span>✂️</span>
                    <span>Split PDF</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    onClick={() => (window.location.href = "/tools/merge")}
                    className="flex items-center justify-center space-x-2 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-white hover:shadow-md transition-all duration-300"
                  >
                    <span>➕</span>
                    <span>Merge PDF</span>
                  </motion.button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Column - Preview */}
          <div className="space-y-8">
            {previewUrl && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass-card overflow-hidden"
              >
                <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200/50">
                  <h3 className="text-xl font-bold text-gray-800 flex items-center">
                    <span className="mr-3 text-2xl">👁️</span>
                    PDF Preview
                  </h3>
                  <p className="text-gray-600 mt-1">
                    Live preview of your document
                  </p>
                </div>
                <div className="p-6">
                  <div className="rounded-2xl overflow-hidden border-2 border-gray-200/50 shadow-inner">
                    <iframe
                      src={previewUrl}
                      className="w-full h-[600px] bg-white"
                      title="PDF Preview"
                    />
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

export default CompressPage;
