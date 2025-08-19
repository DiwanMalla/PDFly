"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/Card";
import {
  FileText,
  Split,
  Compress,
  Edit3,
  Search,
  PenTool,
  Shield,
  Zap,
  Users,
  Cloud,
  BarChart3,
  Sparkles,
} from "@/components/ui/Icons";
import { motion } from "framer-motion";

const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: FileText,
      title: "Smart PDF Merge",
      description:
        "Combine multiple PDFs with intelligent bookmark preservation and content organization.",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: Split,
      title: "Intelligent Split",
      description:
        "Split large documents with AI-powered content recognition and automatic chapter detection.",
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: Compress,
      title: "AI Compression",
      description:
        "Reduce file sizes by up to 90% while maintaining visual quality using advanced algorithms.",
      color: "from-green-500 to-green-600",
    },
    {
      icon: Edit3,
      title: "Real-time Editing",
      description:
        "Collaborate on PDFs in real-time with multiple users, just like Google Docs.",
      color: "from-orange-500 to-orange-600",
    },
    {
      icon: Search,
      title: "Advanced OCR",
      description:
        "Convert scanned documents to searchable text with 99.5% accuracy across 100+ languages.",
      color: "from-red-500 to-red-600",
    },
    {
      icon: PenTool,
      title: "Digital Signatures",
      description:
        "Sign documents legally with secure digital signatures and certificate validation.",
      color: "from-indigo-500 to-indigo-600",
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description:
        "Military-grade encryption, SOC2 compliance, and zero-knowledge architecture.",
      color: "from-gray-500 to-gray-600",
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description:
        "Process documents 10x faster with edge computing and optimized algorithms.",
      color: "from-yellow-500 to-yellow-600",
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description:
        "Share workspaces, assign roles, and manage team permissions with enterprise controls.",
      color: "from-pink-500 to-pink-600",
    },
    {
      icon: Cloud,
      title: "Cloud Integration",
      description:
        "Seamlessly connect with Google Drive, Dropbox, OneDrive, and 20+ other platforms.",
      color: "from-cyan-500 to-cyan-600",
    },
    {
      icon: BarChart3,
      title: "Analytics Dashboard",
      description:
        "Track usage, monitor performance, and gain insights with comprehensive analytics.",
      color: "from-emerald-500 to-emerald-600",
    },
    {
      icon: Sparkles,
      title: "AI Assistant",
      description:
        "Get intelligent suggestions, auto-corrections, and content optimization powered by AI.",
      color: "from-violet-500 to-violet-600",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
    },
  };

  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full px-4 py-2 mb-6">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">
              Powerful Features
            </span>
          </div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Everything you need for
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              PDF processing
            </span>
          </h2>

          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            From basic operations to advanced AI-powered features, PDFly
            provides a comprehensive suite of tools for modern document
            workflows.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <motion.div key={index} variants={itemVariants}>
                <Card hover className="h-full group">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r ${feature.color} mb-4 group-hover:scale-110 transition-transform duration-300">
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-200">
                      {feature.title}
                    </h3>

                    <p className="text-gray-600 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-16"
        >
          <p className="text-gray-600 mb-6">
            Ready to experience the future of PDF processing?
          </p>
          <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-1">
            Start Free Trial
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
