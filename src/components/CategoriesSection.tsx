"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles } from "lucide-react";

export interface CategoryItem {
  id: number | string;
  name: string;
  subtitle: string;
  image: string;
  href?: string;
  slug?: string;
  productCount?: number;
}

const DEFAULT_CATEGORY_PLACEHOLDER = "/api/media/website/catalogue/products/default/image.webp";

interface CategoriesSectionProps {
  data?: {
    visible?: boolean;
    title?: string;
    description?: string;
    categories?: CategoryItem[];
  };
}

export default function CategoriesSection({ data }: CategoriesSectionProps) {
  const [dbCategories, setDbCategories] = useState<CategoryItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const hasMovedRef = useRef(false);

  // Fetch live Category data & dynamic Category Main Images from Database
  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((dataArr: any[]) => {
        if (Array.isArray(dataArr)) {
          const activeOnly = dataArr.filter(
            (cat: any) =>
              cat.status !== "Inactive" &&
              cat.isVisibleWebsite !== false &&
              cat.isVisible !== false
          );
          const mapped: CategoryItem[] = activeOnly.map((cat: any, index: number) => ({
            id: cat.id || cat._id || index,
            name: cat.name,
            subtitle: cat.description || cat.title || `Explore ${cat.name} luxury collection`,
            slug: cat.slug,
            href: `/${cat.slug}`,
            image: cat.image || cat.banner || DEFAULT_CATEGORY_PLACEHOLDER,
            productCount: cat.productCount || 0,
          }));
          setDbCategories(mapped);
        }
        setIsLoaded(true);
      })
      .catch((err) => {
        console.error("Failed to load dynamic categories:", err);
        setIsLoaded(true);
      });
  }, []);

  if (data?.visible === false) return null;

  const validPropsCategories = data?.categories?.filter(
    (c: any) => Boolean(c.image) && c.status !== "Inactive" && c.isVisibleWebsite !== false
  );
  const categoriesList: CategoryItem[] =
    dbCategories.length > 0
      ? dbCategories
      : validPropsCategories && validPropsCategories.length > 0
      ? validPropsCategories
      : [];

  if (isLoaded && categoriesList.length === 0) return null;

  // Check scroll position to enable/disable arrow buttons & update active dot
  const updateScrollState = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);

    const cardWidth = 328; // 304px card + 24px gap
    const idx = Math.round(el.scrollLeft / cardWidth);
    setActiveIndex(Math.max(0, Math.min(idx, categoriesList.length - 1)));
  }, [categoriesList.length]);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    updateScrollState();
    el.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);

    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [updateScrollState]);

  const scrollByCard = (direction: "left" | "right") => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const cardStep = 330;
    const offset = direction === "left" ? -cardStep : cardStep;
    el.scrollBy({ left: offset, behavior: "smooth" });
  };

  const scrollToIndex = (index: number) => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const cardWidth = 328;
    el.scrollTo({ left: index * cardWidth, behavior: "smooth" });
  };

  // Mouse Drag to Scroll handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    const el = scrollContainerRef.current;
    if (!el) return;
    isDraggingRef.current = true;
    hasMovedRef.current = false;
    startXRef.current = e.pageX - el.offsetLeft;
    scrollLeftRef.current = el.scrollLeft;
    el.style.cursor = "grabbing";
    el.style.userSelect = "none";
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const el = scrollContainerRef.current;
    if (!el) return;
    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    const walk = (x - startXRef.current) * 1.4;
    if (Math.abs(walk) > 5) {
      hasMovedRef.current = true;
    }
    el.scrollLeft = scrollLeftRef.current - walk;
  };

  const handleMouseUpOrLeave = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    isDraggingRef.current = false;
    el.style.cursor = "grab";
    el.style.removeProperty("user-select");
  };

  return (
    <section
      data-header-theme="light"
      className="categories-section-wrapper"
      style={{
        width: "100%",
        backgroundColor: "#FFFFFF",
        padding: "100px 0 90px",
        overflow: "hidden",
        position: "relative",
      }}
      aria-label="Product Categories"
    >
      <style>{`
        .categories-card {
          width: 304px;
          min-width: 304px;
          background: #FFFFFF;
          border: 1px solid #E5E7EB;
          border-radius: 20px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          text-decoration: none;
          color: inherit;
          transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03);
          position: relative;
        }

        .categories-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
          border-color: #CBD5E1;
        }

        .categories-card-img-box {
          width: 100%;
          height: 250px;
          background: radial-gradient(circle at center, #F8FAFC 0%, #EDF2F7 100%);
          border-radius: 14px;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          padding: 20px;
          box-sizing: border-box;
        }

        .categories-card-img {
          transition: transform 0.45s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .categories-card:hover .categories-card-img {
          transform: scale(1.08);
        }

        .categories-arrow-btn {
          width: 46px;
          height: 46px;
          border-radius: 50%;
          border: 1px solid #E5E7EB;
          background: #FFFFFF;
          color: #111827;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.25s ease;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        }

        .categories-arrow-btn:hover:not(:disabled) {
          background: #111827;
          color: #FFFFFF;
          border-color: #111827;
          transform: scale(1.05);
        }

        .categories-arrow-btn:disabled {
          opacity: 0.35;
          cursor: not-allowed;
          background: #F9FAFB;
        }

        .categories-card-explore {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 700;
          color: #0077B6;
          transition: gap 0.25s ease, color 0.25s ease;
        }

        .categories-card:hover .categories-card-explore {
          color: #023E8A;
          gap: 10px;
        }

        /* Hide scrollbars */
        .categories-scroll-track {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .categories-scroll-track::-webkit-scrollbar {
          display: none;
        }

        @media (max-width: 768px) {
          .categories-section-wrapper {
            padding: 60px 0 50px !important;
          }
          .categories-card {
            width: 260px !important;
            min-width: 260px !important;
            padding: 12px !important;
          }
          .categories-card-img-box {
            height: 210px !important;
          }
        }
      `}</style>

      {/* ── TOP HEADER (Clean, Luxury, Full Width Container) ── */}
      <div
        style={{
          maxWidth: "1440px",
          margin: "0 auto",
          padding: "0 40px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            flexWrap: "wrap",
            gap: "24px",
            marginBottom: "44px",
          }}
        >
          {/* Heading & Subtitle Block */}
          <div style={{ maxWidth: "680px" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 14px",
                borderRadius: "100px",
                background: "rgba(0, 119, 182, 0.08)",
                color: "#0077B6",
                fontSize: "12px",
                fontWeight: 800,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                fontFamily: "'Manrope', system-ui, sans-serif",
                marginBottom: "14px",
              }}
            >
              <Sparkles size={14} />
              <span>Curated Collections</span>
            </div>

            <h2
              style={{
                fontFamily: "'Manrope', system-ui, sans-serif",
                fontSize: "44px",
                fontWeight: 800,
                lineHeight: 1.15,
                letterSpacing: "-0.03em",
                color: "#111827",
                margin: "0 0 14px 0",
              }}
            >
              {data?.title || "Explore Product Categories"}
            </h2>

            <p
              style={{
                fontFamily: "'Manrope', system-ui, sans-serif",
                fontSize: "17px",
                fontWeight: 400,
                color: "#6B7280",
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              {data?.description ||
                "Top-rated, best-selling products trusted and loved by our customers."}
            </p>
          </div>

          {/* Right Controls: View All + Slider Arrows */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <Link
              href="/faucets"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontFamily: "'Manrope', system-ui, sans-serif",
                fontSize: "14px",
                fontWeight: 700,
                color: "#111827",
                textDecoration: "none",
                padding: "10px 18px",
                borderRadius: "100px",
                border: "1px solid #E5E7EB",
                background: "#FFFFFF",
                transition: "all 0.25s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#111827";
                e.currentTarget.style.background = "#111827";
                e.currentTarget.style.color = "#FFFFFF";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#E5E7EB";
                e.currentTarget.style.background = "#FFFFFF";
                e.currentTarget.style.color = "#111827";
              }}
            >
              <span>View All Categories</span>
              <ArrowRight size={15} />
            </Link>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <button
                type="button"
                onClick={() => scrollByCard("left")}
                disabled={!canScrollLeft}
                className="categories-arrow-btn"
                aria-label="Previous Category"
              >
                <ChevronLeft size={20} />
              </button>

              <button
                type="button"
                onClick={() => scrollByCard("right")}
                disabled={!canScrollRight}
                className="categories-arrow-btn"
                aria-label="Next Category"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── HORIZONTAL NORMAL CARDS SCROLLER TRACK ── */}
      <div
        ref={scrollContainerRef}
        className="categories-scroll-track"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        style={{
          display: "flex",
          gap: "24px",
          overflowX: "auto",
          padding: "10px 40px 30px",
          scrollSnapType: "x mandatory",
          scrollBehavior: "smooth",
          cursor: "grab",
          maxWidth: "100vw",
          boxSizing: "border-box",
        }}
      >
        {categoriesList.map((cat, idx) => (
          <Link
            key={cat.id || idx}
            href={cat.href || `/${cat.slug}`}
            className="categories-card"
            style={{ scrollSnapAlign: "start" }}
            onClick={(e) => {
              if (hasMovedRef.current) {
                e.preventDefault();
              }
            }}
          >
            {/* Card Image Box */}
            <div className="categories-card-img-box">
              <div
                className="categories-card-img"
                style={{
                  position: "relative",
                  width: "100%",
                  height: "100%",
                }}
              >
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  sizes="320px"
                  unoptimized
                  style={{
                    objectFit: "contain",
                    objectPosition: "center",
                    pointerEvents: "none",
                  }}
                />
              </div>

              {cat.productCount && cat.productCount > 0 ? (
                <div
                  style={{
                    position: "absolute",
                    top: "12px",
                    right: "12px",
                    background: "rgba(255, 255, 255, 0.92)",
                    backdropFilter: "blur(6px)",
                    border: "1px solid rgba(0,0,0,0.06)",
                    borderRadius: "100px",
                    padding: "4px 10px",
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#4B5563",
                    fontFamily: "'Manrope', system-ui, sans-serif",
                  }}
                >
                  {cat.productCount} Items
                </div>
              ) : null}
            </div>

            {/* Card Content Details */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                padding: "16px 4px 4px",
                flex: 1,
                justifyContent: "space-between",
              }}
            >
              <div>
                <h3
                  style={{
                    fontFamily: "'Manrope', system-ui, sans-serif",
                    fontSize: "19px",
                    fontWeight: 700,
                    color: "#111827",
                    letterSpacing: "-0.01em",
                    margin: "0 0 6px 0",
                    lineHeight: 1.3,
                  }}
                >
                  {cat.name}
                </h3>

                <p
                  style={{
                    fontFamily: "'Manrope', system-ui, sans-serif",
                    fontSize: "13px",
                    color: "#6B7280",
                    margin: 0,
                    lineHeight: 1.5,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {cat.subtitle}
                </p>
              </div>

              {/* Footer Explore Link */}
              <div
                style={{
                  paddingTop: "12px",
                  borderTop: "1px solid #F3F4F6",
                  marginTop: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span className="categories-card-explore">
                  <span>Explore Collection</span>
                  <ArrowRight size={14} />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* ── BOTTOM PAGINATION PILL DOTS ── */}
      {categoriesList.length > 1 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            marginTop: "16px",
          }}
        >
          {categoriesList.map((_, dotIdx) => (
            <button
              key={`dot-${dotIdx}`}
              type="button"
              onClick={() => scrollToIndex(dotIdx)}
              aria-label={`Go to category ${dotIdx + 1}`}
              style={{
                width: activeIndex === dotIdx ? "28px" : "8px",
                height: "8px",
                borderRadius: "4px",
                background: activeIndex === dotIdx ? "#111827" : "#E5E7EB",
                border: "none",
                cursor: "pointer",
                padding: 0,
                transition: "all 0.3s ease",
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
}
