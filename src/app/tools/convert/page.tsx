"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navigation from "@/components/Navigation";
import { ArrowLeft, Download } from "@/components/ui/Icons";

const ConvertPage: React.FC = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [convertTo, setConvertTo] = useState("word");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [convertedResult, setConvertedResult] = useState<{
    format: string;
    size: string;
  } | null>(null);

  useEffect(() => {
    const storedFileBlob = sessionStorage.getItem("initialFileBlob");
    const storedFileData = sessionStorage.getItem("initialFile");

    if (storedFileBlob && storedFileData) {
      setPreviewUrl(storedFileBlob);
      const fileData = JSON.parse(storedFileData);
      setUploadedFile(new File([], fileData.name, { type: fileData.type }));

      sessionStorage.removeItem("initialFile");
      sessionStorage.removeItem("initialFileBlob");
    }
  }, []);

  const handleConvert = async () => {
    if (!uploadedFile) return;

    setIsProcessing(true);
    setProgress(0);

    const intervals = [20, 45, 70, 85, 100];
    for (const prog of intervals) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      setProgress(prog);
    }

    setTimeout(() => {
      const formatMap = {
        word: { ext: "DOCX", size: "1.8 MB" },
        excel: { ext: "XLSX", size: "1.2 MB" },
        powerpoint: { ext: "PPTX", size: "2.1 MB" },
        image: { ext: "JPG", size: "3.2 MB" },
        text: { ext: "TXT", size: "0.3 MB" },
      };

      setConvertedResult({
        format: formatMap[convertTo as keyof typeof formatMap].ext,
        size: formatMap[convertTo as keyof typeof formatMap].size,
      });
      setIsProcessing(false);
    }, 500);
  };

  const formatOptions = [
    {
      id: "word",
      name: "Word Document",
      desc: "Convert to DOCX format",
      icon: "📄",
    },
    {
      id: "excel",
      name: "Excel Spreadsheet",
      desc: "Convert to XLSX format",
      icon: "📊",
    },
    {
      id: "powerpoint",
      name: "PowerPoint",
      desc: "Convert to PPTX format",
      icon: "📈",
    },
    { id: "image", name: "Images", desc: "Extract as JPG files", icon: "🖼️" },
    { id: "text", name: "Text File", desc: "Extract text to TXT", icon: "📝" },
  ];

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
            <h1 className="text-3xl font-bold text-gray-900">Convert PDF</h1>
            <p className="text-gray-600">Transform your PDF to other formats</p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            {uploadedFile && (
              <div className="bg-white rounded-2xl shadow-sm border p-6">
                <h2 className="text-xl font-semibold mb-4">Convert To</h2>

                <div className="grid grid-cols-1 gap-3">
                  {formatOptions.map((option) => (
                    <label
                      key={option.id}
                      className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <input
                        type="radio"
                        name="format"
                        value={option.id}
                        checked={convertTo === option.id}
                        onChange={(e) => setConvertTo(e.target.value)}
                        className="text-blue-600"
                      />
                      <span className="text-2xl">{option.icon}</span>
                      <div className="flex-1">
                        <div className="font-medium">{option.name}</div>
                        <div className="text-sm text-gray-500">
                          {option.desc}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>

                {!isProcessing && !convertedResult && (
                  <button
                    onClick={handleConvert}
                    className="mt-6 w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700"
                  >
                    Convert PDF
                  </button>
                )}
              </div>
            )}

            {isProcessing && (
              <div className="bg-white rounded-2xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold mb-4">Converting...</h3>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-purple-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-center mt-2 text-sm text-gray-600">
                  {progress}%
                </p>
                <p className="text-center text-sm text-gray-500 mt-1">
                  Converting to{" "}
                  {formatOptions.find((f) => f.id === convertTo)?.name}...
                </p>
              </div>
            )}

            {convertedResult && (
              <div className="bg-white rounded-2xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold mb-4">
                  ✅ Conversion Complete!
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Format:</span>
                    <span className="font-medium">
                      {convertedResult.format}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>File size:</span>
                    <span className="font-medium">{convertedResult.size}</span>
                  </div>
                </div>

                <button
                  onClick={() => (window.location.href = "/signup")}
                  className="mt-4 w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 flex items-center justify-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Sign in to Download</span>
                </button>

                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-800">
                    🔒 Create a free account to download your converted file.
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

export default ConvertPage;
