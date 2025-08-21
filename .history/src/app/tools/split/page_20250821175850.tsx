"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navigation from "@/components/Navigation";
import { loadPDFPages, PDFPageInfo } from "@/lib/pdf-utils";
import {
  ArrowLeft,
  Download,
  Upload,
  Eye,
  Check,
  Plus,
  Minus,
  Settings,
  Sparkles,
  Zap,
  Clock,
  Shield,
  Star,
  BarChart3,
  Layers,
  Move3D,
  Scissors,
  Grid3X3,
} from "lucide-react";

interface PDFPage {
  id: string;
  pageNumber: number;
  thumbnail: string;
  selected: boolean;
  blob?: Blob;
}

interface SplitResult {
  id: string;
  name: string;
  pages: number[];
  blob: Blob;
  preview: string;
  size: string;
}

interface SplitOptions {
  mode: "pages" | "ranges" | "extract" | "every";
  specificPages: number[];
  ranges: string;
  everyNPages: number;
  extractPages: number[];
}

interface SplitProgress {
  isProcessing: boolean;
  progress: number;
  currentStep: string;
  speed: string;
}

const SplitPage: React.FC = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [pdfPages, setPdfPages] = useState<PDFPage[]>([]);
  const [splitOptions, setSplitOptions] = useState<SplitOptions>({
    mode: "pages",
    specificPages: [],
    ranges: "",
    everyNPages: 1,
    extractPages: [],
  });
  const [splitProgress, setSplitProgress] = useState<SplitProgress>({
    isProcessing: false,
    progress: 0,
    currentStep: "",
    speed: "",
  });
  const [splitResults, setSplitResults] = useState<SplitResult[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load initial file from sessionStorage
  useEffect(() => {
    const loadInitialFile = () => {
      const storedFileData = sessionStorage.getItem("initialFile");
      const storedFileBlob = sessionStorage.getItem("initialFileBlob");

      if (storedFileData && storedFileBlob) {
        try {
          const fileData = JSON.parse(storedFileData);

          if (storedFileBlob.startsWith("data:")) {
            fetch(storedFileBlob)
              .then((res) => res.blob())
              .then((blob) => {
                const file = new File([blob], fileData.name, {
                  type: fileData.type,
                });
                setUploadedFile(file);
                loadPDFPagesFromFile(file);
              })
              .catch((error) => {
                console.error("Error loading initial file:", error);
                sessionStorage.removeItem("initialFile");
                sessionStorage.removeItem("initialFileBlob");
              });
          }

          setTimeout(() => {
            sessionStorage.removeItem("initialFile");
            sessionStorage.removeItem("initialFileBlob");
          }, 1000);
        } catch (error) {
          console.error("Error parsing stored file data:", error);
          sessionStorage.removeItem("initialFile");
          sessionStorage.removeItem("initialFileBlob");
        }
      }
    };

    loadInitialFile();
  }, []);

  const loadPDFPagesFromFile = async (file: File) => {
    try {
      const pdfPages = await loadPDFPages(file);
      
      const pages: PDFPage[] = pdfPages.map((pageInfo) => ({
        id: `page-${pageInfo.pageNumber}`,
        pageNumber: pageInfo.pageNumber,
        thumbnail: pageInfo.thumbnail,
        selected: false,
      }));

      setPdfPages(pages);
    } catch (error) {
      console.error("Error loading PDF pages:", error);
      alert("Failed to load PDF pages. Please try again.");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setUploadedFile(file);
      loadPDFPagesFromFile(file);
      setSplitResults([]);
    } else {
      alert("Please select a PDF file");
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
        setUploadedFile(file);
        loadPDFPagesFromFile(file);
        setSplitResults([]);
      } else {
        alert("Please drop a PDF file");
      }
    }
  };

  const togglePageSelection = (pageId: string) => {
    setPdfPages((prev) =>
      prev.map((page) =>
        page.id === pageId ? { ...page, selected: !page.selected } : page
      )
    );
  };

  const selectAllPages = () => {
    setPdfPages((prev) => prev.map((page) => ({ ...page, selected: true })));
  };

  const deselectAllPages = () => {
    setPdfPages((prev) => prev.map((page) => ({ ...page, selected: false })));
  };

  const handleSplit = async () => {
    if (!uploadedFile || pdfPages.length === 0) return;

    setSplitProgress({
      isProcessing: true,
      progress: 0,
      currentStep: "Preparing PDF for splitting...",
      speed: "0 MB/s",
    });

    try {
      const { PDFDocument } = await import("pdf-lib");

      // Load the original PDF
      setSplitProgress((prev) => ({
        ...prev,
        progress: 10,
        currentStep: "Loading PDF document...",
        speed: "1.2 MB/s",
      }));

      const arrayBuffer = await uploadedFile.arrayBuffer();
      const originalPdf = await PDFDocument.load(arrayBuffer);

      let pagesToSplit: number[][] = [];

      // Determine pages to split based on mode
      setSplitProgress((prev) => ({
        ...prev,
        progress: 20,
        currentStep: "Analyzing split configuration...",
        speed: "2.1 MB/s",
      }));

      switch (splitOptions.mode) {
        case "pages":
          // Split individual selected pages
          const selectedPages = pdfPages
            .filter((page) => page.selected)
            .map((page) => page.pageNumber);
          pagesToSplit = selectedPages.map((page) => [page]);
          break;

        case "ranges":
          // Parse ranges like "1-3,5-7,9"
          if (splitOptions.ranges.trim()) {
            const ranges = splitOptions.ranges.split(",").map((range) => {
              if (range.includes("-")) {
                const [start, end] = range
                  .split("-")
                  .map((n) => parseInt(n.trim()));
                const pages = [];
                for (let i = start; i <= end; i++) {
                  pages.push(i);
                }
                return pages;
              } else {
                return [parseInt(range.trim())];
              }
            });
            pagesToSplit = ranges;
          }
          break;

        case "extract":
          // Extract specific pages into separate files
          const extractPages = pdfPages
            .filter((page) => page.selected)
            .map((page) => [page.pageNumber]);
          pagesToSplit = extractPages;
          break;

        case "every":
          // Split every N pages
          const n = splitOptions.everyNPages;
          for (let i = 0; i < pdfPages.length; i += n) {
            const chunk = [];
            for (let j = i; j < Math.min(i + n, pdfPages.length); j++) {
              chunk.push(j + 1);
            }
            pagesToSplit.push(chunk);
          }
          break;
      }

      const results: SplitResult[] = [];

      // Create split documents
      for (let i = 0; i < pagesToSplit.length; i++) {
        const pages = pagesToSplit[i];

        setSplitProgress((prev) => ({
          ...prev,
          progress: 30 + (i * 50) / pagesToSplit.length,
          currentStep: `Creating split ${i + 1} of ${pagesToSplit.length}...`,
          speed: "3.5 MB/s",
        }));

        const newPdf = await PDFDocument.create();

        // Copy pages to new document
        const pageIndices = pages.map((p) => p - 1); // Convert to 0-based
        const copiedPages = await newPdf.copyPages(originalPdf, pageIndices);
        copiedPages.forEach((page) => newPdf.addPage(page));

        // Generate PDF bytes
        const pdfBytes = await newPdf.save();
        const blob = new Blob([new Uint8Array(pdfBytes)], {
          type: "application/pdf",
        });
        const preview = URL.createObjectURL(blob);

        const fileName =
          pages.length === 1
            ? `page_${pages[0]}.pdf`
            : `pages_${pages[0]}-${pages[pages.length - 1]}.pdf`;

        results.push({
          id: `split-${i}`,
          name: fileName,
          pages,
          blob,
          preview,
          size: (blob.size / 1024 / 1024).toFixed(2) + " MB",
        });
      }

      setSplitProgress((prev) => ({
        ...prev,
        progress: 90,
        currentStep: "Finalizing split documents...",
        speed: "2.8 MB/s",
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
      }, 500);
    } catch (error) {
      console.error("Error splitting PDF:", error);
      setSplitProgress((prev) => ({
        ...prev,
        isProcessing: false,
        currentStep: "Error occurred during split",
      }));
      alert("Failed to split PDF. Please try again.");
    }
  };

  const downloadSplitFile = (result: SplitResult) => {
    const link = document.createElement("a");
    link.href = result.preview;
    link.download = result.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAllSplits = () => {
    splitResults.forEach((result, index) => {
      setTimeout(() => downloadSplitFile(result), index * 500);
    });
  };

  const previewSplitFile = (result: SplitResult) => {
    window.open(result.preview, "_blank");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Navigation />

      <div className="pt-20">
        {/* Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 text-white"
        >
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
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
                  <h1 className="text-4xl font-bold mb-2">Split PDF</h1>
                  <p className="text-xl text-white/90">
                    Extract, separate, and organize your PDF pages with
                    precision
                  </p>
                </div>
              </div>
            </div>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-3 mt-8">
              {[
                { icon: Zap, text: "Lightning Fast" },
                { icon: Shield, text: "Secure Processing" },
                { icon: Star, text: "Premium Quality" },
                { icon: Layers, text: "Batch Processing" },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20"
                >
                  <feature.icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{feature.text}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Upload Area */}
          {!uploadedFile && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div
                className={`relative overflow-hidden border-2 border-dashed rounded-3xl p-16 text-center transition-all duration-300 ${
                  isDragOver
                    ? "border-orange-400 bg-orange-50 scale-[1.02]"
                    : "border-gray-300 hover:border-orange-400 hover:bg-gray-50"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-pink-50 opacity-50" />
                <div className="relative">
                  <motion.div
                    animate={
                      isDragOver
                        ? { scale: 1.1, rotate: 5 }
                        : { scale: 1, rotate: 0 }
                    }
                    transition={{ type: "spring", stiffness: 200 }}
                    className="w-24 h-24 bg-gradient-to-br from-orange-500 to-pink-500 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg"
                  >
                    <Upload className="w-12 h-12 text-white" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    Drop your PDF here
                  </h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    Select a PDF file to split into separate documents. We
                    support files up to 100MB.
                  </p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-gradient-to-r from-orange-600 to-pink-600 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300"
                  >
                    Select PDF File
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Main Content */}
          {uploadedFile && (
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
              {/* Split Options Panel */}
              <div className="xl:col-span-1 space-y-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden"
                >
                  <div className="bg-gradient-to-r from-orange-500 to-pink-500 p-6 text-white">
                    <h2 className="text-xl font-bold flex items-center">
                      <Settings className="w-6 h-6 mr-3" />
                      Split Options
                    </h2>
                  </div>

                  <div className="p-6 space-y-6">
                    {/* Split Mode Selection */}
                    <div className="space-y-4">
                      {[
                        {
                          mode: "pages",
                          icon: Grid3X3,
                          title: "Extract Selected Pages",
                          desc: "Choose specific pages to extract",
                          color: "blue",
                        },
                        {
                          mode: "ranges",
                          icon: BarChart3,
                          title: "Split by Ranges",
                          desc: "Define custom page ranges",
                          color: "green",
                        },
                        {
                          mode: "every",
                          icon: Layers,
                          title: "Split Every N Pages",
                          desc: "Create files with equal page counts",
                          color: "purple",
                        },
                      ].map((option) => (
                        <motion.label
                          key={option.mode}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`flex items-start space-x-4 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                            splitOptions.mode === option.mode
                              ? `border-${option.color}-500 bg-${option.color}-50`
                              : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          <input
                            type="radio"
                            name="splitMode"
                            checked={splitOptions.mode === option.mode}
                            onChange={() =>
                              setSplitOptions((prev) => ({
                                ...prev,
                                mode: option.mode as
                                  | "pages"
                                  | "ranges"
                                  | "extract"
                                  | "every",
                              }))
                            }
                            className="mt-1 text-orange-600 focus:ring-orange-500"
                          />
                          <div
                            className={`p-2 rounded-xl ${
                              splitOptions.mode === option.mode
                                ? `bg-${option.color}-100`
                                : "bg-gray-100"
                            }`}
                          >
                            <option.icon
                              className={`w-5 h-5 ${
                                splitOptions.mode === option.mode
                                  ? `text-${option.color}-600`
                                  : "text-gray-600"
                              }`}
                            />
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900">
                              {option.title}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              {option.desc}
                            </div>
                          </div>
                        </motion.label>
                      ))}
                    </div>

                    {/* Range Input */}
                    {splitOptions.mode === "ranges" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-green-50 p-4 rounded-xl border border-green-200"
                      >
                        <label className="block text-sm font-semibold text-green-800 mb-2">
                          Page Ranges
                        </label>
                        <input
                          type="text"
                          placeholder="e.g., 1-3,5-7,9"
                          className="w-full p-3 border border-green-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                          value={splitOptions.ranges}
                          onChange={(e) =>
                            setSplitOptions((prev) => ({
                              ...prev,
                              ranges: e.target.value,
                            }))
                          }
                        />
                        <p className="text-xs text-green-600 mt-2 flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          Use comma to separate ranges, dash for page ranges
                        </p>
                      </motion.div>
                    )}

                    {/* Every N Pages Input */}
                    {splitOptions.mode === "every" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-purple-50 p-4 rounded-xl border border-purple-200"
                      >
                        <label className="block text-sm font-semibold text-purple-800 mb-3">
                          Pages per Split
                        </label>
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() =>
                              setSplitOptions((prev) => ({
                                ...prev,
                                everyNPages: Math.max(1, prev.everyNPages - 1),
                              }))
                            }
                            className="p-3 border border-purple-300 rounded-xl hover:bg-purple-100 transition-colors"
                          >
                            <Minus className="w-4 h-4 text-purple-600" />
                          </button>
                          <input
                            type="number"
                            min="1"
                            max={pdfPages.length}
                            className="flex-1 p-3 border border-purple-300 rounded-xl text-center focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white font-semibold"
                            value={splitOptions.everyNPages}
                            onChange={(e) =>
                              setSplitOptions((prev) => ({
                                ...prev,
                                everyNPages: parseInt(e.target.value) || 1,
                              }))
                            }
                          />
                          <button
                            onClick={() =>
                              setSplitOptions((prev) => ({
                                ...prev,
                                everyNPages: Math.min(
                                  pdfPages.length,
                                  prev.everyNPages + 1
                                ),
                              }))
                            }
                            className="p-3 border border-purple-300 rounded-xl hover:bg-purple-100 transition-colors"
                          >
                            <Plus className="w-4 h-4 text-purple-600" />
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {/* Page Selection Controls */}
                    {(splitOptions.mode === "pages" ||
                      splitOptions.mode === "extract") && (
                      <div className="flex space-x-2">
                        <button
                          onClick={selectAllPages}
                          className="flex-1 py-3 px-4 text-sm font-medium border border-blue-300 rounded-xl hover:bg-blue-50 transition-colors text-blue-600"
                        >
                          Select All
                        </button>
                        <button
                          onClick={deselectAllPages}
                          className="flex-1 py-3 px-4 text-sm font-medium border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors text-gray-600"
                        >
                          Clear All
                        </button>
                      </div>
                    )}

                    {/* Split Button */}
                    {!splitProgress.isProcessing &&
                      splitResults.length === 0 && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleSplit}
                          disabled={
                            (splitOptions.mode === "pages" &&
                              pdfPages.filter((p) => p.selected).length ===
                                0) ||
                            (splitOptions.mode === "ranges" &&
                              !splitOptions.ranges.trim())
                          }
                          className="w-full bg-gradient-to-r from-orange-600 to-pink-600 text-white py-4 rounded-xl font-bold hover:shadow-lg disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center space-x-3"
                        >
                          <Scissors className="w-5 h-5" />
                          <span>Split PDF</span>
                          <Sparkles className="w-5 h-5" />
                        </motion.button>
                      )}
                  </div>
                </motion.div>

                {/* Progress */}
                <AnimatePresence>
                  {splitProgress.isProcessing && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden"
                    >
                      <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-6 text-white">
                        <h3 className="text-lg font-bold flex items-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                          Processing PDF
                        </h3>
                      </div>
                      <div className="p-6 space-y-4">
                        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                          <motion.div
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-4 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${splitProgress.progress}%` }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">
                            {splitProgress.currentStep}
                          </span>
                          <span className="font-bold text-blue-600">
                            {splitProgress.progress}%
                          </span>
                        </div>
                        <div className="flex items-center text-xs text-gray-500">
                          <Clock className="w-3 h-3 mr-1" />
                          Processing speed: {splitProgress.speed}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Results */}
                <AnimatePresence>
                  {splitResults.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden"
                    >
                      <div className="bg-gradient-to-r from-green-500 to-teal-500 p-6 text-white">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-bold flex items-center">
                            <Check className="w-5 h-5 mr-2" />
                            Split Complete!
                          </h3>
                          <button
                            onClick={downloadAllSplits}
                            className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                          >
                            Download All
                          </button>
                        </div>
                      </div>
                      <div className="p-6 space-y-3 max-h-80 overflow-y-auto">
                        {splitResults.map((result, index) => (
                          <motion.div
                            key={result.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl border border-gray-200"
                          >
                            <div className="flex-1">
                              <div className="font-semibold text-gray-900">
                                {result.name}
                              </div>
                              <div className="text-sm text-gray-600 flex items-center space-x-2">
                                <span>Pages: {result.pages.join(", ")}</span>
                                <span>•</span>
                                <span>{result.size}</span>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => previewSplitFile(result)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Preview"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => downloadSplitFile(result)}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title="Download"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* PDF Pages Grid */}
              <div className="xl:col-span-3">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden"
                >
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-6 text-white">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold">PDF Pages</h3>
                      <div className="flex items-center space-x-4">
                        <div className="text-sm bg-white/20 px-3 py-1 rounded-full">
                          {pdfPages.filter((p) => p.selected).length} of{" "}
                          {pdfPages.length} selected
                        </div>
                        <Move3D className="w-5 h-5" />
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    {pdfPages.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 max-h-[600px] overflow-y-auto pr-2">
                        {pdfPages.map((page, index) => (
                          <motion.div
                            key={page.id}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`relative cursor-pointer rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
                              page.selected
                                ? "border-orange-500 ring-4 ring-orange-200 shadow-lg"
                                : "border-gray-200 hover:border-orange-300 hover:shadow-md"
                            }`}
                            onClick={() =>
                              (splitOptions.mode === "pages" ||
                                splitOptions.mode === "extract") &&
                              togglePageSelection(page.id)
                            }
                          >
                            <div className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={page.thumbnail}
                                alt={`Page ${page.pageNumber}`}
                                className="w-full h-full object-contain transition-transform duration-300 hover:scale-110"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 p-3">
                              <div className="text-white text-sm font-bold text-center bg-black/50 backdrop-blur-sm rounded-lg py-1">
                                Page {page.pageNumber}
                              </div>
                            </div>
                            {page.selected && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute top-2 right-2 bg-orange-600 text-white rounded-full p-2 shadow-lg"
                              >
                                <Check className="w-3 h-3" />
                              </motion.div>
                            )}
                            <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-semibold px-2 py-1 rounded-full">
                              {page.pageNumber}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-16">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                          className="w-16 h-16 mx-auto mb-4"
                        >
                          <Grid3X3 className="w-full h-full text-gray-400" />
                        </motion.div>
                        <p className="text-gray-500 text-lg">
                          Loading PDF pages...
                        </p>
                        <div className="flex justify-center space-x-1 mt-4">
                          {[0, 1, 2].map((i) => (
                            <motion.div
                              key={i}
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{
                                duration: 1,
                                repeat: Infinity,
                                delay: i * 0.2,
                              }}
                              className="w-2 h-2 bg-orange-400 rounded-full"
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SplitPage;
