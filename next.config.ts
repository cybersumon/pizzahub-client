
import type { NextConfig } from "next";

// ============================================
// PIZZAHUB BACKEND CONFIGURATION
// ============================================

// Next.js forwards browser API requests to Express.
// Use a separate server-side variable for this URL.
const backendUrl = (
  process.env.PIZZAHUB_BACKEND_URL ||
  "http://localhost:7000"
).replace(/\/+$/, "");

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
