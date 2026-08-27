"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const BLOGS = [
  {
    title: "Designer Wash Basin Trends for Small Bathrooms in 2026",
    href: "#",
    image:
      "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=luxury%20small%20bathroom%20interior%20with%20designer%20white%20wash%20basin%2C%20modern%20chrome%20faucet%2C%20warm%20ambient%20lighting%2C%20premium%20dark%20stone%20wall%2C%20realistic%20editorial%20interior%20photography%2C%20high-end%20home%20design&image_size=landscape_16_9",
  },
  {
    title: "Elegant Bedroom Wall Tile Ideas to Suit Every Style",
    href: "#",
    image:
      "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=contemporary%20luxury%20bedroom%20with%20large%20marble%20accent%20wall%20tiles%2C%20soft%20natural%20light%2C%20floor-to-ceiling%20window%2C%20minimal%20premium%20furniture%2C%20realistic%20interior%20photography&image_size=landscape_16_9",
  },
  {
    title: "Creative Kitchen Chimney Design Ideas for Your Home",
    href: "#",
    image:
      "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=modern%20kitchen%20interior%20with%20sleek%20black%20chimney%20hood%2C%20white%20brick%20wall%2C%20minimal%20cabinetry%2C%20clean%20premium%20appliance%20showcase%2C%20realistic%20interior%20photography&image_size=landscape_16_9",
  },
  {
    title: "Premium Faucet Finishes That Instantly Elevate Your Bathroom",
    href: "#",
    image:
      "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=premium%20bathroom%20countertop%20with%20brushed%20gold%20designer%20faucet%2C%20stone%20sink%2C%20soft%20luxury%20lighting%2C%20high-end%20interior%20editorial%20photography&image_size=landscape_16_9",
  },
  {
    title: "How to Choose Tiles That Make Compact Spaces Feel Bigger",
    href: "#",
    image:
      "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=bright%20compact%20modern%20interior%20with%20large-format%20light%20tiles%2C%20spacious%20feel%2C%20minimal%20furnishings%2C%20realistic%20architectural%20interior%20photography&image_size=landscape_16_9",
  },
] as const;

interface BlogsSectionProps {
  data?: {
    visible?: boolean;
    title?: string;
    viewAllHref?: string;
    blogs?: Array<{ title: string; image: string; href: string }>;
  };
}

export default function BlogsSection({ data }: BlogsSectionProps) {
  if (data?.visible === false) return null;

  const validBlogs = data?.blogs?.filter((b) => Boolean(b.image));
  const blogsList = validBlogs && validBlogs.length > 0 ? validBlogs : BLOGS;
  const sectionTitle = data?.title || "Blogs";
  const viewAllLink = data?.viewAllHref || "#";

  const [startIndex, setStartIndex] = useState(0);

  const visibleBlogs = useMemo(() => {
    const items = [];
    for (let i = 0; i < Math.min(3, blogsList.length); i += 1) {
      items.push(blogsList[(startIndex + i) % blogsList.length]);
    }
    return items;
  }, [startIndex, blogsList]);

  const goPrev = () => {
    setStartIndex((prev) => (prev - 1 + BLOGS.length) % BLOGS.length);
  };

  const goNext = () => {
    setStartIndex((prev) => (prev + 1) % BLOGS.length);
  };

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
          Blogs
        </h2>
        <a
          href="#"
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
