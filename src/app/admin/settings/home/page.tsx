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
  ArrowUp,
  ArrowDown,
  Search,
  Check,
  FolderCheck,
  Sparkles,
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
      targetKey = targetKey.replace(/\.(webp|jpg|jpeg|jfif|png|gif|svg|avif)$/i, `.${videoExt}`);
      if (!/\.[a-zA-Z0-9]+$/.test(targetKey)) {
        targetKey = `${targetKey}.${videoExt}`;
      }
    } else if (ext === "svg" || file.type?.includes("svg")) {
      targetKey = targetKey.replace(/\.(webp|jpg|jpeg|jfif|png|gif|avif|mp4|webm|mov|m4v)$/i, ".svg");
      if (!/\.svg$/i.test(targetKey)) {
        targetKey = `${targetKey}.svg`;
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
          <div style={{ width: "60px", height: "60px", borderRadius: "6px", overflow: "hidden", border: "1px solid #D1D5DB", flexShrink: 0, position: "relative", background: "#0F172A", display: "flex", alignItems: "center", justifyContent: "center" }}>
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
              <img
                src={currentUrl}
                alt={label}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  padding: "4px",
                  boxSizing: "border-box",
                }}
              />
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
  const [bestsellerSearch, setBestsellerSearch] = useState("");

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
              { id: "bestsellers", label: "4. Best Sellers & Collection" },
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
                  r2Key="website/home/header/logo.svg"
                  currentUrl={settings.header?.logo || ""}
                  accept="image/*,.svg"
                  onUploadSuccess={(url) => setSettings({ ...settings, header: { ...settings.header, logo: url } })}
                />

                <R2UploadPicker
                  label="Header Mobile Logo"
                  r2Key="website/home/header/mobile-logo.svg"
                  currentUrl={settings.header?.mobileLogo || settings.header?.logo || ""}
                  accept="image/*,.svg"
                  onUploadSuccess={(url) => setSettings({ ...settings, header: { ...settings.header, mobileLogo: url } })}
                />

                <R2UploadPicker
                  label="Footer Brand Logo"
                  r2Key="website/home/footer/logo.svg"
                  currentUrl={settings.footer?.logo || ""}
                  accept="image/*,.svg"
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

        {/* Tab 4: Best Sellers & Collection */}
        {activeTab === "bestsellers" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* 1. Best Sellers Section Settings */}
            <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: "12px", padding: "24px", boxShadow: shadow }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", borderBottom: `1px solid ${border}`, paddingBottom: "12px" }}>
                <div>
                  <h3 style={{ margin: 0, color: textMain, fontSize: "16px" }}>Best Seller Section Settings</h3>
                  <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: textMuted }}>Configure the homepage Best Seller section headlines, visibility, and source collection.</p>
                </div>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "13px", fontWeight: 700, color: textMain }}>
                  <input
                    type="checkbox"
                    checked={settings.bestSellersSection?.visible !== false}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        bestSellersSection: {
                          ...settings.bestSellersSection,
                          visible: e.target.checked,
                        },
                      })
                    }
                    style={{ cursor: "pointer", width: "16px", height: "16px" }}
                  />
                  <span>Show Section on Homepage</span>
                </label>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: textMain, marginBottom: "4px" }}>
                    Section Title (use Enter to break into lines, e.g. "Best\nSeller")
                  </label>
                  <textarea
                    rows={2}
                    value={settings.bestSellersSection?.title ?? "Best\nSeller"}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        bestSellersSection: {
                          ...settings.bestSellersSection,
                          title: e.target.value,
                        },
                      })
                    }
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: `1px solid ${border}`, background: inputBg, color: textMain, fontFamily: "inherit" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: textMain, marginBottom: "4px" }}>
                    Section Subtitle / Description
                  </label>
                  <textarea
                    rows={2}
                    value={settings.bestSellersSection?.description ?? "Top-rated, best-selling products trusted and loved by our customers."}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        bestSellersSection: {
                          ...settings.bestSellersSection,
                          description: e.target.value,
                        },
                      })
                    }
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: `1px solid ${border}`, background: inputBg, color: textMain, fontFamily: "inherit" }}
                  />
                </div>
              </div>

              {/* Collection Selection Dropdown */}
              <div style={{ background: isDark ? "#161B22" : "#F0F9FF", border: `1px solid ${isDark ? "#30363D" : "#BAE6FD"}`, borderRadius: "10px", padding: "18px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                  <FolderCheck size={18} color="#0077B6" />
                  <span style={{ fontSize: "14px", fontWeight: 800, color: textMain }}>Featured Collection / Category Feed</span>
                </div>
                <p style={{ margin: "0 0 12px 0", fontSize: "12px", color: textMuted }}>
                  Select which collection will automatically feed best seller products into the homepage slider. Choose &quot;All Categories&quot; to show a diverse mix from across the entire catalog.
                </p>

                <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
                  <select
                    value={settings.bestSellersSection?.collectionId || "all"}
                    onChange={(e) => {
                      const selectedId = e.target.value;
                      const selectedCat = dbCategories.find(
                        (c) => String(c.id) === String(selectedId) || String(c.slug) === String(selectedId)
                      );
                      setSettings({
                        ...settings,
                        bestSellersSection: {
                          ...settings.bestSellersSection,
                          collectionId: selectedId,
                          collectionName: selectedCat ? selectedCat.name : "",
                        },
                      });
                    }}
                    style={{
                      flex: 1,
                      minWidth: "260px",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      border: `1px solid ${border}`,
                      background: cardBg,
                      color: textMain,
                      fontSize: "13px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    <option value="all">🌟 All Categories (Dynamic Diverse Best Sellers)</option>
                    {dbCategories.map((c) => (
                      <option key={c.id || c.slug} value={c.id || c.slug}>
                        📁 {c.name} {c.productCount ? `(${c.productCount} products)` : ""}
                      </option>
                    ))}
                  </select>

                  {settings.bestSellersSection?.collectionId && settings.bestSellersSection.collectionId !== "all" && (
                    <button
                      type="button"
                      onClick={() =>
                        setSettings({
                          ...settings,
                          bestSellersSection: {
                            ...settings.bestSellersSection,
                            collectionId: "all",
                            collectionName: "",
                          },
                        })
                      }
                      style={{
                        padding: "9px 14px",
                        borderRadius: "6px",
                        border: `1px solid ${border}`,
                        background: cardBg,
                        color: textMuted,
                        fontSize: "12px",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Reset to All Categories
                    </button>
                  )}
                </div>

                {settings.bestSellersSection?.collectionName && settings.bestSellersSection.collectionId !== "all" && (
                  <div style={{ marginTop: "12px", display: "inline-flex", alignItems: "center", gap: "6px", background: "#E0F2FE", color: "#0369A1", padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: 700 }}>
                    <Sparkles size={14} /> Active Collection Filter: <u>{settings.bestSellersSection.collectionName}</u>
                  </div>
                )}
              </div>
            </div>

            {/* 2. Curated Best Seller Products (Optional Manual Overrides) */}
            <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: "12px", padding: "24px", boxShadow: shadow }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", borderBottom: `1px solid ${border}`, paddingBottom: "12px", flexWrap: "wrap", gap: "10px" }}>
                <div>
                  <h3 style={{ margin: 0, color: textMain, fontSize: "16px" }}>Curated Best Seller Products (Optional Manual Overrides)</h3>
                  <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: textMuted }}>
                    Search and pick specific products to feature in the Best Seller section. If empty, the carousel will automatically display products from your selected collection above.
                  </p>
                </div>

                {Array.isArray(settings.bestSellersSection?.products) && settings.bestSellersSection.products.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm("Remove all manually pinned products and return to the automated collection feed?")) {
                        setSettings({
                          ...settings,
                          bestSellersSection: { ...settings.bestSellersSection, products: [] },
                        });
                      }
                    }}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "6px",
                      border: "1px solid #FECACA",
                      background: "#FEF2F2",
                      color: "#DC2626",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Clear All Curated Products
                  </button>
                )}
              </div>

              {/* Product Search & Picker */}
              <div style={{ marginBottom: "20px" }}>
                <div style={{ position: "relative" }}>
                  <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: textMuted }} />
                  <input
                    type="text"
                    placeholder="Search catalog to add best seller product (by name, SKU code, or category)..."
                    value={bestsellerSearch}
                    onChange={(e) => setBestsellerSearch(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 12px 10px 38px",
                      borderRadius: "8px",
                      border: `1px solid ${border}`,
                      background: inputBg,
                      color: textMain,
                      fontSize: "13px",
                      boxSizing: "border-box",
                    }}
                  />
                  {bestsellerSearch && (
                    <button
                      type="button"
                      onClick={() => setBestsellerSearch("")}
                      style={{
                        position: "absolute",
                        right: "12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        color: textMuted,
                        cursor: "pointer",
                        fontSize: "12px",
                      }}
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Instant Search Results Dropdown */}
                {bestsellerSearch.trim().length > 0 && (
                  <div
                    style={{
                      marginTop: "8px",
                      border: `1px solid ${border}`,
                      borderRadius: "8px",
                      background: cardBg,
                      maxHeight: "320px",
                      overflowY: "auto",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                    }}
                  >
                    {(() => {
                      const query = bestsellerSearch.trim().toLowerCase();
                      const currentProducts = settings.bestSellersSection?.products || [];
                      const hits = dbProducts
                        .filter((p) => {
                          const name = (p.name || "").toLowerCase();
                          const code = (p.code || p.skuCode || p.article || "").toLowerCase();
                          const cat = (p.category || "").toLowerCase();
                          return name.includes(query) || code.includes(query) || cat.includes(query);
                        })
                        .slice(0, 8);

                      if (hits.length === 0) {
                        return (
                          <div style={{ padding: "16px", color: textMuted, textAlign: "center", fontSize: "13px" }}>
                            No products found matching &quot;{bestsellerSearch}&quot;.
                          </div>
                        );
                      }

                      return hits.map((p) => {
                        const isAdded = currentProducts.some(
                          (cur: any) => cur.id === p.id || (p.code && cur.sku === p.code)
                        );

                        return (
                          <div
                            key={p.id}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              gap: "12px",
                              padding: "10px 14px",
                              borderBottom: `1px solid ${border}`,
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
                              <img
                                src={p.image || "/api/media/website/catalogue/products/default/image.webp"}
                                alt={p.name}
                                style={{ width: "40px", height: "40px", borderRadius: "6px", objectFit: "contain", border: `1px solid ${border}`, background: "#FFF" }}
                              />
                              <div style={{ minWidth: 0 }}>
                                <div style={{ fontWeight: 700, fontSize: "13px", color: textMain, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                  {p.name}
                                </div>
                                <div style={{ fontSize: "11px", color: textMuted }}>
                                  {p.skuCode || p.code || "RN-PROD"} • ₹{((p.inSelling || p.price || 0)).toLocaleString()} • {p.category || "Bath Fittings"}
                                </div>
                              </div>
                            </div>

                            <button
                              type="button"
                              disabled={isAdded}
                              onClick={() => {
                                const newProd = {
                                  id: p.id,
                                  name: p.name,
                                  price: `₹${(p.inSelling || p.price || 0).toLocaleString()}`,
                                  sku: p.skuCode || p.code || p.article || `RN-${p.id}`,
                                  image: p.image || "/api/media/website/catalogue/products/default/image.webp",
                                  category: p.category || "Bath Fittings",
                                };
                                const updated = [...(settings.bestSellersSection?.products || []), newProd];
                                setSettings({
                                  ...settings,
                                  bestSellersSection: {
                                    ...settings.bestSellersSection,
                                    products: updated,
                                  },
                                });
                                setBestsellerSearch("");
                              }}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                                padding: "6px 12px",
                                borderRadius: "6px",
                                border: isAdded ? "1px solid #D1D5DB" : "none",
                                background: isAdded ? "#F3F4F6" : "#0077B6",
                                color: isAdded ? "#9CA3AF" : "#FFF",
                                fontSize: "12px",
                                fontWeight: 700,
                                cursor: isAdded ? "default" : "pointer",
                                flexShrink: 0,
                              }}
                            >
                              {isAdded ? (
                                <>
                                  <Check size={12} /> Added
                                </>
                              ) : (
                                <>
                                  <Plus size={12} /> Add to Best Sellers
                                </>
                              )}
                            </button>
                          </div>
                        );
                      });
                    })()}
                  </div>
                )}
              </div>

              {/* Current Selected Products List */}
              {Array.isArray(settings.bestSellersSection?.products) && settings.bestSellersSection.products.length > 0 ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "14px" }}>
                  {settings.bestSellersSection.products.map((prod: any, index: number) => (
                    <div
                      key={prod.id || index}
                      style={{
                        border: `1px solid ${border}`,
                        borderRadius: "10px",
                        padding: "14px",
                        background: inputBg,
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      <span style={{ fontSize: "11px", fontWeight: 800, color: "#0077B6", background: isDark ? "#1F6FEB22" : "#E0F2FE", padding: "3px 7px", borderRadius: "4px", flexShrink: 0 }}>
                        #{index + 1}
                      </span>

                      <img
                        src={prod.image || "/api/media/website/catalogue/products/default/image.webp"}
                        alt={prod.name}
                        style={{ width: "48px", height: "48px", borderRadius: "6px", objectFit: "contain", border: `1px solid ${border}`, background: "#FFF", flexShrink: 0 }}
                      />

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, color: textMain, fontSize: "13px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {prod.name}
                        </div>
                        <div style={{ fontSize: "11px", color: textMuted }}>
                          {prod.sku} • {prod.price}
                        </div>
                        {prod.category && (
                          <div style={{ fontSize: "10px", color: "#0284C7", marginTop: "2px" }}>
                            {prod.category}
                          </div>
                        )}
                      </div>

                      {/* Action buttons: Up, Down, Remove */}
                      <div style={{ display: "flex", alignItems: "center", gap: "4px", flexShrink: 0 }}>
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => {
                            if (index === 0) return;
                            const items = [...settings.bestSellersSection.products];
                            const temp = items[index - 1];
                            items[index - 1] = items[index];
                            items[index] = temp;
                            setSettings({
                              ...settings,
                              bestSellersSection: { ...settings.bestSellersSection, products: items },
                            });
                          }}
                          style={{
                            padding: "5px",
                            borderRadius: "4px",
                            border: `1px solid ${border}`,
                            background: cardBg,
                            color: index === 0 ? "#9CA3AF" : textMain,
                            cursor: index === 0 ? "not-allowed" : "pointer",
                          }}
                          title="Move Up"
                        >
                          <ArrowUp size={13} />
                        </button>

                        <button
                          type="button"
                          disabled={index === settings.bestSellersSection.products.length - 1}
                          onClick={() => {
                            if (index === settings.bestSellersSection.products.length - 1) return;
                            const items = [...settings.bestSellersSection.products];
                            const temp = items[index + 1];
                            items[index + 1] = items[index];
                            items[index] = temp;
                            setSettings({
                              ...settings,
                              bestSellersSection: { ...settings.bestSellersSection, products: items },
                            });
                          }}
                          style={{
                            padding: "5px",
                            borderRadius: "4px",
                            border: `1px solid ${border}`,
                            background: cardBg,
                            color: index === settings.bestSellersSection.products.length - 1 ? "#9CA3AF" : textMain,
                            cursor: index === settings.bestSellersSection.products.length - 1 ? "not-allowed" : "pointer",
                          }}
                          title="Move Down"
                        >
                          <ArrowDown size={13} />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            const updated = settings.bestSellersSection.products.filter((_: any, i: number) => i !== index);
                            setSettings({
                              ...settings,
                              bestSellersSection: { ...settings.bestSellersSection, products: updated },
                            });
                          }}
                          style={{
                            padding: "5px",
                            borderRadius: "4px",
                            border: "1px solid #FECACA",
                            background: "#FEF2F2",
                            color: "#DC2626",
                            cursor: "pointer",
                          }}
                          title="Remove product"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  style={{
                    border: `1px dashed ${border}`,
                    borderRadius: "10px",
                    padding: "28px",
                    textAlign: "center",
                    color: textMuted,
                  }}
                >
                  <p style={{ margin: "0 0 6px 0", fontSize: "14px", fontWeight: 700, color: textMain }}>
                    No manual products pinned
                  </p>
                  <p style={{ margin: 0, fontSize: "12px" }}>
                    The homepage Best Seller section is currently streaming dynamic products automatically from your selected collection (
                    <strong>{settings.bestSellersSection?.collectionName || "All Categories"}</strong>).
                    Use the search bar above if you want to feature specific products manually.
                  </p>
                </div>
              )}
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
