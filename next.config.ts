import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    qualities: [75, 100],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "hindware.com",
      },
      {
        protocol: "https",
        hostname: "hindwarestg.blob.core.windows.net",
      },
      {
        protocol: "https",
        hostname: "rnvalves.media",
      },
      {
        protocol: "https",
        hostname: "rnvalves.com",
      },
      {
        protocol: "https",
        hostname: "www.rnvalves.com",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/contact/privacy",
        destination: "/privacy-policy",
        permanent: true,
      },
      {
        source: "/contact/return",
        destination: "/return-refund-policy",
        permanent: true,
      },
      {
        source: "/contact/terms-conditions",
        destination: "/terms-conditions",
        permanent: true,
      },
      {
        source: "/contact/certificates",
        destination: "/certificates",
        permanent: true,
      },
      {
        source: "/guest/register",
        destination: "/business-user-registration",
        permanent: true,
      },
      {
        source: "/our-csr",
        destination: "/corporate-social-responsibility",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self)" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
        ],
      },
      {
        source: "/videos/:path*",
        headers: [
          { key: "Accept-Ranges", value: "bytes" },
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/Insta-Reels/:path*",
        headers: [
          { key: "Accept-Ranges", value: "bytes" },
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
};

export default nextConfig;
