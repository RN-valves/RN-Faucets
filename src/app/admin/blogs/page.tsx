"use client";

import { useEffect, useState, useRef } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import { useAdminTheme } from "@/app/admin/layout";
import { uploadFileToR2 } from "@/utils/adminStore";
import AdminButton from "@/components/admin/ui/AdminButton";
import AdminFilterBar from "@/components/admin/ui/AdminFilterBar";
import AdminCard from "@/components/admin/ui/AdminCard";
import AdminStatusBadge from "@/components/admin/ui/AdminStatusBadge";
import {
  BookOpen,
  Plus,
  Search,
  CheckCircle2,
  Edit2,
  Trash2,
  RefreshCw,
  Upload,
  Image as ImageIcon,
  Calendar,
  User,
  ExternalLink,
} from "lucide-react";

interface BlogItem {
  _id: string;
  id: string;
  title: string;
  slug: string;
  author: string;
  category: string;
  image: string;
  summary: string;
  content: string;
  status: "Published" | "Draft";
  publishedAt: string;
}

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<BlogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<BlogItem | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: "",
    category: "Bath Design & Care",
    author: "RN Architectural Team",
    image: "",
    summary: "",
    content: "",
    status: "Published" as "Published" | "Draft",
  });

  async function fetchBlogs() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set("q", searchQuery);
      const res = await fetch(`/api/blogs?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setBlogs(data.blogs || []);
      }
    } catch (err) {
      console.error("Failed to fetch blogs:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      title: "",
      category: "Bath Design & Care",
      author: "RN Architectural Team",
      image: "",
      summary: "",
      content: "",
      status: "Published",
    });
    setShowModal(true);
  };

  const handleOpenEdit = (item: BlogItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      category: item.category,
      author: item.author,
      image: item.image,
      summary: item.summary,
      content: item.content,
      status: item.status,
    });
    setShowModal(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const r2Key = `blogs/cover_${Date.now()}_${file.name.replace(/\s+/g, "_")}`;
    const res = await uploadFileToR2(file, r2Key);
    setUploadingImage(false);

    if (res.success && res.url) {
      const imageUrl: string = res.url;
      setFormData((prev) => ({ ...prev, image: imageUrl }));
    } else {
      alert("Failed to upload image to Cloudflare R2.");
    }
  };

  const handleDelete = async (item: BlogItem) => {
    if (!confirm(`Are you sure you want to delete article "${item.title}"?`)) return;
    try {
      const res = await fetch(`/api/blogs/${item._id || item.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchBlogs();
      }
    } catch (err) {
      console.error("Failed to delete blog:", err);
    }
  };

  const handleSaveBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;

    try {
      if (editingItem) {
        const res = await fetch(`/api/blogs/${editingItem._id || editingItem.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (res.ok) {
          setShowModal(false);
          fetchBlogs();
        }
      } else {
        const res = await fetch("/api/blogs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (res.ok) {
          setShowModal(false);
          fetchBlogs();
        }
      }
    } catch (err) {
      console.error("Failed to save blog:", err);
    }
  };

  const { theme, toggleTheme } = useAdminTheme();
  const isDark = theme === "dark";
  const textMain = isDark ? "#FFFFFF" : "#1E293B";

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", width: "100%" }}>
      <AdminHeader
        title="Blogs & Design News CMS"
        subtitle="Manage bathware articles, design guides, and news posts."
        onRefresh={fetchBlogs}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <main style={{ padding: "28px", maxWidth: "1400px", margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
        <AdminFilterBar
          isDark={isDark}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search blog articles by title, category, or summary..."
          actions={
            <div style={{ display: "flex", gap: "10px" }}>
              <AdminButton
                variant="icon"
                size="md"
                icon={<RefreshCw size={15} />}
                isDark={isDark}
                onClick={fetchBlogs}
                title="Refresh"
              />
              <AdminButton
                variant="primary"
                size="md"
                icon={<Plus size={15} />}
                isDark={isDark}
                onClick={handleOpenAdd}
              >
                Write New Article
              </AdminButton>
            </div>
          }
        />

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px", marginTop: "20px" }}>
          {loading ? (
            <div style={{ gridColumn: "1 / -1", padding: "48px", textAlign: "center", opacity: 0.7 }}>Loading articles...</div>
          ) : blogs.length === 0 ? (
            <div style={{ gridColumn: "1 / -1", padding: "48px", textAlign: "center", opacity: 0.7 }}>No blog articles found.</div>
          ) : (
            blogs.map((item) => (
              <AdminCard key={item._id || item.id} isDark={isDark} style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                {item.image ? (
                  <img src={item.image} alt={item.title} style={{ width: "100%", height: "180px", objectFit: "cover" }} />
                ) : (
                  <div style={{ width: "100%", height: "180px", background: isDark ? "#21262D" : "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <BookOpen size={40} style={{ opacity: 0.4 }} />
                  </div>
                )}
                <div style={{ padding: "18px", flex: 1, display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11.5px", opacity: 0.7 }}>
                    <span style={{ fontWeight: 700, color: "#0077B6" }}>{item.category}</span>
                    <span>{item.publishedAt}</span>
                  </div>

                  <h3 style={{ fontSize: "15px", fontWeight: 700, color: textMain, margin: 0, lineHeight: "1.4" }}>
                    {item.title}
                  </h3>

                  <p style={{ fontSize: "13px", opacity: 0.7, margin: 0, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {item.summary}
                  </p>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto", paddingTop: "12px", borderTop: isDark ? "1px solid #21262D" : "1px solid #E5E7EB" }}>
                    <span style={{ fontSize: "12px", opacity: 0.6 }}>By {item.author}</span>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <AdminButton
                        variant="icon"
                        size="sm"
                        icon={<Edit2 size={14} />}
                        isDark={isDark}
                        onClick={() => handleOpenEdit(item)}
                        title="Edit Article"
                      />
                      <AdminButton
                        variant="icon"
                        size="sm"
                        icon={<Trash2 size={14} style={{ color: "#DC2626" }} />}
                        isDark={isDark}
                        onClick={() => handleDelete(item)}
                        title="Delete Article"
                      />
                    </div>
                  </div>
                </div>
              </AdminCard>
            ))
          )}
        </div>
      </main>

      {/* Write / Edit Article Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 relative border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-lg font-bold text-slate-900">
                {editingItem ? `Edit Article: ${editingItem.title}` : "Write New Article"}
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveBlog} className="space-y-3.5 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Article Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-sm font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Author Name</label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
              </div>

              {/* R2 Image Upload */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Featured Cover Image URL</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="flex-1 p-2.5 border border-slate-200 rounded-lg text-xs font-mono"
                  />
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  <button
                    type="button"
                    disabled={uploadingImage}
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-2 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 rounded-lg font-semibold text-xs transition flex items-center gap-1"
                  >
                    <Upload size={14} />
                    {uploadingImage ? "Uploading..." : "Upload R2"}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Short Summary</label>
                <textarea
                  rows={2}
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Full Article Content</label>
                <textarea
                  rows={4}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 font-semibold text-sm rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-lg"
                >
                  Publish Article
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
