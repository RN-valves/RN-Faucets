"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import { useAdminTheme } from "@/app/admin/layout";
import {
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Upload,
  ExternalLink,
  Copy,
  Check,
  Search,
  Plus,
  Trash2,
  Info,
  ShieldCheck,
  Eye,
  FileImage,
} from "lucide-react";

interface WebsitePhotoItem {
  _id: string;
  photoId: string;
  title: string;
  description?: string;
  category: "auth" | "branding" | "catalogue" | "homepage" | "other";
  location: string;
  r2Key: string;
  localPath?: string;
  recommendedResolution?: string;
  publicUrl: string;
  isCustom?: boolean;
  exists: boolean;
  status: "healthy" | "missing";
  sizeBytes?: number;
  sizeFormatted?: string;
  contentType?: string;
  lastModified?: string;
  localExists?: boolean;
  r2Exists?: boolean;
}

interface PhotoSummary {
  total: number;
  healthyCount: number;
  missingCount: number;
}

export default function WebsitePhotosAdminPage() {
  const { theme, toggleTheme } = useAdminTheme();
  const isDark = theme === "dark";

  // Data state
  const [photos, setPhotos] = useState<WebsitePhotoItem[]>([]);
  const [summary, setSummary] = useState<PhotoSummary>({
    total: 0,
    healthyCount: 0,
    missingCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters & search
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Uploading state per photoId
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [uploadProgressText, setUploadProgressText] = useState("");
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Add Custom Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newPhotoData, setNewPhotoData] = useState({
    photoId: "",
    title: "",
    description: "",
    category: "other" as const,
    location: "",
    r2Key: "",
    recommendedResolution: "",
  });
  const [submittingNew, setSubmittingNew] = useState(false);

  // Color tokens matching RN Valves admin dashboard
  const cardBg = isDark ? "#0D1117" : "#FFFFFF";
  const border = isDark ? "#21262D" : "#E5E7EB";
  const textMain = isDark ? "#F0F6FC" : "#111827";
  const textMuted = isDark ? "#8B949E" : "#6B7280";
  const inputBg = isDark ? "#161B22" : "#F9FAFB";
  const shadow = isDark ? "none" : "0 4px 16px rgba(0, 0, 0, 0.05)";

  const showToast = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchPhotos = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await fetch("/api/website-photos");
      const data = await res.json();
      if (data.success) {
        setPhotos(data.photos || []);
        setSummary(
          data.summary || {
            total: data.photos?.length || 0,
            healthyCount: data.photos?.filter((p: WebsitePhotoItem) => p.exists).length || 0,
            missingCount: data.photos?.filter((p: WebsitePhotoItem) => !p.exists).length || 0,
          }
        );
      } else {
        showToast("error", data.error || "Failed to load photos");
      }
    } catch (err: any) {
      showToast("error", err?.message || "Network error loading photos");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  // Handle Photo File Upload
  const handleUploadPhoto = async (photoId: string, file: File) => {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    if (file.size > 50 * 1024 * 1024) {
      alert(`File size (${sizeMB} MB) is too large. Max limit is 50 MB.`);
      return;
    }

    setUploadingId(photoId);
    setUploadProgressText(`Uploading ${sizeMB} MB...`);

    try {
      const formData = new FormData();
      formData.append("photoId", photoId);
      formData.append("file", file);

      const res = await fetch("/api/website-photos", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast("success", data.message || "Photo updated successfully!");
        // Update local state immediately with updated photo
        setPhotos((prev) =>
          prev.map((p) => (p.photoId === photoId ? data.photo : p))
        );
        // Refresh full summary
        fetchPhotos(true);
      } else {
        showToast("error", data.error || "Upload failed. Please try again.");
      }
    } catch (err: any) {
      showToast("error", err?.message || "Upload failed due to network error.");
    } finally {
      setUploadingId(null);
      setUploadProgressText("");
    }
  };

  const handleCopyUrl = (id: string, url: string) => {
    const fullUrl = url.startsWith("http") ? url : `${window.location.origin}${url}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAddCustomPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhotoData.photoId || !newPhotoData.title || !newPhotoData.location || !newPhotoData.r2Key) {
      alert("Please fill in all required fields (Photo ID, Title, Location, and Storage Key).");
      return;
    }

    setSubmittingNew(true);
    try {
      const res = await fetch("/api/website-photos", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPhotoData),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast("success", "Custom photo tracker added!");
        setIsAddModalOpen(false);
        setNewPhotoData({
          photoId: "",
          title: "",
          description: "",
          category: "other",
          location: "",
          r2Key: "",
          recommendedResolution: "",
        });
        fetchPhotos(true);
      } else {
        showToast("error", data.error || "Failed to add photo tracker");
      }
    } catch (err: any) {
      showToast("error", err?.message || "Error adding photo tracker");
    } finally {
      setSubmittingNew(false);
    }
  };

  const handleDeleteCustomPhoto = async (photoId: string) => {
    if (!confirm(`Are you sure you want to delete tracker for "${photoId}"?`)) return;

    try {
      const res = await fetch(`/api/website-photos?photoId=${encodeURIComponent(photoId)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast("success", "Photo tracker deleted.");
        fetchPhotos(true);
      } else {
        showToast("error", data.error || "Delete failed");
      }
    } catch (err: any) {
      showToast("error", err?.message || "Error deleting photo tracker");
    }
  };

  // Filtered photos
  const filteredPhotos = photos.filter((p) => {
    if (activeCategory === "missing" && p.exists) return false;
    if (activeCategory !== "all" && activeCategory !== "missing" && p.category !== activeCategory) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q) ||
        p.r2Key.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <AdminHeader
        title="Website Photos & Assets"
        subtitle="Live audit and asset manager to ensure login banners, brand logos, placeholders, and showcase photos are never broken or missing."
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <main
        style={{
          padding: "32px",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          maxWidth: "1300px",
          margin: "0 auto",
          width: "100%",
          boxSizing: "border-box",
          fontFamily: "'Manrope', system-ui, sans-serif",
        }}
      >
        {/* Toast Notification */}
        {notification && (
          <div
            style={{
              position: "fixed",
              bottom: "28px",
              right: "28px",
              zIndex: 9999,
              background: notification.type === "success" ? "#059669" : "#DC2626",
              color: "#FFFFFF",
              padding: "14px 22px",
              borderRadius: "10px",
              fontSize: "14px",
              fontWeight: 700,
              boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            {notification.type === "success" ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
            {notification.message}
          </div>
        )}

        {/* ── TOP HEALTH SUMMARY CARDS ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "16px",
          }}
        >
          {/* Total Photos */}
          <div
            style={{
              background: cardBg,
              border: `1px solid ${border}`,
              borderRadius: "12px",
              padding: "20px 24px",
              boxShadow: shadow,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div style={{ fontSize: "13px", fontWeight: 700, color: textMuted, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                Total Tracked Photos
              </div>
              <div style={{ fontSize: "28px", fontWeight: 800, color: textMain, marginTop: "4px" }}>
                {summary.total}
              </div>
            </div>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                background: isDark ? "rgba(0, 119, 182, 0.15)" : "#E0F2FE",
                color: "#0077B6",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FileImage size={24} />
            </div>
          </div>

          {/* Healthy / Active Photos */}
          <div
            style={{
              background: cardBg,
              border: `1px solid ${border}`,
              borderRadius: "12px",
              padding: "20px 24px",
              boxShadow: shadow,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div style={{ fontSize: "13px", fontWeight: 700, color: textMuted, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                Active & Live
              </div>
              <div style={{ fontSize: "28px", fontWeight: 800, color: "#10B981", marginTop: "4px" }}>
                {summary.healthyCount}
              </div>
            </div>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                background: isDark ? "rgba(16, 185, 129, 0.15)" : "#D1FAE5",
                color: "#10B981",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ShieldCheck size={24} />
            </div>
          </div>

          {/* Missing Photos Warning */}
          <div
            style={{
              background: cardBg,
              border: `1px solid ${summary.missingCount > 0 ? "#EF4444" : border}`,
              borderRadius: "12px",
              padding: "20px 24px",
              boxShadow: shadow,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div style={{ fontSize: "13px", fontWeight: 700, color: summary.missingCount > 0 ? "#EF4444" : textMuted, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                Missing / Broken Photos
              </div>
              <div
                style={{
                  fontSize: "28px",
                  fontWeight: 800,
                  color: summary.missingCount > 0 ? "#EF4444" : textMain,
                  marginTop: "4px",
                }}
              >
                {summary.missingCount}
              </div>
            </div>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                background: summary.missingCount > 0 ? "rgba(239, 68, 68, 0.15)" : (isDark ? "rgba(255,255,255,0.06)" : "#F3F4F6"),
                color: summary.missingCount > 0 ? "#EF4444" : textMuted,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <AlertTriangle size={24} />
            </div>
          </div>

          {/* Action Toolbar Box */}
          <div
            style={{
              background: cardBg,
              border: `1px solid ${border}`,
              borderRadius: "12px",
              padding: "16px 20px",
              boxShadow: shadow,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: "10px",
            }}
          >
            <button
              onClick={() => fetchPhotos(true)}
              disabled={refreshing}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                padding: "10px 16px",
                background: isDark ? "#21262D" : "#F3F4F6",
                color: textMain,
                border: `1px solid ${border}`,
                borderRadius: "8px",
                fontSize: "13.5px",
                fontWeight: 700,
                cursor: refreshing ? "not-allowed" : "pointer",
                transition: "background 0.2s",
              }}
            >
              <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
              {refreshing ? "Scanning Files..." : "Scan & Verify Health"}
            </button>

            <button
              onClick={() => setIsAddModalOpen(true)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                padding: "10px 16px",
                background: "linear-gradient(135deg, #0077B6 0%, #0096C7 100%)",
                color: "#FFFFFF",
                border: "none",
                borderRadius: "8px",
                fontSize: "13.5px",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(0, 119, 182, 0.25)",
              }}
            >
              <Plus size={16} /> Track New Photo
            </button>
          </div>
        </div>

        {/* ── CONDITIONAL ALERT BANNER IF PHOTOS ARE MISSING ── */}
        {summary.missingCount > 0 && (
          <div
            style={{
              background: isDark ? "rgba(220, 38, 38, 0.15)" : "#FEF2F2",
              border: "1.5px solid #EF4444",
              borderRadius: "12px",
              padding: "16px 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "16px",
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <AlertTriangle size={24} color="#EF4444" style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 800, color: "#DC2626", fontSize: "15px" }}>
                  {summary.missingCount} Website Photo(s) Missing or Broken!
                </div>
                <div style={{ fontSize: "13px", color: isDark ? "#F87171" : "#B91C1C", marginTop: "2px" }}>
                  Visitors may see a blank white space on the live website. Click &quot;Upload Photo&quot; on the cards below to fix them instantly.
                </div>
              </div>
            </div>
            <button
              onClick={() => setActiveCategory("missing")}
              style={{
                padding: "8px 16px",
                background: "#DC2626",
                color: "#FFFFFF",
                border: "none",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: 700,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              Filter Missing Photos →
            </button>
          </div>
        )}

        {/* ── FILTER TABS & SEARCH BAR ── */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          {/* Category Tabs */}
          <div
            style={{
              display: "flex",
              gap: "8px",
              flexWrap: "wrap",
            }}
          >
            {[
              { id: "all", label: "All Photos", count: photos.length },
              { id: "auth", label: "Auth & Login Banners", count: photos.filter((p) => p.category === "auth").length },
              { id: "branding", label: "Logos & Branding", count: photos.filter((p) => p.category === "branding").length },
              { id: "catalogue", label: "Catalogue & Fallbacks", count: photos.filter((p) => p.category === "catalogue").length },
              { id: "homepage", label: "Homepage & Showcase", count: photos.filter((p) => p.category === "homepage").length },
              ...(summary.missingCount > 0
                ? [{ id: "missing", label: "⚠️ Missing Only", count: summary.missingCount }]
                : []),
            ].map((tab) => {
              const isActive = activeCategory === tab.id;
              const isMissingTab = tab.id === "missing";
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveCategory(tab.id)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "999px",
                    border: `1px solid ${isActive ? (isMissingTab ? "#EF4444" : "#0077B6") : border}`,
                    background: isActive
                      ? isMissingTab
                        ? "#DC2626"
                        : "#0077B6"
                      : cardBg,
                    color: isActive ? "#FFFFFF" : textMain,
                    fontSize: "13px",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    transition: "all 0.15s ease",
                  }}
                >
                  <span>{tab.label}</span>
                  <span
                    style={{
                      background: isActive ? "rgba(255,255,255,0.25)" : (isDark ? "#21262D" : "#E5E7EB"),
                      padding: "2px 7px",
                      borderRadius: "999px",
                      fontSize: "11px",
                      fontWeight: 800,
                    }}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: inputBg,
              border: `1px solid ${border}`,
              borderRadius: "8px",
              padding: "0 12px",
              height: "40px",
              width: "280px",
            }}
          >
            <Search size={16} color={textMuted} />
            <input
              type="text"
              placeholder="Search photo, page, or key..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: "transparent",
                border: "none",
                outline: "none",
                color: textMain,
                fontSize: "13.5px",
                width: "100%",
                fontFamily: "'Manrope', system-ui, sans-serif",
              }}
            />
          </div>
        </div>

        {/* ── PHOTO CARDS GRID ── */}
        {loading ? (
          <div
            style={{
              padding: "60px",
              textAlign: "center",
              color: textMuted,
              fontSize: "15px",
              fontWeight: 600,
              background: cardBg,
              borderRadius: "12px",
              border: `1px solid ${border}`,
            }}
          >
            <RefreshCw size={24} className="animate-spin" style={{ margin: "0 auto 12px" }} />
            Verifying website photo assets and storage health...
          </div>
        ) : filteredPhotos.length === 0 ? (
          <div
            style={{
              padding: "60px",
              textAlign: "center",
              color: textMuted,
              fontSize: "14px",
              background: cardBg,
              borderRadius: "12px",
              border: `1px solid ${border}`,
            }}
          >
            No photos match your active filter.
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
              gap: "24px",
            }}
          >
            {filteredPhotos.map((photo) => {
              const isUploadingThis = uploadingId === photo.photoId;
              const hasBrokenPhoto = !photo.exists;

              return (
                <div
                  key={photo.photoId}
                  style={{
                    background: cardBg,
                    border: `1.5px solid ${hasBrokenPhoto ? "#EF4444" : border}`,
                    borderRadius: "14px",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    boxShadow: shadow,
                    transition: "border-color 0.2s, box-shadow 0.2s",
                  }}
                >
                  {/* Photo Preview Stage */}
                  <div
                    style={{
                      height: "210px",
                      position: "relative",
                      background: isDark ? "#05070A" : "#F3F4F6",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                      borderBottom: `1px solid ${border}`,
                    }}
                  >
                    {/* Live Image or Broken State */}
                    {hasBrokenPhoto ? (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: "8px",
                          color: "#EF4444",
                          padding: "20px",
                          textAlign: "center",
                        }}
                      >
                        <AlertTriangle size={36} />
                        <div style={{ fontWeight: 800, fontSize: "14px" }}>
                          IMAGE MISSING / NOT FOUND
                        </div>
                        <div style={{ fontSize: "12px", color: textMuted, maxWidth: "260px" }}>
                          No image file detected at this path. Upload a replacement photo to resolve this immediately.
                        </div>
                      </div>
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={photo.publicUrl}
                        alt={photo.title}
                        onError={(e) => {
                          // Handle runtime img load failure
                          (e.target as HTMLElement).style.display = "none";
                        }}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: photo.category === "branding" ? "contain" : "cover",
                          padding: photo.category === "branding" ? "20px" : "0",
                          boxSizing: "border-box",
                        }}
                      />
                    )}

                    {/* Top Status Pill Overlay */}
                    <div
                      style={{
                        position: "absolute",
                        top: "12px",
                        left: "12px",
                        padding: "5px 12px",
                        borderRadius: "999px",
                        fontSize: "11.5px",
                        fontWeight: 800,
                        background: hasBrokenPhoto ? "#DC2626" : "rgba(16, 185, 129, 0.95)",
                        color: "#FFFFFF",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                      }}
                    >
                      {hasBrokenPhoto ? <AlertTriangle size={13} /> : <CheckCircle2 size={13} />}
                      {hasBrokenPhoto ? "Missing / Broken" : "Active & Live"}
                    </div>

                    {/* Format & Size Badge */}
                    {photo.sizeFormatted && photo.sizeFormatted !== "0 KB" && (
                      <div
                        style={{
                          position: "absolute",
                          bottom: "10px",
                          right: "12px",
                          padding: "4px 10px",
                          borderRadius: "6px",
                          fontSize: "11px",
                          fontWeight: 700,
                          background: "rgba(0, 0, 0, 0.75)",
                          color: "#FFFFFF",
                          backdropFilter: "blur(6px)",
                        }}
                      >
                        {photo.sizeFormatted}
                      </div>
                    )}
                  </div>

                  {/* Card Content & Details */}
                  <div
                    style={{
                      padding: "20px",
                      display: "flex",
                      flexDirection: "column",
                      flex: 1,
                      gap: "14px",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: "8px",
                        }}
                      >
                        <h3
                          style={{
                            fontSize: "16px",
                            fontWeight: 800,
                            color: textMain,
                            margin: 0,
                          }}
                        >
                          {photo.title}
                        </h3>
                        {photo.isCustom && (
                          <button
                            onClick={() => handleDeleteCustomPhoto(photo.photoId)}
                            title="Delete custom tracker"
                            style={{
                              border: "none",
                              background: "transparent",
                              color: "#EF4444",
                              cursor: "pointer",
                              padding: "4px",
                            }}
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>

                      {photo.description && (
                        <p
                          style={{
                            fontSize: "12.5px",
                            color: textMuted,
                            margin: "4px 0 0",
                            lineHeight: 1.45,
                          }}
                        >
                          {photo.description}
                        </p>
                      )}
                    </div>

                    {/* Metadata Specs */}
                    <div
                      style={{
                        background: inputBg,
                        border: `1px solid ${border}`,
                        borderRadius: "8px",
                        padding: "10px 12px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px",
                        fontSize: "12px",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: textMuted, fontWeight: 600 }}>Page Location:</span>
                        <span style={{ color: textMain, fontWeight: 700 }}>{photo.location}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: textMuted, fontWeight: 600 }}>Recommended Res:</span>
                        <span style={{ color: "#0077B6", fontWeight: 700 }}>
                          {photo.recommendedResolution || "Optimized Web"}
                        </span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", overflow: "hidden" }}>
                        <span style={{ color: textMuted, fontWeight: 600, flexShrink: 0 }}>Storage Key:</span>
                        <span
                          title={photo.r2Key}
                          style={{
                            color: textMuted,
                            fontWeight: 500,
                            fontFamily: "monospace",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            maxWidth: "180px",
                          }}
                        >
                          {photo.r2Key}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons Toolbar */}
                    <div
                      style={{
                        marginTop: "auto",
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                      }}
                    >
                      {/* Upload / Replace Photo Button */}
                      <label
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "8px",
                          padding: "11px 16px",
                          borderRadius: "8px",
                          background: hasBrokenPhoto
                            ? "#DC2626"
                            : "linear-gradient(135deg, #0077B6 0%, #0096C7 100%)",
                          color: "#FFFFFF",
                          fontSize: "13.5px",
                          fontWeight: 700,
                          cursor: isUploadingThis ? "not-allowed" : "pointer",
                          boxShadow: hasBrokenPhoto
                            ? "0 4px 14px rgba(220, 38, 38, 0.3)"
                            : "0 4px 14px rgba(0, 119, 182, 0.25)",
                          transition: "transform 0.15s, opacity 0.15s",
                        }}
                      >
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp,image/svg+xml"
                          disabled={isUploadingThis}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleUploadPhoto(photo.photoId, file);
                            e.target.value = "";
                          }}
                          style={{ display: "none" }}
                        />
                        {isUploadingThis ? (
                          <>
                            <RefreshCw size={16} className="animate-spin" />
                            <span>{uploadProgressText || "Uploading Photo..."}</span>
                          </>
                        ) : (
                          <>
                            <Upload size={16} />
                            <span>{hasBrokenPhoto ? "Upload Replacement Photo" : "Upload / Replace Photo"}</span>
                          </>
                        )}
                      </label>

                      {/* Secondary Action Links */}
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: "8px",
                        }}
                      >
                        {/* Copy URL */}
                        <button
                          type="button"
                          onClick={() => handleCopyUrl(photo.photoId, photo.publicUrl)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "6px",
                            padding: "8px 12px",
                            borderRadius: "6px",
                            border: `1px solid ${border}`,
                            background: isDark ? "#161B22" : "#F3F4F6",
                            color: textMain,
                            fontSize: "12px",
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          {copiedId === photo.photoId ? (
                            <>
                              <Check size={14} color="#10B981" />
                              <span style={{ color: "#10B981" }}>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy size={14} />
                              <span>Copy URL</span>
                            </>
                          )}
                        </button>

                        {/* View Live Page */}
                        <a
                          href={photo.location.startsWith("/") ? photo.location : photo.publicUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "6px",
                            padding: "8px 12px",
                            borderRadius: "6px",
                            border: `1px solid ${border}`,
                            background: isDark ? "#161B22" : "#F3F4F6",
                            color: textMain,
                            fontSize: "12px",
                            fontWeight: 600,
                            textDecoration: "none",
                            cursor: "pointer",
                          }}
                        >
                          <Eye size={14} />
                          <span>View Live</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── MODAL: ADD CUSTOM PHOTO TRACKER ── */}
        {isAddModalOpen && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0, 0, 0, 0.65)",
              backdropFilter: "blur(4px)",
              zIndex: 9999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px",
            }}
          >
            <div
              style={{
                background: cardBg,
                border: `1px solid ${border}`,
                borderRadius: "16px",
                width: "100%",
                maxWidth: "520px",
                padding: "28px",
                boxShadow: "0 20px 50px rgba(0,0,0,0.4)",
                display: "flex",
                flexDirection: "column",
                gap: "20px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ fontSize: "18px", fontWeight: 800, color: textMain, margin: 0 }}>
                  Track a New Website Photo
                </h3>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  style={{
                    border: "none",
                    background: "transparent",
                    color: textMuted,
                    fontSize: "20px",
                    cursor: "pointer",
                    padding: "4px",
                  }}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddCustomPhoto} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div>
                  <label style={{ fontSize: "12.5px", fontWeight: 700, color: textMain }}>
                    Unique Photo ID *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. contact-hero-banner"
                    value={newPhotoData.photoId}
                    onChange={(e) =>
                      setNewPhotoData({
                        ...newPhotoData,
                        photoId: e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ""),
                      })
                    }
                    style={{
                      width: "100%",
                      background: inputBg,
                      border: `1px solid ${border}`,
                      borderRadius: "8px",
                      padding: "10px",
                      color: textMain,
                      fontSize: "13.5px",
                      marginTop: "4px",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "12.5px", fontWeight: 700, color: textMain }}>
                    Photo Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Contact Us Hero Banner"
                    value={newPhotoData.title}
                    onChange={(e) => setNewPhotoData({ ...newPhotoData, title: e.target.value })}
                    style={{
                      width: "100%",
                      background: inputBg,
                      border: `1px solid ${border}`,
                      borderRadius: "8px",
                      padding: "10px",
                      color: textMain,
                      fontSize: "13.5px",
                      marginTop: "4px",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <label style={{ fontSize: "12.5px", fontWeight: 700, color: textMain }}>
                      Category
                    </label>
                    <select
                      value={newPhotoData.category}
                      onChange={(e) =>
                        setNewPhotoData({ ...newPhotoData, category: e.target.value as any })
                      }
                      style={{
                        width: "100%",
                        background: inputBg,
                        border: `1px solid ${border}`,
                        borderRadius: "8px",
                        padding: "10px",
                        color: textMain,
                        fontSize: "13.5px",
                        marginTop: "4px",
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                    >
                      <option value="auth">Auth & Login</option>
                      <option value="branding">Logos & Branding</option>
                      <option value="catalogue">Catalogue</option>
                      <option value="homepage">Homepage</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: "12.5px", fontWeight: 700, color: textMain }}>
                      Page Location *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. /contact-us"
                      value={newPhotoData.location}
                      onChange={(e) => setNewPhotoData({ ...newPhotoData, location: e.target.value })}
                      style={{
                        width: "100%",
                        background: inputBg,
                        border: `1px solid ${border}`,
                        borderRadius: "8px",
                        padding: "10px",
                        color: textMain,
                        fontSize: "13.5px",
                        marginTop: "4px",
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: "12.5px", fontWeight: 700, color: textMain }}>
                    Cloudflare R2 Storage Key *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. website/contact/hero-banner.webp"
                    value={newPhotoData.r2Key}
                    onChange={(e) => setNewPhotoData({ ...newPhotoData, r2Key: e.target.value })}
                    style={{
                      width: "100%",
                      background: inputBg,
                      border: `1px solid ${border}`,
                      borderRadius: "8px",
                      padding: "10px",
                      color: textMain,
                      fontSize: "13.5px",
                      marginTop: "4px",
                      outline: "none",
                      boxSizing: "border-box",
                      fontFamily: "monospace",
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "12.5px", fontWeight: 700, color: textMain }}>
                    Recommended Resolution
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 1920 x 800 px"
                    value={newPhotoData.recommendedResolution}
                    onChange={(e) =>
                      setNewPhotoData({ ...newPhotoData, recommendedResolution: e.target.value })
                    }
                    style={{
                      width: "100%",
                      background: inputBg,
                      border: `1px solid ${border}`,
                      borderRadius: "8px",
                      padding: "10px",
                      color: textMain,
                      fontSize: "13.5px",
                      marginTop: "4px",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    style={{
                      padding: "10px 18px",
                      borderRadius: "8px",
                      border: `1px solid ${border}`,
                      background: isDark ? "#21262D" : "#F3F4F6",
                      color: textMain,
                      fontSize: "13.5px",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingNew}
                    style={{
                      padding: "10px 22px",
                      borderRadius: "8px",
                      border: "none",
                      background: "linear-gradient(135deg, #0077B6 0%, #0096C7 100%)",
                      color: "#FFFFFF",
                      fontSize: "13.5px",
                      fontWeight: 700,
                      cursor: submittingNew ? "not-allowed" : "pointer",
                    }}
                  >
                    {submittingNew ? "Saving..." : "Add Photo Tracker"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
