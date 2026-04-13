import type { NextConfig } from "next";

const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
const strapiHost = new URL(strapiUrl).hostname;

const nextConfig: NextConfig = {
  allowedDevOrigins: ["bubbling-conical-charcoal.ngrok-free.dev"],
  images: {
    // In dev Strapi runs on localhost (private IP) which Next.js blocks by default.
    // Disabling optimization locally avoids the private-IP fetch entirely.
    unoptimized: process.env.NODE_ENV === "development",
    remotePatterns: [
      {
        protocol: "http",
        hostname: strapiHost,
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: strapiHost,
        pathname: "/uploads/**",
      },
      // Cloudflare R2
      {
        protocol: "https",
        hostname: "*.r2.cloudflarestorage.com",
        pathname: "/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
