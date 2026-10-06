"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Upload,
  ImageIcon,
  Copy,
  Check,
  ExternalLink,
  Trash2,
  Edit3,
  RotateCcw,
  Folder,
} from "lucide-react";
import { uploadFileToR2, deleteFileFromR2 } from "@/utils/adminStore";

export interface R2UploadPickerProps {
  label: string;
  r2Key: string;
  currentUrl: string;
  onUploadSuccess: (newUrl: string) => void;
  onRemove?: () => void;
  accept?: string;
  isDark?: boolean;
}

export default function R2UploadPicker({
  label,
  r2Key,
  currentUrl,
  onUploadSuccess,
  onRemove,
  accept = "image/*",
  isDark = false,
}: R2UploadPickerProps) {
  const [targetKey, setTargetKey] = useState(r2Key);
  const [isCustomPath, setIsCustomPath] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync targetKey with default prop r2Key when r2Key updates (unless manually edited)
  useEffect(() => {
    if (!isCustomPath) {
      setTargetKey(r2Key);
    }
  }, [r2Key, isCustomPath]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Determine final key to upload to
    let keyToUse = targetKey.trim() || r2Key.trim() || "website/catalogue/products/new/image.webp";

    // If key has trailing slash or no extension, add proper extension/filename
    if (keyToUse.endsWith("/")) {
      keyToUse = `${keyToUse}${file.name}`;
    }

    setUploading(true);
    setUploadStatus("Uploading file to Cloudflare R2...");

    try {
      const res = await uploadFileToR2(file, keyToUse);
      setUploading(false);

      if (res.success && res.url) {
        onUploadSuccess(res.url);
        setUploadStatus(`Successfully uploaded to: ${keyToUse}`);
        setTimeout(() => setUploadStatus(null), 4000);
      } else {
        setUploadStatus(null);
        alert(`Failed to upload image to Cloudflare R2: ${res.error || "Unknown error"}`);
      }
    } catch (err: any) {
      setUploading(false);
      setUploadStatus(null);
      alert(`Upload error: ${err.message || "Failed to upload image"}`);
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleCopyLink = () => {
    if (!currentUrl) return;
    navigator.clipboard.writeText(currentUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleCopyKey = () => {
    if (!targetKey) return;
    navigator.clipboard.writeText(targetKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleResetKey = () => {
    setTargetKey(r2Key);
    setIsCustomPath(false);
  };

  const border = isDark ? "#21262D" : "#E5E7EB";
  const cardBg = isDark ? "#161B22" : "#FFFFFF";
  const textMain = isDark ? "#F0F6FC" : "#111827";
  const textMuted = isDark ? "#8B949E" : "#6B7280";
  const inputBg = isDark ? "#0D1117" : "#F8FAFC";
  const activeBlue = isDark ? "#38BDF8" : "#0077B6";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {/* Header with Title & Editable R2 Target Path */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "6px" }}>
        <label style={{ fontSize: "12.5px", fontWeight: 700, color: textMain }}>
          {label}
        </label>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px" }}>
          <span style={{ color: textMuted, fontWeight: 600 }}>R2 Upload Target:</span>
          <span
            style={{
              fontFamily: "monospace",
              color: isCustomPath ? "#D97706" : activeBlue,
              fontWeight: 700,
              background: isDark ? "#21262D" : "#EFF6FF",
              padding: "2px 6px",
              borderRadius: "4px",
              border: `1px solid ${border}`,
            }}
          >
            {targetKey}
          </span>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          background: isDark ? "#0D1117" : "#F8FAFC",
          border: `1px solid ${border}`,
          borderRadius: "10px",
          padding: "14px",
        }}
      >
        {/* R2 Target Storage Key Editable Bar */}
        <div
          style={{
            background: cardBg,
            border: `1px solid ${border}`,
            borderRadius: "8px",
            padding: "8px 12px",
            display: "flex",
            flexDirection: "column",
            gap: "6px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <label
              style={{
                fontSize: "11.5px",
                fontWeight: 700,
                color: textMain,
                display: "flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              <Folder size={13} style={{ color: activeBlue }} />
              <span>R2 Target Path / File Key (Type custom path if needed)</span>
            </label>
            {isCustomPath && (
              <button
                type="button"
                onClick={handleResetKey}
                style={{
                  background: "none",
                  border: "none",
                  color: "#D97706",
                  fontSize: "11px",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "3px",
                  padding: "2px 6px",
                }}
                title="Reset to default computed path"
              >
                <RotateCcw size={11} /> Reset Path
              </button>
            )}
          </div>

          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            <input
              type="text"
              value={targetKey}
              onChange={(e) => {
                setTargetKey(e.target.value);
                setIsCustomPath(true);
              }}
              placeholder="e.g. website/catalogue/products/new/image.webp"
              style={{
                flex: 1,
                padding: "6px 10px",
                borderRadius: "6px",
                border: `1px solid ${isCustomPath ? (isDark ? "#D97706" : "#F59E0B") : border}`,
                background: inputBg,
                color: textMain,
                fontSize: "12px",
                fontFamily: "monospace",
                outline: "none",
              }}
            />
            <button
              type="button"
              onClick={handleCopyKey}
              title="Copy R2 Target Key"
              style={{
                padding: "6px 8px",
                borderRadius: "6px",
                border: `1px solid ${border}`,
                background: inputBg,
                color: copiedKey ? "#059669" : textMuted,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "11px",
                fontWeight: 600,
              }}
            >
              {copiedKey ? <Check size={12} /> : <Copy size={12} />}
              <span>{copiedKey ? "Copied" : "Copy Key"}</span>
            </button>
          </div>
        </div>

        {/* Live Image Preview Thumbnail & Direct Link Inputs */}
        <div style={{ display: "flex", gap: "14px", alignItems: "flex-start", flexWrap: "wrap" }}>
          {/* Live Image Preview Thumbnail */}
          <div
            style={{
              width: "84px",
              height: "84px",
              borderRadius: "8px",
              overflow: "hidden",
              border: `1px solid ${border}`,
              flexShrink: 0,
              position: "relative",
              background: cardBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            }}
          >
            {currentUrl ? (
              <img
                src={currentUrl}
                alt={label}
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px", color: textMuted }}>
                <ImageIcon size={24} />
                <span style={{ fontSize: "10px", fontWeight: 600 }}>No Image</span>
              </div>
            )}
          </div>

          {/* Direct Link Input and File Upload Options */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "10px", minWidth: "260px" }}>
            <div>
              <label style={{ display: "block", fontSize: "11.5px", fontWeight: 700, color: textMain, marginBottom: "4px" }}>
                Image Link / URL (Type, Paste, or Edit directly)
              </label>
              <div style={{ display: "flex", gap: "6px" }}>
                <input
                  type="text"
                  value={currentUrl}
                  onChange={(e) => onUploadSuccess(e.target.value)}
                  placeholder="https://... or /api/media/..."
                  style={{
                    flex: 1,
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: `1px solid ${border}`,
                    background: cardBg,
                    color: textMain,
                    fontSize: "13px",
                    fontFamily: "monospace",
                    outline: "none",
                  }}
                />
                {currentUrl && (
                  <>
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      title="Copy Image URL"
                      style={{
                        padding: "8px 10px",
                        borderRadius: "6px",
                        border: `1px solid ${border}`,
                        background: cardBg,
                        color: copiedUrl ? "#059669" : textMuted,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        fontSize: "12px",
                        fontWeight: 600,
                      }}
                    >
                      {copiedUrl ? <Check size={14} /> : <Copy size={14} />}
                      <span>{copiedUrl ? "Copied" : "Copy"}</span>
                    </button>
                    <a
                      href={currentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Open Image in new tab"
                      style={{
                        padding: "8px 10px",
                        borderRadius: "6px",
                        border: `1px solid ${border}`,
                        background: cardBg,
                        color: textMuted,
                        display: "flex",
                        alignItems: "center",
                        textDecoration: "none",
                      }}
                    >
                      <ExternalLink size={14} />
                    </a>
                  </>
                )}
              </div>
            </div>

            {/* Upload File & Clear Buttons */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <input
                ref={fileInputRef}
                type="file"
                accept={accept}
                onChange={handleFileChange}
                style={{ display: "none" }}
              />

              <button
                type="button"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "7px 14px",
                  borderRadius: "6px",
                  border: `1px solid ${activeBlue}`,
                  background: isDark ? "#073B4C" : "#E0F2FE",
                  color: activeBlue,
                  fontWeight: 700,
                  fontSize: "12px",
                  cursor: uploading ? "not-allowed" : "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                <Upload size={13} />{" "}
                {uploading
                  ? "Uploading to Cloudflare R2..."
                  : currentUrl
                  ? "Upload & Replace Image File"
                  : "Upload Image File to R2"}
              </button>

              {currentUrl && (
                <button
                  type="button"
                  onClick={() => {
                    if (onRemove) {
                      deleteFileFromR2(targetKey);
                      onRemove();
                    } else {
                      onUploadSuccess("");
                    }
                  }}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    padding: "7px 12px",
                    borderRadius: "6px",
                    border: "1px solid #EF4444",
                    background: "transparent",
                    color: "#EF4444",
                    fontWeight: 700,
                    fontSize: "12px",
                    cursor: "pointer",
                  }}
                >
                  <Trash2 size={13} /> Clear Image
                </button>
              )}

              {uploadStatus && (
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    color: uploadStatus.startsWith("Success") ? "#059669" : activeBlue,
                  }}
                >
                  {uploadStatus}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
