"use client";

import { useEffect, useState, use } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import SupportLinksSection from "@/components/SupportLinksSection";
import FooterSection from "@/components/FooterSection";
import HomeClient from "@/components/home/HomeClient";

const DEFAULT_HERO_IMAGE =
  "/api/media/website/catalogue/products/default/image.webp";

interface CategoryData {
  id?: string;
  name?: string;
  slug?: string;
  title?: string;
  description?: string;
  banner?: string;
  image?: string;
  mobileBanner?: string;
}

export default function DynamicCategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const isIndexSlug = !slug || slug.toLowerCase() === "index" || slug.toLowerCase() === "index.html";
  const [category, setCategory] = useState<CategoryData | null>(null);
  const [isCategoryNotFound, setIsCategoryNotFound] = useState(false);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [blogs, setBlogs] = useState<any[]>([]);

  useEffect(() => {
    if (isIndexSlug) return;
    async function loadCategoryAndSubcategories() {
      setIsCategoryNotFound(false);
      try {
        // 1. Fetch Category by slug
        const catRes = await fetch(`/api/categories/${slug}`);
        const catData = catRes.ok ? await catRes.json() : null;
        if (catData && !catData.error) {
          setCategory(catData);
        } else {
          // 1B. Check if the root slug is a Subcategory (e.g. /m-series-collection)
          const subSingleRes = await fetch(`/api/subcategories/${encodeURIComponent(slug)}`);
          if (subSingleRes.ok) {
            const subSingleData = await subSingleRes.json();
            if (subSingleData && !subSingleData.error) {
              window.location.replace(`/faucets/${encodeURIComponent(subSingleData.slug || slug)}`);
              return;
            }
          }

          // 1C. Check if the root slug is a Product urlKey / SKU (e.g. /wall-mounted-sink-cock-with-swivel-spout-flange-rnama32g09)
          const prodSingleRes = await fetch(`/api/products/${encodeURIComponent(slug)}`);
          if (prodSingleRes.ok) {
            const prodSingleData = await prodSingleRes.json();
            if (prodSingleData && !prodSingleData.error) {
              const subSlug = String(
                prodSingleData.subcategorySlug ||
                  prodSingleData.subcategoryName ||
                  prodSingleData.category ||
                  "collection"
              )
                .toLowerCase()
                .trim()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)/g, "") || "collection";
              const prodIdentifier = prodSingleData.code || prodSingleData.skuCode || prodSingleData.id || slug;
              window.location.replace(
                `/faucets/${encodeURIComponent(subSlug)}/${encodeURIComponent(prodIdentifier)}`
              );
              return;
            }
          }

          setIsCategoryNotFound(true);
          return;
        }

        // 2. Fetch Subcategories
        const subRes = await fetch("/api/subcategories");
        const subs: any[] = subRes.ok ? await subRes.json() : [];
        if (Array.isArray(subs)) {
          const catId = catData?.id || catData?._id;
          const filtered = subs.filter((s) => {
            return (
              (catId && (s.categoryId === catId || s.categoryId === String(catId))) ||
              s.categoryId === slug ||
              s.categoryName?.toLowerCase() === slug.toLowerCase() ||
              (catData?.name && s.categoryName?.toLowerCase() === catData.name.toLowerCase()) ||
              s.slug === slug
            );
          });
          setSubcategories(filtered);
        }

        // 3. Fetch Blogs
        const blogRes = await fetch("/api/blogs");
        if (blogRes.ok) {
          const blogData = await blogRes.json();
          if (Array.isArray(blogData.blogs)) {
            setBlogs(blogData.blogs.slice(0, 3));
          }
        }
      } catch (err) {
        console.error("Error fetching category/subcategories:", err);
      }
    }

    loadCategoryAndSubcategories();
  }, [slug, isIndexSlug]);

  if (isIndexSlug) {
    return <HomeClient />;
  }

  if (isCategoryNotFound) {
    return (
      <main style={{ width: "100%", minHeight: "100vh", backgroundColor: "#ffffff" }}>
        <Header />
        <section
          data-header-theme="light"
          style={{
            maxWidth: "680px",
            margin: "0 auto",
            padding: "160px 24px 120px",
            textAlign: "center",
            fontFamily: "'Manrope', system-ui, sans-serif",
          }}
        >
          <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#0f172a", marginBottom: "12px" }}>
            Category Unavailable
          </h1>
          <p style={{ fontSize: "15px", color: "#64748b", lineHeight: 1.6, marginBottom: "28px" }}>
            This category is currently unavailable or has been removed from our active catalogue.
          </p>
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "12px 28px",
              borderRadius: "8px",
              background: "#0f172a",
              color: "#ffffff",
              fontSize: "14px",
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            Back to Home
          </Link>
        </section>
        <SupportLinksSection />
        <FooterSection />
      </main>
    );
  }

  const categoryName = category?.name || slug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  // Category Banner from Admin panel, fallback to Category Image, fallback to default hero
  const heroBannerImage = category?.banner || category?.image || DEFAULT_HERO_IMAGE;
  const categoryTitle = category?.title || category?.description || `${categoryName} — Precision Engineering with Timeless Style`;

  const showcaseItems = subcategories.length > 0
    ? subcategories.map((sub, i) => ({
        id: sub.id || sub.slug || String(i),
        title: sub.name,
        subtitle: sub.description || sub.title || `${sub.name} Collection`,
        image: sub.image || sub.banner || DEFAULT_HERO_IMAGE,
        href: `/faucets/${sub.slug || sub.id}`,
        isComingSoon: false,
      }))
    : [
        {
          id: "coming-soon-1",
          title: `${categoryName} Series`,
          subtitle: "Coming Soon — New Premium Collection Launching Shortly",
          image: category?.banner || category?.image || DEFAULT_HERO_IMAGE,
          href: "#",
          isComingSoon: true,
        },
        {
          id: "coming-soon-2",
          title: `${categoryName} Accessories`,
          subtitle: "Coming Soon — Designer Bath Hardware in Progress",
          image: category?.image || category?.banner || DEFAULT_HERO_IMAGE,
          href: "#",
          isComingSoon: true,
        },
      ];

  // Split into Top Grid (up to 3) and Bottom Grid (remaining items)
  const topCards = showcaseItems.slice(0, 3);
  const bottomCards = subcategories.length > 3 ? showcaseItems.slice(3) : [];

  return (
    <main style={{ width: "100%", minHeight: "100vh", backgroundColor: "#ffffff" }}>
      <Header />
      <style>{`
        .slug-hero-section {
          position: relative;
          width: 100%;
          height: min(100vh, 65vw);
          min-height: 360px;
          overflow: hidden;
          background-color: #090d16;
        }
        .slug-intro-section {
          padding: 48px 48px 44px;
          background-color: #ffffff;
          box-sizing: border-box;
        }
        .slug-top-grid-section {
          padding: 0 48px 32px;
          background-color: #ffffff;
          box-sizing: border-box;
        }
        .slug-bottom-grid-section {
          padding: 0 48px 64px;
          background-color: #ffffff;
          box-sizing: border-box;
        }
        .slug-unified-mobile-section {
          display: none;
        }
        .slug-blogs-section {
          padding: 48px 48px 80px;
          background-color: #ffffff;
          box-sizing: border-box;
        }
        .slug-cards-grid {
          display: grid;
          gap: 28px;
        }
        .slug-blogs-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 24px;
        }
        @media (max-width: 1024px) {
          .slug-intro-section {
            padding: 36px 24px 32px !important;
          }
          .slug-top-grid-section,
          .slug-bottom-grid-section {
            display: none !important;
          }
          .slug-unified-mobile-section {
            display: block !important;
            padding: 0 24px 48px !important;
            background-color: #ffffff;
            box-sizing: border-box;
          }
          .slug-blogs-section {
            padding: 36px 24px 64px !important;
          }
          .slug-cards-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 20px !important;
          }
          .slug-blogs-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 20px !important;
          }
          .slug-top-card {
            height: 460px !important;
          }
          .slug-bottom-card {
            height: 400px !important;
          }
        }
        @media (max-width: 640px) {
          .slug-hero-section {
            height: clamp(320px, 68vw, 420px) !important;
            min-height: 320px !important;
          }
          .slug-intro-section {
            padding: 24px 16px 20px !important;
          }
          .slug-unified-mobile-section {
            padding: 0 14px 36px !important;
          }
          .slug-blogs-section {
            padding: 28px 16px 52px !important;
          }
          .slug-cards-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 12px !important;
          }
          .slug-blogs-grid {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
          }
          .slug-top-card,
          .slug-bottom-card {
            height: 290px !important;
            padding: 14px 12px 14px !important;
          }
          .subcategory-card h3 {
            font-size: 15px !important;
            line-height: 1.25 !important;
            margin: 0 0 4px 0 !important;
          }
          .subcategory-card p {
            font-size: 12px !important;
            line-height: 1.35 !important;
            display: -webkit-box !important;
            -webkit-line-clamp: 2 !important;
            -webkit-box-orient: vertical !important;
            overflow: hidden !important;
          }
          .slug-blogs-spacer {
            display: none !important;
          }
          .slug-blogs-heading {
            text-align: left !important;
          }
        }
        @media (max-width: 350px) {
          .slug-cards-grid {
            grid-template-columns: 1fr !important;
          }
          .slug-top-card,
          .slug-bottom-card {
            height: 310px !important;
          }
        }
      `}</style>

      {/* ── 1. Fullscreen Hero Section with Category Banner ── */}
      <section
        data-header-theme="dark"
        className="slug-hero-section rn-hero-portrait-cap"
      >
        <Image
          src={heroBannerImage}
          alt={categoryName}
          fill
          priority
          unoptimized
          decoding="async"
          sizes="100vw"
          style={{
            objectFit: "cover",
            objectPosition: "center",
          }}
        />

        {/* Gradient shadow overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.15) 50%, transparent 100%)",
            pointerEvents: "none",
          }}
        />

        {/* Hero Title */}
        <div
          style={{
            position: "absolute",
            bottom: "8vh",
            left: 0,
            right: 0,
            textAlign: "center",
            zIndex: 2,
          }}
        >
          <h1
            style={{
              fontFamily: "'Manrope', system-ui, sans-serif",
              fontSize: "clamp(38px, 4.5vw, 56px)",
              fontWeight: 500,
              color: "#ffffff",
              letterSpacing: "-0.02em",
              margin: 0,
            }}
          >
            {categoryName}
          </h1>
        </div>
      </section>

      {/* ── 2. Breadcrumb & Section Introduction ── */}
      <section
        data-header-theme="light"
        className="slug-intro-section"
      >
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          style={{
            marginBottom: "32px",
            fontFamily: "'Manrope', system-ui, sans-serif",
            fontSize: "13px",
            color: "#64748B",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <Link
            href="/"
            style={{
              color: "#64748B",
              textDecoration: "none",
              transition: "color 0.2s ease",
            }}
          >
            Home
          </Link>
          <span style={{ color: "#CBD5E1" }}>/</span>
          <span style={{ color: "#0F172A", fontWeight: 600 }}>{categoryName}</span>
        </nav>

        {/* Page Title */}
        <h2
          style={{
            textAlign: "center",
            fontFamily: "'Manrope', system-ui, sans-serif",
            fontSize: "clamp(20px, 3vw, 42px)",
            fontWeight: 500,
            lineHeight: 1.32,
            letterSpacing: "-0.025em",
            color: "#111111",
            maxWidth: "920px",
            margin: "0 auto",
          }}
        >
          {String(categoryTitle || "").replace(/\|(\S)/g, " | $1")}
        </h2>
      </section>

      {/* ── 3. Showcase Grid (Top Subcategories) ── */}
      <section
        data-header-theme="light"
        className="slug-top-grid-section"
      >
        <div
          className="slug-cards-grid"
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${Math.min(topCards.length, 3)}, minmax(0, 1fr))`,
            gap: "28px",
          }}
        >
          {topCards.map((card) => (
            <Link
              key={card.id}
              href={card.href}
              onClick={(e) => {
                if (card.isComingSoon) e.preventDefault();
              }}
              style={{
                textDecoration: "none",
                padding: "24px 20px 24px",
                display: "flex",
                flexDirection: "column",
                height: "580px",
                boxSizing: "border-box",
                cursor: card.isComingSoon ? "default" : "pointer",
                position: "relative",
                transition: "transform 0.35s ease, box-shadow 0.35s ease",
              }}
              className="subcategory-card slug-top-card group"
            >
              {card.isComingSoon && (
                <span
                  style={{
                    position: "absolute",
                    top: "20px",
                    right: "20px",
                    backgroundColor: "rgba(0, 0, 0, 0.75)",
                    color: "#ffffff",
                    fontSize: "11px",
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    padding: "4px 12px",
                    borderRadius: "16px",
                    backdropFilter: "blur(4px)",
                    zIndex: 10,
                  }}
                >
                  Coming Soon
                </span>
              )}

              {/* Subcategory PNG sits on full-card textured paper */}
              <div
                className="product-card__image-panel"
                style={{
                  flex: "1 1 auto",
                  width: "100%",
                  minHeight: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  padding: "4px 4px 10px",
                  boxSizing: "border-box",
                }}
              >
                <img
                  src={card.image}
                  alt={card.title}
                  style={{
                    width: "100%",
                    height: "100%",
                    maxWidth: "96%",
                    maxHeight: "100%",
                    objectFit: "contain",
                    transform: "scale(1.12)",
                    transition: "transform 0.45s ease",
                  }}
                  className={card.isComingSoon ? "" : "group-hover:scale-[1.18]"}
                />
              </div>

              {/* Title & Subtitle */}
              <div style={{ flexShrink: 0, marginTop: "12px", padding: "0 6px" }}>
                <h3
                  style={{
                    fontFamily: "'Manrope', system-ui, sans-serif",
                    fontSize: "20px",
                    fontWeight: 600,
                    lineHeight: 1.3,
                    color: "#1a1a1a",
                    margin: "0 0 6px 0",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {card.title}
                </h3>
                <p
                  style={{
                    fontFamily: "'Manrope', system-ui, sans-serif",
                    fontSize: "14px",
                    fontWeight: 400,
                    color: "#475569",
                    margin: 0,
                    lineHeight: 1.4,
                  }}
                >
                  {card.subtitle}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── 4. Feature Grid (Remaining Subcategories) ── */}
      {bottomCards.length > 0 && (
        <section
          data-header-theme="light"
          className="slug-bottom-grid-section"
        >
          <div
            className="slug-cards-grid"
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${Math.min(bottomCards.length, 3)}, minmax(0, 1fr))`,
              gap: "28px",
            }}
          >
            {bottomCards.map((card) => (
              <Link
                key={card.id}
                href={card.href}
                style={{
                  textDecoration: "none",
                  padding: "24px 20px 20px",
                  display: "flex",
                  flexDirection: "column",
                  height: "460px",
                  boxSizing: "border-box",
                  cursor: "pointer",
                  position: "relative",
                  transition: "transform 0.35s ease, box-shadow 0.35s ease",
                }}
                className="subcategory-card slug-top-card group"
              >
                <div
                  className="product-card__image-panel"
                  style={{
                    flex: "1 1 auto",
                    width: "100%",
                    minHeight: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                    padding: "4px 4px 8px",
                    boxSizing: "border-box",
                  }}
                >
                  <img
                    src={card.image}
                    alt={card.title}
                    style={{
                      width: "100%",
                      height: "100%",
                      maxWidth: "96%",
                      maxHeight: "100%",
                      objectFit: "contain",
                      transform: "scale(1.12)",
                      transition: "transform 0.45s ease",
                    }}
                    className="group-hover:scale-[1.18]"
                  />
                </div>

                <div style={{ flexShrink: 0, marginTop: "10px", padding: "0 4px" }}>
                  <h3
                    style={{
                      fontFamily: "'Manrope', system-ui, sans-serif",
                      fontSize: "18px",
                      fontWeight: 600,
                      lineHeight: 1.3,
                      color: "#1a1a1a",
                      margin: "0 0 6px 0",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {card.title}
                  </h3>
                  <p
                    style={{
                      fontFamily: "'Manrope', system-ui, sans-serif",
                      fontSize: "13px",
                      fontWeight: 400,
                      color: "#475569",
                      margin: 0,
                      lineHeight: 1.4,
                    }}
                  >
                    {card.subtitle}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── 4B. Unified Responsive Grid for Tablet & Mobile (≤1024px) so 2-Column Grid Has No Orphan Row ── */}
      <section
        data-header-theme="light"
        className="slug-unified-mobile-section"
      >
        <div
          className="slug-cards-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: "20px",
          }}
        >
          {showcaseItems.map((card) => (
            <Link
              key={`unified-${card.id}`}
              href={card.href}
              onClick={(e) => {
                if (card.isComingSoon) e.preventDefault();
              }}
              style={{
                textDecoration: "none",
                padding: "24px 20px 24px",
                display: "flex",
                flexDirection: "column",
                height: "460px",
                boxSizing: "border-box",
                cursor: card.isComingSoon ? "default" : "pointer",
                position: "relative",
                transition: "transform 0.35s ease, box-shadow 0.35s ease",
              }}
              className="subcategory-card slug-top-card group"
            >
              {card.isComingSoon && (
                <span
                  style={{
                    position: "absolute",
                    top: "14px",
                    right: "14px",
                    backgroundColor: "rgba(0, 0, 0, 0.75)",
                    color: "#ffffff",
                    fontSize: "10px",
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    padding: "4px 10px",
                    borderRadius: "16px",
                    backdropFilter: "blur(4px)",
                    zIndex: 10,
                  }}
                >
                  Coming Soon
                </span>
              )}

              <div
                className="product-card__image-panel"
                style={{
                  flex: "1 1 auto",
                  width: "100%",
                  minHeight: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  padding: "4px 4px 8px",
                  boxSizing: "border-box",
                }}
              >
                <img
                  src={card.image}
                  alt={card.title}
                  style={{
                    width: "100%",
                    height: "100%",
                    maxWidth: "96%",
                    maxHeight: "100%",
                    objectFit: "contain",
                    transform: "scale(1.12)",
                    transition: "transform 0.45s ease",
                  }}
                  className={card.isComingSoon ? "" : "group-hover:scale-[1.18]"}
                />
              </div>

              <div style={{ flexShrink: 0, marginTop: "10px", padding: "0 4px" }}>
                <h3
                  style={{
                    fontFamily: "'Manrope', system-ui, sans-serif",
                    fontSize: "18px",
                    fontWeight: 600,
                    lineHeight: 1.3,
                    color: "#1a1a1a",
                    margin: "0 0 6px 0",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {card.title}
                </h3>
                <p
                  style={{
                    fontFamily: "'Manrope', system-ui, sans-serif",
                    fontSize: "13px",
                    fontWeight: 400,
                    color: "#475569",
                    margin: 0,
                    lineHeight: 1.4,
                  }}
                >
                  {card.subtitle}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── 5. Blogs Section ── */}
      <section
        data-header-theme="light"
        className="slug-blogs-section"
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "36px",
          }}
        >
          <div className="slug-blogs-spacer" style={{ width: "120px" }} />
          <h2
            className="slug-blogs-heading"
            style={{
              fontFamily: "'Manrope', system-ui, sans-serif",
              fontSize: "32px",
              fontWeight: 500,
              color: "#111111",
              letterSpacing: "-0.03em",
              textAlign: "center",
              margin: 0,
              flex: 1,
            }}
          >
            Blogs
          </h2>
          <Link
            href="/blogs"
            style={{
              fontFamily: "'Manrope', system-ui, sans-serif",
              fontSize: "14px",
              fontWeight: 500,
              color: "#111111",
              textDecoration: "underline",
              whiteSpace: "nowrap",
            }}
          >
            View All Blogs
          </Link>
        </div>

        <div className="slug-blogs-grid">
          {blogs.map((blog) => (
            <Link
              key={blog.id || blog._id}
              href="/blogs"
              style={{ display: "flex", flexDirection: "column", gap: "12px", textDecoration: "none" }}
            >
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  aspectRatio: "1.6 / 1",
                  overflow: "hidden",
                  backgroundColor: "#f2f2f2",
                }}
                className="group cursor-pointer"
              >
                <Image
                  src={blog.image || "/api/media/website/catalogue/products/default/image.webp"}
                  alt={blog.title}
                  fill
                  unoptimized
                  style={{
                    objectFit: "cover",
                    transition: "transform 0.5s ease",
                  }}
                  className="group-hover:scale-105"
                />
              </div>

              <h3
                style={{
                  fontFamily: "'Manrope', system-ui, sans-serif",
                  fontSize: "20px",
                  fontWeight: 400,
                  color: "#111111",
                  lineHeight: 1.3,
                  letterSpacing: "-0.02em",
                  margin: 0,
                  cursor: "pointer",
                }}
              >
                {blog.title}
              </h3>
            </Link>
          ))}
        </div>
      </section>

      {/* ── 6. Business Support & Footer ── */}
      <SupportLinksSection />
      <FooterSection />
    </main>
  );
}
