"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import { ArrowLeft, Download, Share2, Trash2 } from '@/components/ui/Icons';

const SplitPage: React.FC = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [splitOptions, setSplitOptions] = useState({
    mode: 'pages', // 'pages' or 'range'
    pages: '',
    ranges: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [splitResults, setSplitResults] = useState<string[]>([]);

  useEffect(() => {
    // Load initial file from home page
    const storedFileBlob = sessionStorage.getItem('initialFileBlob');
    const storedFileData = sessionStorage.getItem('initialFile');
    
    if (storedFileBlob && storedFileData) {
      setPreviewUrl(storedFileBlob);
      const fileData = JSON.parse(storedFileData);
      setUploadedFile(new File([], fileData.name, { type: fileData.type }));
      
      // Clean up
      sessionStorage.removeItem('initialFile');
      sessionStorage.removeItem('initialFileBlob');
    }
  }, []);

  const handleSplit = async () => {
    if (!uploadedFile) return;
    
    setIsProcessing(true);
    setProgress(0);
    
    // Simulate split progress
    const intervals = [20, 40, 60, 80, 100];
    for (const prog of intervals) {
      await new Promise(resolve => setTimeout(resolve, 500));
      setProgress(prog);
    }
    
    // Simulate split results
    setTimeout(() => {
      setSplitResults(['page_1.pdf', 'page_2.pdf', 'page_3.pdf']);
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
            <h1 className="text-3xl font-bold text-gray-900">Split PDF</h1>
            <p className="text-gray-600">Separate pages from your PDF document</p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Options */}
          <div className="space-y-6">
            {uploadedFile && (
              <div className="bg-white rounded-2xl shadow-sm border p-6">
                <h2 className="text-xl font-semibold mb-4">Split Options</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        checked={splitOptions.mode === 'pages'}
                        onChange={() => setSplitOptions(prev => ({ ...prev, mode: 'pages' }))}
                      />
                      <span>Split by page numbers</span>
                    </label>
                    {splitOptions.mode === 'pages' && (
                      <input
                        type="text"
                        placeholder="e.g., 1,3,5-7"
                        className="mt-2 w-full p-2 border rounded-lg"
                        value={splitOptions.pages}
                        onChange={(e) => setSplitOptions(prev => ({ ...prev, pages: e.target.value }))}
                      />
                    )}
                  </div>
                  
                  <div>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        checked={splitOptions.mode === 'range'}
                        onChange={() => setSplitOptions(prev => ({ ...prev, mode: 'range' }))}
                      />
                      <span>Split by ranges</span>
                    </label>
                    {splitOptions.mode === 'range' && (
                      <input
                        type="text"
                        placeholder="e.g., 1-3,4-6,7-10"
                        className="mt-2 w-full p-2 border rounded-lg"
                        value={splitOptions.ranges}
                        onChange={(e) => setSplitOptions(prev => ({ ...prev, ranges: e.target.value }))}
                      />
                    )}
                  </div>
                </div>

                {!isProcessing && splitResults.length === 0 && (
                  <button
                    onClick={handleSplit}
                    className="mt-6 w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700"
                  >
                    Split PDF
                  </button>
                )}
              </div>
            )}

            {/* Progress */}
            {isProcessing && (
              <div className="bg-white rounded-2xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold mb-4">Splitting Progress</h3>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-center mt-2 text-sm text-gray-600">{progress}%</p>
              </div>
            )}

            {/* Results */}
            {splitResults.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold mb-4">✅ Split Complete!</h3>
                <div className="space-y-2">
                  {splitResults.map((result, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">{result}</span>
                      <button
                        onClick={() => window.location.href = '/signup'}
                        className="text-blue-600 hover:underline"
                      >
                        Download
                      </button>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-800">
                    🔒 Sign in required to download split files.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right Side - Preview */}
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

export default SplitPage;
