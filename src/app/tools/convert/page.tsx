"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navigation from "@/components/Navigation";
import {
  usePythonPDFOperations,
  type APIResponse,
} from "@/hooks/usePythonPDFOperations";
import type { ConversionFormat } from "@/types/pdf-converter";

const ConvertPage: React.FC = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [convertTo, setConvertTo] = useState<ConversionFormat | "">("");

  // Excel-specific options
  const [useOCR, setUseOCR] = useState(false);
  const [singleSheet, setSingleSheet] = useState(false);

  // Images-specific options
  const [imageFormat, setImageFormat] = useState<
    "png" | "jpg" | "jpeg" | "webp" | "tiff"
  >("png");
  const [imageQuality, setImageQuality] = useState<
    "low" | "medium" | "high" | "ultra"
  >("high");
  const [imageDPI, setImageDPI] = useState<150 | 300 | 600 | 1200>(300);

  // Text-specific options
  const [includeFormatting, setIncludeFormatting] = useState(true);
  const [preserveLayout, setPreserveLayout] = useState(false);

  // Use the Python PDF operations hook
  const {
    isProcessing,
    progress,
    error,
    estimatedTimeRemaining,
    processingMessage,
    convertPDF,
    downloadFile,
    clearError,
  } = usePythonPDFOperations();

  // State for conversion results
  const [conversionResult, setConversionResult] = useState<APIResponse | null>(
    null
  );
  const [isCompleted, setIsCompleted] = useState(false);

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

    // Extra safety check for available formats
    if (
      convertTo !== "docx" &&
      convertTo !== "excel" &&
      convertTo !== "pptx" &&
      convertTo !== "image" &&
      convertTo !== "text"
    ) {
      alert(
        "Only DOCX, Excel, PowerPoint, Images, and Text conversion are currently available. Other formats are coming soon!"
      );
      return;
    }

    try {
      // Reset any previous state
      clearError();
      setConversionResult(null);
      setIsCompleted(false);

      // Convert the format - only support available formats
      let pythonFormat: "docx" | "excel" | "pptx" | "images" | "text";
      if (convertTo === "docx") {
        pythonFormat = "docx";
      } else if (convertTo === "excel") {
        pythonFormat = "excel";
      } else if (convertTo === "pptx") {
        pythonFormat = "pptx";
      } else if (convertTo === "image") {
        pythonFormat = "images";
      } else if (convertTo === "text") {
        pythonFormat = "text";
      } else {
        throw new Error("Unsupported format");
      }

      // Prepare options based on format
      let options = undefined;
      if (pythonFormat === "excel") {
        options = { use_ocr: useOCR, single_sheet: singleSheet };
      } else if (pythonFormat === "images") {
        options = {
          image_format: imageFormat,
          quality: imageQuality,
          dpi: imageDPI,
        };
      } else if (pythonFormat === "text") {
        options = {
          include_formatting: includeFormatting,
          preserve_layout: preserveLayout,
        };
      }

      // Show user-friendly message about concurrent processing
      console.log(
        "🚀 Starting conversion with concurrent processing - other users won't be affected!"
      );

      // Start conversion using Python Modal API
      const result = await convertPDF([uploadedFile], pythonFormat, options);

      if (result) {
        setConversionResult(result);
        setIsCompleted(true);
      }
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
      desc: "Advanced conversion with OCR & sheet options",
      icon: "📊",
      available: true,
    },
    {
      id: "pptx" as const,
      name: "PowerPoint",
      desc: "Convert to PPTX format",
      icon: "📈",
      available: true,
    },
    {
      id: "image" as const,
      name: "Images",
      desc: "Convert to high-quality image files (PNG, JPG, WEBP, TIFF)",
      icon: "🖼️",
      available: true,
    },
    {
      id: "text" as const,
      name: "Text File",
      desc: "Extract text content with formatting options",
      icon: "📝",
      available: true,
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
                    setUseOCR(false);
                    setSingleSheet(false);
                    clearError();
                    setConversionResult(null);
                    setIsCompleted(false);
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
                          setConvertTo(selectedFormat as ConversionFormat | "");
                          // Reset options when changing format
                          if (selectedFormat !== "excel") {
                            setUseOCR(false);
                            setSingleSheet(false);
                          }
                          if (selectedFormat !== "text") {
                            setIncludeFormatting(true);
                            setPreserveLayout(false);
                          }
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

                {/* Excel-specific options */}
                {convertTo === "excel" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-4 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200"
                  >
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                      <span className="mr-2">📊</span>
                      Excel Conversion Options
                    </h3>

                    {/* OCR Options */}
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-semibold text-gray-700 mb-3 block">
                          📝 Text Extraction Mode
                        </label>
                        <div className="space-y-3">
                          <motion.label
                            whileHover={{ scale: 1.02 }}
                            className={`flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 border-2 cursor-pointer ${
                              !useOCR
                                ? "bg-blue-50 border-blue-400 shadow-md"
                                : "bg-white/50 border-gray-200 hover:border-blue-300"
                            }`}
                          >
                            <input
                              type="radio"
                              name="ocr"
                              checked={!useOCR}
                              onChange={() => setUseOCR(false)}
                              className="w-4 h-4 text-blue-600"
                            />
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <span className="text-lg">📄</span>
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold text-gray-900">
                                Standard Mode
                              </div>
                              <div className="text-sm text-gray-600">
                                Extract selectable text and tables (recommended
                                for digital PDFs)
                              </div>
                            </div>
                          </motion.label>

                          <motion.label
                            whileHover={{ scale: 1.02 }}
                            className={`flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 border-2 cursor-pointer ${
                              useOCR
                                ? "bg-purple-50 border-purple-400 shadow-md"
                                : "bg-white/50 border-gray-200 hover:border-purple-300"
                            }`}
                          >
                            <input
                              type="radio"
                              name="ocr"
                              checked={useOCR}
                              onChange={() => setUseOCR(true)}
                              className="w-4 h-4 text-purple-600"
                            />
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                              <span className="text-lg">🔍</span>
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold text-gray-900">
                                OCR Premium
                                <span className="ml-2 text-xs bg-purple-200 text-purple-700 px-2 py-1 rounded-full">
                                  ADVANCED
                                </span>
                              </div>
                              <div className="text-sm text-gray-600">
                                Process scanned PDFs with OCR technology (for
                                image-based PDFs)
                              </div>
                            </div>
                          </motion.label>
                        </div>
                      </div>

                      {/* Sheet Layout Options */}
                      <div>
                        <label className="text-sm font-semibold text-gray-700 mb-3 block">
                          📋 Sheet Organization
                        </label>
                        <div className="space-y-3">
                          <motion.label
                            whileHover={{ scale: 1.02 }}
                            className={`flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 border-2 cursor-pointer ${
                              !singleSheet
                                ? "bg-green-50 border-green-400 shadow-md"
                                : "bg-white/50 border-gray-200 hover:border-green-300"
                            }`}
                          >
                            <input
                              type="radio"
                              name="sheet"
                              checked={!singleSheet}
                              onChange={() => setSingleSheet(false)}
                              className="w-4 h-4 text-green-600"
                            />
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                              <span className="text-lg">📑</span>
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold text-gray-900">
                                Multiple Sheets
                              </div>
                              <div className="text-sm text-gray-600">
                                Create separate sheets for each table/page
                                (organized)
                              </div>
                            </div>
                          </motion.label>

                          <motion.label
                            whileHover={{ scale: 1.02 }}
                            className={`flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 border-2 cursor-pointer ${
                              singleSheet
                                ? "bg-orange-50 border-orange-400 shadow-md"
                                : "bg-white/50 border-gray-200 hover:border-orange-300"
                            }`}
                          >
                            <input
                              type="radio"
                              name="sheet"
                              checked={singleSheet}
                              onChange={() => setSingleSheet(true)}
                              className="w-4 h-4 text-orange-600"
                            />
                            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                              <span className="text-lg">📄</span>
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold text-gray-900">
                                Single Sheet
                              </div>
                              <div className="text-sm text-gray-600">
                                Combine all data into one consolidated sheet
                              </div>
                            </div>
                          </motion.label>
                        </div>
                      </div>

                      {/* Feature Summary */}
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="text-sm text-gray-700">
                          <strong>Selected Configuration:</strong>
                          <div className="mt-1 space-y-1">
                            <div className="flex items-center space-x-2">
                              <span
                                className={
                                  useOCR ? "text-purple-600" : "text-blue-600"
                                }
                              >
                                {useOCR ? "🔍" : "📄"}
                              </span>
                              <span>
                                {useOCR ? "OCR Premium" : "Standard"} text
                                extraction
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span
                                className={
                                  singleSheet
                                    ? "text-orange-600"
                                    : "text-green-600"
                                }
                              >
                                {singleSheet ? "📄" : "📑"}
                              </span>
                              <span>
                                {singleSheet ? "Single" : "Multiple"} sheet
                                output
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Images-specific options */}
                {convertTo === "image" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-4 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200"
                  >
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                      <span className="mr-2">🖼️</span>
                      Image Conversion Options
                    </h3>

                    <div className="space-y-4">
                      {/* Image Format Options */}
                      <div>
                        <label className="text-sm font-semibold text-gray-700 mb-3 block">
                          🎨 Image Format
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            {
                              value: "png" as const,
                              label: "PNG",
                              desc: "High quality, lossless",
                            },
                            {
                              value: "jpg" as const,
                              label: "JPG",
                              desc: "Smaller size, good quality",
                            },
                            {
                              value: "webp" as const,
                              label: "WebP",
                              desc: "Modern, efficient",
                            },
                            {
                              value: "tiff" as const,
                              label: "TIFF",
                              desc: "Professional archival",
                            },
                          ].map((format) => (
                            <motion.label
                              key={format.value}
                              whileHover={{ scale: 1.02 }}
                              className={`flex items-center space-x-2 p-3 rounded-lg transition-all duration-200 border-2 cursor-pointer ${
                                imageFormat === format.value
                                  ? "bg-purple-50 border-purple-400 shadow-md"
                                  : "bg-white/50 border-gray-200 hover:border-purple-300"
                              }`}
                            >
                              <input
                                type="radio"
                                name="imageFormat"
                                value={format.value}
                                checked={imageFormat === format.value}
                                onChange={(e) =>
                                  setImageFormat(
                                    e.target.value as typeof imageFormat
                                  )
                                }
                                className="w-4 h-4 text-purple-600"
                              />
                              <div className="flex-1">
                                <div className="font-semibold text-sm text-gray-900">
                                  {format.label}
                                </div>
                                <div className="text-xs text-gray-600">
                                  {format.desc}
                                </div>
                              </div>
                            </motion.label>
                          ))}
                        </div>
                      </div>

                      {/* Quality Options */}
                      <div>
                        <label className="text-sm font-semibold text-gray-700 mb-3 block">
                          ⭐ Image Quality
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            {
                              value: "low" as const,
                              label: "Low",
                              desc: "Small file size",
                              icon: "💾",
                            },
                            {
                              value: "medium" as const,
                              label: "Medium",
                              desc: "Balanced quality",
                              icon: "⚖️",
                            },
                            {
                              value: "high" as const,
                              label: "High",
                              desc: "Great quality",
                              icon: "⭐",
                            },
                            {
                              value: "ultra" as const,
                              label: "Ultra",
                              desc: "Maximum quality",
                              icon: "🚀",
                            },
                          ].map((quality) => (
                            <motion.label
                              key={quality.value}
                              whileHover={{ scale: 1.02 }}
                              className={`flex items-center space-x-2 p-3 rounded-lg transition-all duration-200 border-2 cursor-pointer ${
                                imageQuality === quality.value
                                  ? "bg-purple-50 border-purple-400 shadow-md"
                                  : "bg-white/50 border-gray-200 hover:border-purple-300"
                              }`}
                            >
                              <input
                                type="radio"
                                name="imageQuality"
                                value={quality.value}
                                checked={imageQuality === quality.value}
                                onChange={(e) =>
                                  setImageQuality(
                                    e.target.value as typeof imageQuality
                                  )
                                }
                                className="w-4 h-4 text-purple-600"
                              />
                              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                <span className="text-sm">{quality.icon}</span>
                              </div>
                              <div className="flex-1">
                                <div className="font-semibold text-sm text-gray-900">
                                  {quality.label}
                                </div>
                                <div className="text-xs text-gray-600">
                                  {quality.desc}
                                </div>
                              </div>
                            </motion.label>
                          ))}
                        </div>
                      </div>

                      {/* DPI Options */}
                      <div>
                        <label className="text-sm font-semibold text-gray-700 mb-3 block">
                          🔍 Resolution (DPI)
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            {
                              value: 150 as const,
                              label: "150 DPI",
                              desc: "Screen viewing",
                            },
                            {
                              value: 300 as const,
                              label: "300 DPI",
                              desc: "Standard print",
                            },
                            {
                              value: 600 as const,
                              label: "600 DPI",
                              desc: "High quality print",
                            },
                            {
                              value: 1200 as const,
                              label: "1200 DPI",
                              desc: "Professional",
                            },
                          ].map((dpi) => (
                            <motion.label
                              key={dpi.value}
                              whileHover={{ scale: 1.02 }}
                              className={`flex items-center space-x-2 p-3 rounded-lg transition-all duration-200 border-2 cursor-pointer ${
                                imageDPI === dpi.value
                                  ? "bg-purple-50 border-purple-400 shadow-md"
                                  : "bg-white/50 border-gray-200 hover:border-purple-300"
                              }`}
                            >
                              <input
                                type="radio"
                                name="imageDPI"
                                value={dpi.value}
                                checked={imageDPI === dpi.value}
                                onChange={(e) =>
                                  setImageDPI(
                                    Number(e.target.value) as typeof imageDPI
                                  )
                                }
                                className="w-4 h-4 text-purple-600"
                              />
                              <div className="flex-1">
                                <div className="font-semibold text-sm text-gray-900">
                                  {dpi.label}
                                </div>
                                <div className="text-xs text-gray-600">
                                  {dpi.desc}
                                </div>
                              </div>
                            </motion.label>
                          ))}
                        </div>
                      </div>

                      {/* Feature Summary */}
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="text-sm text-gray-700">
                          <strong>Selected Configuration:</strong>
                          <div className="mt-1 space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="text-purple-600">🖼️</span>
                              <span>{imageFormat.toUpperCase()} format</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-purple-600">⭐</span>
                              <span>{imageQuality} quality</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-purple-600">🔍</span>
                              <span>{imageDPI} DPI resolution</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Text-specific options */}
                {convertTo === "text" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-4 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200"
                  >
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                      <span className="mr-2">📝</span>
                      Text Extraction Options
                    </h3>

                    <div className="space-y-4">
                      {/* Formatting Options */}
                      <div>
                        <label className="text-sm font-semibold text-gray-700 mb-3 block">
                          📐 Text Formatting
                        </label>
                        <div className="space-y-3">
                          <motion.label
                            whileHover={{ scale: 1.02 }}
                            className={`flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 border-2 cursor-pointer ${
                              includeFormatting
                                ? "bg-green-50 border-green-400 shadow-md"
                                : "bg-white/50 border-gray-200 hover:border-green-300"
                            }`}
                          >
                            <input
                              type="radio"
                              name="formatting"
                              checked={includeFormatting}
                              onChange={() => setIncludeFormatting(true)}
                              className="w-4 h-4 text-green-600"
                            />
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                              <span className="text-lg">📄</span>
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold text-gray-900">
                                Formatted Text
                              </div>
                              <div className="text-sm text-gray-600">
                                Preserve line breaks, paragraphs, and basic
                                structure
                              </div>
                            </div>
                          </motion.label>

                          <motion.label
                            whileHover={{ scale: 1.02 }}
                            className={`flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 border-2 cursor-pointer ${
                              !includeFormatting
                                ? "bg-blue-50 border-blue-400 shadow-md"
                                : "bg-white/50 border-gray-200 hover:border-blue-300"
                            }`}
                          >
                            <input
                              type="radio"
                              name="formatting"
                              checked={!includeFormatting}
                              onChange={() => setIncludeFormatting(false)}
                              className="w-4 h-4 text-blue-600"
                            />
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <span className="text-lg">📃</span>
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold text-gray-900">
                                Plain Text
                              </div>
                              <div className="text-sm text-gray-600">
                                Simple text output without formatting
                              </div>
                            </div>
                          </motion.label>
                        </div>
                      </div>

                      {/* Layout Preservation Option */}
                      <div>
                        <label className="text-sm font-semibold text-gray-700 mb-3 block">
                          🎯 Advanced Options
                        </label>
                        <motion.label
                          whileHover={{ scale: 1.02 }}
                          className={`flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 border-2 cursor-pointer ${
                            preserveLayout
                              ? "bg-purple-50 border-purple-400 shadow-md"
                              : "bg-white/50 border-gray-200 hover:border-purple-300"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={preserveLayout}
                            onChange={(e) =>
                              setPreserveLayout(e.target.checked)
                            }
                            className="w-4 h-4 text-purple-600"
                          />
                          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <span className="text-lg">🏗️</span>
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900">
                              Preserve Layout
                            </div>
                            <div className="text-sm text-gray-600">
                              Try to maintain spatial positioning (experimental)
                            </div>
                          </div>
                        </motion.label>
                      </div>

                      {/* Feature Summary */}
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="text-sm text-gray-700">
                          <strong>Selected Configuration:</strong>
                          <div className="mt-1 space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="text-green-600">📝</span>
                              <span>
                                {includeFormatting ? "Formatted" : "Plain"} text
                                output
                              </span>
                            </div>
                            {preserveLayout && (
                              <div className="flex items-center space-x-2">
                                <span className="text-purple-600">🏗️</span>
                                <span>Layout preservation enabled</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {!isProcessing && !isCompleted && convertTo && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleConvert}
                    className="mt-6 w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-2xl font-bold text-lg hover:shadow-xl transition-all duration-300 btn-futuristic neon-blue"
                  >
                    <span className="flex items-center justify-center space-x-2">
                      <span>🚀</span>
                      <span>
                        {convertTo === "excel" && useOCR
                          ? "Start OCR Premium Conversion"
                          : convertTo === "excel" && singleSheet
                          ? "Start Single Sheet Conversion"
                          : convertTo === "image"
                          ? `Convert to ${imageFormat.toUpperCase()} Images`
                          : convertTo === "text"
                          ? `Extract ${
                              includeFormatting ? "Formatted" : "Plain"
                            } Text`
                          : "Start Conversion"}
                      </span>
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
            {isProcessing && (
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
                    {progress < 25
                      ? convertTo === "image"
                        ? "Analyzing your PDF..."
                        : convertTo === "text"
                        ? "Reading your document..."
                        : "Starting conversion..."
                      : progress < 50
                      ? convertTo === "image"
                        ? "Processing pages..."
                        : convertTo === "text"
                        ? "Extracting text content..."
                        : "Converting content..."
                      : progress < 75
                      ? convertTo === "image"
                        ? "Creating high-quality images..."
                        : convertTo === "text"
                        ? "Applying formatting..."
                        : "Finalizing conversion..."
                      : convertTo === "image"
                      ? "Almost ready! 📸"
                      : convertTo === "text"
                      ? "Almost done! 📝"
                      : "Almost done! ✨"}
                  </h4>
                  <p className="text-gray-600 mb-3">
                    {uploadedFile && uploadedFile.size ? (
                      uploadedFile.size > 10 * 1024 * 1024 ? (
                        <>
                          <span className="text-blue-600 font-medium">
                            Large file detected!
                          </span>
                          <br />
                          {convertTo === "image"
                            ? "☕ Perfect time for a coffee break while we create beautiful images"
                            : convertTo === "text"
                            ? "📚 Processing large document, extracting comprehensive text..."
                            : "⏰ This may take a few extra moments for the best quality"}
                        </>
                      ) : uploadedFile.size > 5 * 1024 * 1024 ? (
                        <>
                          <span className="text-green-600 font-medium">
                            Medium size file
                          </span>
                          <br />
                          {convertTo === "image"
                            ? "🎯 Processing smoothly, creating crisp images..."
                            : convertTo === "text"
                            ? "📖 Extracting text smoothly, preserving structure..."
                            : "🔄 Converting at optimal speed..."}
                        </>
                      ) : (
                        <>
                          <span className="text-purple-600 font-medium">
                            Small file - lightning fast! ⚡
                          </span>
                          <br />
                          {convertTo === "image"
                            ? "💫 Your images will be ready in seconds!"
                            : convertTo === "text"
                            ? "⚡ Text extraction will be lightning fast!"
                            : "🚀 Almost finished already!"}
                        </>
                      )
                    ) : convertTo === "image" ? (
                      "Please wait while we create your images..."
                    ) : convertTo === "text" ? (
                      "Please wait while we extract your text..."
                    ) : (
                      "Please wait while we process your file..."
                    )}
                  </p>

                  {/* Estimated time remaining */}
                  {estimatedTimeRemaining && (
                    <div className="text-sm text-blue-600 bg-blue-50 rounded-lg p-3 border border-blue-200 mb-4">
                      <div className="flex items-center justify-center mb-1">
                        <span className="mr-2">⏱️</span>
                        <span className="font-medium">
                          Estimated time remaining
                        </span>
                      </div>
                      <p className="text-blue-700 font-bold text-lg">
                        {estimatedTimeRemaining}
                      </p>
                    </div>
                  )}

                  {/* Processing message from backend */}
                  {processingMessage && (
                    <div className="text-sm text-green-600 bg-green-50 rounded-lg p-3 border border-green-200 mb-4">
                      <div className="flex items-center justify-center">
                        <span className="mr-2">📊</span>
                        <span className="font-medium">{processingMessage}</span>
                      </div>
                    </div>
                  )}

                  {/* Concurrent Processing Info */}
                  <div className="text-sm text-blue-600 bg-blue-50 rounded-lg p-3 border border-blue-200 mb-4">
                    <div className="flex items-center justify-center mb-1">
                      <span className="mr-2">⚡</span>
                      <span className="font-medium">
                        Concurrent Processing Active
                      </span>
                    </div>
                    <p className="text-blue-700">
                      Multiple files processed simultaneously - no waiting in
                      queue!
                    </p>
                  </div>

                  {/* Enhanced Progress bar */}
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5 }}
                      className="bg-gradient-to-r from-orange-500 to-yellow-500 h-3 rounded-full relative overflow-hidden"
                    >
                      {/* Animated shimmer effect */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                        animate={{ x: ["-100%", "100%"] }}
                        transition={{
                          repeat: Infinity,
                          duration: 1.5,
                          ease: "linear",
                        }}
                      />
                    </motion.div>
                  </div>

                  {/* Progress percentage with fun emoji */}
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-700 mb-3">
                    <span>{Math.round(progress)}%</span>
                    <span>
                      {progress < 25
                        ? "🟡"
                        : progress < 50
                        ? "🟠"
                        : progress < 75
                        ? "🔴"
                        : progress < 95
                        ? "🟢"
                        : "🎉"}
                    </span>
                  </div>

                  {/* Fun tip based on conversion type */}
                  <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-2">
                    💡 <strong>Tip:</strong>{" "}
                    {convertTo === "image"
                      ? "Higher DPI settings create larger, more detailed images!"
                      : convertTo === "excel"
                      ? "OCR Premium works great for scanned documents!"
                      : convertTo === "pptx"
                      ? "Perfect for presentations and visual layouts!"
                      : convertTo === "text"
                      ? "Formatted text preserves structure, plain text is cleaner!"
                      : "Our AI ensures the best possible conversion quality!"}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Show results when conversion is complete */}
            {conversionResult && (
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
                  <div className="text-center mb-6">
                    <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-3xl text-white">✅</span>
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">
                      Conversion Complete!
                    </h4>
                    <p className="text-gray-600">
                      Your PDF has been successfully converted
                    </p>
                  </div>

                  {/* Download buttons for converted files */}
                  {conversionResult.converted_files.map(
                    (
                      file: {
                        converted_name: string;
                        format: string;
                        size_mb: number;
                      },
                      index: number
                    ) => (
                      <motion.div
                        key={index}
                        className="mb-4 p-4 bg-white/50 rounded-xl border border-gray-200"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-gray-900">
                              {file.converted_name}
                            </p>
                            <p className="text-sm text-gray-600">
                              {file.format.toUpperCase()} •{" "}
                              {file.size_mb.toFixed(2)} MB
                            </p>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() =>
                              downloadFile(
                                conversionResult.job_id,
                                file.converted_name
                              )
                            }
                            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
                          >
                            Download
                          </motion.button>
                        </div>
                      </motion.div>
                    )
                  )}

                  <motion.button
                    onClick={() => {
                      clearError();
                      setConversionResult(null);
                      setIsCompleted(false);
                      setConvertTo("");
                      setUseOCR(false);
                      setSingleSheet(false);
                    }}
                    className="mt-4 w-full bg-gray-600 text-white py-3 rounded-xl font-semibold hover:bg-gray-700 transition-all duration-300"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Convert Another File
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Show error state separately if there's an error but no result */}
            {error && !conversionResult && (
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
                  onClick={() => {
                    clearError();
                    setConversionResult(null);
                    setIsCompleted(false);
                    setConvertTo("");
                    setUseOCR(false);
                    setSingleSheet(false);
                  }}
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
