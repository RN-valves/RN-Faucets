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
        padding: "100px 0 130px",
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
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .luxury-card-image-wrap {
          width: 100%;
          height: 450px;
          background: linear-gradient(180deg, #1C1E22 0%, #111215 100%);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 4px;
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
          border-color: rgba(255, 255, 255, 0.28);
          box-shadow: 0 16px 36px rgba(0, 0, 0, 0.6);
        }

        .luxury-card-img {
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .luxury-card:hover .luxury-card-img {
          transform: scale(1.07);
        }

        .luxury-card-label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-family: 'Manrope', system-ui, sans-serif;
          font-size: 15px;
          font-weight: 500;
          color: #D1D5DB;
          margin-top: 16px;
          transition: color 0.25s ease;
        }

        .luxury-card:hover .luxury-card-label {
          color: #FFFFFF;
        }

        .luxury-card-arrow {
          transition: transform 0.25s ease;
          color: #9CA3AF;
        }

        .luxury-card:hover .luxury-card-arrow {
          transform: translate(3px, -3px);
          color: #FFFFFF;
        }

        .luxury-explore-btn {
          font-family: 'Manrope', system-ui, sans-serif;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #FFFFFF;
          text-decoration: none;
          padding: 11px 22px;
          border: 1px solid rgba(255, 255, 255, 0.35);
          border-radius: 2px;
          background: transparent;
          transition: all 0.25s ease;
          display: inline-block;
        }

        .luxury-explore-btn:hover {
          background: #FFFFFF;
          color: #000000;
          border-color: #FFFFFF;
        }

        .luxury-nav-arrow {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.25);
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

        .luxury-track {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .luxury-track::-webkit-scrollbar {
          display: none;
        }

        @media (max-width: 900px) {
          .luxury-categories-section {
            padding: 70px 0 90px !important;
          }
          .luxury-card {
            width: 270px !important;
            min-width: 270px !important;
            transform: none !important;
          }
          .luxury-card-image-wrap {
            height: 360px !important;
          }
          .luxury-heading-line1 {
            font-size: 24px !important;
          }
          .luxury-heading-line2 {
            font-size: 32px !important;
          }
        }
      `}</style>

      {/* ── TOP HEADER (Dark Editorial Style) ── */}
      <div
        style={{
          maxWidth: "1480px",
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
            marginBottom: "56px",
          }}
        >
          {/* Two-Line Clean Editorial Typography matching screenshot */}
          <div>
            <span
              className="luxury-heading-line1"
              style={{
                display: "block",
                fontFamily: "'Manrope', system-ui, sans-serif",
                fontSize: "30px",
                fontWeight: 300,
                color: "#9CA3AF",
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
                fontSize: "42px",
                fontWeight: 600,
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
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                onClick={() => scrollByAmount("right")}
                disabled={!canScrollRight}
                className="luxury-nav-arrow"
                aria-label="Next Categories"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── STAGGERED EDITORIAL LUXURY GALLERY TRACK ── */}
      <div
        ref={scrollContainerRef}
        className="luxury-track"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        style={{
          display: "flex",
          gap: "36px",
          overflowX: "auto",
          padding: "10px 48px 60px",
          cursor: "grab",
          maxWidth: "100vw",
          boxSizing: "border-box",
          scrollBehavior: "smooth",
        }}
      >
        {categoriesList.map((cat, idx) => {
          // Stagger effect: alternate cards shifted down by 54px just like the reference photo
          const isStaggered = idx % 2 === 1;

          return (
            <Link
              key={cat.id || idx}
              href={cat.href || `/${cat.slug}`}
              className="luxury-card"
              style={{
                marginTop: isStaggered ? "54px" : "0px",
              }}
              onClick={(e) => {
                if (hasMovedRef.current) {
                  e.preventDefault();
                }
              }}
            >
              {/* Image Box */}
              <div className="luxury-card-image-wrap">
                <div
                  className="luxury-card-img"
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
                    sizes="360px"
                    unoptimized
                    style={{
                      objectFit: "contain",
                      objectPosition: "center",
                      pointerEvents: "none",
                    }}
                  />
                </div>
              </div>

              {/* Title with Diagonal Arrow matching screenshot: "Overhead Showers ↗" */}
              <div className="luxury-card-label">
                <span>{cat.name}</span>
                <ArrowUpRight size={15} className="luxury-card-arrow" />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
