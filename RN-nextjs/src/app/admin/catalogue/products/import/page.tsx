"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import AdminHeader from "@/components/admin/AdminHeader";
import { useAdminTheme } from "@/app/admin/layout";
import { getAdminProducts, importProductsJSON } from "@/utils/adminStore";
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

export default function BulkProductsImportPage() {
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

  // Sample data row containing all 51 headers
  const sampleDataRow = [
    {
      id: "PROD-101",
      category: "Faucets",
      subcategory: "Basin Mixers",
      content_id: "1",
      brand: "RN Valves",
      material: "Brass",
      color_name: "Chrome",
      name: "Single Lever Basin Mixer",
      article: "ART-01",
      sku_code: "F410011GRT",
      size: "Standard",
      hsn: "8481",
      image: "/api/media/website/catalogue/products/default/image.webp",
      title: "Single Lever Basin Mixer - RN Faucets",
      keywords: "basin mixer, faucet, tap, bathware",
      description: "High quality brass single lever basin mixer",
      search_keywords: "basin mixer tap faucet nal",
      is_visible_website: "1",
      is_visible_api: "1",
      new_arrival: "0",
      is_featured: "1",
      sale_type: "Retail",
      in_mrp: "2500",
      in_selling: "1890",
      in_v1_mrp: "2400",
      oth_mrp: "35",
      oth_selling: "28",
      oth_v1_mrp: "34",
      color_group_id: "GRP-COLOR-01",
      product_combo_id: "GRP-COMBO-01",
      product_size_id: "GRP-SIZE-01",
      ctn_pcs: "24",
      mid_ctn_pcs: "6",
      inner_pcs: "1",
      stock_pcs: "150",
      only_product_wt_gm: "850",
      product_length: "15.5",
      product_breadth: "12.0",
      product_height: "18.0",
      product_lbh_weight_gm: "950",
      mid_ctn_lbh_weight_kg: "5.2",
      residential_warranty: "10",
      commercial_warranty: "2",
      amazon_link: "https://amazon.in",
      flipkart_link: "https://flipkart.com",
      short_description: "Single lever brass basin mixer faucet",
      video_url: "https://youtube.com",
      is_full_turn: "0",
      full_turn_code: "",
      master_ctn_lbh_weight_kg: "12.5",
      status: "In Stock",
    },
  ];

  // Generate & Download Sample Excel (.xlsx) File
  const handleDownloadSampleExcel = () => {
    const ws = XLSX.utils.json_to_sheet(sampleDataRow);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Products Template");
    XLSX.writeFile(wb, "rn_products_full_template.xlsx");
  };

  // Generate & Download Sample CSV File
  const handleDownloadSampleCSV = () => {
    const ws = XLSX.utils.json_to_sheet(sampleDataRow);
    const csvContent = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "rn_products_full_template.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // Export Current Products Excel (.xlsx) Template
  const handleDownloadCurrentUpdateExcel = async () => {
    const prods = await getAdminProducts();
    const formattedProds = prods.map((p) => ({
      id: p.id,
      category: p.category,
      subcategory: p.subcategoryName || "",
      content_id: "",
      brand: p.brand || "",
      material: p.material || "",
      color_name: p.colorName || "",
      name: p.name,
      article: p.article || "",
      sku_code: p.skuCode || p.code || "",
      size: p.size || "",
      hsn: p.hsn || "",
      image: p.image || "",
      title: p.title || "",
      keywords: p.keywords || "",
      description: p.description || "",
      search_keywords: p.searchKeywords || "",
      is_visible_website: p.isVisibleWebsite ? "1" : "0",
      is_visible_api: p.isVisibleApi ? "1" : "0",
      new_arrival: p.newArrival ? "1" : "0",
      is_featured: p.isFeatured ? "1" : "0",
      sale_type: p.saleType || "",
      in_mrp: p.inMrp || p.originalPrice || 0,
      in_selling: p.inSelling || p.price || 0,
      in_v1_mrp: p.inV1Mrp || 0,
      oth_mrp: p.othMrp || 0,
      oth_selling: p.othSelling || 0,
      oth_v1_mrp: p.othV1Mrp || 0,
      color_group_id: p.colorGroupId || "",
      product_combo_id: p.productComboId || "",
      product_size_id: p.productSizeId || "",
      ctn_pcs: p.ctnPcs || 0,
      mid_ctn_pcs: p.midCtnPcs || 0,
      inner_pcs: p.innerPcs || 0,
      stock_pcs: p.stockPcs || p.stock || 0,
      only_product_wt_gm: p.onlyProductWtGm || 0,
      product_length: p.productLength || 0,
      product_breadth: p.productBreadth || 0,
      product_height: p.productHeight || 0,
      residential_warranty: p.residentialWarranty || 0,
      commercial_warranty: p.commercialWarranty || 0,
      amazon_link: p.amazonLink || "",
      flipkart_link: p.flipkartLink || "",
      video_url: p.videoUrl || "",
      is_full_turn: p.isFullTurn ? "1" : "0",
      status: p.status || "In Stock",
    }));

    const ws = XLSX.utils.json_to_sheet(formattedProds);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Current Products");
    XLSX.writeFile(wb, `rn_products_update_export_${Date.now()}.xlsx`);
  };

  // Handle File Upload (.xlsx, .xls, .csv, .json)
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
          setParsedData(Array.isArray(parsed) ? parsed : parsed.products || []);
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
          alert("Failed to parse Excel file. Please check file format.");
        }
      };
      reader.readAsArrayBuffer(selectedFile);
    } else {
      alert("Unsupported file format. Please upload an Excel (.xlsx, .xls), CSV (.csv), or JSON (.json) file.");
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedData.length === 0) {
      alert("No valid product data found to upload.");
      return;
    }

    setUploading(true);
    const res = await importProductsJSON(parsedData);
    setUploading(false);

    if (res.success) {
      setResultMessage(res.message);
      setParsedData([]);
      setFile(null);
    } else {
      alert(res.message || "Bulk update failed.");
    }
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <AdminHeader
        title="Bulk Products Upload & Update (Excel / CSV / JSON)"
        subtitle="Bulk create or update RN bathware items, prices, inventory, and specs via Excel (.xlsx / .xls), CSV, or JSON spreadsheets."
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <main style={{ padding: "32px", maxWidth: "1100px", margin: "0 auto", width: "100%", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* Navigation Action Bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link
            href="/admin/catalogue/products"
            style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: textMuted, textDecoration: "none", fontWeight: 700, fontSize: "14px" }}
          >
            <ArrowLeft size={16} /> Back to Products
          </Link>
        </div>

        {/* Section 1: Template Download Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          {/* Card 1: Download Templates */}
          <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: "16px", padding: "24px", boxShadow: shadow, display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#0077B6" }}>
              <FileSpreadsheet size={24} />
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 800, color: textMain }}>1. Download Sample Excel / CSV Templates</h3>
            </div>
            <p style={{ margin: 0, fontSize: "13px", color: textMuted, lineHeight: "1.5" }}>
              Download a ready-to-use template with all 51 standard headers (`sku_code`, `name`, `in_mrp`, `in_selling`, `category`, `stock_pcs`).
            </p>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "4px" }}>
              <button
                onClick={handleDownloadSampleExcel}
                style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "10px 18px", borderRadius: "8px", border: "none", background: "#059669", color: "#FFFFFF", fontWeight: 700, fontSize: "13px", cursor: "pointer" }}
              >
                <Download size={15} /> Download Sample Excel (.xlsx)
              </button>

              <button
                onClick={handleDownloadSampleCSV}
                style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "10px 18px", borderRadius: "8px", border: "1px solid #0077B6", background: "#E0F2FE", color: "#0077B6", fontWeight: 700, fontSize: "13px", cursor: "pointer" }}
              >
                <Download size={15} /> Download Sample CSV
              </button>
            </div>
          </div>

          {/* Card 2: Export Current Products */}
          <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: "16px", padding: "24px", boxShadow: shadow, display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#059669" }}>
              <FileCode size={24} />
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 800, color: textMain }}>2. Export Current Catalogue for Update</h3>
            </div>
            <p style={{ margin: 0, fontSize: "13px", color: textMuted, lineHeight: "1.5" }}>
              Export all existing products from MongoDB into an Excel file, modify prices or stock offline, then upload back to bulk update.
            </p>
            <div>
              <button
                onClick={handleDownloadCurrentUpdateExcel}
                style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "10px 18px", borderRadius: "8px", border: "1px solid #059669", background: "#D1FAE5", color: "#059669", fontWeight: 700, fontSize: "13px", cursor: "pointer" }}
              >
                <Download size={15} /> Export Update Sheet (.xlsx)
              </button>
            </div>
          </div>
        </div>

        {/* Section 2: File Upload Card */}
        <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: "16px", padding: "32px", boxShadow: shadow }}>
          <form onSubmit={handleUploadSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <h3 style={{ margin: 0, fontSize: "17px", fontWeight: 800, color: textMain }}>
              Submit Completed Excel / CSV / JSON File
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
                {file ? file.name : "Select an Excel (.xlsx / .xls), CSV (.csv), or JSON file"}
              </span>
              <span style={{ fontSize: "12px", color: textMuted }}>
                Supported extensions: .xlsx, .xls, .csv, .json (All 51 PHP columns supported)
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

            {/* Preview Section */}
            {parsedData.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", background: inputBg, border: `1px solid ${border}`, borderRadius: "12px", padding: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "13px", fontWeight: 800, color: "#0077B6" }}>
                    Detected {parsedData.length} Products in Uploaded Excel / CSV Sheet
                  </span>
                  <span style={{ fontSize: "12px", color: textMuted }}>
                    Matching SKU Codes will be UPDATED in MongoDB automatically.
                  </span>
                </div>

                <div style={{ overflowX: "auto", maxHeight: "250px", overflowY: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                    <thead>
                      <tr style={{ background: isDark ? "#21262D" : "#E5E7EB", color: textMain }}>
                        <th style={{ padding: "6px", textAlign: "left" }}>#</th>
                        <th style={{ padding: "6px", textAlign: "left" }}>Item Code (SKU)</th>
                        <th style={{ padding: "6px", textAlign: "left" }}>Product Name</th>
                        <th style={{ padding: "6px", textAlign: "left" }}>Category</th>
                        <th style={{ padding: "6px", textAlign: "left" }}>IN MRP (₹)</th>
                        <th style={{ padding: "6px", textAlign: "left" }}>IN Selling (₹)</th>
                        <th style={{ padding: "6px", textAlign: "left" }}>Stock Pcs</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsedData.slice(0, 10).map((row, idx) => (
                        <tr key={idx} style={{ borderBottom: `1px solid ${border}` }}>
                          <td style={{ padding: "6px" }}>{idx + 1}</td>
                          <td style={{ padding: "6px", fontWeight: 800, color: "#0077B6" }}>
                            {row.sku_code || row.skuCode || row.code || row.id || "-"}
                          </td>
                          <td style={{ padding: "6px", fontWeight: 700 }}>{row.name || "-"}</td>
                          <td style={{ padding: "6px" }}>{row.category || "-"}</td>
                          <td style={{ padding: "6px" }}>₹{row.in_mrp || row.inMrp || row.originalPrice || 0}</td>
                          <td style={{ padding: "6px", color: "#059669", fontWeight: 800 }}>
                            ₹{row.in_selling || row.inSelling || row.price || 0}
                          </td>
                          <td style={{ padding: "6px" }}>{row.stock_pcs || row.stockPcs || row.stock || 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {parsedData.length > 10 && (
                    <div style={{ padding: "8px", fontSize: "12px", color: textMuted, textAlign: "center" }}>
                      ... and {parsedData.length - 10} more rows.
                    </div>
                  )}
                </div>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", borderTop: `1px solid ${border}`, paddingTop: "20px" }}>
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
                {uploading ? "Processing Bulk Update..." : `Upload & Update ${parsedData.length} Products`}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
