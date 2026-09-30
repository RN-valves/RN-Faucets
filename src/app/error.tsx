"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Root Application Error:", error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        background: "#F9FAFB",
        fontFamily: "'Manrope', system-ui, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "480px",
          width: "100%",
          background: "#FFFFFF",
          border: "1px solid #E5E7EB",
          borderRadius: "16px",
          padding: "36px 28px",
          textAlign: "center",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.08)",
        }}
      >
        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            background: "#FEE2E2",
            color: "#DC2626",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
          }}
        >
          <AlertCircle size={30} />
        </div>

        <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#111827", margin: "0 0 8px" }}>
          Something went wrong
        </h2>

        <p style={{ fontSize: "14px", color: "#6B7280", margin: "0 0 24px", lineHeight: "1.5" }}>
          {error?.message || "An unexpected error occurred while loading this page."}
        </p>

        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              padding: "10px 20px",
              background: "#0077B6",
              color: "#FFFFFF",
              border: "none",
              borderRadius: "8px",
              fontSize: "13.5px",
              fontWeight: 700,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <RefreshCw size={14} /> Try Again
          </button>

          <Link
            href="/"
            style={{
              padding: "10px 20px",
              background: "#F3F4F6",
              color: "#374151",
              borderRadius: "8px",
              fontSize: "13.5px",
              fontWeight: 700,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <Home size={14} /> Go to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
