"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navigation from "@/components/Navigation";
import {
  ArrowLeft,
  Download,
  Share2,
  Trash2,
  FileText,
  SplitSquareHorizontal as Split,
  Scissors,
  Grid3X3,
  Upload,
  Eye,
  Check,
  X,
  Plus,
  Minus,
  RotateCcw,
  Settings,
  Sparkles,
  Zap,
  Clock,
  Shield,
  Star,
  BarChart3,
  Layers,
  Move3D,
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
  const [previewUrl, setPreviewUrl] = useState<string>("");
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
                setPreviewUrl(URL.createObjectURL(file));
                loadPDFPages(file);
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

  const loadPDFPages = async (file: File) => {
    try {
      const { getDocument, GlobalWorkerOptions } = await import("pdfjs-dist");

      // Set up PDF.js worker
      GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await getDocument({ data: arrayBuffer }).promise;
      const numPages = pdf.numPages;

      const pages: PDFPage[] = [];

      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 0.5 });

        // Create canvas for thumbnail
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d")!;
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // Render page to canvas
        await page.render({ canvasContext: context, viewport }).promise;

        // Convert to thumbnail
        const thumbnail = canvas.toDataURL("image/jpeg", 0.8);

        pages.push({
          id: `page-${pageNum}`,
          pageNumber: pageNum,
          thumbnail,
          selected: false,
        });
      }

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
      setPreviewUrl(URL.createObjectURL(file));
      loadPDFPages(file);
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
        setPreviewUrl(URL.createObjectURL(file));
        loadPDFPages(file);
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pt-20">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center space-x-4 mb-8"
        >
          <button
            onClick={() => window.history.back()}
            className="p-3 rounded-xl border border-gray-300 hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-orange-100 rounded-xl">
              <Scissors className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Split PDF</h1>
              <p className="text-gray-600">
                Extract or split pages from your PDF document
              </p>
            </div>
          </div>
        </motion.div>

        {/* Upload Area (if no file) */}
        {!uploadedFile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div
              className={`border-2 border-dashed rounded-2xl p-12 text-center transition-colors ${
                isDragOver
                  ? "border-orange-400 bg-orange-50"
                  : "border-gray-300 hover:border-orange-400"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Choose PDF to Split
              </h3>
              <p className="text-gray-600 mb-6">
                Drag and drop your PDF here, or click to browse
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-orange-700 transition-colors"
              >
                Browse Files
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </motion.div>
        )}

        {/* Main Content */}
        {uploadedFile && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Split Options */}
            <div className="xl:col-span-1 space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-2xl shadow-lg border p-6"
              >
                <h2 className="text-xl font-semibold mb-6 flex items-center">
                  <Settings className="w-5 h-5 mr-2 text-orange-600" />
                  Split Options
                </h2>

                <div className="space-y-6">
                  {/* Split Mode Selection */}
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3 p-3 border rounded-xl hover:bg-gray-50 cursor-pointer">
                      <input
                        type="radio"
                        name="splitMode"
                        checked={splitOptions.mode === "pages"}
                        onChange={() =>
                          setSplitOptions((prev) => ({
                            ...prev,
                            mode: "pages",
                          }))
                        }
                        className="text-orange-600"
                      />
                      <div>
                        <div className="font-medium">
                          Extract Selected Pages
                        </div>
                        <div className="text-sm text-gray-600">
                          Choose specific pages to extract
                        </div>
                      </div>
                    </label>

                    <label className="flex items-center space-x-3 p-3 border rounded-xl hover:bg-gray-50 cursor-pointer">
                      <input
                        type="radio"
                        name="splitMode"
                        checked={splitOptions.mode === "ranges"}
                        onChange={() =>
                          setSplitOptions((prev) => ({
                            ...prev,
                            mode: "ranges",
                          }))
                        }
                        className="text-orange-600"
                      />
                      <div>
                        <div className="font-medium">Split by Ranges</div>
                        <div className="text-sm text-gray-600">
                          Define custom page ranges
                        </div>
                      </div>
                    </label>

                    <label className="flex items-center space-x-3 p-3 border rounded-xl hover:bg-gray-50 cursor-pointer">
                      <input
                        type="radio"
                        name="splitMode"
                        checked={splitOptions.mode === "every"}
                        onChange={() =>
                          setSplitOptions((prev) => ({
                            ...prev,
                            mode: "every",
                          }))
                        }
                        className="text-orange-600"
                      />
                      <div>
                        <div className="font-medium">Split Every N Pages</div>
                        <div className="text-sm text-gray-600">
                          Create files with equal page counts
                        </div>
                      </div>
                    </label>
                  </div>

                  {/* Range Input */}
                  {splitOptions.mode === "ranges" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Page Ranges
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., 1-3,5-7,9"
                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        value={splitOptions.ranges}
                        onChange={(e) =>
                          setSplitOptions((prev) => ({
                            ...prev,
                            ranges: e.target.value,
                          }))
                        }
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Use comma to separate ranges, dash for page ranges
                      </p>
                    </div>
                  )}

                  {/* Every N Pages Input */}
                  {splitOptions.mode === "every" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
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
                          className="p-2 border rounded-lg hover:bg-gray-100"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <input
                          type="number"
                          min="1"
                          max={pdfPages.length}
                          className="flex-1 p-3 border border-gray-300 rounded-xl text-center focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                          className="p-2 border rounded-lg hover:bg-gray-100"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Page Selection Controls */}
                  {(splitOptions.mode === "pages" ||
                    splitOptions.mode === "extract") && (
                    <div className="flex space-x-2">
                      <button
                        onClick={selectAllPages}
                        className="flex-1 py-2 px-3 text-sm border border-gray-300 rounded-lg hover:bg-gray-100"
                      >
                        Select All
                      </button>
                      <button
                        onClick={deselectAllPages}
                        className="flex-1 py-2 px-3 text-sm border border-gray-300 rounded-lg hover:bg-gray-100"
                      >
                        Clear All
                      </button>
                    </div>
                  )}

                  {/* Split Button */}
                  {!splitProgress.isProcessing && splitResults.length === 0 && (
                    <button
                      onClick={handleSplit}
                      disabled={
                        (splitOptions.mode === "pages" &&
                          pdfPages.filter((p) => p.selected).length === 0) ||
                        (splitOptions.mode === "ranges" &&
                          !splitOptions.ranges.trim())
                      }
                      className="w-full bg-orange-600 text-white py-4 rounded-xl font-semibold hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                    >
                      <Scissors className="w-5 h-5" />
                      <span>Split PDF</span>
                    </button>
                  )}
                </div>
              </motion.div>

              {/* Progress */}
              {splitProgress.isProcessing && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-2xl shadow-lg border p-6"
                >
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-600 mr-2"></div>
                    Splitting PDF
                  </h3>
                  <div className="space-y-3">
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-orange-500 to-orange-600 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${splitProgress.progress}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {splitProgress.currentStep}
                      </span>
                      <span className="font-semibold">
                        {splitProgress.progress}%
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Processing speed: {splitProgress.speed}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Results */}
              {splitResults.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-2xl shadow-lg border p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold flex items-center">
                      <Check className="w-5 h-5 text-green-600 mr-2" />
                      Split Complete!
                    </h3>
                    <button
                      onClick={downloadAllSplits}
                      className="text-sm bg-orange-600 text-white px-3 py-1.5 rounded-lg hover:bg-orange-700"
                    >
                      Download All
                    </button>
                  </div>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {splitResults.map((result) => (
                      <div
                        key={result.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                      >
                        <div className="flex-1">
                          <div className="font-medium text-sm">
                            {result.name}
                          </div>
                          <div className="text-xs text-gray-600">
                            Pages: {result.pages.join(", ")} • {result.size}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => previewSplitFile(result)}
                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="Preview"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => downloadSplitFile(result)}
                            className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg"
                            title="Download"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* PDF Pages Grid */}
            <div className="xl:col-span-2">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-2xl shadow-lg border p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold">PDF Pages</h3>
                  <div className="text-sm text-gray-600">
                    {pdfPages.filter((p) => p.selected).length} of{" "}
                    {pdfPages.length} selected
                  </div>
                </div>

                {pdfPages.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
                    {pdfPages.map((page) => (
                      <motion.div
                        key={page.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.05 }}
                        className={`relative cursor-pointer rounded-xl overflow-hidden border-2 transition-all ${
                          page.selected
                            ? "border-orange-500 ring-2 ring-orange-200"
                            : "border-gray-200 hover:border-orange-300"
                        }`}
                        onClick={() =>
                          (splitOptions.mode === "pages" ||
                            splitOptions.mode === "extract") &&
                          togglePageSelection(page.id)
                        }
                      >
                        <div className="aspect-[3/4] bg-gray-100">
                          <img
                            src={page.thumbnail}
                            alt={`Page ${page.pageNumber}`}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                          <div className="text-white text-sm font-medium text-center">
                            Page {page.pageNumber}
                          </div>
                        </div>
                        {page.selected && (
                          <div className="absolute top-2 right-2 bg-orange-600 text-white rounded-full p-1">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Grid3X3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Loading PDF pages...</p>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SplitPage;
