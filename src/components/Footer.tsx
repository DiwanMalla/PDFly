"use client";

import React from "react";
import Link from "next/link";
import {
  FileText,
  Globe,
  Smartphone,
  Laptop,
  Shield,
  CheckCircle,
} from "@/components/ui/Icons";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: "Product",
      links: [
        { name: "Features", href: "#features" },
        { name: "Pricing", href: "#pricing" },
        { name: "API", href: "#api" },
        { name: "Integrations", href: "/integrations" },
        { name: "Security", href: "/security" },
        { name: "Changelog", href: "/changelog" },
      ],
    },
    {
      title: "Tools",
      links: [
        { name: "Merge PDF", href: "/tools/merge" },
        { name: "Split PDF", href: "/tools/split" },
        { name: "Compress PDF", href: "/tools/compress" },
        { name: "Convert PDF", href: "/tools/convert" },
        { name: "Edit PDF", href: "/tools/edit" },
        { name: "Sign PDF", href: "/tools/sign" },
      ],
    },
    {
      title: "Resources",
      links: [
        { name: "Blog", href: "/blog" },
        { name: "Help Center", href: "/help" },
        { name: "Documentation", href: "/docs" },
        { name: "Tutorials", href: "/tutorials" },
        { name: "PDF Guide", href: "/guide" },
        { name: "Templates", href: "/templates" },
      ],
    },
    {
      title: "Company",
      links: [
        { name: "About Us", href: "/about" },
        { name: "Careers", href: "/careers" },
        { name: "Contact", href: "/contact" },
        { name: "Press", href: "/press" },
        { name: "Partners", href: "/partners" },
        { name: "Affiliates", href: "/affiliates" },
      ],
    },
  ];

  const features = [
    { icon: Shield, text: "Enterprise Security" },
    { icon: CheckCircle, text: "99.9% Uptime" },
    { icon: Globe, text: "150+ Countries" },
    { icon: FileText, text: "10M+ Files Processed" },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-6">
              <img
                src="/logo.png"
                alt="PDFly Logo"
                className="w-20 h-20 object-contain drop-shadow-2xl rounded-2xl bg-white p-1 mx-2"
                style={{ display: "block", backgroundColor: "white" }}
              />
              <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                PDFly
              </span>
            </div>

            <p className="text-gray-400 mb-6 text-sm leading-relaxed">
              Transform your PDF workflow with AI-powered tools. Trusted by
              millions of users worldwide for secure, fast, and reliable
              document processing.
            </p>

            {/* Trust Indicators */}
            <div className="grid grid-cols-2 gap-3">
              {features.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <div key={index} className="flex items-center space-x-2">
                    <IconComponent className="w-4 h-4 text-blue-400" />
                    <span className="text-xs text-gray-400">
                      {feature.text}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Links Sections */}
          {footerSections.map((section, index) => (
            <div key={index}>
              <h3 className="font-semibold text-white mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-white text-sm transition-colors duration-200"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter Section */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Stay updated with PDFly
              </h3>
              <p className="text-gray-400 text-sm">
                Get the latest features, tips, and news delivered to your inbox.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-200 whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* App Download Section */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
            <div>
              <h3 className="font-semibold text-white mb-2">
                Get PDFly on all your devices
              </h3>
              <p className="text-gray-400 text-sm">
                Work seamlessly across desktop, mobile, and web.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button className="flex items-center space-x-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors duration-200">
                <Laptop className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-300">Desktop App</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors duration-200">
                <Smartphone className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-300">Mobile App</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors duration-200">
                <Globe className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-300">Web App</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-400">
              <span>© {currentYear} PDFly. All rights reserved.</span>
              <Link
                href="/privacy"
                className="hover:text-white transition-colors duration-200"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="hover:text-white transition-colors duration-200"
              >
                Terms of Service
              </Link>
              <Link
                href="/cookies"
                className="hover:text-white transition-colors duration-200"
              >
                Cookie Policy
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-400">
                Available in 25+ languages
              </span>
              <select className="bg-gray-800 border border-gray-700 text-gray-300 text-sm rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>English</option>
                <option>Español</option>
                <option>Français</option>
                <option>Deutsch</option>
                <option>日本語</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
