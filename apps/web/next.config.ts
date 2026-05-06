import type { NextConfig } from "next";

// NEXT_PUBLIC_STRAPI_URL is the public Strapi URL — used for image remotePatterns
// so that Next.js image optimization can fetch cover images.
const strapiPublicUrl = process.env.NEXT_PUBLIC_STRAPI_URL || process.env.STRAPI_URL || "http://localhost:1337";
const strapiPublicHost = new URL(strapiPublicUrl).hostname;

const uniqueHosts = [strapiPublicHost];

const nextConfig: NextConfig = {
  allowedDevOrigins: ["bubbling-conical-charcoal.ngrok-free.dev"],
  images: {
    // In dev Strapi runs on localhost (private IP) which Next.js blocks by default.
    // Disabling optimization locally avoids the private-IP fetch entirely.
    unoptimized: process.env.NODE_ENV === "development",
    remotePatterns: [
      ...uniqueHosts.flatMap((host) => [
        { protocol: "http" as const, hostname: host, pathname: "/uploads/**" },
        { protocol: "https" as const, hostname: host, pathname: "/uploads/**" },
      ]),
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
