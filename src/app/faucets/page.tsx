"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import SupportLinksSection from "@/components/SupportLinksSection";
import FooterSection from "@/components/FooterSection";

const HERO_IMAGE_DEFAULT =
  "/api/media/website/catalogue/categories/cat-cp-faucets/banner.webp";

export default function FaucetsPage() {
  const [category, setCategory] = useState<any>(null);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [blogs, setBlogs] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const catRes = await fetch("/api/categories/cp-faucets");
        const catData = catRes.ok ? await catRes.json() : null;
        if (catData) setCategory(catData);

        const subRes = await fetch("/api/subcategories");
        const subs: any[] = subRes.ok ? await subRes.json() : [];
        if (Array.isArray(subs)) {
          const catId = catData?.id || catData?._id;
          const filtered = subs.filter((s) => {
            return (
              (catId && (s.categoryId === catId || s.categoryId === String(catId))) ||
              s.categoryId === "cp-faucets" ||
              s.categoryId === "faucets" ||
              s.categoryName?.toLowerCase() === "cp-faucets" ||
              s.categoryName?.toLowerCase() === "faucets"
            );
          });
          setSubcategories(filtered);
        }

        const blogRes = await fetch("/api/blogs");
        if (blogRes.ok) {
          const blogData = await blogRes.json();
          if (Array.isArray(blogData.blogs)) {
            setBlogs(blogData.blogs.slice(0, 3));
          }
        }
      } catch (err) {
        console.error("Error loading faucets data:", err);
      }
    }
    loadData();
  }, []);

  const heroImage = category?.banner || category?.image || HERO_IMAGE_DEFAULT;
  const categoryName = category?.name || "Faucets";
  const pageTitle = category?.title || category?.description || "Faucets — Precision Engineering with Timeless Style";

  const allCards = subcategories.length > 0
    ? subcategories.map((sub, i) => ({
        id: sub.id || sub.slug || String(i),
        title: sub.name,
        subtitle: sub.description || sub.title || `${sub.name} Collection`,
        image: sub.image || sub.banner || HERO_IMAGE_DEFAULT,
        href: `/faucets/${sub.slug || sub.id}`,
        isComingSoon: false,
      }))
    : [
        {
          id: "coming-soon-1",
          title: "Faucets Series",
          subtitle: "Coming Soon — New Premium Collection Launching Shortly",
          image: category?.banner || category?.image || HERO_IMAGE_DEFAULT,
          href: "#",
          isComingSoon: true,
        },
        {
          id: "coming-soon-2",
          title: "Faucets Accessories",
          subtitle: "Coming Soon — Designer Bath Hardware in Progress",
          image: category?.image || category?.banner || HERO_IMAGE_DEFAULT,
          href: "#",
          isComingSoon: true,
        },
      ];

  const showcaseCards = allCards.slice(0, 3);
  const featureCards = subcategories.length > 3 ? allCards.slice(3) : [];

  return (
    <main style={{ width: "100%", minHeight: "100vh", backgroundColor: "#ffffff" }}>
      <Header />

      {/* ── 1. Fullscreen Hero Section ── */}
      <section
        data-header-theme="dark"
        style={{
          position: "relative",
          width: "100vw",
          height: "100vh",
          overflow: "hidden",
          backgroundColor: "#000000",
        }}
      >
        <Image
          src={heroImage}
          alt={categoryName}
          fill
          priority
          unoptimized
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
        style={{
          padding: "48px 48px 44px",
          backgroundColor: "#ffffff",
          boxSizing: "border-box",
        }}
      >
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          style={{
            marginBottom: "32px",
            fontFamily: "'Manrope', system-ui, sans-serif",
            fontSize: "13px",
            color: "#666666",
          }}
        >
          <Link href="/" style={{ color: "#777777", textDecoration: "none" }}>
            Home
          </Link>{" "}
          <span style={{ margin: "0 6px" }}>&gt;</span>{" "}
          <span style={{ color: "#777777" }}>Bathware</span>{" "}
          <span style={{ margin: "0 6px" }}>&gt;</span>{" "}
          <span style={{ color: "#111111", fontWeight: 500 }}>Faucets</span>
        </nav>

        {/* Page Title */}
        <h2
          style={{
            textAlign: "center",
            fontFamily: "'Manrope', system-ui, sans-serif",
            fontSize: "clamp(26px, 3.2vw, 44px)",
            fontWeight: 500,
            lineHeight: 1.25,
            letterSpacing: "-0.03em",
            color: "#111111",
            maxWidth: "920px",
            margin: "0 auto",
          }}
        >
          {pageTitle}
        </h2>
      </section>

      {/* ── 3. Showcase Grid ── */}
      <section
        data-header-theme="light"
        style={{
          padding: "0 48px 32px",
          backgroundColor: "#ffffff",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${Math.min(showcaseCards.length, 3)}, 1fr)`,
            gap: "28px",
          }}
        >
          {showcaseCards.map((card) => (
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
              className="subcategory-card group"
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

      {/* ── 4. Feature Grid ── */}
      {featureCards.length > 0 && (
        <section
          data-header-theme="light"
          style={{
            padding: "0 48px 64px",
            backgroundColor: "#ffffff",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${Math.min(featureCards.length, 3)}, 1fr)`,
              gap: "28px",
            }}
          >
            {featureCards.map((card) => (
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
                className="subcategory-card group"
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

      {/* ── 5. Blogs Section ── */}
      <section
        data-header-theme="light"
        style={{
          padding: "48px 48px 80px",
          backgroundColor: "#ffffff",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "36px",
          }}
        >
          <div style={{ width: "120px" }} />
          <h2
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

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "24px",
          }}
        >
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
