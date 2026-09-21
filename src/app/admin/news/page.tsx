"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import AdminHeader from "@/components/admin/AdminHeader";
import { useAdminTheme } from "@/app/admin/layout";
import { uploadFileToR2 } from "@/utils/adminStore";
import AdminButton from "@/components/admin/ui/AdminButton";
import AdminFilterBar from "@/components/admin/ui/AdminFilterBar";
import AdminTabs from "@/components/admin/ui/AdminTabs";
import AdminStatusBadge from "@/components/admin/ui/AdminStatusBadge";
import AdminDataTable, { Column } from "@/components/admin/ui/AdminDataTable";
import {
  Newspaper,
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  Upload,
  Eye,
} from "lucide-react";

interface NewsItem {
  _id?: string;
  id: number;
  newsId?: string;
  authId?: number;
  createdBy: string;
  name: string;
  urlKey: string;
  slug: string;
  title: string;
  keywords?: string;
  description?: string;
  shortDescription?: string;
  content: string;
  image?: string;
  status: "Active" | "InActive";
  publishedAt: string;
  createdAt?: string;
}

export default function AdminNewsPage() {
  const { theme, toggleTheme } = useAdminTheme();
  const router = useRouter();

  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<NewsItem | null>(null);
  const [previewItem, setPreviewItem] = useState<NewsItem | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    title: "",
    urlKey: "",
    keywords: "",
    description: "",
    shortDescription: "",
    content: "",
    image: "",
    status: "Active" as "Active" | "InActive",
    publishedAt: new Date().toISOString().split("T")[0],
  });

  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isDark = theme === "dark";
  const cardBg = isDark ? "#0D1117" : "#FFFFFF";
  const border = isDark ? "#21262D" : "#E5E7EB";
  const textMain = isDark ? "#F0F6FC" : "#111827";
  const textMuted = isDark ? "#8B949E" : "#6B7280";
  const inputBg = isDark ? "#161B22" : "#F9FAFB";

  async function fetchNews() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set("q", searchQuery);
      const res = await fetch(`/api/news?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setNews(data.news || []);
      }
    } catch (err) {
      console.error("Failed to fetch news:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchNews();
  }, [searchQuery]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      name: "",
      title: "",
      urlKey: "",
      keywords: "",
      description: "",
      shortDescription: "",
      content: "",
      image: "",
      status: "Active",
      publishedAt: new Date().toISOString().split("T")[0],
    });
    setShowModal(true);
  };

  const handleOpenEdit = (item: NewsItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      title: item.title,
      urlKey: item.urlKey,
      keywords: item.keywords || "",
      description: item.description || "",
      shortDescription: item.shortDescription || "",
      content: item.content || "",
      image: item.image || "",
      status: item.status || "Active",
      publishedAt: item.publishedAt ? new Date(item.publishedAt).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
    });
    setShowModal(true);
  };

  const handleDelete = async (item: NewsItem) => {
    if (!confirm(`Are you sure you want to delete news item #${item.id} "${item.name}"?`)) return;
    try {
      const res = await fetch(`/api/news?id=${item.id}`, { method: "DELETE" });
      if (res.ok) fetchNews();
    } catch (err) {
      console.error("Failed to delete news:", err);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.title) return;

    try {
      if (editingItem) {
        const res = await fetch("/api/news", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingItem.id,
            ...formData,
          }),
        });
        if (res.ok) {
          setShowModal(false);
          fetchNews();
        }
      } else {
        const res = await fetch("/api/news", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (res.ok) {
          setShowModal(false);
          fetchNews();
        }
      }
    } catch (err) {
      console.error("Failed to save news:", err);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const r2Key = `news/cover_${Date.now()}_${file.name.replace(/\s+/g, "_")}`;
    const res = await uploadFileToR2(file, r2Key);
    setUploadingImage(false);

    if (res.success && res.url) {
      setFormData((prev) => ({ ...prev, image: res.url || "" }));
    } else {
      alert("Failed to upload image.");
    }
  };

  const newsColumns: Column<NewsItem>[] = [
    {
      header: "ID",
      width: "80px",
      accessor: (item) => (
        <span style={{ fontFamily: "monospace", fontWeight: 700, color: "#0077B6" }}>
          {item.newsId || `NW${item.id}`}
        </span>
      ),
    },
    {
      header: "News Article & Headline",
      accessor: (item) => (
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          {item.image ? (
            <img
              src={item.image}
              alt={item.name}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "/logo.svg";
                e.currentTarget.style.padding = "6px";
                e.currentTarget.style.background = isDark ? "#21262D" : "#F3F4F6";
              }}
              style={{
                width: "52px",
                height: "52px",
                borderRadius: "8px",
                objectFit: "cover",
                border: `1px solid ${border}`,
              }}
            />
          ) : (
            <div
              style={{
                width: "52px",
                height: "52px",
                borderRadius: "8px",
                background: isDark ? "#21262D" : "#E5E7EB",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Newspaper size={20} style={{ opacity: 0.5 }} />
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
            <span style={{ fontWeight: 700, fontSize: "14px", color: textMain, lineHeight: "1.3" }}>
              {item.name}
            </span>
            <span style={{ fontSize: "12px", color: textMuted, display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
              {item.shortDescription || item.title}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: "URL Slug",
      width: "180px",
      accessor: (item) => (
        <span style={{ fontSize: "12px", fontFamily: "monospace", color: textMuted }}>
          /{item.urlKey || item.slug}
        </span>
      ),
    },
    {
      header: "Published Date",
      width: "140px",
      accessor: (item) => (
        <span style={{ fontSize: "12px", color: textMuted }}>
          {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }) : "N/A"}
        </span>
      ),
    },
    {
      header: "Created By",
      width: "120px",
      accessor: (item) => (
        <span style={{ fontSize: "12px", fontWeight: 600, color: textMain }}>
          {item.createdBy || "Admin"}
        </span>
      ),
    },
    {
      header: "Status",
      width: "100px",
      accessor: (item) => (
        <AdminStatusBadge
          status={item.status === "Active" ? "Active" : "Inactive"}
          variant={item.status === "Active" ? "success" : "danger"}
          isDark={isDark}
        />
      ),
    },
    {
      header: "Actions",
      align: "right",
      width: "110px",
      accessor: (item) => (
        <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
          <AdminButton
            variant="icon"
            size="sm"
            icon={<Eye size={14} style={{ color: "#0077B6" }} />}
            isDark={isDark}
            onClick={() => setPreviewItem(item)}
            title="Preview News"
          />
          <AdminButton
            variant="icon"
            size="sm"
            icon={<Edit2 size={14} style={{ color: isDark ? "#58A6FF" : "#2563EB" }} />}
            isDark={isDark}
            onClick={() => handleOpenEdit(item)}
            title="Edit News"
          />
          <AdminButton
            variant="icon"
            size="sm"
            icon={<Trash2 size={14} style={{ color: "#DC2626" }} />}
            isDark={isDark}
            onClick={() => handleDelete(item)}
            title="Delete News"
          />
        </div>
      ),
    },
  ];

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", width: "100%" }}>
      <AdminHeader
        title="Press Releases & News Media"
        subtitle="Manage official press releases, exhibitions, media interviews, and company announcements."
        onRefresh={fetchNews}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <main style={{ padding: "28px", maxWidth: "1400px", margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
        {/* Top Tabs: Blogs Master (46) vs News & Press (5) */}
        <AdminTabs
          isDark={isDark}
          activeTab="news"
          onChange={(tab) => {
            if (tab === "blogs") router.push("/admin/blogs");
          }}
          tabs={[
            { id: "blogs", label: "Blogs Master (46)", icon: <BookOpen size={16} /> },
            { id: "news", label: `News & Press Releases (${news.length})`, icon: <Newspaper size={16} /> },
          ]}
          rightAction={
            <AdminButton
              variant="primary"
              size="md"
              icon={<Plus size={15} />}
              isDark={isDark}
              onClick={handleOpenAdd}
            >
              Create New News
            </AdminButton>
          }
        />

        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <AdminFilterBar
            isDark={isDark}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Search news by headline, author, or keywords..."
            actions={
              <AdminButton
                variant="icon"
                size="md"
                icon={<RefreshCw size={15} />}
                isDark={isDark}
                onClick={fetchNews}
                title="Refresh News"
              />
            }
          />

          {/* News Data Table */}
          <AdminDataTable
            isDark={isDark}
            loading={loading}
            columns={newsColumns}
            data={news}
            keyExtractor={(item) => item.id.toString()}
          />
        </div>
      </main>

      {/* --- PREVIEW MODAL --- */}
      {previewItem && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: "20px",
          }}
        >
          <div
            style={{
              background: cardBg,
              border: `1px solid ${border}`,
              borderRadius: "16px",
              padding: "28px",
              width: "100%",
              maxWidth: "720px",
              maxHeight: "85vh",
              overflowY: "auto",
              boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#0077B6" }}>
                {previewItem.newsId || `NW${previewItem.id}`} • Published {previewItem.publishedAt ? new Date(previewItem.publishedAt).toLocaleDateString("en-IN") : ""}
              </span>
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                style={{ background: "transparent", border: "none", fontSize: "18px", color: textMuted, cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            {previewItem.image && (
              <img
                src={previewItem.image}
                alt={previewItem.name}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "/logo.svg";
                  e.currentTarget.style.padding = "24px";
                  e.currentTarget.style.background = isDark ? "#21262D" : "#F3F4F6";
                }}
                style={{ width: "100%", height: "260px", objectFit: "cover", borderRadius: "10px", marginBottom: "16px" }}
              />
            )}

            <h2 style={{ fontSize: "20px", fontWeight: 800, color: textMain, margin: "0 0 10px 0" }}>
              {previewItem.name}
            </h2>

            {previewItem.shortDescription && (
              <p style={{ fontSize: "14px", color: textMuted, fontWeight: 600, margin: "0 0 16px 0" }}>
                {previewItem.shortDescription}
              </p>
            )}

            <div
              style={{ fontSize: "14px", lineHeight: "1.7", color: textMain }}
              dangerouslySetInnerHTML={{ __html: previewItem.content }}
            />
          </div>
        </div>
      )}

      {/* --- CREATE / EDIT MODAL --- */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: "20px",
          }}
        >
          <div
            style={{
              background: cardBg,
              border: `1px solid ${border}`,
              borderRadius: "16px",
              padding: "28px",
              width: "100%",
              maxWidth: "680px",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, color: textMain }}>
                {editingItem ? `Edit News: ${editingItem.name}` : "Create New News Article"}
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{ background: "transparent", border: "none", fontSize: "18px", color: textMuted, cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: textMain, marginBottom: "4px" }}>
                  News Headline / Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData((prev) => ({
                      ...prev,
                      name: val,
                      title: prev.title || val,
                      urlKey: prev.urlKey || val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, ""),
                    }));
                  }}
                  placeholder="e.g. Vibrant Buildcon Brought Innovation and Impact"
                  style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: `1px solid ${border}`, background: inputBg, color: textMain }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: textMain, marginBottom: "4px" }}>
                    SEO Meta Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: `1px solid ${border}`, background: inputBg, color: textMain }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: textMain, marginBottom: "4px" }}>
                    URL Key / Slug *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.urlKey}
                    onChange={(e) => setFormData({ ...formData, urlKey: e.target.value })}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: `1px solid ${border}`, background: inputBg, color: textMain }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: textMain, marginBottom: "4px" }}>
                    Published Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.publishedAt}
                    onChange={(e) => setFormData({ ...formData, publishedAt: e.target.value })}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: `1px solid ${border}`, background: inputBg, color: textMain }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: textMain, marginBottom: "4px" }}>
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: `1px solid ${border}`, background: inputBg, color: textMain }}
                  >
                    <option value="Active">Active</option>
                    <option value="InActive">InActive</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: textMain, marginBottom: "4px" }}>
                  Cover Image URL
                </label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    type="text"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="https://... or /uploads/news/..."
                    style={{ flex: 1, padding: "9px 12px", borderRadius: "8px", border: `1px solid ${border}`, background: inputBg, color: textMain }}
                  />
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    style={{ display: "none" }}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    style={{
                      padding: "9px 14px",
                      borderRadius: "8px",
                      border: `1px solid ${border}`,
                      background: inputBg,
                      color: textMain,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      fontSize: "12px",
                    }}
                  >
                    <Upload size={14} /> {uploadingImage ? "Uploading..." : "Upload"}
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: textMain, marginBottom: "4px" }}>
                  Short Summary / Excerpt
                </label>
                <textarea
                  rows={2}
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  placeholder="Brief summary shown on news cards..."
                  style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: `1px solid ${border}`, background: inputBg, color: textMain }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: textMain, marginBottom: "4px" }}>
                  Full Article Content (HTML supported) *
                </label>
                <textarea
                  rows={8}
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Enter full news article paragraphs, HTML tags supported..."
                  style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: `1px solid ${border}`, background: inputBg, color: textMain, fontFamily: "monospace", fontSize: "13px" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ padding: "8px 16px", borderRadius: "8px", border: `1px solid ${border}`, background: "transparent", color: textMuted, cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: "8px 20px", borderRadius: "8px", border: "none", background: "#0077B6", color: "#FFFFFF", fontWeight: 700, cursor: "pointer" }}
                >
                  Save News
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
