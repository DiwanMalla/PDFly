"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Navigation from "@/components/Navigation";
import { loadPDFPages } from "@/lib/pdf-utils";
import { savePDFFile } from "@/lib/indexeddb-utils";
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

const SplitPage: React.FC = () => {
  const router = useRouter();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [pdfPages, setPdfPages] = useState<PDFPage[]>([]);
  const [isLoadingPages, setIsLoadingPages] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [splitOptions, setSplitOptions] = useState<SplitOptions>({
    mode: "pages",
    specificPages: [],
    ranges: "",
    everyNPages: 1,
    extractPages: [],
  });

  const [splitResults, setSplitResults] = useState<SplitResult[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Continue Processing: Store split file key and redirect
  const continueProcessing = (
    result: SplitResult,
    tool: "merge" | "compress" | "convert"
  ) => {
    // Store split file key and config in sessionStorage
    sessionStorage.setItem(
      "continueProcessingConfig",
      JSON.stringify({
        splitFileKey: result.id, // Use result.id as key for IndexedDB
        splitFileName: result.name,
        splitPages: result.pages,
        tool,
      })
    );
    // Redirect to the selected tool page
    router.push(`/tools/${tool}`);
  };
  // Reset and update page selections based on split mode and input
  useEffect(() => {
    if (splitOptions.mode === "pages" || splitOptions.mode === "extract") {
      // Keep manual selections for these modes
      return;
    } else if (splitOptions.mode === "ranges") {
      // Select pages based on ranges input
      const ranges = splitOptions.ranges
        .split(",")
        .map((r) => r.trim())
        .filter(Boolean);
      const selectedPages: number[] = [];
      ranges.forEach((r) => {
        if (r.includes("-")) {
          const [start, end] = r.split("-").map((n) => parseInt(n.trim()));
          if (!isNaN(start) && !isNaN(end)) {
            for (let i = start; i <= end; i++) selectedPages.push(i);
          }
        } else {
          const num = parseInt(r);
          if (!isNaN(num)) selectedPages.push(num);
        }
      });
      setPdfPages((prev) =>
        prev.map((page) => ({
          ...page,
          selected: selectedPages.includes(page.pageNumber),
        }))
      );
    } else if (splitOptions.mode === "every") {
      // Select all pages for 'every' mode
      setPdfPages((prev) => prev.map((page) => ({ ...page, selected: true })));
    } else {
      // Clear selections for other modes
      setPdfPages((prev) => prev.map((page) => ({ ...page, selected: false })));
    }
  }, [splitOptions.mode, splitOptions.ranges, splitOptions.everyNPages]);

  // Reset results when options change significantly
  useEffect(() => {
    if (splitResults.length > 0) {
      setSplitResults([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [splitOptions.mode, splitOptions.ranges, splitOptions.everyNPages]);
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
    setIsLoadingPages(true);
    setLoadingProgress(0);
    setPdfPages([]);

    try {
      console.log("Starting to load PDF pages...");
      setLoadingProgress(20);

      const pdfPages = await loadPDFPages(file);
      setLoadingProgress(80);

      const pages: PDFPage[] = pdfPages.map((pageInfo) => ({
        id: `page-${pageInfo.pageNumber}`,
        pageNumber: pageInfo.pageNumber,
        thumbnail: pageInfo.thumbnail,
        selected: false,
      }));

      setPdfPages(pages);
      setLoadingProgress(100);

      console.log("Successfully loaded", pages.length, "PDF pages");
    } catch (error) {
      console.error("Error loading PDF pages:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to load PDF pages. Please try again.";
      alert(errorMessage);
    } finally {
      setIsLoadingPages(false);
      setTimeout(() => setLoadingProgress(0), 1000);
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

    try {
      // Save the file in IndexedDB and store only the key in sessionStorage
      const fileKey = `splitFile-${Date.now()}-${uploadedFile.name}`;
      await savePDFFile(fileKey, uploadedFile);

      const splitConfig = {
        fileKey,
        fileName: uploadedFile.name,
        splitOptions,
        pdfPages,
        originalFileName: uploadedFile.name.replace(/\.pdf$/i, ""),
      };
      sessionStorage.setItem("splitConfig", JSON.stringify(splitConfig));

      // Use Next.js router to navigate to progress page
      router.push("/tools/split/progress");
    } catch (error) {
      console.error("Error preparing split:", error);
      alert(
        `Failed to prepare split: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
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
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              {/* Split Options Panel - Wider for better UX */}
              <div className="lg:col-span-2 space-y-6">
                {/* max-h-screen overflow-y-auto */}
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

                  <div className="p-4 space-y-4">
                    {/* Reduced padding for more compact design */}
                    {/* Split Mode Selection */}
                    <div className="space-y-3">
                      {/* Reduced spacing */}
                      {[
                        {
                          mode: "pages",
                          icon: Grid3X3,
                          title: "Extract Pages",
                          desc: "Select specific pages",
                          color: "blue",
                        },
                        {
                          mode: "ranges",
                          icon: BarChart3,
                          title: "Split by Ranges",
                          desc: "Define page ranges",
                          color: "green",
                        },
                        {
                          mode: "every",
                          icon: Layers,
                          title: "Split Every N Pages",
                          desc: "Equal page counts",
                          color: "purple",
                        },
                      ].map((option) => (
                        <motion.label
                          key={option.mode}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          className={`flex items-center space-x-3 p-3 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
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
                            className="text-orange-600 focus:ring-orange-500"
                          />
                          <div
                            className={`p-2 rounded-lg ${
                              splitOptions.mode === option.mode
                                ? `bg-${option.color}-100`
                                : "bg-gray-100"
                            }`}
                          >
                            <option.icon
                              className={`w-4 h-4 ${
                                splitOptions.mode === option.mode
                                  ? `text-${option.color}-600`
                                  : "text-gray-600"
                              }`}
                            />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 text-sm">
                              {option.title}
                            </div>
                            <div className="text-xs text-gray-600">
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
                        className="bg-green-50 p-3 rounded-lg border border-green-200"
                      >
                        <label className="block text-sm font-medium text-green-800 mb-2">
                          Page Ranges
                        </label>
                        <input
                          type="text"
                          placeholder="e.g., 1-3,5-7,9"
                          className="w-full p-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-sm placeholder:text-green-500 placeholder:font-semibold text-green-700"
                          value={splitOptions.ranges}
                          onChange={(e) => {
                            // Only allow valid page numbers/ranges
                            const val = e.target.value.replace(/[^0-9,-]/g, "");
                            const maxPage = pdfPages.length;
                            // Validate each range
                            const validRanges = val
                              .split(",")
                              .map((r) => r.trim())
                              .filter(Boolean)
                              .map((r) => {
                                if (r.includes("-")) {
                                  let [start, end] = r
                                    .split("-")
                                    .map((n) => parseInt(n.trim()));
                                  start = Math.max(1, Math.min(start, maxPage));
                                  end = Math.max(1, Math.min(end, maxPage));
                                  return `${start}-${end}`;
                                } else {
                                  const num = Math.max(
                                    1,
                                    Math.min(parseInt(r), maxPage)
                                  );
                                  return isNaN(num) ? "" : `${num}`;
                                }
                              })
                              .filter(Boolean);
                            setSplitOptions((prev) => ({
                              ...prev,
                              ranges: validRanges.join(","),
                            }));
                          }}
                        />
                        <p className="text-xs text-green-600 mt-1 flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          Comma-separated ranges or pages
                        </p>
                      </motion.div>
                    )}

                    {/* Every N Pages Input */}
                    {splitOptions.mode === "every" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-purple-50 p-3 rounded-lg border border-purple-200"
                      >
                        <label className="block text-sm font-medium text-purple-800 mb-2">
                          Pages per Split
                        </label>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() =>
                              setSplitOptions((prev) => ({
                                ...prev,
                                everyNPages: Math.max(1, prev.everyNPages - 1),
                              }))
                            }
                            className="p-2 border border-purple-300 rounded-lg hover:bg-purple-100 transition-colors"
                          >
                            <Minus className="w-3 h-3 text-purple-600" />
                          </button>
                          <input
                            type="number"
                            min="1"
                            max={pdfPages.length}
                            className="flex-1 p-2 border border-purple-300 rounded-lg text-center focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white font-medium text-sm text-purple-700"
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
                            className="p-2 border border-purple-300 rounded-lg hover:bg-purple-100 transition-colors"
                          >
                            <Plus className="w-3 h-3 text-purple-600" />
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
                          className="flex-1 py-2 px-3 text-sm font-medium border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors text-blue-600"
                        >
                          Select All
                        </button>
                        <button
                          onClick={deselectAllPages}
                          className="flex-1 py-2 px-3 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-600"
                        >
                          Clear All
                        </button>
                      </div>
                    )}

                    {/* Split Button */}
                    {splitResults.length === 0 && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSplit}
                        disabled={
                          (splitOptions.mode === "pages" &&
                            pdfPages.filter((p) => p.selected).length === 0) ||
                          (splitOptions.mode === "ranges" &&
                            !splitOptions.ranges.trim())
                        }
                        className="w-full bg-gradient-to-r from-orange-600 to-pink-600 text-white py-3 rounded-xl font-bold hover:shadow-lg disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center space-x-2"
                      >
                        <Scissors className="w-4 h-4" />
                        <span>Split PDF</span>
                        <Sparkles className="w-4 h-4" />
                      </motion.button>
                    )}
                  </div>
                </motion.div>

                {/* Results */}
                <AnimatePresence>
                  {splitResults.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
                    >
                      <div className="bg-gradient-to-r from-green-500 to-teal-500 p-4 text-white">
                        <div className="flex items-center justify-between">
                          <h3 className="text-base font-bold flex items-center">
                            <Check className="w-4 h-4 mr-2" />
                            Split Complete!
                          </h3>
                          <button
                            onClick={downloadAllSplits}
                            className="bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-lg text-xs font-medium transition-colors"
                          >
                            Download All
                          </button>
                        </div>
                      </div>
                      <div className="p-4 space-y-2 max-h-60 overflow-y-auto">
                        {splitResults.map((result, index) => (
                          <motion.div
                            key={result.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200"
                          >
                            <div className="flex-1">
                              <div className="font-medium text-gray-900 text-sm">
                                {result.name}
                              </div>
                              <div className="text-xs text-gray-600 flex items-center space-x-2">
                                <span>Pages: {result.pages.join(", ")}</span>
                                <span>•</span>
                                <span>{result.size}</span>
                              </div>
                              {/* Continue Processing Buttons */}
                              <div className="flex space-x-2 mt-2">
                                <button
                                  onClick={() =>
                                    continueProcessing(result, "merge")
                                  }
                                  className="bg-blue-100 text-blue-700 px-2 py-1 rounded-lg text-xs font-semibold hover:bg-blue-200 transition-colors"
                                >
                                  Continue to Merge
                                </button>
                                <button
                                  onClick={() =>
                                    continueProcessing(result, "compress")
                                  }
                                  className="bg-purple-100 text-purple-700 px-2 py-1 rounded-lg text-xs font-semibold hover:bg-purple-200 transition-colors"
                                >
                                  Continue to Compress
                                </button>
                                <button
                                  onClick={() =>
                                    continueProcessing(result, "convert")
                                  }
                                  className="bg-green-100 text-green-700 px-2 py-1 rounded-lg text-xs font-semibold hover:bg-green-200 transition-colors"
                                >
                                  Continue to Convert
                                </button>
                              </div>
                            </div>
                            <div className="flex space-x-1">
                              <button
                                onClick={() => previewSplitFile(result)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                title="Preview"
                              >
                                <Eye className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => downloadSplitFile(result)}
                                className="p-1.5 text-green-600 hover:bg-green-50 rounded-md transition-colors"
                                title="Download"
                              >
                                <Download className="w-3 h-3" />
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* PDF Pages Grid - More space for preview */}
              <div className="lg:col-span-3">
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
                          {/* Show selected count for 'pages' and 'extract', else show calculated for 'ranges' and 'every' */}
                          {(() => {
                            if (
                              splitOptions.mode === "pages" ||
                              splitOptions.mode === "extract"
                            ) {
                              return `${
                                pdfPages.filter((p) => p.selected).length
                              } of ${pdfPages.length} selected`;
                            } else if (
                              splitOptions.mode === "ranges" &&
                              splitOptions.ranges.trim()
                            ) {
                              // Calculate total pages from ranges string
                              const ranges = splitOptions.ranges
                                .split(",")
                                .map((r) => r.trim())
                                .filter(Boolean);
                              let count = 0;
                              ranges.forEach((r) => {
                                if (r.includes("-")) {
                                  const [start, end] = r
                                    .split("-")
                                    .map((n) => parseInt(n.trim()));
                                  if (!isNaN(start) && !isNaN(end))
                                    count += Math.max(0, end - start + 1);
                                } else {
                                  if (!isNaN(parseInt(r))) count += 1;
                                }
                              });
                              return `${count} of ${pdfPages.length} selected`;
                            } else if (splitOptions.mode === "every") {
                              const n = splitOptions.everyNPages;
                              const total = pdfPages.length;
                              const count = n > 0 ? total : 0;
                              return `${count} of ${total} selected`;
                            } else {
                              return `0 of ${pdfPages.length} selected`;
                            }
                          })()}
                        </div>
                        <Move3D className="w-5 h-5" />
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    {isLoadingPages ? (
                      <div className="text-center py-16">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                          className="w-16 h-16 mx-auto mb-6"
                        >
                          <Grid3X3 className="w-full h-full text-orange-500" />
                        </motion.div>
                        <p className="text-gray-700 text-lg font-semibold mb-4">
                          Loading PDF pages...
                        </p>
                        <div className="w-full max-w-xs mx-auto bg-gray-200 rounded-full h-3 mb-4">
                          <motion.div
                            className="bg-gradient-to-r from-orange-500 to-pink-500 h-3 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${loadingProgress}%` }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>
                        <p className="text-sm text-gray-500">
                          {loadingProgress}% complete
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
                    ) : pdfPages.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 max-h-[600px] overflow-y-auto pr-2">
                        {(() => {
                          if (
                            splitOptions.mode === "every" &&
                            splitOptions.everyNPages > 0
                          ) {
                            const groupSize = splitOptions.everyNPages;
                            const colors = [
                              "bg-purple-50 border-purple-200",
                              "bg-indigo-50 border-indigo-200",
                              "bg-pink-50 border-pink-200",
                              "bg-blue-50 border-blue-200",
                              "bg-orange-50 border-orange-200",
                            ];
                            return pdfPages.map((page, index) => {
                              const groupIdx = Math.floor(index / groupSize);
                              const colorClass =
                                colors[groupIdx % colors.length];
                              return (
                                <motion.div
                                  key={page.id}
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ delay: index * 0.05 }}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  className={`relative cursor-pointer rounded-2xl overflow-hidden border-2 transition-all duration-300 ${colorClass} ${
                                    page.selected
                                      ? "border-orange-500 ring-4 ring-orange-200 shadow-lg"
                                      : "hover:border-orange-300 hover:shadow-md"
                                  }`}
                                >
                                  <div className="aspect-[3/4] relative overflow-hidden">
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
                                  <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-semibold px-2 py-1 rounded-full">
                                    {page.pageNumber}
                                  </div>
                                  <div className="absolute top-2 right-2 bg-white/80 text-purple-700 rounded-full px-2 py-1 text-xs font-bold shadow">
                                    Group {groupIdx + 1}
                                  </div>
                                  {page.selected && (
                                    <motion.div
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      className="absolute top-8 right-2 bg-orange-600 text-white rounded-full p-2 shadow-lg"
                                    >
                                      <Check className="w-3 h-3" />
                                    </motion.div>
                                  )}
                                </motion.div>
                              );
                            });
                          } else {
                            return pdfPages.map((page, index) => (
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
                                onClick={() => {
                                  if (
                                    splitOptions.mode === "pages" ||
                                    splitOptions.mode === "extract"
                                  ) {
                                    togglePageSelection(page.id);
                                  } else if (splitOptions.mode === "ranges") {
                                    // Update range input and selection
                                    const maxPage = pdfPages.length;
                                    const currentRange = splitOptions.ranges
                                      .split(",")
                                      .map((r) => r.trim())
                                      .find((r) => r.includes("-"));
                                    let start = 1,
                                      end = 1;
                                    if (currentRange) {
                                      [start, end] = currentRange
                                        .split("-")
                                        .map((n) => parseInt(n.trim()));
                                      if (isNaN(start) || isNaN(end)) {
                                        start = end = page.pageNumber;
                                      }
                                    } else {
                                      start = end = page.pageNumber;
                                    }
                                    if (page.pageNumber < start) {
                                      start = page.pageNumber;
                                    } else if (page.pageNumber > end) {
                                      end = page.pageNumber;
                                    } else {
                                      // If clicked inside range, shrink to start-page
                                      end = page.pageNumber;
                                    }
                                    start = Math.max(
                                      1,
                                      Math.min(start, maxPage)
                                    );
                                    end = Math.max(1, Math.min(end, maxPage));
                                    setSplitOptions((prev) => ({
                                      ...prev,
                                      ranges: `${start}-${end}`,
                                    }));
                                  }
                                }}
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
                            ));
                          }
                        })()}
                      </div>
                    ) : (
                      <div className="text-center py-16">
                        <Grid3X3 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                        <p className="text-gray-500 text-lg">No PDF loaded</p>
                        <p className="text-sm text-gray-400 mt-2">
                          Upload a PDF file to get started
                        </p>
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
