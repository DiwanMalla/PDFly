"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function AIAnonymizePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50">
      <div className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center"
        >
          {/* Coming Soon Badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-block mb-6"
          >
            <span className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-sm font-bold rounded-full shadow-lg">
              🚧 COMING SOON
            </span>
          </motion.div>

          {/* Main Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            className="text-8xl mb-8"
          >
            🔒
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent"
          >
            AI PII Removal
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed"
          >
            Advanced AI-powered detection and removal of Personally Identifiable
            Information (PII). Protect sensitive data while maintaining document
            usability and readability.
          </motion.p>

          {/* Features Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto"
          >
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-red-100 shadow-lg">
              <div className="text-4xl mb-4">🆔</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Identity Protection
              </h3>
              <p className="text-gray-600 text-sm">
                Detects and removes names, addresses, and IDs
              </p>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-red-100 shadow-lg">
              <div className="text-4xl mb-4">📞</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Contact Information
              </h3>
              <p className="text-gray-600 text-sm">
                Removes phone numbers, emails, and addresses
              </p>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-red-100 shadow-lg">
              <div className="text-4xl mb-4">💳</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Financial Data
              </h3>
              <p className="text-gray-600 text-sm">
                Protects credit cards, SSNs, and financial info
              </p>
            </div>
          </motion.div>

          {/* Notify Me Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-red-200 shadow-xl max-w-md mx-auto mb-8"
          >
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Get Notified When Available
            </h3>
            <div className="flex gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 border border-red-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-800"
              />
              <button className="px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl font-semibold hover:from-red-700 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl">
                Notify Me
              </button>
            </div>
          </motion.div>

          {/* Back to Tools */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Link
              href="/tools"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200"
            >
              ← Back to Tools
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
