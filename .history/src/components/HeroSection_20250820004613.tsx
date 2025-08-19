"use client";

import React, { useRef, useState } from "react";
import Button from "@/components/ui/Button";
import { Play, CheckCircle, Sparkles, ArrowRight } from "@/components/ui/Icons";
import { motion } from "framer-motion";

const HeroSection: React.FC = () => {
  const trustedCompanies = [
    "Google",
    "Microsoft",
    "Apple",
    "Amazon",
    "Meta",
    "Tesla",
  ];

  const stats = [
    { number: "2M+", label: "Documents Processed" },
    { number: "50K+", label: "Active Users" },
    { number: "99.9%", label: "Uptime" },
    { number: "4.9/5", label: "User Rating" },
  ];

  const processorRef = useRef<HTMLDivElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showError, setShowError] = useState(false);

  const handleStartProcessing = () => {
    setTimeout(() => {
      processorRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === "application/pdf") {
        setSelectedFile(file);
        setShowError(false);
      } else {
        setShowError(true);
        setTimeout(() => setShowError(false), 3000);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type === "application/pdf") {
        setSelectedFile(file);
        setShowError(false);
      } else {
        setShowError(true);
        setTimeout(() => setShowError(false), 3000);
      }
    }
  };

  const handleBrowseClick = () => {
    document.getElementById("pdf-upload-input")?.click();
  };

  // TODO: Integrate Cloudflare R2 for PDF storage and retrieval

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedFile, setProcessedFile] = useState<{
    key: string;
    action: string;
  } | null>(null);

  const handleProcessClick = async (action: string) => {
    if (!selectedFile) {
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      return;
    }

    // If action is merge, redirect to merge page with file data
    if (action.toLowerCase() === 'merge') {
      // Store file data for the merge page
      const fileData = {
        id: Date.now().toString(),
        name: selectedFile.name,
        size: (selectedFile.size / 1024 / 1024).toFixed(2) + ' MB',
        type: selectedFile.type,
        lastModified: selectedFile.lastModified
      };
      
      // Store in sessionStorage for the merge page to access
      sessionStorage.setItem('initialFile', JSON.stringify(fileData));
      sessionStorage.setItem('initialFileBlob', URL.createObjectURL(selectedFile));
      
      // Redirect to merge page
      window.location.href = '/tools/merge';
      return;
    }

    setIsProcessing(true);

    try {
      // For other actions, show preview only (no download for unregistered)
      if (!previewUrl) {
        const url = URL.createObjectURL(selectedFile);
        setPreviewUrl(url);
      }

      // TODO: Upload to Cloudflare R2 and process PDF
      // const { previewUrl: processedUrl, downloadKey } = await processPDF(selectedFile, action as any);

      // Simulate processing
      setTimeout(() => {
        setProcessedFile({ key: `processed-${Date.now()}`, action });
        setIsProcessing(false);
      }, 2000);
    } catch (error) {
      console.error("Error processing PDF:", error);
      setIsProcessing(false);
    }
  };
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-20 right-10 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full px-4 py-2 mb-6"
            >
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">
                AI-Powered PDF Processing
              </span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight"
            >
              Transform Your
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                PDF Workflow
              </span>
              with AI
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto lg:mx-0"
            >
              Experience the future of document processing. Merge, split,
              compress, edit, and collaborate on PDFs with enterprise-grade
              security and real-time AI assistance.
            </motion.p>

            {/* Features List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8 max-w-lg mx-auto lg:mx-0"
            >
              {[
                "AI-Powered Compression",
                "Real-time Collaboration",
                "Enterprise Security",
                "99.9% Uptime Guarantee",
              ].map((feature, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm text-gray-600">{feature}</span>
                </div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8"
            >
              <Button
                size="xl"
                className="group"
                onClick={handleStartProcessing}
              >
                Start Processing Free
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
              </Button>
              <Button
                variant="outline"
                size="xl"
                className="group"
                onClick={() => {
                  window.location.href = "/demo";
                }}
              >
                <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-200" />
                Watch Demo
              </Button>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="text-center lg:text-left"
            >
              <p className="text-sm text-gray-500 mb-4">Trusted by teams at</p>
              <div className="flex flex-wrap justify-center lg:justify-start gap-6 opacity-60">
                {trustedCompanies.map((company, index) => (
                  <span
                    key={index}
                    className="text-sm font-medium text-gray-600"
                  >
                    {company}
                  </span>
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column - Visual/Demo */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
            ref={processorRef}
          >
            {/* PDF Processor Card */}
            <div className="relative max-w-lg mx-auto">
              <div className="bg-white rounded-3xl shadow-2xl p-8 relative z-10">
                <div className="space-y-6">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                      PDF Processor
                    </h3>
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    </div>
                  </div>

                  {/* Upload Area */}
                  <div
                    className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors duration-200 ${
                      isDragOver
                        ? "border-blue-400 bg-blue-50"
                        : selectedFile
                        ? "border-green-400 bg-green-50"
                        : "border-gray-200 bg-gray-50"
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <input
                      id="pdf-upload-input"
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <div
                      className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 cursor-pointer transition-colors duration-200 ${
                        selectedFile
                          ? "bg-green-100"
                          : "bg-blue-100 hover:bg-blue-200"
                      }`}
                      onClick={handleBrowseClick}
                    >
                      {selectedFile ? (
                        <svg
                          className="w-8 h-8 text-green-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-8 h-8 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                          />
                        </svg>
                      )}
                    </div>

                    {selectedFile ? (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-green-700">
                          ✓ {selectedFile.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        <button
                          onClick={() => setSelectedFile(null)}
                          className="text-xs text-red-600 hover:text-red-800 underline"
                        >
                          Remove file
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-sm text-gray-700 font-medium">
                          Drop your PDF here or click to browse
                        </p>
                        <p className="text-xs text-gray-500">
                          Supports PDF files up to 100MB
                        </p>
                      </div>
                    )}

                    {/* Error Message */}
                    {showError && (
                      <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-lg">
                        <p className="text-sm text-red-700">
                          {selectedFile
                            ? "Please upload a PDF file first"
                            : "Please upload a valid PDF file"}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Processing Options */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-gray-800 text-center">
                      Choose Processing Tool
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { name: "Merge", icon: "📄", desc: "Combine PDFs" },
                        { name: "Split", icon: "✂️", desc: "Split pages" },
                        { name: "Compress", icon: "🗜️", desc: "Reduce size" },
                        { name: "Convert", icon: "🔄", desc: "Change format" },
                      ].map((tool) => (
                        <button
                          key={tool.name}
                          className={`p-4 rounded-xl text-sm font-medium transition-all duration-200 border-2 ${
                            selectedFile && !isProcessing
                              ? "bg-white border-blue-200 hover:border-blue-400 hover:bg-blue-50 text-gray-700 hover:text-blue-700 shadow-sm hover:shadow-md"
                              : "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                          }`}
                          onClick={() => handleProcessClick(tool.name)}
                          disabled={!selectedFile || isProcessing}
                        >
                          <div className="flex flex-col items-center space-y-1">
                            <span className="text-lg">{tool.icon}</span>
                            <span className="font-semibold">{tool.name}</span>
                            <span className="text-xs opacity-75">
                              {tool.desc}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>

                    {!selectedFile && (
                      <p className="text-xs text-center text-gray-500 mt-2">
                        Upload a PDF to enable processing tools
                      </p>
                    )}
                  </div>

                  {/* Processing Status */}
                  {isProcessing && (
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-2xl p-6">
                      <div className="flex flex-col items-center space-y-3">
                        <div className="relative">
                          <svg
                            className="animate-spin h-8 w-8 text-blue-600"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-semibold text-blue-800">
                            Processing your PDF...
                          </p>
                          <p className="text-xs text-blue-600 mt-1">
                            This may take a few moments
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* PDF Preview for unregistered users (no download) */}
                  {previewUrl && (
                    <div className="space-y-4">
                      <div className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden">
                        <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                          <div className="flex items-center justify-between">
                            <h5 className="text-sm font-semibold text-gray-700">
                              PDF Preview
                            </h5>
                            {processedFile && (
                              <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                ✓ {processedFile.action} Complete
                              </span>
                            )}
                          </div>
                        </div>
                        <iframe
                          src={previewUrl}
                          title="PDF Preview"
                          className="w-full h-80 border-0"
                        />
                      </div>

                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            <svg
                              className="h-5 w-5 text-amber-600"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <h6 className="text-sm font-medium text-amber-800">
                              Preview Only
                            </h6>
                            <p className="text-sm text-amber-700 mt-1">
                              {processedFile
                                ? `Your PDF has been successfully processed with ${processedFile.action.toLowerCase()}! `
                                : "This is a preview of your uploaded PDF. "}
                              To download the processed file, please create a
                              free account.
                            </p>
                            <div className="mt-3 flex space-x-3">
                              <button
                                onClick={() =>
                                  (window.location.href = "/signup")
                                }
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors duration-200"
                              >
                                Sign Up for Free
                              </button>
                              <button
                                onClick={() =>
                                  (window.location.href = "/login")
                                }
                                className="bg-white text-blue-600 border border-blue-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors duration-200"
                              >
                                Login
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {/* TODO: Implement actual PDF processing actions and Cloudflare R2 upload */}
                </div>
              </div>

              {/* Floating Elements */}
              <motion.div
                animate={{ y: [-10, 10, -10] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute -top-4 -right-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white p-3 rounded-2xl shadow-lg"
              >
                <span className="text-sm font-medium">99% Faster</span>
              </motion.div>

              <motion.div
                animate={{ y: [10, -10, 10] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 2,
                }}
                className="absolute -bottom-4 -left-4 bg-green-500 text-white p-3 rounded-2xl shadow-lg"
              >
                <span className="text-sm font-medium">AI Powered</span>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                {stat.number}
              </div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default HeroSection;
