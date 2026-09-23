"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface BlogItem {
  id?: string;
  _id?: string;
  title: string;
  slug?: string;
  image: string;
  href?: string;
}

interface BlogsSectionProps {
  data?: {
    visible?: boolean;
    title?: string;
    viewAllHref?: string;
    blogs?: Array<{ title: string; image: string; href?: string; slug?: string }>;
  };
}

export default function BlogsSection({ data }: BlogsSectionProps) {
  const [dbBlogs, setDbBlogs] = useState<BlogItem[]>([]);
  const [startIndex, setStartIndex] = useState(0);

  useEffect(() => {
    if (!data?.blogs || data.blogs.length === 0) {
      fetch("/api/blogs")
        .then((res) => res.json())
        .then((json) => {
          if (Array.isArray(json.blogs)) {
            const mapped = json.blogs.map((b: any) => ({
              id: b.id || b._id,
              title: b.title,
              slug: b.slug,
              image: b.image || "/api/media/website/catalogue/products/default/image.webp",
              href: `/blogs?slug=${encodeURIComponent(b.slug || "")}`,
            }));
            setDbBlogs(mapped);
          }
        })
        .catch((err) => console.error("Failed to load blogs for BlogsSection:", err));
    }
  }, [data?.blogs]);

  const blogsList: BlogItem[] = useMemo(() => {
    if (data?.blogs && data.blogs.length > 0) {
      return data.blogs.filter((b) => Boolean(b.image)).map((b) => ({
        ...b,
        href: b.href || (b.slug ? `/blogs?slug=${encodeURIComponent(b.slug)}` : "/blogs"),
      }));
    }
    return dbBlogs;
  }, [data?.blogs, dbBlogs]);

  const sectionTitle = data?.title || "Blogs";
  const viewAllLink = data?.viewAllHref && data.viewAllHref !== "#" ? data.viewAllHref : "/blogs";

  const visibleBlogs = useMemo(() => {
    if (blogsList.length === 0) return [];
    const count = Math.min(3, blogsList.length);
    const items: BlogItem[] = [];
    for (let i = 0; i < count; i += 1) {
      items.push(blogsList[(startIndex + i) % blogsList.length]);
    }
    return items;
  }, [startIndex, blogsList]);

  const goPrev = () => {
    if (blogsList.length === 0) return;
    setStartIndex((prev) => (prev - 1 + blogsList.length) % blogsList.length);
  };

  const goNext = () => {
    if (blogsList.length === 0) return;
    setStartIndex((prev) => (prev + 1) % blogsList.length);
  };

  if (data?.visible === false) return null;
  if (blogsList.length === 0) return null;

  return (
    <section
      data-header-theme="light"
      className="blogs-section"
      style={{
        width: "100vw",
        background: "#F3F3F3",
        padding: "110px 48px 64px",
        boxSizing: "border-box",
      }}
      aria-label="Blogs"
    >
      <style>{`
        .blogs-header-link:hover {
          opacity: 0.65;
        }
        .blogs-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 20px;
        }
        .blogs-card {
          text-decoration: none;
          color: #111111;
          min-width: 0;
        }
        .blogs-card:hover .blogs-card-title {
          opacity: 0.7;
        }
        .blogs-image-wrap {
          position: relative;
          aspect-ratio: 1.68 / 1;
          overflow: hidden;
          background: #DDDDDD;
          margin-bottom: 12px;
        }
        .blogs-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.45s ease;
        }
        .blogs-card:hover .blogs-image {
          transform: scale(1.03);
        }
        .blogs-nav {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 32px;
          height: 32px;
          border: 1px solid rgba(17,17,17,0.12);
          border-radius: 999px;
          background: rgba(255,255,255,0.9);
          color: #111111;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.2s ease, opacity 0.2s ease;
        }
        .blogs-nav:hover {
          background: #FFFFFF;
        }
        .blogs-nav-left {
          left: 12px;
        }
        .blogs-nav-right {
          right: 12px;
        }
        .blogs-card-title {
          margin: 0;
          font-family: 'Manrope', Helvetica, Arial, sans-serif;
          font-size: 24px;
          font-weight: 400;
          line-height: 1.28;
          letter-spacing: -0.03em;
          transition: opacity 0.2s ease;
        }
        @media (max-width: 960px) {
          .blogs-grid {
            grid-template-columns: 1fr;
          }
          .blogs-card-title {
            font-size: 20px;
          }
        }
        @media (max-width: 768px) {
          .blogs-section {
            padding: 18px 16px 36px !important;
          }
        }
      `}</style>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "20px",
          marginBottom: "26px",
        }}
      >
        <div style={{ width: "150px" }} />
        <h2
          style={{
            margin: 0,
            fontFamily: "'Manrope', Helvetica, Arial, sans-serif",
            fontSize: "28px",
            fontWeight: 500,
            lineHeight: 1.1,
            color: "#111111",
            textAlign: "center",
            letterSpacing: "-0.03em",
            flex: 1,
          }}
        >
          {sectionTitle}
        </h2>
        <a
          href={viewAllLink}
          className="blogs-header-link"
          style={{
            color: "#111111",
            textDecoration: "none",
            borderBottom: "1px solid #111111",
            paddingBottom: "2px",
            fontFamily: "'Manrope', Helvetica, Arial, sans-serif",
            fontSize: "14px",
            fontWeight: 500,
            lineHeight: 1.2,
            whiteSpace: "nowrap",
            transition: "opacity 0.2s ease",
          }}
        >
          View All Blogs
        </a>
      </div>

      <div className="blogs-grid">
        {visibleBlogs.map((blog, index) => (
          <article key={`${blog.title}-${index}`}>
            <a href={blog.href} className="blogs-card">
              <div className="blogs-image-wrap">
                {index === 0 && (
                  <button
                    type="button"
                    className="blogs-nav blogs-nav-left"
                    onClick={(event) => {
                      event.preventDefault();
                      goPrev();
                    }}
                    aria-label="Previous blogs"
                  >
                    <ChevronLeft size={18} strokeWidth={1.8} />
                  </button>
                )}
                {index === 2 && (
                  <button
                    type="button"
                    className="blogs-nav blogs-nav-right"
                    onClick={(event) => {
                      event.preventDefault();
                      goNext();
                    }}
                    aria-label="Next blogs"
                  >
                    <ChevronRight size={18} strokeWidth={1.8} />
                  </button>
                )}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={blog.image} alt={blog.title} className="blogs-image" />
              </div>
              <h3 className="blogs-card-title">{blog.title}</h3>
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}
