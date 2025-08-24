"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navigation from "@/components/Navigation";
import { ArrowLeft } from "@/components/ui/Icons";

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
  } | null>(null);

  useEffect(() => {
    const loadInitialFile = () => {
      const storedFileBlob = sessionStorage.getItem("initialFileBlob");
      const storedFileData = sessionStorage.getItem("initialFile");

      if (storedFileBlob && storedFileData) {
        setPreviewUrl(storedFileBlob);
        const fileData = JSON.parse(storedFileData);
        setUploadedFile(new File([], fileData.name, { type: fileData.type }));
        setOriginalSize(fileData.size);

        sessionStorage.removeItem("initialFile");
        sessionStorage.removeItem("initialFileBlob");
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
                setUploadedFile(file);
                setPreviewUrl(previewUrl);
                setOriginalSize(config.size);
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

  const handleCompress = async () => {
    if (!uploadedFile) return;

    setIsProcessing(true);
    setProgress(0);

    const intervals = [25, 50, 75, 100];
    for (const prog of intervals) {
      await new Promise((resolve) => setTimeout(resolve, 600));
      setProgress(prog);
    }

    setTimeout(() => {
      const savings =
        compressionLevel === "high"
          ? "75%"
          : compressionLevel === "medium"
          ? "50%"
          : "25%";
      const newSize =
        compressionLevel === "high"
          ? "0.8 MB"
          : compressionLevel === "medium"
          ? "1.2 MB"
          : "1.8 MB";

      setCompressedResult({
        size: newSize,
        savings: savings,
      });
      setIsProcessing(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center space-x-4 mb-8"
        >
          <button
            onClick={() => window.history.back()}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Compress PDF</h1>
            <p className="text-gray-600">
              Reduce file size while maintaining quality
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            {uploadedFile && (
              <div className="bg-white rounded-2xl shadow-sm border p-6">
                <h2 className="text-xl font-semibold mb-4">
                  Compression Settings
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Original size: {originalSize}
                    </label>
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="compression"
                        value="low"
                        checked={compressionLevel === "low"}
                        onChange={(e) => setCompressionLevel(e.target.value)}
                      />
                      <div>
                        <div className="font-medium">Low Compression</div>
                        <div className="text-sm text-gray-500">
                          Best quality, larger file
                        </div>
                      </div>
                    </label>

                    <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="compression"
                        value="medium"
                        checked={compressionLevel === "medium"}
                        onChange={(e) => setCompressionLevel(e.target.value)}
                      />
                      <div>
                        <div className="font-medium">Medium Compression</div>
                        <div className="text-sm text-gray-500">
                          Balanced quality and size
                        </div>
                      </div>
                    </label>

                    <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="compression"
                        value="high"
                        checked={compressionLevel === "high"}
                        onChange={(e) => setCompressionLevel(e.target.value)}
                      />
                      <div>
                        <div className="font-medium">High Compression</div>
                        <div className="text-sm text-gray-500">
                          Smallest file, good quality
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                {!isProcessing && !compressedResult && (
                  <button
                    onClick={handleCompress}
                    className="mt-6 w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700"
                  >
                    Compress PDF
                  </button>
                )}
              </div>
            )}

            {isProcessing && (
              <div className="bg-white rounded-2xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold mb-4">Compressing...</h3>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-green-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-center mt-2 text-sm text-gray-600">
                  {progress}%
                </p>
              </div>
            )}

            {compressedResult && (
              <div className="bg-white rounded-2xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold mb-4">
                  ✅ Compression Complete!
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Original size:</span>
                    <span className="font-medium">{originalSize}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Compressed size:</span>
                    <span className="font-medium text-green-600">
                      {compressedResult.size}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Space saved:</span>
                    <span className="font-bold text-green-600">
                      {compressedResult.savings}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => (window.location.href = "/signup")}
                  className="mt-4 w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700"
                >
                  Sign in to Download
                </button>

                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-800">
                    🔒 Create a free account to download your compressed PDF.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div>
            {previewUrl && (
              <div className="bg-white rounded-2xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold mb-4">PDF Preview</h3>
                <iframe
                  src={previewUrl}
                  className="w-full h-96 border rounded-lg"
                  title="PDF Preview"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompressPage;
