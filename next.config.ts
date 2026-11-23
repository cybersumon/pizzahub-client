
import type { NextConfig } from "next";

// ============================================
// PIZZAHUB BACKEND CONFIGURATION
// ============================================

// Next.js forwards browser API requests to Express.
// Use a separate server-side variable for this URL.
// Read the backend URL and remove extra whitespace.
const backendUrl = (
  process.env.PIZZAHUB_BACKEND_URL ||
  "http://localhost:7000"
)
  .trim()
  .replace(/\/+$/, "");

// Validate the backend URL before creating rewrites.
if (!/^https?:\/\//.test(backendUrl)) {
  throw new Error(
    "PIZZAHUB_BACKEND_URL must start with http:// or https://"
  );
}

const nextConfig: NextConfig = {
  // ==========================================
  // EXISTING NEXT.JS CONFIGURATION
  // ==========================================

  cacheComponents: true,
  partialPrefetching: true,

  // Preserve existing Turbopack CSS configuration.
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },

  // ==========================================
  // EXTERNAL IMAGE CONFIGURATION
  // ==========================================

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.ibb.co",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "ibb.co.com",
        pathname: "/**",
      },
    ],
  },

  // ==========================================
  // SAME-ORIGIN EXPRESS API PROXY
  // ==========================================

  async rewrites() {
    return [
      {
        // Browser requests /api/* on the Next.js domain.
        source: "/api/:path*",

        // Forward the request to Express.
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
