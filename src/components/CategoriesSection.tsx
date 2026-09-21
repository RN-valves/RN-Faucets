"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";

export interface CategoryItem {
  id: number | string;
  name: string;
  subtitle: string;
  image: string;
  hoverImage?: string;
  homeImage?: string;
  homeHoverImage?: string;
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
            // Normal Homepage Photo: uses homeImage first, then fallback to thumbnail image
            image: cat.homeImage || cat.image || DEFAULT_CATEGORY_PLACEHOLDER,
            // Hover Homepage Photo: exclusively uses homeHoverImage (NEVER fallback to banner)
            hoverImage: cat.homeHoverImage || "",
            homeImage: cat.homeImage || "",
            homeHoverImage: cat.homeHoverImage || "",
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

  const validPropsCategories = data?.categories
    ?.filter((c: any) => Boolean(c.homeImage || c.image) && c.status !== "Inactive" && c.isVisibleWebsite !== false)
    ?.map((c: any) => ({
      ...c,
      image: c.homeImage || c.image || DEFAULT_CATEGORY_PLACEHOLDER,
      hoverImage: c.homeHoverImage || "",
    }));
  const categoriesList: CategoryItem[] =
    dbCategories.length > 0
      ? dbCategories
      : validPropsCategories && validPropsCategories.length > 0
      ? validPropsCategories
      : [];

  if (isLoaded && categoriesList.length === 0) return null;

  const updateScrollState = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }, []);

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

  const scrollByAmount = (direction: "left" | "right") => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const offset = direction === "left" ? -420 : 420;
    el.scrollBy({ left: offset, behavior: "smooth" });
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
    const walk = (x - startXRef.current) * 1.3;
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
      className="luxury-categories-section"
      style={{
        width: "100%",
        backgroundColor: "#FFFFFF",
        color: "#111827",
        padding: "100px 0 120px",
        overflow: "hidden",
        position: "relative",
      }}
      aria-label="Explore Product Categories"
    >
      <style>{`
        .luxury-card {
          width: 380px;
          min-width: 380px;
          text-decoration: none;
          color: inherit;
          display: flex;
          flex-direction: column;
          position: relative;
          transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .luxury-card:hover {
          transform: translateY(-6px);
        }

        .luxury-card-image-wrap {
          width: 100%;
          height: 380px;
          background: linear-gradient(180deg, #F8FAFC 0%, #EDF2F7 100%);
          border: 1px solid #E5E7EB;
          border-radius: 6px;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          box-sizing: border-box;
          transition: border-color 0.35s ease, box-shadow 0.35s ease;
        }

        .luxury-card:hover .luxury-card-image-wrap {
          border-color: #9CA3AF;
          box-shadow: 0 16px 36px rgba(0, 0, 0, 0.08);
        }

        /* Primary Normal Image */
        .luxury-img-primary {
          position: absolute;
          inset: 0;
          padding: 24px;
          box-sizing: border-box;
          opacity: 1;
          transition: opacity 0.45s ease-in-out, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .luxury-card.has-hover-img:hover .luxury-img-primary {
          opacity: 0;
          transform: scale(1.06);
        }

        .luxury-card:not(.has-hover-img):hover .luxury-img-primary {
          transform: scale(1.08);
        }

        /* Secondary Hover Image */
        .luxury-img-hover {
          position: absolute;
          inset: 0;
          padding: 24px;
          box-sizing: border-box;
          opacity: 0;
          transform: scale(0.97);
          transition: opacity 0.45s ease-in-out, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
          pointer-events: none;
        }

        .luxury-card:hover .luxury-img-hover {
          opacity: 1;
          transform: scale(1.06);
        }

        .luxury-card-label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-family: 'Manrope', system-ui, sans-serif;
          font-size: 17px;
          font-weight: 600;
          color: #1F2937;
          margin-top: 14px;
          transition: color 0.25s ease;
        }

        .luxury-card:hover .luxury-card-label {
          color: #000000;
        }

        .luxury-card-arrow {
          transition: transform 0.25s ease, color 0.25s ease;
          color: #6B7280;
        }

        .luxury-card:hover .luxury-card-arrow {
          transform: translate(3px, -3px);
          color: #000000;
        }

        .luxury-explore-btn {
          font-family: 'Manrope', system-ui, sans-serif;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #111827;
          text-decoration: none;
          padding: 11px 24px;
          border: 1px solid rgba(0, 0, 0, 0.35);
          border-radius: 2px;
          background: transparent;
          transition: all 0.25s ease;
          display: inline-block;
        }

        .luxury-explore-btn:hover {
          background: #111827;
          color: #FFFFFF;
          border-color: #111827;
        }

        .luxury-nav-arrow {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          border: 1px solid #D1D5DB;
          background: transparent;
          color: #111827;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.25s ease;
        }

        .luxury-nav-arrow:hover:not(:disabled) {
          background: #111827;
          color: #FFFFFF;
          border-color: #111827;
        }

        .luxury-nav-arrow:disabled {
          opacity: 0.25;
          cursor: not-allowed;
        }

        .luxury-two-row-track {
          display: grid;
          grid-template-rows: repeat(2, auto);
          grid-auto-flow: column;
          gap: 36px 32px;
          overflow-x: auto;
          padding: 10px 48px 40px;
          box-sizing: border-box;
          scrollbar-width: none;
          -ms-overflow-style: none;
          scroll-behavior: smooth;
        }

        .luxury-two-row-track::-webkit-scrollbar {
          display: none;
        }

        @media (max-width: 1024px) {
          .luxury-card {
            width: 320px !important;
            min-width: 320px !important;
          }
          .luxury-card-image-wrap {
            height: 320px !important;
          }
          .luxury-two-row-track {
            padding: 10px 24px 30px !important;
            gap: 28px 24px !important;
          }
        }

        @media (max-width: 768px) {
          .luxury-categories-section {
            padding: 60px 0 80px !important;
          }
          .luxury-card {
            width: 270px !important;
            min-width: 270px !important;
          }
          .luxury-card-image-wrap {
            height: 270px !important;
            padding: 16px !important;
          }
          .luxury-heading-line1 {
            font-size: 22px !important;
          }
          .luxury-heading-line2 {
            font-size: 32px !important;
          }
        }
      `}</style>

      {/* ── TOP HEADER (Editorial Style) ── */}
      <div
        style={{
          maxWidth: "1520px",
          margin: "0 auto",
          padding: "0 48px",
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
            marginBottom: "50px",
          }}
        >
          {/* Two-Line Editorial Typography */}
          <div>
            <span
              className="luxury-heading-line1"
              style={{
                display: "block",
                fontFamily: "'Manrope', system-ui, sans-serif",
                fontSize: "30px",
                fontWeight: 300,
                color: "#6B7280",
                letterSpacing: "-0.01em",
                lineHeight: 1.25,
                marginBottom: "2px",
              }}
            >
              Redefine Luxury With
            </span>

            <h2
              className="luxury-heading-line2"
              style={{
                fontFamily: "'Manrope', system-ui, sans-serif",
                fontSize: "44px",
                fontWeight: 700,
                color: "#111827",
                letterSpacing: "-0.02em",
                lineHeight: 1.2,
                margin: 0,
              }}
            >
              {data?.title && data.title !== "Explore Product Categories"
                ? data.title
                : "Premium Bath Fittings"}
            </h2>
          </div>

          {/* Right Controls: EXPLORE ALL Button + Prev/Next Arrows */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <Link href="/faucets" className="luxury-explore-btn">
              EXPLORE ALL
            </Link>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <button
                type="button"
                onClick={() => scrollByAmount("left")}
                disabled={!canScrollLeft}
                className="luxury-nav-arrow"
                aria-label="Previous Categories"
              >
                <ChevronLeft size={19} />
              </button>
              <button
                type="button"
                onClick={() => scrollByAmount("right")}
                disabled={!canScrollRight}
                className="luxury-nav-arrow"
                aria-label="Next Categories"
              >
                <ChevronRight size={19} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2-ROW BIGGER CARDS DISPLAY TRACK (With Image Hover Swap) ── */}
      <div
        ref={scrollContainerRef}
        className="luxury-two-row-track"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        style={{
          cursor: "grab",
          maxWidth: "100vw",
        }}
      >
        {categoriesList.map((cat, idx) => {
          const hasHoverImg = Boolean(cat.hoverImage && cat.hoverImage !== cat.image);

          return (
            <Link
              key={cat.id || idx}
              href={cat.href || `/${cat.slug}`}
              className={`luxury-card${hasHoverImg ? " has-hover-img" : ""}`}
              onClick={(e) => {
                if (hasMovedRef.current) {
                  e.preventDefault();
                }
              }}
            >
              {/* Image Container with Smooth Primary -> Hover Cross-fade */}
              <div className="luxury-card-image-wrap">
                {/* 1st Normal Image */}
                <div className="luxury-img-primary">
                  <div style={{ position: "relative", width: "100%", height: "100%" }}>
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      fill
                      sizes="400px"
                      unoptimized
                      style={{
                        objectFit: "contain",
                        objectPosition: "center",
                        pointerEvents: "none",
                      }}
                    />
                  </div>
                </div>

                {/* 2nd Hover Image (Fades In on Cursor Hover) */}
                {hasHoverImg && (
                  <div className="luxury-img-hover">
                    <div style={{ position: "relative", width: "100%", height: "100%" }}>
                      <Image
                        src={cat.hoverImage!}
                        alt={`${cat.name} hover preview`}
                        fill
                        sizes="400px"
                        unoptimized
                        style={{
                          objectFit: "contain",
                          objectPosition: "center",
                          pointerEvents: "none",
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Label Below Image with Diagonal Arrow */}
              <div className="luxury-card-label">
                <span>{cat.name}</span>
                <ArrowUpRight size={17} className="luxury-card-arrow" />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
