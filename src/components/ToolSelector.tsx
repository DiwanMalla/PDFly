"use client";

import React from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

interface Tool {
  id: string;
  name: string;
  description: string;
  icon: string;
  path: string;
  color: string;
  features: string[];
}

const tools: Tool[] = [
  {
    id: "compress",
    name: "Compress PDF",
    description: "Reduce PDF file size without losing quality",
    icon: "🗜️",
    path: "/tools/compress",
    color: "from-blue-500 to-blue-600",
    features: [
      "Multiple compression levels",
      "Maintains quality",
      "Fast processing",
    ],
  },
  {
    id: "convert",
    name: "Convert PDF",
    description: "Convert PDFs to Word, Excel, PowerPoint, images, or text",
    icon: "🔄",
    path: "/tools/convert",
    color: "from-purple-500 to-purple-600",
    features: ["Text extraction", "Multiple formats", "High accuracy"],
  },
  {
    id: "merge",
    name: "Merge PDFs",
    description: "Combine multiple PDF files into one document",
    icon: "📑",
    path: "/tools/merge",
    color: "from-green-500 to-green-600",
    features: ["Drag & drop reordering", "Unlimited files", "Preview pages"],
  },
  {
    id: "split",
    name: "Split PDF",
    description: "Extract specific pages or split into multiple files",
    icon: "✂️",
    path: "/tools/split",
    color: "from-red-500 to-red-600",
    features: [
      "Page range selection",
      "Single or multiple output",
      "Preview pages",
    ],
  },
];

interface ToolSelectorProps {
  currentTool?: string;
  className?: string;
}

const ToolSelector: React.FC<ToolSelectorProps> = ({
  currentTool,
  className = "",
}) => {
  const router = useRouter();

  const handleToolSelect = (tool: Tool) => {
    router.push(tool.path);
  };

  return (
    <div className={`${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {tools.map((tool) => (
          <motion.div
            key={tool.id}
            className={`relative overflow-hidden rounded-2xl bg-white shadow-lg border-2 transition-all duration-300 cursor-pointer ${
              currentTool === tool.id
                ? "border-blue-400 shadow-blue-100 scale-105"
                : "border-gray-200 hover:border-gray-300 hover:scale-102"
            }`}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleToolSelect(tool)}
          >
            {/* Tool Card Header */}
            <div className={`bg-gradient-to-r ${tool.color} p-6 text-white`}>
              <div className="flex items-center space-x-3">
                <div className="text-3xl">{tool.icon}</div>
                <div>
                  <h3 className="text-xl font-bold">{tool.name}</h3>
                  <p className="text-sm opacity-90">{tool.description}</p>
                </div>
              </div>
            </div>

            {/* Tool Features */}
            <div className="p-6">
              <ul className="space-y-2">
                {tool.features.map((feature, index) => (
                  <li
                    key={index}
                    className="flex items-center text-sm text-gray-600"
                  >
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Current Tool Indicator */}
            {currentTool === tool.id && (
              <div className="absolute top-4 right-4">
                <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
              </div>
            )}

            {/* Hover Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-blue-50 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ToolSelector;
