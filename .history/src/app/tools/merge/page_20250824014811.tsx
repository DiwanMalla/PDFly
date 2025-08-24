"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navigation from "@/components/Navigation";
import {
  ArrowLeft,
  Plus,
  Download,
  Share2,
  Trash2,
  FileText,
  Edit3 as Move,
  ExternalLink as Eye,
} from "@/components/ui/Icons";

interface PDFFile {
  id: string;
  file: File;
  preview: string;
  name: string;
  size: string;
}

interface MergeProgress {
  isProcessing: boolean;
  progress: number;
  speed: string;
  currentStep: string;
}

const MergePage: React.FC = () => {
  const [uploadedFiles, setUploadedFiles] = useState<PDFFile[]>([]);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mergeProgress, setMergeProgress] = useState<MergeProgress>({
    isProcessing: false,
    progress: 0,
    speed: "0 MB/s",
    currentStep: "Initializing...",
  });
  const [mergedFile, setMergedFile] = useState<{
    preview: string;
    downloadKey: string;
    blob?: Blob;
  } | null>(null);

  // Get initial file from home page or continueProcessConfig from split
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
                const newPreviewUrl = URL.createObjectURL(file);
                const initialFile: PDFFile = {
                  id: fileData.id,
                  file: file,
                  preview: newPreviewUrl,
                  name: fileData.name,
                  size: fileData.size,
                };
                setUploadedFiles([initialFile]);
              })
              .catch((error) => {
                console.error("Error converting base64 to blob:", error);
                sessionStorage.removeItem("initialFile");
                sessionStorage.removeItem("initialFileBlob");
              });
          } else {
            console.error("Invalid stored data format");
            sessionStorage.removeItem("initialFile");
            sessionStorage.removeItem("initialFileBlob");
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
        return;
      }

      // Check for continueProcessConfig from split tool
      const continueConfigStr = sessionStorage.getItem("continueProcessConfig");
      if (continueConfigStr) {
        try {
          const config = JSON.parse(continueConfigStr);
          if (config.blobBase64) {
            // Convert base64 to Blob
            fetch(config.blobBase64)
              .then((res) => res.blob())
              .then((blob) => {
                const file = new File([blob], config.fileName, {
                  type: "application/pdf",
                });
                const previewUrl = URL.createObjectURL(file);
                const pdfFile: PDFFile = {
                  id: Date.now().toString(),
                  file,
                  preview: previewUrl,
                  name: config.fileName,
                  size: config.size,
                };
                setUploadedFiles([pdfFile]);
              });
          }
        } catch (error) {
          console.error("Error loading continueProcessConfig:", error);
        }
        setTimeout(() => {
          sessionStorage.removeItem("continueProcessConfig");
        }, 1000);
      }
    };
    loadInitialFile();
  }, []);

  const handleAddFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === "application/pdf") {
        // Create a fresh blob URL for consistent handling
        const previewUrl = URL.createObjectURL(file);

        const newFile: PDFFile = {
          id: Date.now().toString(),
          file,
          preview: previewUrl,
          name: file.name,
          size: (file.size / 1024 / 1024).toFixed(2) + " MB",
        };
        setUploadedFiles((prev) => [...prev, newFile]);
      } else {
        alert("Please select a PDF file");
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
      Array.from(files).forEach((file) => {
        if (file.type === "application/pdf") {
          // Create a fresh blob URL for consistent handling
          const previewUrl = URL.createObjectURL(file);

          const newFile: PDFFile = {
            id: Date.now().toString() + Math.random(),
            file,
            preview: previewUrl,
            name: file.name,
            size: (file.size / 1024 / 1024).toFixed(2) + " MB",
          };
          setUploadedFiles((prev) => [...prev, newFile]);
        }
      });
    }
  };

  const removeFile = (id: string) => {
    setUploadedFiles((prev) => {
      const fileToRemove = prev.find((f) => f.id === id);
      if (fileToRemove && fileToRemove.preview) {
        // Clean up the blob URL to prevent memory leaks
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prev.filter((f) => f.id !== id);
    });
  };

  const handleMerge = async () => {
    if (uploadedFiles.length < 2) return;

    setMergeProgress({
      isProcessing: true,
      progress: 0,
      speed: "0 MB/s",
      currentStep: "Preparing files...",
    });

    try {
      // Dynamic import to avoid SSR issues
      const { PDFDocument } = await import("pdf-lib");

      // Step 1: Create new document
      setMergeProgress((prev) => ({
        ...prev,
        progress: 10,
        currentStep: "Creating merged document...",
        speed: "1.2 MB/s",
      }));

      const mergedPdf = await PDFDocument.create();

      // Step 2: Process each file
      for (let i = 0; i < uploadedFiles.length; i++) {
        const file = uploadedFiles[i];

        setMergeProgress((prev) => ({
          ...prev,
          progress: 20 + (i * 60) / uploadedFiles.length,
          currentStep: `Processing ${file.name}...`,
          speed: "2.5 MB/s",
        }));

        // Read file as array buffer
        const arrayBuffer = await file.file.arrayBuffer();

        // Load PDF
        const pdf = await PDFDocument.load(arrayBuffer);

        // Copy all pages
        const pageIndices = pdf.getPageIndices();
        const copiedPages = await mergedPdf.copyPages(pdf, pageIndices);

        // Add pages to merged document
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      // Step 3: Generate final PDF
      setMergeProgress((prev) => ({
        ...prev,
        progress: 90,
        currentStep: "Generating merged PDF...",
        speed: "3.1 MB/s",
      }));

      const mergedPdfBytes = await mergedPdf.save();
      const mergedBlob = new Blob([new Uint8Array(mergedPdfBytes)], {
        type: "application/pdf",
      });
      const mergedPreview = URL.createObjectURL(mergedBlob);

      // Step 4: Complete
      setMergeProgress((prev) => ({
        ...prev,
        progress: 100,
        currentStep: "Merge complete!",
        speed: "0 MB/s",
      }));

      setTimeout(() => {
        setMergeProgress((prev) => ({ ...prev, isProcessing: false }));

        setMergedFile({
          preview: mergedPreview,
          downloadKey: "merged-" + Date.now(),
          blob: mergedBlob, // Store the blob for download
        });
      }, 500);
    } catch (error) {
      console.error("Error merging PDFs:", error);
      setMergeProgress((prev) => ({
        ...prev,
        isProcessing: false,
        currentStep: "Error occurred during merge",
      }));
      alert("Failed to merge PDFs. Please try again.");
    }
  };

  const handleDownload = () => {
    if (mergedFile?.blob) {
      // Create download link
      const downloadUrl = URL.createObjectURL(mergedFile.blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `merged-${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);
    } else {
      // Fallback: redirect to signup for authentication
      window.location.href =
        "/signup?redirect=download&file=" + mergedFile?.downloadKey;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Navigation />

      {/* Main Content - Fixed padding to avoid navbar overlap */}
      <div className="pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center space-x-4 mb-4">
              <button
                onClick={() => window.history.back()}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back</span>
              </button>
            </div>
            <div className="text-center">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Merge PDFs
              </h1>
              <p className="text-lg text-gray-600">
                Combine multiple PDF files into one seamless document
              </p>
            </div>
          </motion.div>

          {!mergedFile ? (
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
              {/* Left Side - Upload & Files */}
              <div className="xl:col-span-3 space-y-6">
                {/* Upload Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-semibold text-gray-900 mb-1">
                        PDF Files
                      </h2>
                      <p className="text-gray-600">
                        {uploadedFiles.length} file
                        {uploadedFiles.length !== 1 ? "s" : ""} uploaded
                      </p>
                    </div>
                    <label className="cursor-pointer">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="application/pdf"
                        multiple
                        className="hidden"
                        onChange={handleAddFile}
                      />
                      <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-200 transform hover:scale-105">
                        <Plus className="w-5 h-5" />
                        <span className="font-medium">Add PDF</span>
                      </div>
                    </label>
                  </div>

                  {uploadedFiles.length === 0 ? (
                    <div
                      className={`text-center py-16 border-2 border-dashed rounded-2xl transition-all duration-200 ${
                        isDragOver
                          ? "border-blue-400 bg-blue-50 scale-105"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <div className="text-gray-400 mb-6">
                        <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                          <FileText className="w-10 h-10" />
                        </div>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-700 mb-2">
                        Drop PDF files here
                      </h3>
                      <p className="text-gray-500 mb-4">
                        or click &ldquo;Add PDF&rdquo; to browse files
                      </p>
                      <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm">
                        📄 Minimum 2 files required for merging
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <Move className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-sm font-medium text-blue-800">
                            Drag files to reorder • Files will be merged in this
                            order
                          </span>
                        </div>
                        <div className="text-sm text-blue-600 font-medium">
                          {uploadedFiles.length >= 2
                            ? "✓ Ready to merge"
                            : "Need more files"}
                        </div>
                      </div>

                      <AnimatePresence>
                        {uploadedFiles.map((file, index) => (
                          <motion.div
                            key={file.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ delay: index * 0.05 }}
                            draggable
                            onDragStart={() => setDraggedItem(file.id)}
                            onDragEnd={() => setDraggedItem(null)}
                            className={`group flex items-center space-x-4 p-6 border-2 rounded-2xl transition-all duration-200 cursor-move ${
                              draggedItem === file.id
                                ? "border-blue-400 bg-blue-50 shadow-lg scale-105"
                                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50 hover:shadow-md"
                            }`}
                          >
                            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                              <span className="text-white font-bold text-lg">
                                {index + 1}
                              </span>
                            </div>

                            <div className="flex-shrink-0 w-16 h-16 bg-red-100 rounded-xl flex items-center justify-center border-2 border-red-200">
                              <span className="text-red-600 font-bold text-xs">
                                PDF
                              </span>
                            </div>

                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 truncate text-lg">
                                {file.name}
                              </h4>
                              <p className="text-gray-500 mt-1">{file.size}</p>
                              <div className="flex items-center space-x-4 mt-2">
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                  Position {index + 1}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => {
                                  // Create a new window/tab for better PDF viewing
                                  const newWindow = window.open("", "_blank");
                                  if (newWindow) {
                                    newWindow.document.write(`
                                      <!DOCTYPE html>
                                      <html>
                                        <head>
                                          <title>${file.name}</title>
                                          <style>
                                            body { margin: 0; padding: 0; background: #f5f5f5; }
                                            embed { width: 100vw; height: 100vh; }
                                          </style>
                                        </head>
                                        <body>
                                          <embed src="${file.preview}" type="application/pdf" width="100%" height="100%">
                                        </body>
                                      </html>
                                    `);
                                    newWindow.document.close();
                                  }
                                }}
                                className="p-3 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200 transition-colors"
                                title="Quick Look"
                              >
                                <Eye className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => removeFile(file.id)}
                                className="p-3 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-colors"
                                title="Remove"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>

                      {/* Add More Files Drop Zone */}
                      <div
                        className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all duration-200 ${
                          isDragOver
                            ? "border-blue-400 bg-blue-50"
                            : "border-gray-300 hover:border-blue-300 hover:bg-blue-25"
                        }`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                      >
                        <Plus className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500 font-medium">
                          Drop more PDF files here to add them
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Merge Button */}
                  {uploadedFiles.length >= 1 && !mergeProgress.isProcessing && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-8 text-center"
                    >
                      <button
                        onClick={handleMerge}
                        className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 text-white px-12 py-4 rounded-2xl font-bold text-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:rotate-1"
                      >
                        🚀 Merge {uploadedFiles.length} PDF{uploadedFiles.length > 1 ? 's' : ''} into One
                      </button>
                      <p className="text-gray-500 text-sm mt-3">
                        Files will be combined in the order shown above
                      </p>
                    </motion.div>
                  )}
                </motion.div>

                {/* Progress Section */}
                {mergeProgress.isProcessing && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8"
                  >
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                          className="w-8 h-8 border-2 border-white border-t-transparent rounded-full"
                        />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        Merging Your PDFs
                      </h3>
                      <p className="text-gray-600">
                        {mergeProgress.currentStep}
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Processing Speed</span>
                        <span className="text-blue-600 font-bold bg-blue-100 px-3 py-1 rounded-full">
                          {mergeProgress.speed}
                        </span>
                      </div>

                      <div className="relative">
                        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600 rounded-full relative"
                            initial={{ width: 0 }}
                            animate={{ width: `${mergeProgress.progress}%` }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                          >
                            <div className="absolute inset-0 bg-white opacity-30 animate-pulse" />
                          </motion.div>
                        </div>
                        <div className="absolute right-0 top-6 text-sm font-bold text-gray-900">
                          {mergeProgress.progress}%
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Right Side - Preview */}
              <div className="space-y-6">
                {uploadedFiles.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 sticky top-24"
                  >
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                      <Eye className="w-5 h-5 mr-2 text-blue-600" />
                      Live Preview
                    </h3>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {uploadedFiles.slice(0, 3).map((file, index) => (
                        <div
                          key={file.id}
                          className="border-2 border-gray-200 rounded-xl overflow-hidden hover:border-blue-300 transition-colors"
                        >
                          <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-4 py-2 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-700 truncate">
                                {index + 1}. {file.name}
                              </span>
                              <button
                                onClick={() => {
                                  const newWindow = window.open("", "_blank");
                                  if (newWindow) {
                                    newWindow.document.write(`
                                      <!DOCTYPE html>
                                      <html>
                                        <head>
                                          <title>${file.name}</title>
                                          <style>
                                            body { margin: 0; padding: 0; background: #f5f5f5; }
                                            embed { width: 100vw; height: 100vh; }
                                          </style>
                                        </head>
                                        <body>
                                          <embed src="${file.preview}" type="application/pdf" width="100%" height="100%">
                                        </body>
                                      </html>
                                    `);
                                    newWindow.document.close();
                                  }
                                }}
                                className="text-blue-600 hover:text-blue-800 transition-colors"
                                title="Quick Look"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <div className="relative bg-gray-100 h-32 flex items-center justify-center">
                            <div className="text-center">
                              <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                                <span className="text-white font-bold text-xs">
                                  PDF
                                </span>
                              </div>
                              <p className="text-xs text-gray-600 truncate max-w-full px-2">
                                {file.name}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {file.size}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                      {uploadedFiles.length > 3 && (
                        <div className="text-center py-6 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                          <p className="text-gray-500 font-medium">
                            + {uploadedFiles.length - 3} more files
                          </p>
                          <p className="text-sm text-gray-400 mt-1">
                            Scroll up to see all files
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          ) : (
            /* Result Page Layout */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto"
            >
              <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
                {/* Success Header */}
                <div className="bg-gradient-to-r from-green-500 to-blue-600 p-8 text-white text-center">
                  <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        delay: 0.2,
                        type: "spring",
                        stiffness: 200,
                      }}
                    >
                      ✅
                    </motion.div>
                  </div>
                  <h2 className="text-3xl font-bold mb-2">Merge Complete!</h2>
                  <p className="text-green-100">
                    Your {uploadedFiles.length} PDF files have been successfully
                    merged
                  </p>
                </div>

                <div className="p-8">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Preview Section */}
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                        <Eye className="w-5 h-5 mr-2 text-blue-600" />
                        Quick Look
                      </h3>
                      <div className="border-2 border-gray-200 rounded-2xl overflow-hidden">
                        <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">
                            merged-document.pdf
                          </span>
                          <button
                            onClick={() => {
                              const newWindow = window.open("", "_blank");
                              if (newWindow) {
                                newWindow.document.write(`
                                  <!DOCTYPE html>
                                  <html>
                                    <head>
                                      <title>Merged PDF Preview</title>
                                      <style>
                                        body { margin: 0; padding: 0; background: #f5f5f5; }
                                        embed { width: 100vw; height: 100vh; }
                                      </style>
                                    </head>
                                    <body>
                                      <embed src="${mergedFile.preview}" type="application/pdf" width="100%" height="100%">
                                    </body>
                                  </html>
                                `);
                                newWindow.document.close();
                              }
                            }}
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                            title="Full Screen Preview"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="bg-gray-100 h-64 flex items-center justify-center">
                          <div className="text-center">
                            <div className="w-16 h-16 bg-green-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                              <span className="text-white font-bold">PDF</span>
                            </div>
                            <p className="text-lg font-semibold text-gray-800 mb-2">
                              Merged Document
                            </p>
                            <p className="text-sm text-gray-600">
                              {uploadedFiles.length} files combined
                            </p>
                            <button
                              onClick={() => {
                                const newWindow = window.open("", "_blank");
                                if (newWindow) {
                                  newWindow.document.write(`
                                    <!DOCTYPE html>
                                    <html>
                                      <head>
                                        <title>Merged PDF Preview</title>
                                        <style>
                                          body { margin: 0; padding: 0; background: #f5f5f5; }
                                          embed { width: 100vw; height: 100vh; }
                                        </style>
                                      </head>
                                      <body>
                                        <embed src="${mergedFile.preview}" type="application/pdf" width="100%" height="100%">
                                      </body>
                                    </html>
                                  `);
                                  newWindow.document.close();
                                }
                              }}
                              className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
                            >
                              Click to Preview
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-5 h-5 text-amber-600 mt-0.5">
                            🔒
                          </div>
                          <div>
                            <p className="text-sm font-medium text-amber-800">
                              Sign in to download
                            </p>
                            <p className="text-sm text-amber-700 mt-1">
                              Create a free account to download your merged PDF
                              file
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions Section */}
                    <div className="space-y-6">
                      {/* Download Section */}
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">
                          Download Options
                        </h4>
                        <div className="space-y-3">
                          <button
                            onClick={handleDownload}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2"
                          >
                            <Download className="w-5 h-5" />
                            <span>Download Merged PDF</span>
                          </button>

                          <button
                            onClick={() => {
                              const newWindow = window.open("", "_blank");
                              if (newWindow) {
                                newWindow.document.write(`
                                  <!DOCTYPE html>
                                  <html>
                                    <head>
                                      <title>Merged PDF - Full Screen</title>
                                      <style>
                                        body { margin: 0; padding: 0; background: #f5f5f5; }
                                        embed { width: 100vw; height: 100vh; }
                                      </style>
                                    </head>
                                    <body>
                                      <embed src="${mergedFile.preview}" type="application/pdf" width="100%" height="100%">
                                    </body>
                                  </html>
                                `);
                                newWindow.document.close();
                              }
                            }}
                            className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
                          >
                            <Eye className="w-5 h-5" />
                            <span>Full Screen Preview</span>
                          </button>
                        </div>
                      </div>

                      {/* Share & Save Options */}
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                          <Share2 className="w-5 h-5 mr-2" />
                          Share & Save
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={() => {
                              // Google Drive integration
                              window.open(
                                "https://drive.google.com/drive/my-drive",
                                "_blank"
                              );
                            }}
                            className="flex flex-col items-center p-4 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group"
                          >
                            <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">
                              📁
                            </div>
                            <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">
                              Google Drive
                            </span>
                          </button>

                          <button
                            onClick={() => {
                              // Dropbox integration
                              window.open("https://www.dropbox.com", "_blank");
                            }}
                            className="flex flex-col items-center p-4 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group"
                          >
                            <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">
                              📦
                            </div>
                            <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">
                              Dropbox
                            </span>
                          </button>

                          <button
                            onClick={() => {
                              // Copy download link
                              const link = `${window.location.origin}/download/${mergedFile.downloadKey}`;
                              navigator.clipboard.writeText(link);
                              alert("Download link copied to clipboard!");
                            }}
                            className="flex flex-col items-center p-4 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group"
                          >
                            <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">
                              🔗
                            </div>
                            <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">
                              Copy Link
                            </span>
                          </button>

                          <button
                            onClick={() => {
                              // Generate QR code
                              const link = `${window.location.origin}/download/${mergedFile.downloadKey}`;
                              const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                                link
                              )}`;
                              window.open(qrCodeUrl, "_blank");
                            }}
                            className="flex flex-col items-center p-4 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group"
                          >
                            <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">
                              📱
                            </div>
                            <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">
                              QR Code
                            </span>
                          </button>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="pt-4 border-t border-gray-200 space-y-3">
                        <button
                          onClick={() => window.history.back()}
                          className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
                        >
                          <ArrowLeft className="w-5 h-5" />
                          <span>Back to Home</span>
                        </button>

                        <button
                          onClick={() => {
                            if (
                              confirm(
                                "Are you sure you want to delete this file?"
                              )
                            ) {
                              setMergedFile(null);
                              setUploadedFiles([]);
                            }
                          }}
                          className="w-full text-red-600 hover:bg-red-50 py-2 rounded-xl transition-colors flex items-center justify-center space-x-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Delete File</span>
                        </button>
                      </div>
                    </div>
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

export default MergePage;
