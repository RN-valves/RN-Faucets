"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import AdminHeader from "@/components/admin/AdminHeader";
import { useAdminTheme } from "@/app/admin/layout";
import * as XLSX from "xlsx";
import {
  ArrowLeft,
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  FileCode,
} from "lucide-react";

export default function BulkProductImagesImportPage() {
  const { theme, toggleTheme } = useAdminTheme();

  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [resultMessage, setResultMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const isDark = theme === "dark";

  const cardBg = isDark ? "#0D1117" : "#FFFFFF";
  const border = isDark ? "#21262D" : "#E5E7EB";
  const textMain = isDark ? "#F0F6FC" : "#111827";
  const textMuted = isDark ? "#8B949E" : "#6B7280";
  const inputBg = isDark ? "#161B22" : "#F9FAFB";
  const shadow = isDark ? "none" : "0 2px 10px rgba(0, 0, 0, 0.04)";

  // Sample data for Add New Template
  const addNewSampleRow = [
    {
      sku_code: "F410011GRT",
      image: "/api/media/website/catalogue/products/default/image.webp",
    },
  ];

  // Sample data for Update Template
  const updateSampleRow = [
    {
      id: "PROD-101_img_0",
      article: "ART-01",
      sku_code: "F410011GRT",
      image: "/api/media/website/catalogue/products/default/image.webp",
    },
  ];

  // Download Add New Template (.xlsx)
  const handleDownloadAddNewTemplate = () => {
    const ws = XLSX.utils.json_to_sheet(addNewSampleRow);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Add Images Template");
    XLSX.writeFile(wb, `product_images_add_template.xlsx`);
  };

  // Download Update Template (.xlsx)
  const handleDownloadUpdateTemplate = () => {
    const ws = XLSX.utils.json_to_sheet(updateSampleRow);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Update Images Template");
    XLSX.writeFile(wb, `product_images_update_template.xlsx`);
  };

  // File Change Handler (.xlsx, .xls, .csv, .json)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setResultMessage(null);

    const fileName = selectedFile.name.toLowerCase();

    if (fileName.endsWith(".json")) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const text = evt.target?.result as string;
          const parsed = JSON.parse(text);
          setParsedData(Array.isArray(parsed) ? parsed : parsed.images || []);
        } catch {
          alert("Invalid JSON file syntax.");
        }
      };
      reader.readAsText(selectedFile);
    } else if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls") || fileName.endsWith(".csv")) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const data = new Uint8Array(evt.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonRows = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
          setParsedData(jsonRows);
        } catch (err) {
          console.error("Excel parse error:", err);
          alert("Failed to parse file.");
        }
      };
      reader.readAsArrayBuffer(selectedFile);
    } else {
      alert("Unsupported file format.");
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedData.length === 0) {
      alert("No valid image data found to upload.");
      return;
    }

    setUploading(true);
    setResultMessage(null);

    try {
      const res = await fetch("/api/product-images/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsedData),
      });

      const data = await res.json();
      if (res.ok) {
        setResultMessage(data.message);
        setParsedData([]);
        setFile(null);
      } else {
        alert(data.error || "Bulk product images import failed.");
      }
    } catch (err: any) {
      alert(err.message || "Failed to upload.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <AdminHeader
        title="Product Images Bulk Import"
        subtitle="Bulk map or update product gallery image URLs via Excel (.xlsx / .xls), CSV, or JSON spreadsheets."
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <main style={{ padding: "32px", maxWidth: "1100px", margin: "0 auto", width: "100%", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* Navigation Action Bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link
            href="/admin/catalogue/product-images"
            style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: textMuted, textDecoration: "none", fontWeight: 700, fontSize: "14px" }}
          >
            <ArrowLeft size={16} /> Back to Product Images
          </Link>
        </div>

        {/* Section 1: Template Download Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: "16px", padding: "24px", boxShadow: shadow, display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#0077B6" }}>
              <FileSpreadsheet size={24} />
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 800, color: textMain }}>1. Download Add New Template</h3>
            </div>
            <p style={{ margin: 0, fontSize: "13px", color: textMuted, lineHeight: "1.5" }}>
              Download a template with `sku_code` and `image` columns to batch add new gallery images to products.
            </p>
            <div>
              <button
                onClick={handleDownloadAddNewTemplate}
                style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "10px 18px", borderRadius: "8px", border: "1px solid #0077B6", background: "#E0F2FE", color: "#0077B6", fontWeight: 700, fontSize: "13px", cursor: "pointer" }}
              >
                <Download size={15} /> Add New Template (.xlsx)
              </button>
            </div>
          </div>

          <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: "16px", padding: "24px", boxShadow: shadow, display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#D97706" }}>
              <FileCode size={24} />
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 800, color: textMain }}>2. Download Update Template</h3>
            </div>
            <p style={{ margin: 0, fontSize: "13px", color: textMuted, lineHeight: "1.5" }}>
              Update template includes `id`, `article`, `sku_code`, and `image` to replace existing product image mappings.
            </p>
            <div>
              <button
                onClick={handleDownloadUpdateTemplate}
                style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "10px 18px", borderRadius: "8px", border: "1px solid #D97706", background: "#FEF3C7", color: "#B45309", fontWeight: 700, fontSize: "13px", cursor: "pointer" }}
              >
                <Download size={15} /> Update Template (.xlsx)
              </button>
            </div>
          </div>
        </div>

        {/* Section 2: Upload File Card */}
        <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: "16px", padding: "32px", boxShadow: shadow }}>
          <form onSubmit={handleUploadSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <h3 style={{ margin: 0, fontSize: "17px", fontWeight: 800, color: textMain }}>
              Ready to submit a completed file?
            </h3>

            {resultMessage && (
              <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "14px", borderRadius: "8px", background: "#D1FAE5", border: "1px solid #10B981", color: "#065F46", fontWeight: 700, fontSize: "14px" }}>
                <CheckCircle2 size={18} />
                <span>{resultMessage}</span>
              </div>
            )}

            <div style={{ border: `2px dashed ${border}`, borderRadius: "12px", padding: "36px", textAlign: "center", background: inputBg, display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
              <FileSpreadsheet size={40} style={{ color: "#0077B6" }} />
              <span style={{ fontSize: "15px", fontWeight: 800, color: textMain }}>
                {file ? file.name : "Select an Excel (.xlsx / .xls), CSV, or JSON file"}
              </span>
              <span style={{ fontSize: "12px", color: textMuted }}>
                Supported extensions: .xlsx, .xls, .csv, .json
              </span>

              <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv,.json" onChange={handleFileChange} style={{ display: "none" }} />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{ padding: "10px 20px", borderRadius: "8px", border: `1px solid ${border}`, background: cardBg, color: textMain, fontWeight: 700, fontSize: "13px", cursor: "pointer" }}
              >
                {file ? "Choose Different File" : "Browse File..."}
              </button>
            </div>

            {/* Preview Table */}
            {parsedData.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", background: inputBg, border: `1px solid ${border}`, borderRadius: "12px", padding: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "13px", fontWeight: 800, color: "#0077B6" }}>
                    Detected {parsedData.length} Product Image rows in file
                  </span>
                </div>

                <div style={{ overflowX: "auto", maxHeight: "250px", overflowY: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                    <thead>
                      <tr style={{ background: isDark ? "#21262D" : "#E5E7EB", color: textMain }}>
                        <th style={{ padding: "6px", textAlign: "left" }}>#</th>
                        <th style={{ padding: "6px", textAlign: "left" }}>SKU Code</th>
                        <th style={{ padding: "6px", textAlign: "left" }}>Article</th>
                        <th style={{ padding: "6px", textAlign: "left" }}>Image URL</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsedData.slice(0, 10).map((row, idx) => (
                        <tr key={idx} style={{ borderBottom: `1px solid ${border}` }}>
                          <td style={{ padding: "6px" }}>{idx + 1}</td>
                          <td style={{ padding: "6px", fontWeight: 800, color: "#0077B6" }}>
                            {row.sku_code || row.skuCode || row.code || "-"}
                          </td>
                          <td style={{ padding: "6px" }}>{row.article || "-"}</td>
                          <td style={{ padding: "6px", wordBreak: "break-all" }}>{row.image || row.image_url || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", borderTop: `1px solid ${border}`, paddingTop: "20px" }}>
              <button
                type="submit"
                disabled={uploading || parsedData.length === 0}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 24px",
                  borderRadius: "8px",
                  border: "none",
                  background: uploading || parsedData.length === 0 ? "#9CA3AF" : "#059669",
                  color: "#FFFFFF",
                  fontWeight: 700,
                  fontSize: "14px",
                  cursor: uploading || parsedData.length === 0 ? "not-allowed" : "pointer",
                }}
              >
                {uploading ? <RefreshCw className="animate-spin" size={16} /> : <Upload size={16} />}
                {uploading ? "Processing Import..." : `Upload & Link ${parsedData.length} Product Images`}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
