"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AdminHeader from "@/components/admin/AdminHeader";
import {
  addAdminCategory,
  uploadFileToR2,
  deleteFileFromR2,
  getAdminAttributes,
} from "@/utils/adminStore";
import { useAdminTheme } from "@/app/admin/layout";
import {
  ArrowLeft,
  Save,
  Upload,
  Image as ImageIcon,
} from "lucide-react";

// Reusable R2 Upload Component
function R2UploadPicker({
  label,
  r2Key,
  currentUrl,
  onUploadSuccess,
  onRemove,
  accept = "image/*",
}: {
  label: string;
  r2Key: string;
  currentUrl: string;
  onUploadSuccess: (newUrl: string) => void;
  onRemove?: () => void;
  accept?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const res = await uploadFileToR2(file, r2Key);
      if (res.success && res.url) {
        onUploadSuccess(res.url);
      } else {
        alert("Failed to upload image to Cloudflare R2.");
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      alert("Failed to upload image to Cloudflare R2: " + (err?.message || "Unknown error"));
    } finally {
      setUploading(false);
      if (e.target) e.target.value = "";
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      <label style={{ fontSize: "12px", fontWeight: 700, display: "flex", justifyContent: "space-between" }}>
        <span>{label}</span>
        <span style={{ fontSize: "10px", color: "#6B7280", fontFamily: "monospace" }}>R2: {r2Key}</span>
      </label>

      <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: "8px", padding: "8px" }}>
        {currentUrl ? (
          <div style={{ width: "48px", height: "48px", borderRadius: "6px", overflow: "hidden", border: "1px solid #D1D5DB", flexShrink: 0, position: "relative", background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <img src={currentUrl} alt={label} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          </div>
        ) : (
          <div style={{ width: "48px", height: "48px", borderRadius: "6px", border: "1px dashed #9CA3AF", display: "flex", alignItems: "center", justifyContent: "center", color: "#9CA3AF", flexShrink: 0 }}>
            <ImageIcon size={18} />
          </div>
        )}

        <div style={{ flex: 1, display: "flex", gap: "8px", alignItems: "center" }}>
          <input ref={fileInputRef} type="file" accept={accept} onChange={handleFileChange} style={{ display: "none" }} />

          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 12px",
              borderRadius: "6px",
              border: "1px solid #0077B6",
              background: "#E0F2FE",
              color: "#0077B6",
              fontWeight: 700,
              fontSize: "12px",
              cursor: uploading ? "not-allowed" : "pointer",
            }}
          >
            <Upload size={13} /> {uploading ? "Uploading..." : currentUrl ? "Change Image" : "Upload File"}
          </button>

          {currentUrl && onRemove && (
            <button
              type="button"
              onClick={() => {
                deleteFileFromR2(r2Key);
                onRemove();
              }}
              style={{
                padding: "6px 10px",
                borderRadius: "6px",
                border: "1px solid #EF4444",
                background: "transparent",
                color: "#EF4444",
                fontWeight: 700,
                fontSize: "12px",
                cursor: "pointer",
              }}
            >
              Remove
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CreateCategoryPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useAdminTheme();

  const [contentList, setContentList] = useState<Array<{ id: string; name: string }>>([]);
  const [submitting, setSubmitting] = useState(false);

  const [catName, setCatName] = useState("");
  const [catSlug, setCatSlug] = useState("");
  const [catTitle, setCatTitle] = useState("");
  const [catKeywords, setCatKeywords] = useState("");
  const [catDescription, setCatDescription] = useState("");
  const [catContentId, setCatContentId] = useState("");
  const [catContentName, setCatContentName] = useState("");
  const [catPdfCatalogue, setCatPdfCatalogue] = useState("");
  const [catImage, setCatImage] = useState("");
  const [catBanner, setCatBanner] = useState("");
  const [catMobileBanner, setCatMobileBanner] = useState("");
  const [catHomeImage, setCatHomeImage] = useState("");
  const [catHomeHoverImage, setCatHomeHoverImage] = useState("");
  const [catIcon, setCatIcon] = useState("");
  const [catTax, setCatTax] = useState(18);
  const [catDiscount, setCatDiscount] = useState(0);
  const [catDisplayOrder, setCatDisplayOrder] = useState<number>(0);
  const [catStatus, setCatStatus] = useState<"Active" | "Inactive">("Active");
  const [catIsVisibleWebsite, setCatIsVisibleWebsite] = useState(true);

  const isDark = theme === "dark";

  const cardBg = isDark ? "#0D1117" : "#FFFFFF";
  const border = isDark ? "#21262D" : "#E5E7EB";
  const textMain = isDark ? "#F0F6FC" : "#111827";
  const textMuted = isDark ? "#8B949E" : "#6B7280";
  const inputBg = isDark ? "#161B22" : "#F9FAFB";
  const shadow = isDark ? "none" : "0 2px 10px rgba(0, 0, 0, 0.04)";

  useEffect(() => {
    getAdminAttributes("Content").then((attrs) => {
      if (attrs && Array.isArray(attrs)) {
        setContentList(attrs.map((a) => ({ id: a.id, name: a.name })));
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;

    setSubmitting(true);

    const generatedId = `cat-${Date.now()}`;
    const slug = catSlug.trim() || catName.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");

    const created = await addAdminCategory({
      id: generatedId,
      name: catName.trim(),
      slug,
      title: catTitle.trim(),
      keywords: catKeywords.trim(),
      description: catDescription.trim(),
      content_id: catContentId,
      contentName: catContentName,
      pdfCatalogue: catPdfCatalogue.trim(),
      image: catImage || "/api/media/website/catalogue/categories/default/image.webp",
      banner: catBanner,
      mobileBanner: catMobileBanner,
      homeImage: catHomeImage,
      homeHoverImage: catHomeHoverImage,
      icon: catIcon,
      tax: Number(catTax),
      discount: Number(catDiscount),
      displayOrder: Number(catDisplayOrder),
      status: catStatus,
      isVisibleWebsite: catIsVisibleWebsite,
      productCount: 0,
    });

    setSubmitting(false);

    if (created) {
      router.push(`/admin/catalogue/categories/${created.slug || slug}`);
    } else {
      alert("Failed to create category.");
    }
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <AdminHeader
        title="Create New Category"
        subtitle="Add a new bathware product range, setting rates, SEO fields, and R2 media assets."
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <main style={{ padding: "32px", maxWidth: "960px", margin: "0 auto", width: "100%", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* Navigation Action Bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link
            href="/admin/catalogue/categories"
            style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: textMuted, textDecoration: "none", fontWeight: 700, fontSize: "14px" }}
          >
            <ArrowLeft size={16} /> Back to Categories
          </Link>
        </div>

        {/* Form Container */}
        <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: "16px", padding: "32px", boxShadow: shadow }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Content Master Relation Dropdown */}
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: textMain, marginBottom: "4px" }}>Select Content Master (Optional)</label>
              <select
                value={catContentId}
                onChange={(e) => {
                  setCatContentId(e.target.value);
                  const selected = contentList.find((c) => c.id === e.target.value);
                  if (selected) setCatContentName(selected.name);
                }}
                style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: `1px solid ${border}`, background: inputBg, color: textMain, fontWeight: 700 }}
              >
                <option value="">-- Select Content --</option>
                {contentList.map((cnt) => (
                  <option key={cnt.id} value={cnt.id}>
                    {cnt.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Name & Slug */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: textMain, marginBottom: "4px" }}>Category Name *</label>
                <input
                  type="text"
                  required
                  value={catName}
                  onChange={(e) => {
                    setCatName(e.target.value);
                    setCatSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
                  }}
                  placeholder="e.g. CP Faucets"
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: `1px solid ${border}`, background: inputBg, color: textMain }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: textMain, marginBottom: "4px" }}>URL Key / Slug *</label>
                <input
                  type="text"
                  required
                  value={catSlug}
                  onChange={(e) => setCatSlug(e.target.value)}
                  placeholder="e.g. cp-faucets"
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: `1px solid ${border}`, background: inputBg, color: textMain }}
                />
              </div>
            </div>

            {/* HOMEPAGE CARD 2-IMAGE UPLOADER (NORMAL & HOVER) */}
            <div style={{ display: "flex", flexDirection: "column", gap: "14px", background: isDark ? "rgba(0, 119, 182, 0.08)" : "#F0F9FF", border: `1.5px solid #0077B6`, borderRadius: "14px", padding: "18px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "14px", fontWeight: 800, color: "#0077B6" }}>
                    Homepage Category Card (2 Photos: Normal & Hover)
                  </span>
                  <span style={{ fontSize: "11px", padding: "3px 10px", background: "rgba(0,119,182,0.12)", color: "#0077B6", borderRadius: "100px", fontWeight: 800 }}>
                    Homepage Exclusive
                  </span>
                </div>
                <span style={{ fontSize: "11px", color: textMuted, fontWeight: 700 }}>
                  🛡️ Category Detail Page Banner remains 100% UNTOUCHED
                </span>
              </div>
              <p style={{ margin: 0, fontSize: "12.5px", color: textMuted, lineHeight: 1.5 }}>
                Upload 2 photos specifically for the Homepage &quot;Explore Product Categories&quot; cards. The <strong>Normal Photo</strong> is shown by default, and the <strong>Hover Photo</strong> is smoothly revealed when a customer hovers over the category card.
              </p>

              <R2UploadPicker
                label="1. Normal Photo (Default on Homepage - recommended 600x600px or transparent PNG)"
                r2Key={`website/catalogue/categories/${catSlug || "new"}/home_normal.webp`}
                currentUrl={catHomeImage}
                onUploadSuccess={(url) => setCatHomeImage(url)}
                onRemove={() => setCatHomeImage("")}
              />

              <R2UploadPicker
                label="2. Hover Photo (Revealed on Mouse Hover - recommended 600x600px lifestyle/action shot)"
                r2Key={`website/catalogue/categories/${catSlug || "new"}/home_hover.webp`}
                currentUrl={catHomeHoverImage}
                onUploadSuccess={(url) => setCatHomeHoverImage(url)}
                onRemove={() => setCatHomeHoverImage("")}
              />
            </div>

            {/* R2 Image Uploaders */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", background: inputBg, border: `1px solid ${border}`, borderRadius: "12px", padding: "16px" }}>
              <span style={{ fontSize: "13px", fontWeight: 800, color: "#0077B6" }}>Category Details Page Assets (Cloudflare R2 Direct Upload)</span>

              <R2UploadPicker
                label="Select Category Image (size: 500x500px) *"
                r2Key={`website/catalogue/categories/new/image.webp`}
                currentUrl={catImage}
                onUploadSuccess={(url) => setCatImage(url)}
                onRemove={() => setCatImage("")}
              />

              <R2UploadPicker
                label="Select Banner (Opt - size: 1900x400px)"
                r2Key={`website/catalogue/categories/new/banner.webp`}
                currentUrl={catBanner}
                onUploadSuccess={(url) => setCatBanner(url)}
                onRemove={() => setCatBanner("")}
              />

              <R2UploadPicker
                label="Select Mobile Banner (Opt - size: 414x200px)"
                r2Key={`website/catalogue/categories/new/mobile_banner.webp`}
                currentUrl={catMobileBanner}
                onUploadSuccess={(url) => setCatMobileBanner(url)}
                onRemove={() => setCatMobileBanner("")}
              />

              <R2UploadPicker
                label="Select Icon (Opt - size: 100x100px)"
                r2Key={`website/catalogue/categories/new/icon.webp`}
                currentUrl={catIcon}
                onUploadSuccess={(url) => setCatIcon(url)}
                onRemove={() => setCatIcon("")}
              />
            </div>

            {/* PDF Catalogue Link */}
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: textMain, marginBottom: "4px" }}>PDF Catalogues URL() (Opt)</label>
              <input
                type="text"
                value={catPdfCatalogue}
                onChange={(e) => setCatPdfCatalogue(e.target.value)}
                placeholder="https://rnvalves.com/catalogues/..."
                style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: `1px solid ${border}`, background: inputBg, color: textMain }}
              />
            </div>

            {/* SEO Title & Keywords */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: textMain, marginBottom: "4px" }}>SEO Title</label>
                <input
                  type="text"
                  value={catTitle}
                  onChange={(e) => setCatTitle(e.target.value)}
                  placeholder="Enter title"
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: `1px solid ${border}`, background: inputBg, color: textMain }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: textMain, marginBottom: "4px" }}>SEO Keywords</label>
                <input
                  type="text"
                  value={catKeywords}
                  onChange={(e) => setCatKeywords(e.target.value)}
                  placeholder="Enter keywords"
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: `1px solid ${border}`, background: inputBg, color: textMain }}
                />
              </div>
            </div>

            {/* SEO Description */}
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: textMain, marginBottom: "4px" }}>SEO Description</label>
              <textarea
                rows={3}
                value={catDescription}
                onChange={(e) => setCatDescription(e.target.value)}
                placeholder="Enter description"
                style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: `1px solid ${border}`, background: inputBg, color: textMain }}
              />
            </div>

            {/* Tax, Discount, Order, Status, Visibility */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: textMain, marginBottom: "4px" }}>Display Order / Rank</label>
                <input
                  type="number"
                  min="0"
                  value={catDisplayOrder}
                  onChange={(e) => setCatDisplayOrder(Number(e.target.value))}
                  placeholder="e.g. 1 (Top), 2, 3..."
                  style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: `1px solid #0077B6`, background: inputBg, color: textMain, fontWeight: 700 }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: textMain, marginBottom: "4px" }}>Category Tax %</label>
                <input
                  type="number"
                  value={catTax}
                  onChange={(e) => setCatTax(Number(e.target.value))}
                  style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: `1px solid ${border}`, background: inputBg, color: textMain }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: textMain, marginBottom: "4px" }}>Category Discount %</label>
                <input
                  type="number"
                  value={catDiscount}
                  onChange={(e) => setCatDiscount(Number(e.target.value))}
                  style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: `1px solid ${border}`, background: inputBg, color: textMain }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: textMain, marginBottom: "4px" }}>Select Status</label>
                <select
                  value={catStatus}
                  onChange={(e) => setCatStatus(e.target.value as any)}
                  style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: `1px solid ${border}`, background: inputBg, color: textMain, fontWeight: 700 }}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: textMain, marginBottom: "4px" }}>Select Visible Web</label>
                <select
                  value={catIsVisibleWebsite ? "1" : "0"}
                  onChange={(e) => setCatIsVisibleWebsite(e.target.value === "1")}
                  style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: `1px solid ${border}`, background: inputBg, color: textMain, fontWeight: 700 }}
                >
                  <option value="1">Visible</option>
                  <option value="0">InVisible</option>
                </select>
              </div>
            </div>

            {/* Form Actions */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", borderTop: `1px solid ${border}`, paddingTop: "20px", marginTop: "10px" }}>
              <Link
                href="/admin/catalogue/categories"
                style={{ padding: "10px 20px", borderRadius: "8px", border: `1px solid ${border}`, background: "transparent", color: textMuted, fontWeight: 700, textDecoration: "none" }}
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting}
                style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 24px", borderRadius: "8px", border: "none", background: "#0077B6", color: "#FFFFFF", fontWeight: 700, cursor: submitting ? "not-allowed" : "pointer" }}
              >
                <Save size={16} /> {submitting ? "Saving Category..." : "Save Category"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
