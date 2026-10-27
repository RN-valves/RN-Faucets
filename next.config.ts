import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  compress: true,
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
    serverActions: {
      bodySizeLimit: "100mb",
    },
  },
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75, 85, 100],
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
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "www.rnvalves.com",
          },
        ],
        destination: "https://rnvalves.com/:path*",
        statusCode: 301,
      },
      {
        source: "/index",
        destination: "/",
        statusCode: 301,
      },
      {
        source: "/index.html",
        destination: "/",
        statusCode: 301,
      },
      {
        source: "/index.php",
        destination: "/",
        statusCode: 301,
      },
      {
        source: "/contact/privacy",
        destination: "/privacy-policy",
        statusCode: 301,
      },
      {
        source: "/contact/return",
        destination: "/return-refund-policy",
        statusCode: 301,
      },
      {
        source: "/contact/terms-conditions",
        destination: "/terms-conditions",
        statusCode: 301,
      },
      {
        source: "/contact/certificates",
        destination: "/certificates",
        statusCode: 301,
      },
      {
        source: "/guest/register",
        destination: "/business-user-registration",
        statusCode: 301,
      },
      {
        source: "/our-csr",
        destination: "/corporate-social-responsibility",
        statusCode: 301,
      },
      {
        source: "/catalogue",
        destination: "/catalogues",
        statusCode: 301,
      },
      {
        source: "/blog",
        destination: "/blogs",
        statusCode: 301,
      },
      {
        source: "/about",
        destination: "/about-us",
        statusCode: 301,
      },
      {
        source: "/contact",
        destination: "/contact-us",
        statusCode: 301,
      },
      {
        source: "/careers",
        destination: "/career",
        statusCode: 301,
      },
      {
        source: "/terms-of-service",
        destination: "/terms-conditions",
        statusCode: 301,
      },
    ];
  },
  async headers() {
    return [
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
      {
        source: "/.well-known/-/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
        ],
      },
      {
        source: "/:path*",
        headers: [
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
