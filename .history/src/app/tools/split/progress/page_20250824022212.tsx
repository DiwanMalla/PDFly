"use client";

import React, { useState, useEffect } from "react";
import { getPDFFile } from "@/lib/indexeddb-utils";
import { motion } from "framer-motion";
import Navigation from "@/components/Navigation";
import {
  ArrowLeft,
  Download,
  Eye,
  RotateCcw,
  Scissors,
  FileText,
  Check,
  AlertCircle,
  Clock,
  Activity,
} from "lucide-react";

interface SplitResult {
  id: string;
  name: string;
  pages: number[];
  blob: Blob;
  preview: string;
  size: string;
}

interface SplitProgress {
  isProcessing: boolean;
  progress: number;
  currentStep: string;
  speed: string;
}

const SplitProgressPage: React.FC = () => {
  const [splitProgress, setSplitProgress] = useState<SplitProgress>({
    isProcessing: true,
    progress: 0,
    currentStep: "Initializing split process...",
    speed: "0 MB/s",
  });
  const [splitResults, setSplitResults] = useState<SplitResult[]>([]);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const processSplit = async () => {
      try {
        // Get split configuration from sessionStorage

        const splitConfigStr = sessionStorage.getItem("splitConfig");
        if (!splitConfigStr) {
          throw new Error("Split configuration not found");
        }
        const splitConfig = JSON.parse(splitConfigStr);

        // Retrieve the file from IndexedDB using the key
        const fileBlobOrArrayBuffer = await getPDFFile(splitConfig.fileKey);
        if (!fileBlobOrArrayBuffer) {
          throw new Error("PDF file not found in IndexedDB");
        }
        let fileBlob: Blob;
        if (fileBlobOrArrayBuffer instanceof Blob) {
          fileBlob = fileBlobOrArrayBuffer;
        } else {
          fileBlob = new Blob([fileBlobOrArrayBuffer], {
            type: "application/pdf",
          });
        }
        const file = new File([fileBlob], splitConfig.fileName, {
          type: "application/pdf",
        });

        setSplitProgress({
          isProcessing: true,
          progress: 10,
          currentStep: "Loading PDF document...",
          speed: "1.2 MB/s",
        });

        const { PDFDocument } = await import("pdf-lib");

        const arrayBuffer = await file.arrayBuffer();
        const originalPdf = await PDFDocument.load(arrayBuffer);

        let pagesToSplit: number[][] = [];

        setSplitProgress((prev) => ({
          ...prev,
          progress: 20,
          currentStep: "Analyzing split configuration...",
          speed: "2.1 MB/s",
        }));

        // Determine pages to split based on mode
        switch (splitConfig.splitOptions.mode) {
          case "pages":
            const selectedPages = splitConfig.pdfPages
              .filter(
                (page: { selected: boolean; pageNumber: number }) =>
                  page.selected
              )
              .map(
                (page: { selected: boolean; pageNumber: number }) =>
                  page.pageNumber
              );
            if (selectedPages.length === 0) {
              throw new Error("No pages selected for splitting");
            }
            pagesToSplit = selectedPages.map((page: number) => [page]);
            break;

          case "ranges":
            if (splitConfig.splitOptions.ranges.trim()) {
              const ranges = splitConfig.splitOptions.ranges
                .split(",")
                .map((range: string) => {
                  const trimmedRange = range.trim();
                  if (trimmedRange.includes("-")) {
                    const [start, end] = trimmedRange
                      .split("-")
                      .map((n: string) => parseInt(n.trim()));
                    const pages = [];
                    for (let i = start; i <= end; i++) {
                      pages.push(i);
                    }
                    return pages;
                  } else {
                    return [parseInt(trimmedRange)];
                  }
                });
              pagesToSplit = ranges;
            } else {
              throw new Error("No page ranges specified");
            }
            break;

          case "extract":
            const extractPages = splitConfig.pdfPages
              .filter(
                (page: { selected: boolean; pageNumber: number }) =>
                  page.selected
              )
              .map(
                (page: { selected: boolean; pageNumber: number }) =>
                  page.pageNumber
              );
            if (extractPages.length === 0) {
              throw new Error("No pages selected for extraction");
            }
            pagesToSplit = extractPages.map((page: number) => [page]);
            break;

          case "every":
            const n = splitConfig.splitOptions.everyNPages;
            const totalPages = splitConfig.pdfPages.length;
            for (let i = 0; i < totalPages; i += n) {
              const chunk = [];
              for (let j = i; j < Math.min(i + n, totalPages); j++) {
                chunk.push(j + 1);
              }
              pagesToSplit.push(chunk);
            }
            break;
        }

        if (pagesToSplit.length === 0) {
          throw new Error("No valid pages to split");
        }

        const results: SplitResult[] = [];

        setSplitProgress((prev) => ({
          ...prev,
          progress: 30,
          currentStep: `Creating ${pagesToSplit.length} split documents...`,
          speed: "2.8 MB/s",
        }));

        // Create split documents
        for (let i = 0; i < pagesToSplit.length; i++) {
          const pages = pagesToSplit[i];

          setSplitProgress((prev) => ({
            ...prev,
            progress: 30 + (i * 50) / pagesToSplit.length,
            currentStep: `Processing split ${i + 1} of ${
              pagesToSplit.length
            }...`,
            speed: "3.2 MB/s",
          }));

          const newPdf = await PDFDocument.create();

          // Copy pages to new document
          const pageIndices = pages.map((p) => p - 1); // Convert to 0-based
          const copiedPages = await newPdf.copyPages(originalPdf, pageIndices);
          copiedPages.forEach((page) => newPdf.addPage(page));

          // Generate PDF bytes
          const pdfBytes = await newPdf.save();
          const resultBlob = new Blob([new Uint8Array(pdfBytes)], {
            type: "application/pdf",
          });
          const preview = URL.createObjectURL(resultBlob);

          const fileName =
            pages.length === 1
              ? `${splitConfig.fileName.replace(".pdf", "")}_page_${
                  pages[0]
                }.pdf`
              : `${splitConfig.fileName.replace(".pdf", "")}_pages_${
                  pages[0]
                }-${pages[pages.length - 1]}.pdf`;

          results.push({
            id: `split-${i}`,
            name: fileName,
            pages,
            blob: resultBlob,
            preview,
            size: (resultBlob.size / 1024 / 1024).toFixed(2) + " MB",
          });
        }

        setSplitProgress((prev) => ({
          ...prev,
          progress: 90,
          currentStep: "Finalizing split documents...",
          speed: "2.1 MB/s",
        }));

        setTimeout(() => {
          setSplitProgress((prev) => ({
            ...prev,
            progress: 100,
            currentStep: "Split complete!",
            speed: "0 MB/s",
            isProcessing: false,
          }));

          setSplitResults(results);

          // Clean up sessionStorage
          sessionStorage.removeItem("splitConfig");
          // Optionally, clean up the file from IndexedDB after processing
          // import { deletePDFFile } from "@/lib/indexeddb-utils"; and call deletePDFFile(splitConfig.fileKey);
        }, 500);
      } catch (error) {
        console.error("Error splitting PDF:", error);
        setError(
          error instanceof Error
            ? error.message
            : "An error occurred while splitting the PDF"
        );
        setSplitProgress((prev) => ({
          ...prev,
          isProcessing: false,
          currentStep: "Error occurred",
          speed: "0 MB/s",
        }));
      }
    };

    processSplit();
  }, []);

  const downloadFile = (result: SplitResult) => {
    const link = document.createElement("a");
    link.href = result.preview;
    link.download = result.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAllFiles = () => {
    splitResults.forEach((result, index) => {
      setTimeout(() => downloadFile(result), index * 300);
    });
  };

  const previewFile = (result: SplitResult) => {
    window.open(result.preview, "_blank");
  };

  const startNewSplit = () => {
    window.location.href = "/tools/split";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Navigation />

      <div className="pt-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 text-white"
        >
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex items-center space-x-4 mb-6">
              <button
                onClick={() => window.history.back()}
                className="p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-4">
                <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                  <Scissors className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold mb-2">
                    {splitProgress.isProcessing
                      ? "Splitting PDF..."
                      : "Split Complete!"}
                  </h1>
                  <p className="text-xl text-white/90">
                    {splitProgress.isProcessing
                      ? "Processing your PDF split request"
                      : `Successfully created ${splitResults.length} split documents`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Progress Section */}
          {splitProgress.isProcessing && !error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mb-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Activity className="w-6 h-6 mr-3 text-orange-600" />
                  Processing
                </h2>
                <div className="text-2xl font-bold text-orange-600">
                  {splitProgress.progress}%
                </div>
              </div>

              <div className="space-y-4">
                <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
                  <motion.div
                    className="bg-gradient-to-r from-orange-500 to-pink-500 h-6 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${splitProgress.progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-medium">
                    {splitProgress.currentStep}
                  </span>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="w-4 h-4 mr-1" />
                    Speed: {splitProgress.speed}
                  </div>
                </div>

                <div className="flex justify-center space-x-2 mt-6">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        delay: i * 0.2,
                      }}
                      className="w-3 h-3 bg-orange-400 rounded-full"
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Error Section */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl shadow-xl border border-red-200 p-8 mb-8"
            >
              <div className="flex items-center mb-4">
                <AlertCircle className="w-8 h-8 text-red-600 mr-3" />
                <h2 className="text-2xl font-bold text-red-600">Error</h2>
              </div>
              <p className="text-gray-700 mb-6">{error}</p>
              <button
                onClick={startNewSplit}
                className="bg-gradient-to-r from-orange-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
              >
                Try Again
              </button>
            </motion.div>
          )}

          {/* Results Section */}
          {splitResults.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-green-500 to-teal-500 p-6 text-white">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold flex items-center">
                    <Check className="w-6 h-6 mr-3" />
                    Split Results
                  </h2>
                  <button
                    onClick={downloadAllFiles}
                    className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl font-medium transition-colors"
                  >
                    Download All
                  </button>
                </div>
                <p className="text-green-100 mt-2">
                  {splitResults.length} files created successfully
                </p>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {splitResults.map((result, index) => (
                    <motion.div
                      key={result.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-4 border border-gray-200 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <FileText className="w-8 h-8 text-orange-600" />
                        <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full font-medium">
                          {result.size}
                        </span>
                      </div>

                      <h3 className="font-semibold text-gray-900 mb-2 truncate">
                        {result.name}
                      </h3>

                      <p className="text-sm text-gray-600 mb-4">
                        Pages: {result.pages.join(", ")}
                      </p>

                      <div className="flex space-x-2">
                        <button
                          onClick={() => previewFile(result)}
                          className="flex-1 bg-blue-100 text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium flex items-center justify-center"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Preview
                        </button>
                        <button
                          onClick={() => downloadFile(result)}
                          className="flex-1 bg-green-100 text-green-600 px-3 py-2 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium flex items-center justify-center"
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Continue Options */}
                <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Continue Processing
                  </h3>
                  <p className="text-gray-600 mb-4">
                    What would you like to do next with your split files?
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <button
                      onClick={() => (window.location.href = "/tools/merge")}
                      className="bg-white border border-gray-200 rounded-xl p-3 text-center hover:shadow-md transition-all duration-300 group"
                    >
                      <div className="text-2xl mb-2">📑</div>
                      <div className="font-medium text-gray-900">
                        Merge Files
                      </div>
                      <div className="text-xs text-gray-500">Combine PDFs</div>
                    </button>
                    <button
                      onClick={() => (window.location.href = "/tools/compress")}
                      className="bg-white border border-gray-200 rounded-xl p-3 text-center hover:shadow-md transition-all duration-300 group"
                    >
                      <div className="text-2xl mb-2">🗜️</div>
                      <div className="font-medium text-gray-900">Compress</div>
                      <div className="text-xs text-gray-500">
                        Reduce file size
                      </div>
                    </button>
                    <button
                      onClick={() => (window.location.href = "/tools/convert")}
                      className="bg-white border border-gray-200 rounded-xl p-3 text-center hover:shadow-md transition-all duration-300 group"
                    >
                      <div className="text-2xl mb-2">🔄</div>
                      <div className="font-medium text-gray-900">Convert</div>
                      <div className="text-xs text-gray-500">Change format</div>
                    </button>
                    <button
                      onClick={startNewSplit}
                      className="bg-white border border-gray-200 rounded-xl p-3 text-center hover:shadow-md transition-all duration-300 group"
                    >
                      <RotateCcw className="w-6 h-6 mx-auto mb-2 text-gray-600" />
                      <div className="font-medium text-gray-900">
                        Split Again
                      </div>
                      <div className="text-xs text-gray-500">
                        New split task
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SplitProgressPage;
