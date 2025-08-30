import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    // Handle pdfjs-dist properly for both server and client
    if (!isServer) {
      // Client-side: disable Node.js modules
      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false,
        fs: false,
        net: false,
        tls: false,
      };
    } else {
      // Server-side: allow Node.js modules but configure externals
      config.externals = config.externals || [];
      config.externals.push({
        canvas: "canvas",
        pdf2pic: "pdf2pic",
      });

      // Fix pdf-parse test file issue
      config.resolve.alias = {
        ...config.resolve.alias,
        "pdf-parse": require.resolve("pdf-parse"),
      };
    }

    // Disable parsing for pdfjs worker files
    config.module.rules.push({
      test: /pdf\.worker\.(min\.)?js/,
      type: "asset/resource",
      generator: {
        filename: "static/worker/[hash][ext][query]",
      },
    });

    return config;
  },
  serverExternalPackages: ["pdf2pic", "canvas", "sharp", "pdf-parse"],
};
export default nextConfig;
