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
    const offset = direction === "left" ? -360 : 360;
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
      data-header-theme="dark"
      className="luxury-categories-section"
      style={{
        width: "100%",
        backgroundColor: "#000000",
        color: "#FFFFFF",
        padding: "90px 0 110px",
        overflow: "hidden",
        position: "relative",
      }}
      aria-label="Explore Product Categories"
    >
      <style>{`
        .luxury-card {
          width: 330px;
          min-width: 330px;
          text-decoration: none;
          color: inherit;
          display: flex;
          flex-direction: column;
          position: relative;
          cursor: pointer;
          transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .luxury-card:hover {
          transform: translateY(-4px);
        }

        .luxury-card-image-wrap {
          width: 100%;
          height: 440px;
          background: #0A0A0A;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 0px;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          box-sizing: border-box;
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
        }

        .luxury-card:hover .luxury-card-image-wrap {
          border-color: rgba(255, 255, 255, 0.85);
          box-shadow: 0 0 24px rgba(255, 255, 255, 0.08);
        }

        /* Primary Normal Image */
        .luxury-img-primary {
          position: absolute;
          inset: 0;
          padding: 0;
          box-sizing: border-box;
          opacity: 1;
          transition: opacity 0.5s ease-in-out, transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .luxury-card.has-hover-img:hover .luxury-img-primary {
          opacity: 0;
          transform: scale(1.04);
        }

        .luxury-card:not(.has-hover-img):hover .luxury-img-primary {
          transform: scale(1.05);
        }

        /* Secondary Hover Image */
        .luxury-img-hover {
          position: absolute;
          inset: 0;
          padding: 0;
          box-sizing: border-box;
          opacity: 0;
          transform: scale(0.98);
          transition: opacity 0.5s ease-in-out, transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
          pointer-events: none;
        }

        .luxury-card:hover .luxury-img-hover {
          opacity: 1;
          transform: scale(1.04);
        }

        .luxury-card-label {
          display: flex;
          align-items: center;
          gap: 7px;
          font-family: 'Manrope', system-ui, sans-serif;
          font-size: 15px;
          font-weight: 500;
          color: #D1D5DB;
          margin-top: 15px;
          letter-spacing: 0.01em;
          transition: color 0.25s ease;
        }

        .luxury-card:hover .luxury-card-label {
          color: #FFFFFF;
        }

        .luxury-card-arrow {
          transition: transform 0.25s ease, color 0.25s ease;
          color: #9CA3AF;
        }

        .luxury-card:hover .luxury-card-arrow {
          transform: translate(3px, -3px);
          color: #FFFFFF;
        }

        .luxury-nav-arrow {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.22);
          background: transparent;
          color: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.25s ease;
        }

        .luxury-nav-arrow:hover:not(:disabled) {
          background: #FFFFFF;
          color: #000000;
          border-color: #FFFFFF;
        }

        .luxury-nav-arrow:disabled {
          opacity: 0.25;
          cursor: not-allowed;
        }

        .luxury-single-row-track {
          display: flex;
          gap: 28px;
          overflow-x: auto;
          padding: 10px 48px 30px;
          box-sizing: border-box;
          scrollbar-width: none;
          -ms-overflow-style: none;
          scroll-behavior: smooth;
        }

        .luxury-single-row-track::-webkit-scrollbar {
          display: none;
        }

        @media (max-width: 1024px) {
          .luxury-card {
            width: 280px !important;
            min-width: 280px !important;
          }
          .luxury-card-image-wrap {
            height: 380px !important;
          }
          .luxury-single-row-track {
            padding: 10px 24px 20px !important;
            gap: 20px !important;
          }
        }

        @media (max-width: 768px) {
          .luxury-categories-section {
            padding: 60px 0 80px !important;
          }
          .luxury-card {
            width: 240px !important;
            min-width: 240px !important;
          }
          .luxury-card-image-wrap {
            height: 330px !important;
          }
          .luxury-single-row-track {
            padding: 10px 16px 20px !important;
            gap: 16px !important;
          }
          .luxury-heading-line1 {
            font-size: 20px !important;
          }
          .luxury-heading-line2 {
            font-size: 30px !important;
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
            marginBottom: "44px",
          }}
        >
          {/* Two-Line Editorial Typography */}
          <div>
            <span
              className="luxury-heading-line1"
              style={{
                display: "block",
                fontFamily: "'Manrope', system-ui, sans-serif",
                fontSize: "26px",
                fontWeight: 300,
                color: "#9CA3AF",
                letterSpacing: "-0.01em",
                lineHeight: 1.25,
                marginBottom: "4px",
              }}
            >
              Redefine Luxury With
            </span>

            <h2
              className="luxury-heading-line2"
              style={{
                fontFamily: "'Manrope', system-ui, sans-serif",
                fontSize: "42px",
                fontWeight: 700,
                color: "#FFFFFF",
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

          {/* Right Controls: Prev/Next Arrows */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              type="button"
              onClick={() => scrollByAmount("left")}
              disabled={!canScrollLeft}
              className="luxury-nav-arrow"
              aria-label="Previous Categories"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              onClick={() => scrollByAmount("right")}
              disabled={!canScrollRight}
              className="luxury-nav-arrow"
              aria-label="Next Categories"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* ── HORIZONTAL PORTRAIT CARDS TRACK (With Image Hover Swap & Outline) ── */}
      <div
        ref={scrollContainerRef}
        className="luxury-single-row-track"
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
              {/* Image Container with Smooth Primary -> Hover Cross-fade & White Border Outline on Hover */}
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
                        objectFit: "cover",
                        objectPosition: "center",
                        pointerEvents: "none",
                      }}
                    />
                  </div>
                </div>

                {/* 2nd Hover Image (Smoothly Fades In on Cursor Hover) */}
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
                          objectFit: "cover",
                          objectPosition: "center",
                          pointerEvents: "none",
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Label Below Image with Diagonal Arrow (Left Aligned, exactly like reference) */}
              <div className="luxury-card-label">
                <span>{cat.name}</span>
                <ArrowUpRight size={16} className="luxury-card-arrow" />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
