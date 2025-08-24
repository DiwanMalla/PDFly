"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
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
                <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg lg:text-xl">
                    P
                  </span>
                </div>
                <span className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
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
                  const name = (form.elements.namedItem('name') as HTMLInputElement)?.value;
                  const email = (form.elements.namedItem('email') as HTMLInputElement)?.value;
                  const message = (form.elements.namedItem('feedback') as HTMLTextAreaElement)?.value;
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
