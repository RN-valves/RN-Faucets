"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import FooterSection from "@/components/FooterSection";
import SupportLinksSection from "@/components/SupportLinksSection";
import { Calendar, User, ArrowRight, Search, X, ChevronRight, BookOpen, Clock } from "lucide-react";
import Link from "next/link";

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
  publishedAt: string;
}

export default function UserBlogsPage() {
  const [blogs, setBlogs] = useState<BlogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [readingBlog, setReadingBlog] = useState<BlogItem | null>(null);

  useEffect(() => {
    async function fetchBlogs() {
      setLoading(true);
      try {
        const res = await fetch("/api/blogs");
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
    fetchBlogs();
  }, []);

  const rawCategories = Array.from(new Set(blogs.map((b) => b.category).filter(Boolean)));
  const categories = ["All", ...rawCategories];

  const filteredBlogs = blogs.filter((b) => {
    const matchesCategory = selectedCategory === "All" || b.category === selectedCategory;
    if (!matchesCategory) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      b.title.toLowerCase().includes(q) ||
      b.summary.toLowerCase().includes(q) ||
      b.author.toLowerCase().includes(q) ||
      b.category.toLowerCase().includes(q)
    );
  });

  return (
    <main
      style={{
        minHeight: "100vh",
        width: "100%",
        background: "#FFFFFF",
        overflowX: "hidden",
        fontFamily: "'Manrope', system-ui, -apple-system, sans-serif",
      }}
    >
      <Header />

      {/* Global Style Scopes */}
      <style jsx global>{`
        .blogs-page-wrap {
          width: 100vw;
          padding: 140px clamp(16px, 5vw, 80px) 70px;
          box-sizing: border-box;
          background: #ffffff;
        }
        @media (max-width: 768px) {
          .blogs-page-wrap {
            padding: 110px 16px 50px;
          }
        }

        .blog-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          overflow: hidden;
          transition: all 0.25s ease;
          display: flex;
          flex-direction: column;
          justifyContent: space-between;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
          cursor: pointer;
        }
        .blog-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.08);
          border-color: #cbd5e1;
        }
        .blog-card-img {
          width: 100%;
          height: 220px;
          object-fit: cover;
          transition: transform 0.4s ease;
        }
        .blog-card:hover .blog-card-img {
          transform: scale(1.04);
        }

        .category-tab-btn {
          padding: 8px 18px;
          border-radius: 9999px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
          border: 1px solid transparent;
        }
        .category-tab-btn.active {
          background-color: #000000;
          color: #ffffff;
          border-color: #000000;
        }
        .category-tab-btn:not(.active) {
          background-color: #ffffff;
          color: #475569;
          border-color: #e2e8f0;
        }
        .category-tab-btn:not(.active):hover {
          background-color: #f1f5f9;
          color: #0f172a;
        }
      `}</style>

      <section data-header-theme="light" className="blogs-page-wrap">
        <div style={{ maxWidth: "1280px", margin: "0 auto", width: "100%" }}>
          {/* Breadcrumbs Navigation */}
          <nav
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "13px",
              color: "#888888",
              marginBottom: "28px",
            }}
          >
            <Link href="/" style={{ color: "#888888", textDecoration: "none" }}>
              Home
            </Link>
            <ChevronRight size={13} />
            <span style={{ color: "#111111", fontWeight: 600 }}>Blogs &amp; Journal</span>
          </nav>

          {/* Centered Luxury Header Title */}
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <span
              style={{
                display: "inline-block",
                padding: "4px 14px",
                borderRadius: "9999px",
                fontSize: "11.5px",
                fontWeight: 800,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                background: "#F0F9FF",
                color: "#0284C7",
                border: "1px solid #BAE6FD",
                marginBottom: "12px",
              }}
            >
              RN Design &amp; Living Journal
            </span>
            <h1
              style={{
                fontSize: "clamp(28px, 3.6vw, 42px)",
                fontWeight: 700,
                color: "#111111",
                margin: "0 0 12px",
                letterSpacing: "-0.02em",
              }}
            >
              Bath Space Inspiration &amp; Care Guides
            </h1>
            <p
              style={{
                fontSize: "14.5px",
                color: "#64748B",
                margin: 0,
                maxWidth: "640px",
                marginInline: "auto",
                lineHeight: 1.6,
              }}
            >
              Explore architectural bathroom trends, maintenance guides, finish selection, and modern faucet engineering technology.
            </p>
          </div>

          {/* Filter Tabs & Search Bar */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "16px",
              marginBottom: "36px",
              paddingBottom: "20px",
              borderBottom: "1px solid #F1F5F9",
            }}
          >
            {/* Scrollable / Wrapped Category Buttons */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "8px",
                alignItems: "center",
              }}
            >
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`category-tab-btn ${selectedCategory === cat ? "active" : ""}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Box */}
            <div style={{ position: "relative", minWidth: "260px" }}>
              <Search
                size={16}
                style={{
                  position: "absolute",
                  left: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#94a3b8",
                }}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles by keyword..."
                style={{
                  width: "100%",
                  padding: "9px 38px 9px 38px",
                  borderRadius: "9999px",
                  border: "1px solid #E2E8F0",
                  fontSize: "13px",
                  fontFamily: "inherit",
                  outline: "none",
                  boxSizing: "border-box",
                  color: "#0F172A",
                  background: "#FFFFFF",
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    color: "#94a3b8",
                    padding: 0,
                  }}
                >
                  <X size={15} />
                </button>
              )}
            </div>
          </div>

          {/* Blog Articles Grid */}
          {loading ? (
            /* Skeleton Loading State */
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "28px" }}>
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  style={{
                    borderRadius: "16px",
                    border: "1px solid #E2E8F0",
                    background: "#F8FAFC",
                    height: "360px",
                  }}
                />
              ))}
            </div>
          ) : filteredBlogs.length === 0 ? (
            /* Empty State */
            <div
              style={{
                textAlign: "center",
                padding: "80px 20px",
                border: "1px dashed #E2E8F0",
                borderRadius: "16px",
                background: "#FAFAFA",
              }}
            >
              <BookOpen size={42} style={{ color: "#94A3B8", margin: "0 auto 16px" }} />
              <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#111111", margin: "0 0 6px" }}>
                {searchQuery ? "No matching articles found" : "No articles published yet"}
              </h2>
              <p style={{ fontSize: "13.5px", color: "#64748B", margin: "0 0 20px" }}>
                {searchQuery
                  ? `No articles matching "${searchQuery}". Try a different keyword.`
                  : "Check back soon for new design guides and plumbing advice."}
              </p>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  style={{
                    padding: "10px 22px",
                    background: "#000000",
                    color: "#FFFFFF",
                    border: "none",
                    borderRadius: "6px",
                    fontWeight: 600,
                    fontSize: "13px",
                    cursor: "pointer",
                  }}
                >
                  Clear Search Filter
                </button>
              )}
            </div>
          ) : (
            /* 3-Column Luxury Grid */
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
                gap: "32px",
              }}
            >
              {filteredBlogs.map((b) => (
                <article
                  key={b._id || b.id}
                  className="blog-card"
                  onClick={() => setReadingBlog(b)}
                >
                  <div>
                    {/* Thumbnail Image */}
                    <div style={{ overflow: "hidden", position: "relative" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={b.image || "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80"}
                        alt={b.title}
                        className="blog-card-img"
                      />
                    </div>

                    {/* Card Content */}
                    <div style={{ padding: "24px 24px 16px" }}>
                      {/* Category & Date */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: "12px",
                          gap: "8px",
                          flexWrap: "wrap",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "11.5px",
                            fontWeight: 700,
                            color: "#0284C7",
                            background: "#F0F9FF",
                            border: "1px solid #BAE6FD",
                            padding: "3px 10px",
                            borderRadius: "20px",
                          }}
                        >
                          {b.category}
                        </span>

                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                            fontSize: "12px",
                            color: "#94A3B8",
                          }}
                        >
                          <Calendar size={13} />
                          {b.publishedAt}
                        </span>
                      </div>

                      {/* Title */}
                      <h2
                        style={{
                          fontSize: "17px",
                          fontWeight: 700,
                          color: "#0F172A",
                          margin: "0 0 10px",
                          lineHeight: 1.38,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {b.title}
                      </h2>

                      {/* Summary */}
                      <p
                        style={{
                          fontSize: "13.5px",
                          color: "#64748B",
                          margin: 0,
                          lineHeight: 1.55,
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {b.summary}
                      </p>
                    </div>
                  </div>

                  {/* Card Footer: Author & Read CTA */}
                  <div
                    style={{
                      padding: "16px 24px",
                      borderTop: "1px solid #F1F5F9",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      fontSize: "12.5px",
                    }}
                  >
                    <span style={{ color: "#64748B", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                      <User size={13} color="#94A3B8" />
                      {b.author}
                    </span>

                    <span
                      style={{
                        color: "#0F172A",
                        fontWeight: 700,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      Read Article <ArrowRight size={14} />
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Detailed Article Reader Modal */}
      {readingBlog && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(5px)",
            zIndex: 10000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
        >
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: "16px",
              maxWidth: "760px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 25px 50px rgba(0,0,0,0.25)",
              position: "relative",
            }}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setReadingBlog(null)}
              style={{
                position: "absolute",
                top: "18px",
                right: "18px",
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: "#F1F5F9",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#0F172A",
                zIndex: 10,
              }}
            >
              <X size={18} />
            </button>

            {/* Article Image Banner */}
            <div style={{ position: "relative", width: "100%", height: "300px", overflow: "hidden" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={readingBlog.image}
                alt={readingBlog.title}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>

            {/* Article Body Content */}
            <div style={{ padding: "32px 36px 40px" }}>
              {/* Meta */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  fontSize: "12.5px",
                  color: "#64748B",
                  marginBottom: "16px",
                  flexWrap: "wrap",
                }}
              >
                <span
                  style={{
                    fontWeight: 700,
                    color: "#0284C7",
                    background: "#F0F9FF",
                    border: "1px solid #BAE6FD",
                    padding: "3px 10px",
                    borderRadius: "20px",
                  }}
                >
                  {readingBlog.category}
                </span>
                <span>•</span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                  <Calendar size={13} />
                  {readingBlog.publishedAt}
                </span>
                <span>•</span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                  <User size={13} />
                  By {readingBlog.author}
                </span>
              </div>

              {/* Title */}
              <h1
                style={{
                  fontSize: "24px",
                  fontWeight: 800,
                  color: "#0F172A",
                  lineHeight: 1.3,
                  margin: "0 0 16px",
                }}
              >
                {readingBlog.title}
              </h1>

              {/* Summary lead */}
              <p
                style={{
                  fontSize: "15px",
                  fontWeight: 500,
                  color: "#334155",
                  lineHeight: 1.6,
                  borderLeft: "3px solid #00AEEF",
                  paddingLeft: "16px",
                  margin: "0 0 24px",
                }}
              >
                {readingBlog.summary}
              </p>

              {/* Full Article Text */}
              <div
                style={{
                  fontSize: "14.5px",
                  color: "#475569",
                  lineHeight: 1.8,
                  whiteSpace: "pre-line",
                }}
              >
                {readingBlog.content}
              </div>

              {/* Bottom Close Action */}
              <div style={{ marginTop: "32px", paddingTop: "20px", borderTop: "1px solid #F1F5F9", textAlign: "right" }}>
                <button
                  type="button"
                  onClick={() => setReadingBlog(null)}
                  style={{
                    padding: "10px 24px",
                    background: "#000000",
                    color: "#FFFFFF",
                    border: "none",
                    borderRadius: "6px",
                    fontWeight: 600,
                    fontSize: "13.5px",
                    cursor: "pointer",
                  }}
                >
                  Close Article
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <SupportLinksSection />
      <FooterSection />
    </main>
  );
}
