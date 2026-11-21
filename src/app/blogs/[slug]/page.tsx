"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import FooterSection from "@/components/FooterSection";
import { Calendar, User, ChevronLeft, ChevronRight, BookOpen } from "lucide-react";

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

const FALLBACK_BLOG_IMAGE =
  "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80";

export default function BlogDetailsPage() {
  const params = useParams();
  const slugParam = typeof params?.slug === "string" ? decodeURIComponent(params.slug) : "";

  const [blog, setBlog] = useState<BlogItem | null>(null);
  const [allBlogs, setAllBlogs] = useState<BlogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [slugParam]);

  useEffect(() => {
    let active = true;
    async function loadBlogDetail() {
      setLoading(true);
      setNotFound(false);
      try {
        const res = await fetch("/api/blogs");
        if (!res.ok) {
          if (active) setNotFound(true);
          return;
        }
        const data = await res.json();
        const items: BlogItem[] = Array.isArray(data?.blogs) ? data.blogs : [];
        if (!active) return;

        setAllBlogs(items);

        const matched = items.find(
          (b) =>
            b.slug === slugParam ||
            b.id === slugParam ||
            b._id === slugParam ||
            b.slug?.toLowerCase() === slugParam.toLowerCase()
        );

        if (matched) {
          setBlog(matched);
        } else {
          // Fallback: query single blog endpoint
          const singleRes = await fetch(`/api/blogs/${encodeURIComponent(slugParam)}`);
          if (singleRes.ok) {
            const singleBlog = await singleRes.json();
            if (active && singleBlog && singleBlog.title) {
              setBlog(singleBlog);
            } else if (active) {
              setNotFound(true);
            }
          } else if (active) {
            setNotFound(true);
          }
        }
      } catch (err) {
        console.error("Failed to load blog detail:", err);
        if (active) setNotFound(true);
      } finally {
        if (active) setLoading(false);
      }
    }

    if (slugParam) {
      loadBlogDetail();
    }
    return () => {
      active = false;
    };
  }, [slugParam]);

  // Compute category counts for "Blog Categories" sidebar widget (matching Laravel blog_details.blade.php)
  const categoryCounts = allBlogs.reduce<Record<string, number>>((acc, item) => {
    const catName = item.category || "Bath Design & Care";
    acc[catName] = (acc[catName] || 0) + 1;
    return acc;
  }, {});
  const categoryList = Object.entries(categoryCounts);

  // Recent 3 posts for "Recent Post" sidebar widget (matching Laravel blog_details.blade.php)
  const recentPosts = allBlogs
    .filter((item) => (item.slug || item.id) !== (blog?.slug || blog?.id))
    .slice(0, 3);
  const sidebarRecentPosts = recentPosts.length > 0 ? recentPosts : allBlogs.slice(0, 3);

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

      <style jsx global>{`
        .rn-blog-detail-section {
          width: 100%;
          padding: 138px clamp(16px, 5vw, 80px) 80px;
          box-sizing: border-box;
          background: #ffffff;
        }
        @media (max-width: 1024px) {
          .rn-blog-detail-section {
            padding: 122px 24px 64px;
          }
        }
        @media (max-width: 768px) {
          .rn-blog-detail-section {
            padding: 104px 16px 52px;
          }
        }

        .rn-blog-detail-grid {
          display: grid;
          grid-template-columns: minmax(0, 2fr) minmax(280px, 1fr);
          gap: 48px;
          align-items: start;
        }
        @media (max-width: 992px) {
          .rn-blog-detail-grid {
            grid-template-columns: 1fr;
            gap: 40px;
          }
        }

        /* Laravel .blog_right_side sidebar styling */
        .rn-blog-right-sidebar {
          position: sticky;
          top: 110px;
          padding-left: 36px;
          border-left: 1px solid #eeeeee;
        }
        @media (max-width: 992px) {
          .rn-blog-right-sidebar {
            position: static;
            padding-left: 0;
            border-left: none;
            border-top: 1px solid #eeeeee;
            padding-top: 32px;
          }
        }

        .rn-widget-title {
          font-size: 16.5px;
          font-weight: 700;
          color: #181818;
          padding-bottom: 14px;
          border-bottom: 1px solid #f1f1f1;
          position: relative;
          margin: 0 0 18px 0;
        }
        .rn-widget-title::after {
          content: "";
          position: absolute;
          bottom: -1px;
          left: 0;
          background: #00a0e3;
          height: 3px;
          width: 50px;
          border-radius: 2px;
        }

        .rn-cat-list {
          list-style: none;
          padding: 0;
          margin: 0 0 40px 0;
        }
        .rn-cat-list li {
          border-bottom: 1px solid #f5f5f5;
        }
        .rn-cat-list li:last-child {
          border-bottom: none;
        }
        .rn-cat-link {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 11px 6px;
          color: #334155;
          text-decoration: none;
          font-size: 14.5px;
          font-weight: 500;
          transition: color 0.2s ease, transform 0.2s ease;
        }
        .rn-cat-link:hover {
          color: #00a0e3;
          transform: translateX(3px);
        }
        .rn-cat-count {
          color: #00a0e3;
          font-weight: 600;
          font-size: 13.5px;
        }

        .rn-recent-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .rn-recent-item {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding-bottom: 16px;
          border-bottom: 1px solid #f1f1f1;
          text-decoration: none;
          color: inherit;
          transition: opacity 0.2s ease;
        }
        .rn-recent-item:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }
        .rn-recent-item:hover .rn-recent-item-title {
          color: #00a0e3;
        }
        .rn-recent-thumb {
          width: 82px;
          height: 62px;
          border-radius: 8px;
          overflow: hidden;
          flex-shrink: 0;
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
        }
        .rn-recent-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.35s ease;
        }
        .rn-recent-item:hover .rn-recent-thumb img {
          transform: scale(1.06);
        }
        .rn-recent-item-title {
          margin: 0 0 6px 0;
          font-size: 14.5px;
          font-weight: 600;
          line-height: 1.38;
          color: #111827;
          transition: color 0.2s ease;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .rn-recent-item-time {
          font-size: 12px;
          color: #64748b;
          display: inline-flex;
          align-items: center;
          gap: 5px;
        }

        /* Article Content Typography matching Laravel .blog_content_areaaa */
        .rn-article-body {
          font-size: 15.5px;
          line-height: 1.82;
          color: #334155;
        }
        .rn-article-body p {
          margin: 0 0 20px 0;
          line-height: 1.82;
          color: #334155;
          font-size: 15.5px;
        }
        .rn-article-body h2,
        .rn-article-body h3,
        .rn-article-body h4,
        .rn-article-body h5,
        .rn-article-body h6 {
          margin: 28px 0 12px 0;
          font-weight: 700;
          color: #0f172a;
          line-height: 1.35;
        }
        .rn-article-body h2 {
          font-size: 22px;
        }
        .rn-article-body h3 {
          font-size: 19px;
        }
        .rn-article-body h4,
        .rn-article-body h5,
        .rn-article-body h6 {
          font-size: 17px;
        }
        .rn-article-body ul,
        .rn-article-body ol {
          margin: 0 0 22px 22px;
          padding-left: 10px;
          color: #334155;
          line-height: 1.8;
        }
        .rn-article-body li {
          margin-bottom: 8px;
        }
        .rn-article-body strong {
          color: #0f172a;
          font-weight: 700;
        }
        .rn-article-body img {
          max-width: 100%;
          height: auto;
          border-radius: 10px;
          margin: 20px 0;
        }
        .rn-article-body a {
          color: #0077b6;
          text-decoration: underline;
        }
        .rn-article-body table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
          font-size: 14.5px;
        }
        .rn-article-body th,
        .rn-article-body td {
          border: 1px solid #e2e8f0;
          padding: 10px 14px;
          text-align: left;
        }
        .rn-article-body th {
          background: #f8fafc;
          font-weight: 700;
          color: #0f172a;
        }
      `}</style>

      <section data-header-theme="light" className="rn-blog-detail-section">
        <div style={{ maxWidth: "1280px", margin: "0 auto", width: "100%" }}>
          {/* Top Breadcrumb + Back to Blog List (Matches Laravel .brdcrm_menu) */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "12px",
              marginBottom: "28px",
              paddingBottom: "16px",
              borderBottom: "1px solid #F1F5F9",
            }}
          >
            <Link
              href="/blogs"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "7px 14px",
                borderRadius: "8px",
                border: "1px solid #E2E8F0",
                background: "#FFFFFF",
                color: "#0F172A",
                fontSize: "13.5px",
                fontWeight: 600,
                textDecoration: "none",
                transition: "all 0.2s ease",
              }}
            >
              <ChevronLeft size={15} />
              Back to Blog List
            </Link>

            <nav
              aria-label="Breadcrumb"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "13px",
                color: "#64748B",
                flexWrap: "wrap",
              }}
            >
              <Link href="/" style={{ color: "#64748B", textDecoration: "none" }}>
                Home
              </Link>
              <ChevronRight size={13} />
              <Link href="/blogs" style={{ color: "#64748B", textDecoration: "none" }}>
                Blogs &amp; Journal
              </Link>
              {blog?.title && (
                <>
                  <ChevronRight size={13} />
                  <span
                    style={{
                      color: "#0F172A",
                      fontWeight: 600,
                      maxWidth: "280px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {blog.title}
                  </span>
                </>
              )}
            </nav>
          </div>

          {loading ? (
            /* Skeleton Loading Layout */
            <div className="rn-blog-detail-grid">
              <div>
                <div
                  className="animate-pulse"
                  style={{
                    height: "36px",
                    width: "80%",
                    background: "#F1F5F9",
                    borderRadius: "8px",
                    marginBottom: "20px",
                  }}
                />
                <div
                  className="animate-pulse"
                  style={{
                    height: "380px",
                    width: "100%",
                    background: "#F1F5F9",
                    borderRadius: "14px",
                    marginBottom: "28px",
                  }}
                />
                <div
                  className="animate-pulse"
                  style={{
                    height: "18px",
                    width: "100%",
                    background: "#F1F5F9",
                    borderRadius: "4px",
                    marginBottom: "12px",
                  }}
                />
                <div
                  className="animate-pulse"
                  style={{
                    height: "18px",
                    width: "92%",
                    background: "#F1F5F9",
                    borderRadius: "4px",
                    marginBottom: "12px",
                  }}
                />
                <div
                  className="animate-pulse"
                  style={{
                    height: "18px",
                    width: "75%",
                    background: "#F1F5F9",
                    borderRadius: "4px",
                  }}
                />
              </div>
              <div className="rn-blog-right-sidebar">
                <div
                  className="animate-pulse"
                  style={{
                    height: "240px",
                    width: "100%",
                    background: "#F8FAFC",
                    borderRadius: "12px",
                  }}
                />
              </div>
            </div>
          ) : notFound || !blog ? (
            /* Not Found State */
            <div
              style={{
                textAlign: "center",
                padding: "80px 20px",
                border: "1px dashed #E2E8F0",
                borderRadius: "16px",
                background: "#FAFAFA",
                margin: "20px 0 40px",
              }}
            >
              <BookOpen size={44} style={{ color: "#94A3B8", margin: "0 auto 16px" }} />
              <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#0F172A", margin: "0 0 8px" }}>
                Article Not Found
              </h1>
              <p style={{ fontSize: "14.5px", color: "#64748B", margin: "0 0 24px" }}>
                The blog post you are looking for may have been moved or does not exist.
              </p>
              <Link
                href="/blogs"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "11px 24px",
                  background: "#0F172A",
                  color: "#FFFFFF",
                  borderRadius: "8px",
                  textDecoration: "none",
                  fontSize: "14px",
                  fontWeight: 600,
                }}
              >
                <ChevronLeft size={16} />
                View All Blogs
              </Link>
            </div>
          ) : (
            /* 2-Column Layout matching Laravel blog_details.blade.php (col-lg-8 + col-lg-4) */
            <div className="rn-blog-detail-grid">
              {/* Left 8-Column Article Content Area */}
              <article className="blog-details-wrap" style={{ paddingBottom: "20px" }}>
                {/* Meta Row: Category Badge, Published Date, Author */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    fontSize: "13px",
                    color: "#64748B",
                    marginBottom: "14px",
                    flexWrap: "wrap",
                  }}
                >
                  <Link
                    href={`/blogs?category=${encodeURIComponent(blog.category || "Bath Design & Care")}`}
                    style={{
                      fontWeight: 700,
                      color: "#0284C7",
                      background: "#F0F9FF",
                      border: "1px solid #BAE6FD",
                      padding: "4px 12px",
                      borderRadius: "20px",
                      textDecoration: "none",
                      fontSize: "12px",
                    }}
                  >
                    {blog.category || "Bath Design & Care"}
                  </Link>
                  <span>•</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                    <Calendar size={13.5} />
                    {blog.publishedAt}
                  </span>
                  <span>•</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                    <User size={13.5} />
                    By {blog.author || "Admin"}
                  </span>
                </div>

                {/* H1 Article Title (Matches Laravel <h1 class="title" style="font-size:30px">) */}
                <h1
                  style={{
                    fontSize: "clamp(24px, 3vw, 34px)",
                    fontWeight: 800,
                    color: "#0F172A",
                    lineHeight: 1.28,
                    letterSpacing: "-0.02em",
                    margin: "0 0 22px 0",
                  }}
                >
                  {blog.title}
                </h1>

                {/* Featured Hero Image */}
                {blog.image && (
                  <div
                    style={{
                      width: "100%",
                      borderRadius: "14px",
                      overflow: "hidden",
                      marginBottom: "28px",
                      border: "1px solid #E2E8F0",
                      background: "#F8FAFC",
                      maxHeight: "460px",
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={blog.image}
                      alt={blog.title}
                      width={860}
                      height={460}
                      style={{
                        width: "100%",
                        height: "auto",
                        maxHeight: "460px",
                        objectFit: "cover",
                        display: "block",
                      }}
                      onError={(e) => {
                        const target = e.currentTarget;
                        const originalSrc = blog.image || "";
                        if (
                          originalSrc &&
                          !target.src.includes("www.rnvalves.com") &&
                          !originalSrc.startsWith("http")
                        ) {
                          const cleanPath = originalSrc.startsWith("/")
                            ? originalSrc
                            : `/${originalSrc}`;
                          target.src = `https://www.rnvalves.com${cleanPath}`;
                        } else {
                          target.src = FALLBACK_BLOG_IMAGE;
                        }
                      }}
                    />
                  </div>
                )}

                {/* Summary Lead Quote */}
                {blog.summary && (
                  <p
                    style={{
                      fontSize: "16px",
                      fontWeight: 500,
                      color: "#1E293B",
                      lineHeight: 1.68,
                      borderLeft: "3.5px solid #00A0E3",
                      paddingLeft: "18px",
                      margin: "0 0 28px 0",
                      background: "#F8FAFC",
                      paddingTop: "12px",
                      paddingBottom: "12px",
                      paddingRight: "16px",
                      borderRadius: "0 8px 8px 0",
                    }}
                  >
                    {blog.summary}
                  </p>
                )}

                {/* Full HTML Article Content */}
                <div
                  className="rn-article-body"
                  dangerouslySetInnerHTML={{ __html: blog.content }}
                />

                {/* Bottom Footer Navigation */}
                <div
                  style={{
                    marginTop: "44px",
                    paddingTop: "24px",
                    borderTop: "1px solid #E2E8F0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "12px",
                  }}
                >
                  <Link
                    href="/blogs"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "10px 20px",
                      borderRadius: "8px",
                      background: "#0F172A",
                      color: "#FFFFFF",
                      fontSize: "13.5px",
                      fontWeight: 600,
                      textDecoration: "none",
                    }}
                  >
                    <ChevronLeft size={16} />
                    Back to Blog List
                  </Link>
                </div>
              </article>

              {/* Right 4-Column Sticky Sidebar (Matches Laravel .blog_right_side: Blog Categories + Recent Post) */}
              <aside className="rn-blog-right-sidebar" aria-label="Blog Sidebar">
                {/* Widget 1: Blog Categories */}
                <div style={{ marginBottom: "36px" }}>
                  <h5 className="rn-widget-title">Blog Categories</h5>
                  <ul className="rn-cat-list">
                    <li>
                      <Link href="/blogs" className="rn-cat-link">
                        <span>All Articles</span>
                        <span className="rn-cat-count">({allBlogs.length})</span>
                      </Link>
                    </li>
                    {categoryList.map(([catName, count]) => (
                      <li key={catName}>
                        <Link
                          href={`/blogs?category=${encodeURIComponent(catName)}`}
                          className="rn-cat-link"
                        >
                          <span>{catName}</span>
                          <span className="rn-cat-count">({count})</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Widget 2: Recent Post */}
                {sidebarRecentPosts.length > 0 && (
                  <div>
                    <h5 className="rn-widget-title">Recent Post</h5>
                    <div className="rn-recent-list">
                      {sidebarRecentPosts.map((post) => {
                        const postSlug = post.slug || post.id;
                        return (
                          <Link
                            key={post._id || post.id}
                            href={`/blogs/${encodeURIComponent(postSlug)}`}
                            className="rn-recent-item"
                          >
                            <div className="rn-recent-thumb">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={post.image || FALLBACK_BLOG_IMAGE}
                                alt={post.title}
                                width={82}
                                height={62}
                                loading="lazy"
                                decoding="async"
                                onError={(e) => {
                                  const target = e.currentTarget;
                                  const originalSrc = post.image || "";
                                  if (
                                    originalSrc &&
                                    !target.src.includes("www.rnvalves.com") &&
                                    !originalSrc.startsWith("http")
                                  ) {
                                    const cleanPath = originalSrc.startsWith("/")
                                      ? originalSrc
                                      : `/${originalSrc}`;
                                    target.src = `https://www.rnvalves.com${cleanPath}`;
                                  } else {
                                    target.src = FALLBACK_BLOG_IMAGE;
                                  }
                                }}
                              />
                            </div>
                            <div style={{ minWidth: 0, flex: 1 }}>
                              <h5 className="rn-recent-item-title">{post.title}</h5>
                              <span className="rn-recent-item-time">
                                <Calendar size={11.5} />
                                {post.publishedAt}
                              </span>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </aside>
            </div>
          )}
        </div>
      </section>

      <FooterSection />
    </main>
  );
}
