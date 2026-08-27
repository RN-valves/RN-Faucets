"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AdminHeader from "@/components/admin/AdminHeader";
import {
  addAdminSubcategory,
  getAdminCategories,
  uploadFileToR2,
  deleteFileFromR2,
  getAdminAttributes,
} from "@/utils/adminStore";
import { AdminCategory } from "@/types/admin";
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

    setUploading(true);
    const res = await uploadFileToR2(file, r2Key);
    setUploading(false);

    if (res.success && res.url) {
      onUploadSuccess(res.url);
    } else {
      alert("Failed to upload image to Cloudflare R2.");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      <label style={{ fontSize: "12px", fontWeight: 700, color: "#111827", display: "flex", justifyContent: "space-between" }}>
        <span>{label}</span>
        <span style={{ fontSize: "10px", color: "#6B7280", fontFamily: "monospace" }}>R2: {r2Key}</span>
      </label>

      <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: "8px", padding: "8px" }}>
        {currentUrl ? (
          <div style={{ width: "48px", height: "48px", borderRadius: "6px", overflow: "hidden", border: "1px solid #D1D5DB", flexShrink: 0, position: "relative", background: "#111827" }}>
            <img src={currentUrl} alt={label} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
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

export default function CreateSubcategoryPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useAdminTheme();

  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [contentList, setContentList] = useState<Array<{ id: string; name: string }>>([]);
  const [submitting, setSubmitting] = useState(false);

  const [subCategoryId, setSubCategoryId] = useState("");
  const [subName, setSubName] = useState("");
  const [subSlug, setSubSlug] = useState("");
  const [subTitle, setSubTitle] = useState("");
  const [subKeywords, setSubKeywords] = useState("");
  const [subDescription, setSubDescription] = useState("");
  const [subContentId, setSubContentId] = useState("");
  const [subPdfCatalogue, setSubPdfCatalogue] = useState("");
  const [subDisplayOrder, setSubDisplayOrder] = useState(0);
  const [subImage, setSubImage] = useState("");
  const [subBanner, setSubBanner] = useState("");
  const [subIcon, setSubIcon] = useState("");
  const [subStatus, setSubStatus] = useState<"Active" | "Inactive">("Active");
  const [subIsVisibleWebsite, setSubIsVisibleWebsite] = useState(true);

  const isDark = theme === "dark";

  const cardBg = isDark ? "#0D1117" : "#FFFFFF";
  const border = isDark ? "#21262D" : "#E5E7EB";
  const textMain = isDark ? "#F0F6FC" : "#111827";
  const textMuted = isDark ? "#8B949E" : "#6B7280";
  const inputBg = isDark ? "#161B22" : "#F9FAFB";
  const shadow = isDark ? "none" : "0 2px 10px rgba(0, 0, 0, 0.04)";

  useEffect(() => {
    Promise.all([getAdminCategories(), getAdminAttributes("Content")]).then(([cats, attrs]) => {
      setCategories(cats);
      if (cats.length > 0) setSubCategoryId(cats[0].id);
      if (attrs && Array.isArray(attrs)) {
        setContentList(attrs.map((a) => ({ id: a.id, name: a.name })));
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subName.trim() || !subCategoryId) return;

    setSubmitting(true);
    const parentCat = categories.find((c) => c.id === subCategoryId);
    const slug = subSlug.trim() || subName.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const generatedId = `SUB-${Date.now()}`;

    const created = await addAdminSubcategory({
      id: generatedId,
      categoryId: subCategoryId,
      categoryName: parentCat?.name || "",
      name: subName.trim(),
      slug,
      title: subTitle.trim(),
      keywords: subKeywords.trim(),
      description: subDescription.trim(),
      image: subImage,
      banner: subBanner,
      icon: subIcon,
      pdfCatalogue: subPdfCatalogue.trim(),
      displayOrder: Number(subDisplayOrder),
      status: subStatus,
      isVisibleWebsite: subIsVisibleWebsite,
    });

    setSubmitting(false);

    if (created) {
      router.push(`/admin/catalogue/subcategories/${created.slug || slug}`);
    } else {
      alert("Failed to create subcategory.");
    }
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <AdminHeader
        title="Add New SubCategory"
        subtitle="Create a new subcategory and link to parent range."
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <main style={{ padding: "32px", maxWidth: "960px", margin: "0 auto", width: "100%", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* Navigation Action Bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link
            href="/admin/catalogue/subcategories"
            style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: textMuted, textDecoration: "none", fontWeight: 700, fontSize: "14px" }}
          >
            <ArrowLeft size={16} /> Back to Subcategories
          </Link>
        </div>

        {/* Form Container */}
        <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: "16px", padding: "32px", boxShadow: shadow }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Parent Category & Content Master */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: textMain, marginBottom: "4px" }}>Select Parent Category *</label>
                <select
                  required
                  value={subCategoryId}
                  onChange={(e) => setSubCategoryId(e.target.value)}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: `1px solid ${border}`, background: inputBg, color: textMain, fontWeight: 700 }}
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: textMain, marginBottom: "4px" }}>Select Content (Opt)</label>
                <select
                  value={subContentId}
                  onChange={(e) => setSubContentId(e.target.value)}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: `1px solid ${border}`, background: inputBg, color: textMain }}
                >
                  <option value="">Select Content</option>
                  {contentList.map((cnt) => (
                    <option key={cnt.id} value={cnt.id}>
                      {cnt.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Subcategory Name & Slug */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: textMain, marginBottom: "4px" }}>Enter Name *</label>
                <input
                  type="text"
                  required
                  value={subName}
                  onChange={(e) => {
                    setSubName(e.target.value);
                    setSubSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
                  }}
                  placeholder="Enter Name"
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: `1px solid ${border}`, background: inputBg, color: textMain }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: textMain, marginBottom: "4px" }}>URL Key / Slug *</label>
                <input
                  type="text"
                  required
                  value={subSlug}
                  onChange={(e) => setSubSlug(e.target.value)}
                  placeholder="e.g. basin-mixers"
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: `1px solid ${border}`, background: inputBg, color: textMain }}
                />
              </div>
            </div>

            {/* R2 Image Uploaders */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", background: inputBg, border: `1px solid ${border}`, borderRadius: "12px", padding: "16px" }}>
              <span style={{ fontSize: "13px", fontWeight: 800, color: "#0077B6" }}>Media Assets (Cloudflare R2 Direct Upload)</span>

              <R2UploadPicker
                label="Select Image - size: 500*500px"
                r2Key={`website/catalogue/subcategories/new/image.webp`}
                currentUrl={subImage}
                onUploadSuccess={(url) => setSubImage(url)}
                onRemove={() => setSubImage("")}
              />

              <R2UploadPicker
                label="Select Banner (Opt) - size: 1900*400px"
                r2Key={`website/catalogue/subcategories/new/banner.webp`}
                currentUrl={subBanner}
                onUploadSuccess={(url) => setSubBanner(url)}
                onRemove={() => setSubBanner("")}
              />

              <R2UploadPicker
                label="Select Icon (Opt) - size: 100*100px"
                r2Key={`website/catalogue/subcategories/new/icon.webp`}
                currentUrl={subIcon}
                onUploadSuccess={(url) => setSubIcon(url)}
                onRemove={() => setSubIcon("")}
              />
            </div>

            {/* Display Order & PDF Catalogue */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: textMain, marginBottom: "4px" }}>Display Order</label>
                <input
                  type="number"
                  value={subDisplayOrder}
                  onChange={(e) => setSubDisplayOrder(Number(e.target.value))}
                  placeholder="0"
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: `1px solid ${border}`, background: inputBg, color: textMain }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: textMain, marginBottom: "4px" }}>PDF Catalogues URL() (Opt)</label>
                <input
                  type="text"
                  value={subPdfCatalogue}
                  onChange={(e) => setSubPdfCatalogue(e.target.value)}
                  placeholder="https://..."
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: `1px solid ${border}`, background: inputBg, color: textMain }}
                />
              </div>
            </div>

            {/* SEO Title & Keywords */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: textMain, marginBottom: "4px" }}>SEO Title</label>
                <input
                  type="text"
                  value={subTitle}
                  onChange={(e) => setSubTitle(e.target.value)}
                  placeholder="SEO Title"
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: `1px solid ${border}`, background: inputBg, color: textMain }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: textMain, marginBottom: "4px" }}>SEO Keywords</label>
                <input
                  type="text"
                  value={subKeywords}
                  onChange={(e) => setSubKeywords(e.target.value)}
                  placeholder="SEO Keywords"
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: `1px solid ${border}`, background: inputBg, color: textMain }}
                />
              </div>
            </div>

            {/* SEO Description */}
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: textMain, marginBottom: "4px" }}>SEO Description</label>
              <textarea
                rows={3}
                value={subDescription}
                onChange={(e) => setSubDescription(e.target.value)}
                placeholder="SEO Description"
                style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: `1px solid ${border}`, background: inputBg, color: textMain }}
              />
            </div>

            {/* Status & Visibility */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: textMain, marginBottom: "4px" }}>Select Status</label>
                <select
                  value={subStatus}
                  onChange={(e) => setSubStatus(e.target.value as any)}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: `1px solid ${border}`, background: inputBg, color: textMain, fontWeight: 700 }}
                >
                  <option value="Active">Active</option>
                  <option value="InActive">InActive</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: textMain, marginBottom: "4px" }}>Select Visible Web</label>
                <select
                  value={subIsVisibleWebsite ? "1" : "0"}
                  onChange={(e) => setSubIsVisibleWebsite(e.target.value === "1")}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: `1px solid ${border}`, background: inputBg, color: textMain, fontWeight: 700 }}
                >
                  <option value="1">Visible</option>
                  <option value="0">InVisible</option>
                </select>
              </div>
            </div>

            {/* Form Actions */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", borderTop: `1px solid ${border}`, paddingTop: "20px", marginTop: "10px" }}>
              <Link
                href="/admin/catalogue/subcategories"
                style={{ padding: "10px 20px", borderRadius: "8px", border: `1px solid ${border}`, background: "transparent", color: textMuted, fontWeight: 700, textDecoration: "none" }}
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting}
                style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 24px", borderRadius: "8px", border: "none", background: "#0077B6", color: "#FFFFFF", fontWeight: 700, cursor: submitting ? "not-allowed" : "pointer" }}
              >
                <Save size={16} /> {submitting ? "Saving..." : "Submit"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
