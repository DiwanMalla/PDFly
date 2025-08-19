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
  const [showUpload, setShowUpload] = useState(false);

  const handleStartProcessing = () => {
    setShowUpload(true);
    setTimeout(() => {
      processorRef.current?.scrollIntoView({ behavior: "smooth" });
      window.alert("Upload your PDF to start processing.");
    }, 100);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleBrowseClick = () => {
    document.getElementById("pdf-upload-input")?.click();
  };

  // ...existing code...
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
                  <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center bg-gray-50">
                    {showUpload ? (
                      <>
                        <input
                          id="pdf-upload-input"
                          type="file"
                          accept="application/pdf"
                          className="hidden"
                          onChange={handleFileChange}
                        />
                        <div
                          className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4 cursor-pointer"
                          onClick={handleBrowseClick}
                        >
                          <svg
                            className="w-6 h-6 text-blue-600"
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
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {selectedFile
                            ? `Selected: ${selectedFile.name}`
                            : "Drop your PDF here or click to browse"}
                        </p>
                        {/* TODO: Implement drag-and-drop and PDF preview */}
                        {selectedFile && (
                          <div className="text-xs text-green-600 mb-2">
                            PDF uploaded! (TODO: Preview & process)
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                          <svg
                            className="w-6 h-6 text-blue-600"
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
                        </div>
                        <p className="text-sm text-gray-600">
                          Drop your PDF here or click &#39;Start Processing
                          Free&#39; above
                        </p>
                      </>
                    )}
                  </div>

                  {/* Processing Options */}
                  <div className="grid grid-cols-2 gap-3">
                    {["Merge", "Split", "Compress", "Convert"].map((action) => (
                      <button
                        key={action}
                        className="p-3 bg-gray-50 hover:bg-blue-50 rounded-xl text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors duration-200"
                        disabled={!selectedFile}
                      >
                        {action}
                      </button>
                    ))}
                  </div>
                  {/* TODO: Implement actual PDF processing actions */}
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
