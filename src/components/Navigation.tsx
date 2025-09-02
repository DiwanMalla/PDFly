"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "@/components/ui/Icons";
import Button from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";

const Navigation: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { name: "Features", href: "#features" },
    { name: "Pricing", href: "#pricing" },
    { name: "API", href: "#api" },
    { name: "About", href: "#about" },
  ];

  const toolItems = [
    {
      name: "Compress PDF",
      href: "/tools/compress",
      icon: "🗜️",
      desc: "Reduce file size",
    },
    {
      name: "Convert PDF",
      href: "/tools/convert",
      icon: "🔄",
      desc: "Change format",
    },
    {
      name: "Merge PDF",
      href: "/tools/merge",
      icon: "➕",
      desc: "Combine files",
    },
    {
      name: "Split PDF",
      href: "/tools/split",
      icon: "✂️",
      desc: "Separate pages",
    },
  ];

  const aiToolItems = [
    {
      name: "PDF to Markdown",
      href: "/tools/ai-convert",
      icon: "📝",
      desc: "AI-powered conversion",
      badge: "AI",
    },
    {
      name: "Smart Extract",
      href: "/tools/ai-extract",
      icon: "🧠",
      desc: "Extract structured data",
      badge: "AI",
    },
    {
      name: "Document Analysis",
      href: "/tools/ai-analyze",
      icon: "📊",
      desc: "Analyze & summarize",
      badge: "AI",
    },
    {
      name: "PII Removal",
      href: "/tools/ai-anonymize",
      icon: "🔒",
      desc: "Remove personal info",
      badge: "AI",
    },
  ];

  const [showFeedback, setShowFeedback] = useState(false);

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-lg"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 lg:h-20">
            {/* Logo */}
            <motion.div
              className="flex items-center"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Link href="/" className="flex items-center space-x-2">
                <Image
                  src="/logo.png"
                  alt="PDFly Logo"
                  width={96}
                  height={96}
                  className="w-20 h-20 lg:w-24 lg:h-24 object-contain drop-shadow-2xl rounded-2xl"
                  style={{ display: "block" }}
                  priority
                />
                <span className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                  PDFly
                </span>
              </Link>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors duration-200 relative group"
                >
                  {item.name}
                  <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200"></span>
                </Link>
              ))}

              {/* Tools Dropdown */}
              <div className="relative group">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative px-6 py-2.5 text-sm font-semibold flex items-center space-x-2 rounded-xl transition-all duration-300 bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-purple-700 border border-blue-500/20 backdrop-blur-sm"
                >
                  <span className="text-lg">🛠️</span>
                  <span>Tools</span>
                  <motion.span className="text-sm transform transition-transform duration-200 group-hover:rotate-180">
                    ⌄
                  </motion.span>
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400/20 to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </motion.button>

                <AnimatePresence>
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute left-0 mt-3 w-[520px] p-6 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)",
                      boxShadow:
                        "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(59, 130, 246, 0.1)",
                    }}
                  >
                    {/* Standard PDF Tools Section */}
                    <div className="mb-6">
                      <h3 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                        PDF Tools
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Essential PDF utilities
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-6">
                      {toolItems.map((tool, index) => (
                        <motion.div
                          key={tool.name}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Link
                            href={tool.href}
                            className="group/item relative flex items-center p-4 rounded-2xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200 border border-transparent hover:border-blue-200/50 hover:shadow-lg"
                          >
                            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center mr-3 group-hover/item:scale-110 transition-transform duration-200">
                              <span className="text-xl">{tool.icon}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-900 group-hover/item:text-blue-700 transition-colors">
                                {tool.name}
                              </p>
                              <p className="text-xs text-gray-500 mt-0.5">
                                {tool.desc}
                              </p>
                            </div>
                            <div className="opacity-0 group-hover/item:opacity-100 transition-opacity duration-200">
                              <span className="text-blue-600">→</span>
                            </div>
                          </Link>
                        </motion.div>
                      ))}
                    </div>

                    {/* AI-Powered Tools Section */}
                    <div className="border-t border-gray-200/50 pt-6">
                      <div className="mb-4 flex items-center gap-2">
                        <h3 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                          AI-Powered Tools
                        </h3>
                        <span className="px-2 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 text-xs font-bold rounded-full">
                          NEW
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mb-4">
                        Advanced AI-driven document processing
                      </p>

                      <div className="grid grid-cols-2 gap-3">
                        {aiToolItems.map((tool, index) => (
                          <motion.div
                            key={tool.name}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: (toolItems.length + index) * 0.05 }}
                          >
                            <Link
                              href={tool.href}
                              className="group/item relative flex items-center p-4 rounded-2xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-200 border border-transparent hover:border-purple-200/50 hover:shadow-lg"
                            >
                              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center mr-3 group-hover/item:scale-110 transition-transform duration-200 relative">
                                <span className="text-xl">{tool.icon}</span>
                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                                  AI
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900 group-hover/item:text-purple-700 transition-colors">
                                  {tool.name}
                                </p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                  {tool.desc}
                                </p>
                              </div>
                              <div className="opacity-0 group-hover/item:opacity-100 transition-opacity duration-200">
                                <span className="text-purple-600">→</span>
                              </div>
                            </Link>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-200/50">
                      <Link
                        href="/tools"
                        className="block w-full text-center py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 hover:shadow-lg"
                      >
                        View All Tools
                      </Link>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Suggest/Report Bug Button */}
              <button
                onClick={() => setShowFeedback(true)}
                className="px-3 py-2 text-sm font-medium rounded-lg bg-orange-100 text-orange-700 hover:bg-orange-200 transition-colors duration-200 border border-orange-200"
                title="Suggest a feature or report a bug"
              >
                Suggest / Report Bug
              </button>
            </div>

            {/* Desktop Auth Buttons */}
            <div className="hidden lg:flex items-center space-x-4">
              <Link
                href="/auth/signin"
                className="text-gray-600 hover:text-gray-900 px-4 py-2 text-sm font-medium transition-colors duration-200"
              >
                Sign In
              </Link>
              <Button size="lg">Get Started Free</Button>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden bg-white/95 backdrop-blur-lg border-b border-gray-200"
            >
              <div className="px-4 py-6 space-y-4">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="block text-gray-600 hover:text-gray-900 py-2 text-base font-medium transition-colors duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                {/* Suggest/Report Bug Button (Mobile) */}
                <button
                  onClick={() => {
                    setShowFeedback(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full py-2 mt-2 text-orange-700 bg-orange-100 rounded-lg font-medium hover:bg-orange-200 transition-colors border border-orange-200"
                  title="Suggest a feature or report a bug"
                >
                  Suggest / Report Bug
                </button>
                <div className="pt-4 space-y-2">
                  <Link
                    href="/auth/signin"
                    className="block w-full text-center py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Button className="w-full" size="lg">
                    Get Started Free
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Feedback Modal (outside nav for correct stacking) */}
      <AnimatePresence>
        {showFeedback && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
          >
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full border border-gray-200 relative">
              <button
                onClick={() => setShowFeedback(false)}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
              >
                <span className="text-xl">×</span>
              </button>
              <h2 className="text-xl font-bold mb-2 text-orange-700">
                Suggest a Feature / Report a Bug
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Help us improve PDFly! Share your suggestions or report any
                issues below.
              </p>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const form = e.target as HTMLFormElement;
                  const name = (
                    form.elements.namedItem("name") as HTMLInputElement
                  )?.value;
                  const email = (
                    form.elements.namedItem("email") as HTMLInputElement
                  )?.value;
                  const message = (
                    form.elements.namedItem("feedback") as HTMLTextAreaElement
                  )?.value;
                  const res = await fetch("/api/suggestion", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name, email, message }),
                  });
                  if (res.ok) {
                    form.reset();
                    setShowFeedback(false);
                    alert("Thank you for your feedback!");
                  } else {
                    alert("Failed to submit feedback. Please try again.");
                  }
                }}
              >
                <input
                  type="text"
                  name="name"
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm mb-3 text-gray-900 placeholder:text-orange-600"
                  placeholder="Your name (optional)"
                />
                <textarea
                  name="feedback"
                  required
                  rows={5}
                  className="w-full p-3 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm mb-3 text-gray-900 placeholder:text-orange-600"
                  placeholder="Describe your suggestion or bug..."
                />
                <input
                  type="email"
                  name="email"
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm mb-3 text-gray-900 placeholder:text-orange-600"
                  placeholder="Your email (optional)"
                />
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-orange-600 to-pink-600 text-white py-2 rounded-lg font-bold hover:shadow-lg transition-all duration-300"
                >
                  Submit Feedback
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navigation;
