"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import AdminHeader from "@/components/admin/AdminHeader";
import { useAdminTheme } from "@/app/admin/layout";
import { uploadFileToR2 } from "@/utils/adminStore";
import AdminButton from "@/components/admin/ui/AdminButton";
import AdminFilterBar from "@/components/admin/ui/AdminFilterBar";
import AdminCard from "@/components/admin/ui/AdminCard";
import AdminTabs from "@/components/admin/ui/AdminTabs";
import AdminStatusBadge from "@/components/admin/ui/AdminStatusBadge";
import AdminDataTable, { Column } from "@/components/admin/ui/AdminDataTable";
import {
  BookOpen,
  Newspaper,
  Plus,
  Search,
  Edit2,
  Trash2,
  RefreshCw,
  Upload,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface BlogItem {
  _id: string;
  id: string;
  legacyId?: number;
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

function BlogsContent() {
  const { theme, toggleTheme } = useAdminTheme();
  const searchParams = useSearchParams();
  const router = useRouter();

  const urlTab = searchParams.get("tab")?.toLowerCase();
  const [activeTab, setActiveTab] = useState<"blogs" | "news">(urlTab === "news" ? "news" : "blogs");

  // Sync with URL query parameter or route to dedicated news page
  useEffect(() => {
    const tabParam = searchParams.get("tab")?.toLowerCase();
    if (tabParam === "news") {
      router.replace("/admin/news");
    }
  }, [searchParams, router]);

  const handleTabChange = (newTab: string) => {
    if (newTab === "news") {
      router.push("/admin/news");
    } else {
      setActiveTab("blogs");
      router.replace("/admin/blogs");
    }
  };

  // --- BLOGS STATE ---
  const [blogs, setBlogs] = useState<BlogItem[]>([]);
  const [loadingBlogs, setLoadingBlogs] = useState(true);
  const [blogSearchQuery, setBlogSearchQuery] = useState("");
  const [showBlogModal, setShowBlogModal] = useState(false);
  const [editingBlog, setEditingBlog] = useState<BlogItem | null>(null);
  const [blogPage, setBlogPage] = useState(1);
  const blogLimit = 12;

  const [blogFormData, setBlogFormData] = useState({
    title: "",
    category: "Bath Design & Care",
    author: "RN Architectural Team",
    image: "",
    summary: "",
    content: "",
    status: "Published" as "Published" | "Draft",
  });

  // --- NEWS STATE ---
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const [newsSearchQuery, setNewsSearchQuery] = useState("");
  const [showNewsModal, setShowNewsModal] = useState(false);
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null);
  const [previewNews, setPreviewNews] = useState<NewsItem | null>(null);

  const [newsFormData, setNewsFormData] = useState({
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

  // Fetch Blogs
  async function fetchBlogs() {
    setLoadingBlogs(true);
    try {
      const params = new URLSearchParams();
      if (blogSearchQuery) params.set("q", blogSearchQuery);
      const res = await fetch(`/api/blogs?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setBlogs(data.blogs || []);
      }
    } catch (err) {
      console.error("Failed to fetch blogs:", err);
    } finally {
      setLoadingBlogs(false);
    }
  }

  // Fetch News
  async function fetchNews() {
    setLoadingNews(true);
    try {
      const params = new URLSearchParams();
      if (newsSearchQuery) params.set("q", newsSearchQuery);
      const res = await fetch(`/api/news?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setNews(data.news || []);
      }
    } catch (err) {
      console.error("Failed to fetch news:", err);
    } finally {
      setLoadingNews(false);
    }
  }

  useEffect(() => {
    fetchBlogs();
    fetchNews();
  }, []);

  useEffect(() => {
    if (activeTab === "blogs") {
      fetchBlogs();
    } else {
      fetchNews();
    }
  }, [activeTab, blogSearchQuery, newsSearchQuery]);

  // --- BLOG HANDLERS ---
  const handleOpenAddBlog = () => {
    setEditingBlog(null);
    setBlogFormData({
      title: "",
      category: "Bath Design & Care",
      author: "RN Architectural Team",
      image: "",
      summary: "",
      content: "",
      status: "Published",
    });
    setShowBlogModal(true);
  };

  const handleOpenEditBlog = (item: BlogItem) => {
    setEditingBlog(item);
    setBlogFormData({
      title: item.title,
      category: item.category,
      author: item.author,
      image: item.image,
      summary: item.summary,
      content: item.content,
      status: item.status,
    });
    setShowBlogModal(true);
  };

  const handleDeleteBlog = async (item: BlogItem) => {
    if (!confirm(`Are you sure you want to delete article "${item.title}"?`)) return;
    try {
      const res = await fetch(`/api/blogs/${item._id || item.id}`, { method: "DELETE" });
      if (res.ok) fetchBlogs();
    } catch (err) {
      console.error("Failed to delete blog:", err);
    }
  };

  const handleSaveBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blogFormData.title) return;

    try {
      if (editingBlog) {
        const res = await fetch(`/api/blogs/${editingBlog._id || editingBlog.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(blogFormData),
        });
        if (res.ok) {
          setShowBlogModal(false);
          fetchBlogs();
        }
      } else {
        const res = await fetch("/api/blogs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(blogFormData),
        });
        if (res.ok) {
          setShowBlogModal(false);
          fetchBlogs();
        }
      }
    } catch (err) {
      console.error("Failed to save blog:", err);
    }
  };

  // --- NEWS HANDLERS ---
  const handleOpenAddNews = () => {
    setEditingNews(null);
    setNewsFormData({
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
    setShowNewsModal(true);
  };

  const handleOpenEditNews = (item: NewsItem) => {
    setEditingNews(item);
    setNewsFormData({
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
    setShowNewsModal(true);
  };

  const handleDeleteNews = async (item: NewsItem) => {
    if (!confirm(`Are you sure you want to delete news item #${item.id} "${item.name}"?`)) return;
    try {
      const res = await fetch(`/api/news?id=${item.id}`, { method: "DELETE" });
      if (res.ok) fetchNews();
    } catch (err) {
      console.error("Failed to delete news:", err);
    }
  };

  const handleSaveNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsFormData.name || !newsFormData.title) return;

    try {
      if (editingNews) {
        const res = await fetch("/api/news", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingNews.id,
            ...newsFormData,
          }),
        });
        if (res.ok) {
          setShowNewsModal(false);
          fetchNews();
        }
      } else {
        const res = await fetch("/api/news", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newsFormData),
        });
        if (res.ok) {
          setShowNewsModal(false);
          fetchNews();
        }
      }
    } catch (err) {
      console.error("Failed to save news:", err);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: "blog" | "news") => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const r2Key = `${target}/cover_${Date.now()}_${file.name.replace(/\s+/g, "_")}`;
    const res = await uploadFileToR2(file, r2Key);
    setUploadingImage(false);

    if (res.success && res.url) {
      const imageUrl: string = res.url;
      if (target === "blog") {
        setBlogFormData((prev) => ({ ...prev, image: imageUrl }));
      } else {
        setNewsFormData((prev) => ({ ...prev, image: imageUrl }));
      }
    } else {
      alert("Failed to upload image.");
    }
  };

  // Columns for News Table
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
            onClick={() => setPreviewNews(item)}
            title="Preview News"
          />
          <AdminButton
            variant="icon"
            size="sm"
            icon={<Edit2 size={14} style={{ color: isDark ? "#58A6FF" : "#2563EB" }} />}
            isDark={isDark}
            onClick={() => handleOpenEditNews(item)}
            title="Edit News"
          />
          <AdminButton
            variant="icon"
            size="sm"
            icon={<Trash2 size={14} style={{ color: "#DC2626" }} />}
            isDark={isDark}
            onClick={() => handleDeleteNews(item)}
            title="Delete News"
          />
        </div>
      ),
    },
  ];

  // Pagination for Blogs
  const totalBlogPages = Math.ceil(blogs.length / blogLimit);
  const pagedBlogs = blogs.slice((blogPage - 1) * blogLimit, blogPage * blogLimit);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", width: "100%" }}>
      <AdminHeader
        title={activeTab === "news" ? "Press Releases & News Media" : "Blogs & Design Articles CMS"}
        subtitle={
          activeTab === "news"
            ? "Manage official press releases, exhibitions, media interviews, and company announcements."
            : "Manage bathware design guides, styling articles, and luxury catalogue features."
        }
        onRefresh={activeTab === "news" ? fetchNews : fetchBlogs}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <main style={{ padding: "28px", maxWidth: "1400px", margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
        {/* Top Tab Navigation: Blogs (46) vs News (5) */}
        <AdminTabs
          isDark={isDark}
          activeTab={activeTab}
          onChange={handleTabChange}
          tabs={[
            { id: "blogs", label: `Blogs Master (${blogs.length})`, icon: <BookOpen size={16} /> },
            { id: "news", label: `News & Press Releases (${news.length})`, icon: <Newspaper size={16} /> },
          ]}
          rightAction={
            <AdminButton
              variant="primary"
              size="md"
              icon={<Plus size={15} />}
              isDark={isDark}
              onClick={activeTab === "news" ? handleOpenAddNews : handleOpenAddBlog}
            >
              {activeTab === "news" ? "Create New News" : "Write New Article"}
            </AdminButton>
          }
        />

        {/* --- NEWS TAB VIEW --- */}
        {activeTab === "news" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Filter / Search Bar */}
            <AdminFilterBar
              isDark={isDark}
              searchQuery={newsSearchQuery}
              onSearchChange={setNewsSearchQuery}
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
              loading={loadingNews}
              columns={newsColumns}
              data={news}
              keyExtractor={(item) => item.id.toString()}
            />
          </div>
        )}

        {/* --- BLOGS TAB VIEW --- */}
        {activeTab === "blogs" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <AdminFilterBar
              isDark={isDark}
              searchQuery={blogSearchQuery}
              onSearchChange={setBlogSearchQuery}
              searchPlaceholder="Search blog articles by title, category, or summary..."
              actions={
                <AdminButton
                  variant="icon"
                  size="md"
                  icon={<RefreshCw size={15} />}
                  isDark={isDark}
                  onClick={fetchBlogs}
                  title="Refresh Blogs"
                />
              }
            />

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
              {loadingBlogs ? (
                <div style={{ gridColumn: "1 / -1", padding: "48px", textAlign: "center", opacity: 0.7 }}>Loading articles...</div>
              ) : blogs.length === 0 ? (
                <div style={{ gridColumn: "1 / -1", padding: "48px", textAlign: "center", opacity: 0.7 }}>No blog articles found.</div>
              ) : (
                pagedBlogs.map((item) => (
                  <AdminCard key={item._id || item.id} isDark={isDark} style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.title}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = "/logo.svg";
                          e.currentTarget.style.padding = "24px";
                          e.currentTarget.style.background = isDark ? "#21262D" : "#F3F4F6";
                        }}
                        style={{ width: "100%", height: "180px", objectFit: "cover" }}
                      />
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
                            onClick={() => handleOpenEditBlog(item)}
                            title="Edit Article"
                          />
                          <AdminButton
                            variant="icon"
                            size="sm"
                            icon={<Trash2 size={14} style={{ color: "#DC2626" }} />}
                            isDark={isDark}
                            onClick={() => handleDeleteBlog(item)}
                            title="Delete Article"
                          />
                        </div>
                      </div>
                    </div>
                  </AdminCard>
                ))
              )}
            </div>

            {/* Blogs Pagination */}
            {totalBlogPages > 1 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "14px 20px",
                  background: cardBg,
                  border: `1px solid ${border}`,
                  borderRadius: "10px",
                  marginTop: "10px",
                }}
              >
                <span style={{ fontSize: "13px", color: textMuted }}>
                  Showing {(blogPage - 1) * blogLimit + 1} - {Math.min(blogPage * blogLimit, blogs.length)} of {blogs.length} articles
                </span>

                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <button
                    type="button"
                    disabled={blogPage <= 1}
                    onClick={() => setBlogPage((p) => Math.max(1, p - 1))}
                    style={{
                      padding: "6px 14px",
                      borderRadius: "6px",
                      border: `1px solid ${border}`,
                      background: inputBg,
                      color: blogPage <= 1 ? textMuted : textMain,
                      cursor: blogPage <= 1 ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      fontSize: "12px",
                    }}
                  >
                    <ChevronLeft size={14} /> Previous
                  </button>

                  <span style={{ fontSize: "13px", fontWeight: 700, color: textMain, padding: "0 8px" }}>
                    Page {blogPage} of {totalBlogPages}
                  </span>

                  <button
                    type="button"
                    disabled={blogPage >= totalBlogPages}
                    onClick={() => setBlogPage((p) => Math.min(totalBlogPages, p + 1))}
                    style={{
                      padding: "6px 14px",
                      borderRadius: "6px",
                      border: `1px solid ${border}`,
                      background: inputBg,
                      color: blogPage >= totalBlogPages ? textMuted : textMain,
                      cursor: blogPage >= totalBlogPages ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      fontSize: "12px",
                    }}
                  >
                    Next <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* --- PREVIEW NEWS MODAL --- */}
      {previewNews && (
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
                {previewNews.newsId || `NW${previewNews.id}`} • Published {previewNews.publishedAt ? new Date(previewNews.publishedAt).toLocaleDateString("en-IN") : ""}
              </span>
              <button
                type="button"
                onClick={() => setPreviewNews(null)}
                style={{ background: "transparent", border: "none", fontSize: "18px", color: textMuted, cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            {previewNews.image && (
              <img
                src={previewNews.image}
                alt={previewNews.name}
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
              {previewNews.name}
            </h2>

            {previewNews.shortDescription && (
              <p style={{ fontSize: "14px", color: textMuted, fontWeight: 600, margin: "0 0 16px 0" }}>
                {previewNews.shortDescription}
              </p>
            )}

            <div
              style={{ fontSize: "14px", lineHeight: "1.7", color: textMain }}
              dangerouslySetInnerHTML={{ __html: previewNews.content }}
            />
          </div>
        </div>
      )}

      {/* --- CREATE / EDIT NEWS MODAL --- */}
      {showNewsModal && (
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
                {editingNews ? `Edit News: ${editingNews.name}` : "Create New News Article"}
              </h3>
              <button
                type="button"
                onClick={() => setShowNewsModal(false)}
                style={{ background: "transparent", border: "none", fontSize: "18px", color: textMuted, cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveNews} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: textMain, marginBottom: "4px" }}>
                  News Headline / Name *
                </label>
                <input
                  type="text"
                  required
                  value={newsFormData.name}
                  onChange={(e) => {
                    const val = e.target.value;
                    setNewsFormData((prev) => ({
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
                    value={newsFormData.title}
                    onChange={(e) => setNewsFormData({ ...newsFormData, title: e.target.value })}
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
                    value={newsFormData.urlKey}
                    onChange={(e) => setNewsFormData({ ...newsFormData, urlKey: e.target.value })}
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
                    value={newsFormData.publishedAt}
                    onChange={(e) => setNewsFormData({ ...newsFormData, publishedAt: e.target.value })}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: `1px solid ${border}`, background: inputBg, color: textMain }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: textMain, marginBottom: "4px" }}>
                    Status
                  </label>
                  <select
                    value={newsFormData.status}
                    onChange={(e) => setNewsFormData({ ...newsFormData, status: e.target.value as any })}
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
                    value={newsFormData.image}
                    onChange={(e) => setNewsFormData({ ...newsFormData, image: e.target.value })}
                    placeholder="https://... or /uploads/news/..."
                    style={{ flex: 1, padding: "9px 12px", borderRadius: "8px", border: `1px solid ${border}`, background: inputBg, color: textMain }}
                  />
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => handleImageUpload(e, "news")}
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
                  value={newsFormData.shortDescription}
                  onChange={(e) => setNewsFormData({ ...newsFormData, shortDescription: e.target.value })}
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
                  value={newsFormData.content}
                  onChange={(e) => setNewsFormData({ ...newsFormData, content: e.target.value })}
                  placeholder="Enter full news article paragraphs, HTML tags supported..."
                  style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: `1px solid ${border}`, background: inputBg, color: textMain, fontFamily: "monospace", fontSize: "13px" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                <button
                  type="button"
                  onClick={() => setShowNewsModal(false)}
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

      {/* --- CREATE / EDIT BLOG MODAL --- */}
      {showBlogModal && (
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
                {editingBlog ? `Edit Article: ${editingBlog.title}` : "Write New Blog Article"}
              </h3>
              <button
                type="button"
                onClick={() => setShowBlogModal(false)}
                style={{ background: "transparent", border: "none", fontSize: "18px", color: textMuted, cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveBlog} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: textMain, marginBottom: "4px" }}>
                  Article Title *
                </label>
                <input
                  type="text"
                  required
                  value={blogFormData.title}
                  onChange={(e) => setBlogFormData({ ...blogFormData, title: e.target.value })}
                  style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: `1px solid ${border}`, background: inputBg, color: textMain }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: textMain, marginBottom: "4px" }}>
                    Category
                  </label>
                  <input
                    type="text"
                    value={blogFormData.category}
                    onChange={(e) => setBlogFormData({ ...blogFormData, category: e.target.value })}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: `1px solid ${border}`, background: inputBg, color: textMain }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: textMain, marginBottom: "4px" }}>
                    Author Name
                  </label>
                  <input
                    type="text"
                    value={blogFormData.author}
                    onChange={(e) => setBlogFormData({ ...blogFormData, author: e.target.value })}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: `1px solid ${border}`, background: inputBg, color: textMain }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: textMain, marginBottom: "4px" }}>
                  Cover Image URL
                </label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    type="text"
                    value={blogFormData.image}
                    onChange={(e) => setBlogFormData({ ...blogFormData, image: e.target.value })}
                    placeholder="https://... or /uploads/blogs/..."
                    style={{ flex: 1, padding: "9px 12px", borderRadius: "8px", border: `1px solid ${border}`, background: inputBg, color: textMain }}
                  />
                  <input
                    type="file"
                    onChange={(e) => handleImageUpload(e, "blog")}
                    accept="image/*"
                    style={{ display: "none" }}
                    id="blog-image-input"
                  />
                  <button
                    type="button"
                    onClick={() => document.getElementById("blog-image-input")?.click()}
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
                    <Upload size={14} /> Upload
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: textMain, marginBottom: "4px" }}>
                  Short Summary
                </label>
                <textarea
                  rows={2}
                  value={blogFormData.summary}
                  onChange={(e) => setBlogFormData({ ...blogFormData, summary: e.target.value })}
                  style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: `1px solid ${border}`, background: inputBg, color: textMain }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: textMain, marginBottom: "4px" }}>
                  Content (HTML supported)
                </label>
                <textarea
                  rows={6}
                  value={blogFormData.content}
                  onChange={(e) => setBlogFormData({ ...blogFormData, content: e.target.value })}
                  style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: `1px solid ${border}`, background: inputBg, color: textMain, fontFamily: "monospace", fontSize: "13px" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                <button
                  type="button"
                  onClick={() => setShowBlogModal(false)}
                  style={{ padding: "8px 16px", borderRadius: "8px", border: `1px solid ${border}`, background: "transparent", color: textMuted, cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: "8px 20px", borderRadius: "8px", border: "none", background: "#0077B6", color: "#FFFFFF", fontWeight: 700, cursor: "pointer" }}
                >
                  Save Article
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminBlogsPage() {
  return (
    <Suspense fallback={<div style={{ padding: "40px", textAlign: "center" }}>Loading Blogs & News CMS...</div>}>
      <BlogsContent />
    </Suspense>
  );
}
