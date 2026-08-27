"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AdminHeader from "@/components/admin/AdminHeader";
import { useAdminTheme } from "@/app/admin/layout";
import { uploadFileToR2 } from "@/utils/adminStore";
import { ArrowLeft, Upload, CheckCircle2, AlertCircle } from "lucide-react";

export default function CreateProductImagePage() {
  const { theme, toggleTheme } = useAdminTheme();
  const router = useRouter();

  const [skuCode, setSkuCode] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isDark = theme === "dark";

  const cardBg = isDark ? "#0D1117" : "#FFFFFF";
  const border = isDark ? "#21262D" : "#E5E7EB";
  const textMain = isDark ? "#F0F6FC" : "#111827";
  const textMuted = isDark ? "#8B949E" : "#6B7280";
  const inputBg = isDark ? "#161B22" : "#F9FAFB";
  const shadow = isDark ? "none" : "0 2px 10px rgba(0, 0, 0, 0.04)";

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setErrorMsg(null);
    try {
      const cleanSku = skuCode.trim() || `gallery_${Date.now()}`;
      const fileKey = `website/catalogue/products/${cleanSku}/gallery_${Date.now()}_${file.name.replace(/[^a-z0-9.]/gi, "_")}`;
      const res = await uploadFileToR2(file, fileKey);
      if (res && res.url) {
        setImageUrl(res.url);
      } else {
        setErrorMsg("Failed to upload image file to R2 storage.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to upload file.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!skuCode.trim()) {
      setErrorMsg("Please enter Product SKU Code.");
      return;
    }
    if (!imageUrl.trim()) {
      setErrorMsg("Please enter or upload an Image URL.");
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/product-images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sku_code: skuCode.trim(),
          image: imageUrl.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Failed to save product image.");
      } else {
        router.push("/admin/catalogue/product-images");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Error submitting form.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <AdminHeader
        title="Add New Product Image"
        subtitle="Link a new gallery image asset to a product by entering Product SKU Code and Image URL."
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <main style={{ padding: "32px", maxWidth: "900px", margin: "0 auto", width: "100%", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* Navigation Action Bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link
            href="/admin/catalogue/product-images"
            style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: textMuted, textDecoration: "none", fontWeight: 700, fontSize: "14px" }}
          >
            <ArrowLeft size={16} /> Back to Product Images
          </Link>
        </div>

        {/* Card Form matching PHP Blade */}
        <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: "16px", padding: "32px", boxShadow: shadow }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 800, color: textMain }}>
              Product Image Mapping Details
            </h3>

            {errorMsg && (
              <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "14px", borderRadius: "8px", background: "#FEE2E2", border: "1px solid #EF4444", color: "#B91C1C", fontWeight: 700, fontSize: "14px" }}>
                <AlertCircle size={18} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Field 1: Enter Product Sku Code */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "14px", fontWeight: 700, color: textMain }}>
                Enter Product SKU Code <span style={{ color: "#EF4444" }}>*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. F410011GRT"
                value={skuCode}
                onChange={(e) => setSkuCode(e.target.value)}
                style={{ padding: "12px 14px", borderRadius: "8px", border: `1px solid ${border}`, background: inputBg, color: textMain, outline: "none", fontSize: "14px", fontWeight: 600 }}
              />
            </div>

            {/* Field 2: Enter Image URL or Upload File */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "14px", fontWeight: 700, color: textMain }}>
                Enter Image URL / Select Image File <span style={{ color: "#EF4444" }}>*</span>
              </label>
              
              <div style={{ display: "flex", gap: "10px" }}>
                <input
                  type="text"
                  placeholder="https://... or /api/media/..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  style={{ flex: 1, padding: "12px 14px", borderRadius: "8px", border: `1px solid ${border}`, background: inputBg, color: textMain, outline: "none", fontSize: "14px" }}
                />

                <label
                  style={{
                    padding: "12px 18px",
                    borderRadius: "8px",
                    border: `1px solid ${border}`,
                    background: inputBg,
                    color: textMain,
                    fontWeight: 700,
                    fontSize: "13px",
                    cursor: uploading ? "not-allowed" : "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <Upload size={16} />
                  {uploading ? "Uploading..." : "Upload File"}
                  <input type="file" accept="image/*" onChange={handleFileUpload} disabled={uploading} style={{ display: "none" }} />
                </label>
              </div>

              {imageUrl && (
                <div style={{ marginTop: "12px" }}>
                  <img
                    src={imageUrl}
                    alt="Preview"
                    style={{ width: "120px", height: "120px", borderRadius: "8px", objectFit: "cover", border: `1px solid ${border}` }}
                  />
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div style={{ display: "flex", justifyContent: "flex-end", borderTop: `1px solid ${border}`, paddingTop: "20px" }}>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  padding: "12px 28px",
                  borderRadius: "8px",
                  border: "none",
                  background: submitting ? "#9CA3AF" : "#059669",
                  color: "#FFFFFF",
                  fontWeight: 700,
                  fontSize: "14px",
                  cursor: submitting ? "not-allowed" : "pointer",
                }}
              >
                {submitting ? "Saving..." : "Submit Product Image"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
