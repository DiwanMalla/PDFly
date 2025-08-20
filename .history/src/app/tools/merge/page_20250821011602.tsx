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
  } | null>(null);
  const [showShareOptions, setShowShareOptions] = useState(false);

  // Get initial file from home page
  useEffect(() => {
    const loadInitialFile = () => {
      const storedFileData = sessionStorage.getItem("initialFile");
      const storedFileBlob = sessionStorage.getItem("initialFileBlob");

      if (storedFileData && storedFileBlob) {
        try {
          const fileData = JSON.parse(storedFileData);
          const initialFile: PDFFile = {
            id: fileData.id,
            file: new File([], fileData.name, { type: fileData.type }), // Placeholder file object
            preview: storedFileBlob,
            name: fileData.name,
            size: fileData.size,
          };

          setUploadedFiles([initialFile]);

          // Clean up sessionStorage
          sessionStorage.removeItem("initialFile");
          sessionStorage.removeItem("initialFileBlob");
        } catch (error) {
          console.error("Error loading initial file:", error);
        }
      }
    };

    loadInitialFile();
  }, []);

  const handleAddFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === "application/pdf") {
        const newFile: PDFFile = {
          id: Date.now().toString(),
          file,
          preview: URL.createObjectURL(file),
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
      Array.from(files).forEach(file => {
        if (file.type === "application/pdf") {
          const newFile: PDFFile = {
            id: Date.now().toString() + Math.random(),
            file,
            preview: URL.createObjectURL(file),
            name: file.name,
            size: (file.size / 1024 / 1024).toFixed(2) + " MB",
          };
          setUploadedFiles((prev) => [...prev, newFile]);
        }
      });
    }
  };

  const handleFileReorder = (dragIndex: number, hoverIndex: number) => {
    const draggedFile = uploadedFiles[dragIndex];
    const newFiles = [...uploadedFiles];
    newFiles.splice(dragIndex, 1);
    newFiles.splice(hoverIndex, 0, draggedFile);
    setUploadedFiles(newFiles);
  };

  const removeFile = (id: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleMerge = async () => {
    if (uploadedFiles.length < 2) return;

    setMergeProgress({
      isProcessing: true,
      progress: 0,
      speed: "0 MB/s",
      currentStep: "Preparing files...",
    });

    // Simulate merge progress
    const steps = [
      { progress: 20, step: "Reading PDF files...", speed: "2.1 MB/s" },
      { progress: 40, step: "Analyzing structure...", speed: "3.5 MB/s" },
      { progress: 60, step: "Merging pages...", speed: "4.2 MB/s" },
      { progress: 80, step: "Optimizing output...", speed: "3.8 MB/s" },
      { progress: 100, step: "Finalizing...", speed: "1.9 MB/s" },
    ];

    for (const stepData of steps) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      setMergeProgress((prev) => ({
        ...prev,
        progress: stepData.progress,
        currentStep: stepData.step,
        speed: stepData.speed,
      }));
    }

    // Simulate completion
    setTimeout(() => {
      setMergeProgress((prev) => ({ ...prev, isProcessing: false }));
      setMergedFile({
        preview: uploadedFiles[0].preview, // Use first file's preview for demo
        downloadKey: "merged-" + Date.now(),
      });
    }, 500);
  };

  const handleDownload = () => {
    // Check if user is signed in
    // For demo, redirect to signup
    window.location.href =
      "/signup?redirect=download&file=" + mergedFile?.downloadKey;
  };

  const shareOptions = [
    {
      name: "Google Drive",
      icon: "📁",
      action: () => console.log("Save to Drive"),
    },
    {
      name: "Dropbox",
      icon: "📦",
      action: () => console.log("Save to Dropbox"),
    },
    { name: "Get Link", icon: "🔗", action: () => console.log("Get link") },
    { name: "QR Code", icon: "📱", action: () => console.log("Generate QR") },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center space-x-4">
            <button
              onClick={() => window.history.back()}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Merge PDFs</h1>
              <p className="text-gray-600 mt-1">
                Combine multiple PDF files into one document
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Side - Upload & Files */}
          <div className="lg:col-span-2 space-y-6">
            {/* Uploaded Files Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Uploaded Files ({uploadedFiles.length})
                </h2>
                <label className="cursor-pointer">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf"
                    multiple
                    className="hidden"
                    onChange={handleAddFile}
                  />
                  <div className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    <Plus className="w-4 h-4" />
                    <span>Add PDF</span>
                  </div>
                </label>
              </div>

              {uploadedFiles.length === 0 ? (
                <div 
                  className={`text-center py-12 border-2 border-dashed rounded-xl transition-colors ${
                    isDragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className="text-gray-400 mb-4">
                    <FileText className="w-12 h-12 mx-auto" />
                  </div>
                  <p className="text-gray-600 mb-2">
                    Drag & drop PDF files here or click "Add PDF"
                  </p>
                  <p className="text-sm text-gray-500">
                    Add at least 2 PDF files to merge
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    <span>Drag files to reorder them</span>
                    <span>{uploadedFiles.length >= 2 ? "Ready to merge" : "Add more files"}</span>
                  </div>
                  
                  <AnimatePresence>
                    {uploadedFiles.map((file, index) => (
                      <motion.div
                        key={file.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.1 }}
                        draggable
                        onDragStart={() => setDraggedItem(file.id)}
                        onDragEnd={() => setDraggedItem(null)}
                        className={`flex items-center space-x-4 p-4 border rounded-xl transition-all cursor-move hover:shadow-md ${
                          draggedItem === file.id ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <span className="text-blue-600 font-bold text-sm">
                            {index + 1}
                          </span>
                        </div>
                        
                        <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                          <span className="text-red-600 font-semibold text-xs">
                            PDF
                          </span>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {file.name}
                          </p>
                          <p className="text-sm text-gray-500">{file.size}</p>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => window.open(file.preview, '_blank')}
                            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                            title="Preview"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => removeFile(file.id)}
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                            title="Remove"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  {/* Drop zone for additional files */}
                  <div 
                    className={`border-2 border-dashed rounded-xl p-4 text-center transition-colors ${
                      isDragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <p className="text-sm text-gray-500">
                      Drop more PDF files here to add them
                    </p>
                  </div>
                </div>
              )}

              {/* Merge Button */}
              {uploadedFiles.length >= 2 &&
                !mergeProgress.isProcessing &&
                !mergedFile && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 text-center"
                  >
                    <button
                      onClick={handleMerge}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
                    >
                      Merge {uploadedFiles.length} PDFs
                    </button>
                  </motion.div>
                )}
            </motion.div>

            {/* Progress Section */}
            {mergeProgress.isProcessing && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Merging Progress
                </h3>

                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {mergeProgress.currentStep}
                    </span>
                    <span className="text-blue-600 font-medium">
                      {mergeProgress.speed}
                    </span>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <motion.div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${mergeProgress.progress}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Progress</span>
                    <span className="text-gray-900 font-medium">
                      {mergeProgress.progress}%
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Result Section */}
            {mergedFile && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    ✅ Merge Complete!
                  </h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => window.history.back()}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleDownload}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-amber-800">
                    🔒 <strong>Sign in required:</strong> Create a free account
                    to download your merged PDF.
                  </p>
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Side - Preview & Share */}
          <div className="space-y-6">
            {/* PDF Preview */}
            {uploadedFiles.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Preview
                </h3>
                <div className="space-y-4">
                  {uploadedFiles.slice(0, 2).map((file, index) => (
                    <div
                      key={file.id}
                      className="border border-gray-200 rounded-lg overflow-hidden"
                    >
                      <div className="bg-gray-50 px-3 py-2 text-sm text-gray-600">
                        File {index + 1}: {file.name}
                      </div>
                      <iframe
                        src={file.preview}
                        className="w-full h-40 border-0"
                        title={`Preview ${index + 1}`}
                      />
                    </div>
                  ))}
                  {uploadedFiles.length > 2 && (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      + {uploadedFiles.length - 2} more files
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Share Options */}
            {mergedFile && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Share & Save
                  </h3>
                  <button
                    onClick={() => setShowShareOptions(!showShareOptions)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {shareOptions.map((option) => (
                    <button
                      key={option.name}
                      onClick={option.action}
                      className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-2xl mb-1">{option.icon}</span>
                      <span className="text-sm text-gray-700">
                        {option.name}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button className="w-full flex items-center justify-center space-x-2 text-red-600 hover:bg-red-50 py-2 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                    <span>Delete File</span>
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MergePage;
