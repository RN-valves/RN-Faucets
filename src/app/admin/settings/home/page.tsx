"use client";

import { useEffect, useState, useRef } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import {
  getAdminHomeSetting,
  updateAdminHomeSetting,
  uploadFileToR2,
  deleteFileFromR2,
  getAdminProducts,
  getAdminCategories,
} from "@/utils/adminStore";
import { useAdminTheme } from "@/app/admin/layout";
import { AdminProduct, AdminCategory } from "@/types/admin";
import {
  Save,
  Plus,
  Trash2,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  Layers,
  ShoppingBag,
} from "lucide-react";

// Reusable R2 Media Upload & Preview Component
function R2UploadPicker({
  label,
  r2Key,
  currentUrl,
  onUploadSuccess,
  onRemove,
  accept = "image/*,video/*",
}: {
  label: string;
  r2Key: string;
  currentUrl: string;
  onUploadSuccess: (newUrl: string, detectedType?: "image" | "video") => void;
  onRemove?: () => void;
  accept?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isVideoUrl = (url: string) => {
    if (!url) return false;
    const clean = url.split("?")[0].toLowerCase();
    return (
      clean.endsWith(".mp4") ||
      clean.endsWith(".webm") ||
      clean.endsWith(".mov") ||
      clean.endsWith(".m4v") ||
      clean.includes("/reels/") ||
      clean.includes("/video")
    );
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    if (file.size > 500 * 1024 * 1024) {
      alert(`File size (${sizeMB} MB) is too large. Maximum supported size is 500 MB.`);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    const isVideo = file.type.startsWith("video/") || ["mp4", "webm", "mov", "m4v"].includes(ext);
    const detectedType = isVideo ? "video" : "image";

    // Adjust target key extension based on actual file type
    let targetKey = r2Key;
    if (isVideo) {
      const videoExt = ["mp4", "webm", "mov"].includes(ext) ? ext : "mp4";
      targetKey = targetKey.replace(/\.(webp|jpg|jpeg|png|gif)$/i, `.${videoExt}`);
      if (!/\.[a-zA-Z0-9]+$/.test(targetKey)) {
        targetKey = `${targetKey}.${videoExt}`;
      }
    } else {
      targetKey = targetKey.replace(/\.(mp4|webm|mov|m4v)$/i, ".webp");
    }

    setUploading(true);
    setUploadProgressText(`Uploading ${sizeMB} MB...`);
    const res = await uploadFileToR2(file, targetKey);
    setUploading(false);
    setUploadProgressText("");

    if (res.success && res.url) {
      onUploadSuccess(res.url, detectedType);
    } else {
      alert(`Failed to upload file to Cloudflare R2:\n\n${res.error || "Please try again."}`);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const isVideo = isVideoUrl(currentUrl);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <label style={{ fontSize: "12px", fontWeight: 700, color: "#111827", display: "flex", justifyContent: "space-between" }}>
        <span>{label}</span>
        <span style={{ fontSize: "10px", color: "#6B7280", fontFamily: "monospace" }}>R2 Key: {r2Key}</span>
      </label>

      <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: "8px", padding: "10px" }}>
        {/* Media Preview */}
        {currentUrl ? (
          <div style={{ width: "60px", height: "60px", borderRadius: "6px", overflow: "hidden", border: "1px solid #D1D5DB", flexShrink: 0, position: "relative", background: "#111827", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {isVideo ? (
              <video
                src={currentUrl}
                muted
                autoPlay
                loop
                playsInline
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <img src={currentUrl} alt={label} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            )}
            {isVideo && (
              <span style={{ position: "absolute", bottom: 2, right: 2, background: "rgba(0,0,0,0.75)", color: "#38bdf8", fontSize: "8px", padding: "1px 3px", borderRadius: "2px", fontWeight: 800 }}>
                VIDEO
              </span>
            )}
          </div>
        ) : (
          <div style={{ width: "60px", height: "60px", borderRadius: "6px", border: "1px dashed #9CA3AF", display: "flex", alignItems: "center", justifyContent: "center", color: "#9CA3AF", flexShrink: 0 }}>
            <ImageIcon size={20} />
          </div>
        )}

        <div style={{ flex: 1, display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
          <input ref={fileInputRef} type="file" accept={accept} onChange={handleFileChange} style={{ display: "none" }} />

          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "7px 14px",
              borderRadius: "6px",
              border: "1px solid #0077B6",
              background: "#E0F2FE",
              color: "#0077B6",
              fontWeight: 700,
              fontSize: "12px",
              cursor: uploading ? "not-allowed" : "pointer",
            }}
          >
            <Upload size={14} /> {uploading ? (uploadProgressText || "Uploading...") : currentUrl ? "Change Media" : "Upload File"}
          </button>

          {currentUrl && onRemove && (
            <button
              type="button"
              onClick={() => {
                deleteFileFromR2(r2Key);
                onRemove();
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                padding: "7px 12px",
                borderRadius: "6px",
                border: "1px solid #FECACA",
                background: "#FEF2F2",
                color: "#DC2626",
                fontWeight: 600,
                fontSize: "12px",
                cursor: "pointer",
              }}
            >
              <Trash2 size={13} /> Remove
            </button>
          )}

          {currentUrl && (
            <a
              href={currentUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "11px",
                color: "#6B7280",
                textDecoration: "none",
                marginLeft: "auto",
              }}
            >
              <ExternalLink size={12} /> View Media
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminHomeSettingPage() {
  const { theme, toggleTheme } = useAdminTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"header_footer" | "hero" | "categories" | "bestsellers" | "content">("header_footer");
  const [successMsg, setSuccessMsg] = useState("");

  const [dbProducts, setDbProducts] = useState<AdminProduct[]>([]);
  const [dbCategories, setDbCategories] = useState<AdminCategory[]>([]);

  const isDark = theme === "dark";

  // Color Tokens
  const cardBg = isDark ? "#0D1117" : "#FFFFFF";
  const border = isDark ? "#21262D" : "#E5E7EB";
  const textMain = isDark ? "#F0F6FC" : "#111827";
  const textMuted = isDark ? "#8B949E" : "#6B7280";
  const inputBg = isDark ? "#161B22" : "#F9FAFB";
  const shadow = isDark ? "none" : "0 2px 10px rgba(0, 0, 0, 0.04)";

  // Full Homepage Settings State
  const [settings, setSettings] = useState<any>(null);

  const loadSettings = async () => {
    setLoading(true);
    const [data, prods, cats] = await Promise.all([
      getAdminHomeSetting(),
      getAdminProducts(),
      getAdminCategories(),
    ]);
    if (data) setSettings(data);
    setDbProducts(prods);
    setDbCategories(cats);
    setLoading(false);
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!settings) return;

    setSaving(true);
    const success = await updateAdminHomeSetting(settings);
    setSaving(false);

    if (success) {
      setSuccessMsg("Website Home Settings updated successfully!");
      setTimeout(() => setSuccessMsg(""), 4000);
    } else {
      alert("Failed to save homepage settings. Please check database connection.");
    }
  };

  if (loading || !settings) {
    return (
      <div style={{ padding: "40px", color: textMuted, textAlign: "center" }}>
        Loading Website Home Settings & R2 Media Architecture...
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <AdminHeader
        title="Website Home Setting (Cloudflare R2 CMS)"
        subtitle="Upload assets directly to Cloudflare R2 storage with predictable key architecture and cache-busting versioning."
        onRefresh={loadSettings}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <main style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "24px", maxWidth: "1400px", margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
        {/* Success Banner */}
        {successMsg && (
          <div style={{ background: "#0596691A", border: "1px solid #059669", color: "#059669", borderRadius: "10px", padding: "14px 20px", display: "flex", alignItems: "center", gap: "10px", fontWeight: 700 }}>
            <CheckCircle2 size={18} /> {successMsg}
          </div>
        )}

        {/* Top Control Bar with Save Button */}
        <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: "12px", padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: shadow }}>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {[
              { id: "header_footer", label: "1. Header & Footer" },
              { id: "hero", label: "2. Hero Carousel" },
              { id: "categories", label: "3. Showcase & Categories" },
              { id: "bestsellers", label: "4. New Arrivals & Why Buy" },
              { id: "content", label: "5. Reels, Support & Blogs" },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id as typeof activeTab)}
                style={{
                  padding: "10px 16px",
                  borderRadius: "8px",
                  border: `1px solid ${activeTab === t.id ? "#0077B6" : border}`,
                  background: activeTab === t.id ? (isDark ? "#1F6FEB22" : "#E0F2FE") : inputBg,
                  color: activeTab === t.id ? "#0077B6" : textMuted,
                  fontWeight: 700,
                  fontSize: "13px",
                  cursor: "pointer",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => handleSave()}
            disabled={saving}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 24px",
              borderRadius: "8px",
              border: "none",
              background: "linear-gradient(90deg, #0077B6 0%, #0096C7 100%)",
              color: "#FFFFFF",
              fontWeight: 700,
              fontSize: "14px",
              cursor: saving ? "not-allowed" : "pointer",
              boxShadow: "0 4px 12px rgba(0,119,182,0.3)",
            }}
          >
            <Save size={16} /> {saving ? "Saving..." : "Save All Changes"}
          </button>
        </div>

        {/* Tab 1: Header & Footer */}
        {activeTab === "header_footer" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: "12px", padding: "24px", boxShadow: shadow }}>
              <h3 style={{ margin: "0 0 16px 0", color: textMain, fontSize: "16px", borderBottom: `1px solid ${border}`, paddingBottom: "12px" }}>
                Singleton Branding Assets (Cloudflare R2 Overwrite)
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px" }}>
                <R2UploadPicker
                  label="Header Desktop Logo"
                  r2Key="website/home/header/logo.webp"
                  currentUrl={settings.header?.logo || ""}
                  onUploadSuccess={(url) => setSettings({ ...settings, header: { ...settings.header, logo: url } })}
                />

                <R2UploadPicker
                  label="Header Mobile Logo"
                  r2Key="website/home/header/mobile-logo.webp"
                  currentUrl={settings.header?.mobileLogo || settings.header?.logo || ""}
                  onUploadSuccess={(url) => setSettings({ ...settings, header: { ...settings.header, mobileLogo: url } })}
                />

                <R2UploadPicker
                  label="Footer Brand Logo"
                  r2Key="website/home/footer/logo.webp"
                  currentUrl={settings.footer?.logo || ""}
                  onUploadSuccess={(url) => setSettings({ ...settings, footer: { ...settings.footer, logo: url } })}
                />
              </div>
            </div>

            <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: "12px", padding: "24px", boxShadow: shadow }}>
              <h3 style={{ margin: "0 0 16px 0", color: textMain, fontSize: "16px", borderBottom: `1px solid ${border}`, paddingBottom: "12px" }}>
                Footer Contact Information
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: textMain, marginBottom: "4px" }}>Toll-Free Phone</label>
                  <input type="text" value={settings.footer?.phone || ""} onChange={(e) => setSettings({ ...settings, footer: { ...settings.footer, phone: e.target.value } })} style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: `1px solid ${border}`, background: inputBg, color: textMain }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: textMain, marginBottom: "4px" }}>Support Email</label>
                  <input type="text" value={settings.footer?.email1 || ""} onChange={(e) => setSettings({ ...settings, footer: { ...settings.footer, email1: e.target.value } })} style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: `1px solid ${border}`, background: inputBg, color: textMain }} />
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: textMain, marginBottom: "4px" }}>Physical Address</label>
                  <textarea rows={2} value={settings.footer?.address || ""} onChange={(e) => setSettings({ ...settings, footer: { ...settings.footer, address: e.target.value } })} style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: `1px solid ${border}`, background: inputBg, color: textMain }} />
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: textMain, marginBottom: "4px" }}>Copyright Line</label>
                  <input type="text" value={settings.footer?.copyrightText || ""} onChange={(e) => setSettings({ ...settings, footer: { ...settings.footer, copyrightText: e.target.value } })} style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: `1px solid ${border}`, background: inputBg, color: textMain }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Hero Carousel */}
        {activeTab === "hero" && (
          <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: "12px", padding: "24px", boxShadow: shadow }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", borderBottom: `1px solid ${border}`, paddingBottom: "12px" }}>
              <h3 style={{ margin: 0, color: textMain, fontSize: "16px" }}>Hero Video/Image Banner Carousel Slides</h3>
              <button
                type="button"
                onClick={() => {
                  const slideId = Date.now();
                  const newSlide = {
                    id: slideId,
                    type: "image",
                    src: "",
                    title: "New Collection",
                    subtitle: "Discover",
                    duration: 5000,
                    active: true,
                  };
                  setSettings({ ...settings, hero: [...(settings.hero || []), newSlide] });
                }}
                style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 14px", borderRadius: "6px", border: "none", background: "#059669", color: "#FFF", fontWeight: 700, fontSize: "12px", cursor: "pointer" }}
              >
                <Plus size={14} /> Add Hero Slide
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {settings.hero?.map((slide: any, index: number) => {
                const slideId = slide.id !== undefined ? slide.id : index + 1;
                const isVideo =
                  slide.type === "video" ||
                  Boolean(
                    slide.src &&
                      (slide.src.split("?")[0].endsWith(".mp4") ||
                        slide.src.split("?")[0].endsWith(".webm") ||
                        slide.src.split("?")[0].endsWith(".mov"))
                  );
                const r2Key = isVideo
                  ? `website/home/hero/${slideId}.mp4`
                  : `website/home/hero/${slideId}.webp`;

                return (
                  <div key={slideId} style={{ border: `1px solid ${border}`, borderRadius: "10px", padding: "18px", background: inputBg, display: "flex", flexDirection: "column", gap: "14px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                        <span style={{ fontWeight: 800, color: "#0077B6", fontSize: "13px" }}>Hero Slide #{index + 1} (ID: {slideId})</span>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span style={{ fontSize: "11px", color: textMuted, fontWeight: 600 }}>Media Type:</span>
                          <select
                            value={slide.type || (isVideo ? "video" : "image")}
                            onChange={(e) => {
                              const updated = [...settings.hero];
                              updated[index].type = e.target.value;
                              setSettings({ ...settings, hero: updated });
                            }}
                            style={{
                              padding: "3px 8px",
                              borderRadius: "4px",
                              border: `1px solid ${border}`,
                              fontSize: "11px",
                              fontWeight: 700,
                              background: (slide.type === "video" || isVideo) ? "#7C3AED" : "#0284C7",
                              color: "#FFF",
                              cursor: "pointer",
                            }}
                          >
                            <option value="image">Image Slide</option>
                            <option value="video">Video Slide (MP4 / WebM)</option>
                          </select>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          deleteFileFromR2(r2Key);
                          const updated = settings.hero.filter((_: any, i: number) => i !== index);
                          setSettings({ ...settings, hero: updated });
                        }}
                        style={{ background: "transparent", border: "none", color: "#DC2626", cursor: "pointer" }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                      <div>
                        <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: textMain, marginBottom: "4px" }}>Slide Title (pre-line)</label>
                        <textarea rows={2} value={slide.title} onChange={(e) => {
                          const updated = [...settings.hero];
                          updated[index].title = e.target.value;
                          setSettings({ ...settings, hero: updated });
                        }} style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: `1px solid ${border}`, background: cardBg, color: textMain }} />
                      </div>

                      <div>
                        <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: textMain, marginBottom: "4px" }}>Subtitle</label>
                        <input type="text" value={slide.subtitle} onChange={(e) => {
                          const updated = [...settings.hero];
                          updated[index].subtitle = e.target.value;
                          setSettings({ ...settings, hero: updated });
                        }} style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: `1px solid ${border}`, background: cardBg, color: textMain }} />
                      </div>
                    </div>

                    <R2UploadPicker
                      label={`Slide Media Asset (${slide.type === "video" || isVideo ? "MP4 / WebM Video" : "Image / WebP"})`}
                      r2Key={r2Key}
                      currentUrl={slide.src}
                      accept={slide.type === "video" || isVideo ? "video/*" : "image/*,video/*"}
                      onUploadSuccess={(url, detectedType) => {
                        const updated = [...settings.hero];
                        updated[index].src = url;
                        if (detectedType) {
                          updated[index].type = detectedType;
                        }
                        setSettings({ ...settings, hero: updated });
                      }}
                      onRemove={() => {
                        const updated = [...settings.hero];
                        updated[index].src = "";
                        setSettings({ ...settings, hero: updated });
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 3: Showcase & Categories */}
        {activeTab === "categories" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Space Showcase */}
            <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: "12px", padding: "24px", boxShadow: shadow }}>
              <h3 style={{ margin: "0 0 16px 0", color: textMain, fontSize: "16px", borderBottom: `1px solid ${border}`, paddingBottom: "12px" }}>
                Space Showcase Section Asset
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: textMain, marginBottom: "4px" }}>Heading</label>
                  <input type="text" value={settings.spaceShowcase?.title || ""} onChange={(e) => setSettings({ ...settings, spaceShowcase: { ...settings.spaceShowcase, title: e.target.value } })} style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: `1px solid ${border}`, background: inputBg, color: textMain }} />
                </div>

                <div style={{ gridColumn: "1 / -1" }}>
                  <R2UploadPicker
                    label="Showcase Background Image Asset"
                    r2Key="website/home/showcase/space-bathroom.webp"
                    currentUrl={settings.spaceShowcase?.image || ""}
                    onUploadSuccess={(url) => setSettings({ ...settings, spaceShowcase: { ...settings.spaceShowcase, image: url } })}
                  />
                </div>
              </div>
            </div>

            {/* Category Cards Section */}
            <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: "12px", padding: "24px", boxShadow: shadow }}>
              <h3 style={{ margin: "0 0 16px 0", color: textMain, fontSize: "16px", borderBottom: `1px solid ${border}`, paddingBottom: "12px" }}>
                Explore Product Categories (Referencing Database Categories or R2 Assets)
              </h3>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                {settings.categoriesSection?.categories?.map((cat: any, index: number) => {
                  const categoryId = cat.id || index + 1;
                  const r2Key = `website/home/categories/${categoryId}.webp`;

                  return (
                    <div key={categoryId} style={{ border: `1px solid ${border}`, borderRadius: "10px", padding: "16px", background: inputBg, display: "flex", flexDirection: "column", gap: "10px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontWeight: 800, fontSize: "13px", color: "#0077B6" }}>Category Card #{index + 1}</span>
                      </div>

                      <input type="text" placeholder="Category Name" value={cat.name} onChange={(e) => {
                        const updated = [...settings.categoriesSection.categories];
                        updated[index].name = e.target.value;
                        setSettings({ ...settings, categoriesSection: { ...settings.categoriesSection, categories: updated } });
                      }} style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: `1px solid ${border}`, background: cardBg, color: textMain }} />

                      <R2UploadPicker
                        label="Category Card Image"
                        r2Key={r2Key}
                        currentUrl={cat.image}
                        onUploadSuccess={(url) => {
                          const updated = [...settings.categoriesSection.categories];
                          updated[index].image = url;
                          setSettings({ ...settings, categoriesSection: { ...settings.categoriesSection, categories: updated } });
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Best Sellers & Why Buy */}
        {activeTab === "bestsellers" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Best Sellers referencing Product DB without duplication */}
            <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: "12px", padding: "24px", boxShadow: shadow }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", borderBottom: `1px solid ${border}`, paddingBottom: "12px" }}>
                <div>
                  <h3 style={{ margin: 0, color: textMain, fontSize: "16px" }}>New Arrivals Products</h3>
                  <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: textMuted }}>Select products from catalog to automatically reuse existing product images without R2 duplication.</p>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                {settings.bestSellersSection?.products?.map((prod: any, index: number) => (
                  <div key={prod.id || index} style={{ border: `1px solid ${border}`, borderRadius: "10px", padding: "16px", background: inputBg, display: "flex", flexDirection: "column", gap: "10px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontWeight: 800, fontSize: "13px", color: "#0077B6" }}>Slot #{index + 1}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = settings.bestSellersSection.products.filter((_: any, i: number) => i !== index);
                          setSettings({
                            ...settings,
                            bestSellersSection: { ...settings.bestSellersSection, products: updated },
                          });
                        }}
                        style={{ background: "transparent", border: "none", color: "#DC2626", cursor: "pointer" }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <label style={{ fontSize: "11px", fontWeight: 700, color: textMuted }}>Link to Catalog Product (Auto-fetches Image)</label>
                    <select
                      onChange={(e) => {
                        const selectedProd = dbProducts.find((p) => p.id === e.target.value);
                        if (selectedProd) {
                          const updated = [...settings.bestSellersSection.products];
                          updated[index] = {
                            id: selectedProd.id,
                            name: selectedProd.name,
                            price: `₹${(selectedProd.inSelling || selectedProd.price || 0).toLocaleString()}`,
                            sku: selectedProd.skuCode || selectedProd.code,
                            image: selectedProd.image,
                          };
                          setSettings({ ...settings, bestSellersSection: { ...settings.bestSellersSection, products: updated } });
                        }
                      }}
                      style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: `1px solid ${border}`, background: cardBg, color: textMain }}
                    >
                      <option value="">Select from catalog...</option>
                      {dbProducts.map((p) => (
                        <option key={p.id} value={p.id}>{p.name} ({p.skuCode || p.code}) - ₹{p.price}</option>
                      ))}
                    </select>

                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "4px" }}>
                      <img src={prod.image} alt={prod.name} style={{ width: "48px", height: "48px", borderRadius: "6px", objectFit: "cover", border: `1px solid ${border}` }} />
                      <div>
                        <div style={{ fontWeight: 700, color: textMain, fontSize: "13px" }}>{prod.name}</div>
                        <div style={{ fontSize: "11px", color: textMuted }}>{prod.sku} • {prod.price}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Reels, Support & Blogs */}
        {activeTab === "content" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Instagram Reels R2 Uploads */}
            <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: "12px", padding: "24px", boxShadow: shadow }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", borderBottom: `1px solid ${border}`, paddingBottom: "12px" }}>
                <h3 style={{ margin: 0, color: textMain, fontSize: "16px" }}>Instagram Video Reels (R2 Keys: website/home/reels/reelId.webp)</h3>
                <button
                  type="button"
                  onClick={() => {
                    const reelId = Date.now();
                    const newReel = { id: reelId, video: "", instagram: "https://www.instagram.com/" };
                    setSettings({
                      ...settings,
                      reelsSection: {
                        ...settings.reelsSection,
                        reels: [...(settings.reelsSection?.reels || []), newReel],
                      },
                    });
                  }}
                  style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 14px", borderRadius: "6px", border: "none", background: "#059669", color: "#FFF", fontWeight: 700, fontSize: "12px", cursor: "pointer" }}
                >
                  <Plus size={14} /> Add Video Reel
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {settings.reelsSection?.reels?.map((reel: any, index: number) => {
                  const reelId = reel.id || index + 1;
                  const r2Key = `website/home/reels/${reelId}.webp`;

                  return (
                    <div key={reelId} style={{ border: `1px solid ${border}`, borderRadius: "10px", padding: "16px", background: inputBg, display: "flex", flexDirection: "column", gap: "10px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontWeight: 800, fontSize: "13px", color: "#0077B6" }}>Reel #{index + 1}</span>
                        <button
                          type="button"
                          onClick={() => {
                            deleteFileFromR2(r2Key);
                            const updated = settings.reelsSection.reels.filter((_: any, i: number) => i !== index);
                            setSettings({ ...settings, reelsSection: { ...settings.reelsSection, reels: updated } });
                          }}
                          style={{ background: "transparent", border: "none", color: "#DC2626", cursor: "pointer" }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <input type="text" placeholder="Instagram Link" value={reel.instagram} onChange={(e) => {
                        const updated = [...settings.reelsSection.reels];
                        updated[index].instagram = e.target.value;
                        setSettings({ ...settings, reelsSection: { ...settings.reelsSection, reels: updated } });
                      }} style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: `1px solid ${border}`, background: cardBg, color: textMain }} />

                      <R2UploadPicker
                        label="Video File Asset (MP4)"
                        r2Key={r2Key}
                        currentUrl={reel.video}
                        onUploadSuccess={(url) => {
                          const updated = [...settings.reelsSection.reels];
                          updated[index].video = url;
                          setSettings({ ...settings, reelsSection: { ...settings.reelsSection, reels: updated } });
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Blogs Cover Images R2 Uploads */}
            <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: "12px", padding: "24px", boxShadow: shadow }}>
              <h3 style={{ margin: "0 0 16px 0", color: textMain, fontSize: "16px", borderBottom: `1px solid ${border}`, paddingBottom: "12px" }}>
                Blog Cover Images (R2 Keys: website/home/blogs/blogId/cover.webp)
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {settings.blogsSection?.blogs?.map((blog: any, index: number) => {
                  const blogId = blog.id || index + 1;
                  const r2Key = `website/home/blogs/${blogId}/cover.webp`;

                  return (
                    <div key={blogId} style={{ border: `1px solid ${border}`, borderRadius: "10px", padding: "16px", background: inputBg, display: "flex", flexDirection: "column", gap: "10px" }}>
                      <input type="text" placeholder="Blog Title" value={blog.title} onChange={(e) => {
                        const updated = [...settings.blogsSection.blogs];
                        updated[index].title = e.target.value;
                        setSettings({ ...settings, blogsSection: { ...settings.blogsSection, blogs: updated } });
                      }} style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: `1px solid ${border}`, background: cardBg, color: textMain }} />

                      <R2UploadPicker
                        label="Blog Cover Image Asset"
                        r2Key={r2Key}
                        currentUrl={blog.image}
                        onUploadSuccess={(url) => {
                          const updated = [...settings.blogsSection.blogs];
                          updated[index].image = url;
                          setSettings({ ...settings, blogsSection: { ...settings.blogsSection, blogs: updated } });
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
