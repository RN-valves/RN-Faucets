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
  const isHoveredRef = useRef(false);
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
  const baseCategoriesList: CategoryItem[] =
    dbCategories.length > 0
      ? dbCategories
      : validPropsCategories && validPropsCategories.length > 0
      ? validPropsCategories
      : [];

  // Reverse order: last categories appear first, first categories appear last
  const categoriesList: CategoryItem[] = [...baseCategoriesList].reverse();

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

  // ── Auto Scroll Timer (pauses on user hover/drag, loops continuously) ──
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const interval = setInterval(() => {
      if (isDraggingRef.current || isHoveredRef.current) return;

      const card = el.querySelector(".luxury-card") as HTMLElement | null;
      const cardWidth = card?.offsetWidth || 320;
      const gap = 24;
      const step = cardWidth + gap;

      if (el.scrollLeft >= el.scrollWidth - el.clientWidth - 15) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollBy({ left: step, behavior: "smooth" });
      }
    }, 3200);

    return () => clearInterval(interval);
  }, []);

  const scrollByAmount = (direction: "left" | "right") => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const card = el.querySelector(".luxury-card") as HTMLElement | null;
    const cardWidth = card?.offsetWidth || 320;
    const gap = 24;
    // Smoothly scroll by 4 cards (one full viewport set)
    const scrollAmount = (cardWidth + gap) * 4;
    const offset = direction === "left" ? -scrollAmount : scrollAmount;
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

  // Staggered "upar - nicche" margin formula matching reference image
  const getCardOffsetClass = (index: number) => {
    if (index === 0) return "stagger-mid";
    return index % 2 === 1 ? "stagger-down" : "stagger-up";
  };

  return (
    <section
      data-header-theme="light"
      className="luxury-categories-section"
      style={{
        width: "100%",
        minHeight: "100vh",
        backgroundColor: "#FFFFFF",
        color: "#0F172A",
        padding: "clamp(90px, 12vh, 105px) 0 clamp(20px, 3vh, 35px)",
        overflow: "hidden",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        boxSizing: "border-box",
      }}
      aria-label="Explore Product Categories"
      onMouseEnter={() => {
        isHoveredRef.current = true;
      }}
      onMouseLeave={() => {
        isHoveredRef.current = false;
        handleMouseUpOrLeave();
      }}
    >
      <style>{`
        .luxury-categories-section {
          --track-pad: clamp(24px, 3.5vw, 48px);
          --track-gap: clamp(18px, 2.2vw, 32px);
        }

        .luxury-card {
          width: clamp(220px, 18vw, 265px);
          min-width: clamp(220px, 18vw, 265px);
          max-width: clamp(220px, 18vw, 265px);
          flex: 0 0 clamp(220px, 18vw, 265px);
          text-decoration: none;
          color: inherit;
          display: flex;
          flex-direction: column;
          position: relative;
          cursor: pointer;
          transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .luxury-card:hover {
          transform: translateY(-5px);
        }

        /* Staggered Upar - Nicche Wave offsets (compact so whole section fits on screen) */
        .luxury-card.stagger-mid {
          margin-top: 20px;
        }
        .luxury-card.stagger-down {
          margin-top: 55px;
        }
        .luxury-card.stagger-up {
          margin-top: 0px;
        }

        /* Compact 2:3 Aspect Ratio Cards */
        .luxury-card-image-wrap {
          width: 100%;
          aspect-ratio: 2 / 3;
          height: auto;
          max-height: clamp(330px, 44vh, 395px);
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
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
          border-color: #0F172A;
          box-shadow: 0 16px 36px rgba(0, 0, 0, 0.09);
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
          gap: 6px;
          font-family: 'Manrope', system-ui, sans-serif;
          font-size: 15px;
          font-weight: 600;
          color: #1F2937;
          margin-top: 14px;
          letter-spacing: 0.01em;
          transition: color 0.25s ease;
        }

        .luxury-card:hover .luxury-card-label {
          color: #000000;
        }

        .luxury-card-arrow {
          transition: transform 0.25s ease, color 0.25s ease;
          color: #64748B;
        }

        .luxury-card:hover .luxury-card-arrow {
          transform: translate(3px, -3px);
          color: #000000;
        }

        .luxury-explore-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 9px 20px;
          border: 1px solid #0F172A;
          background: transparent;
          color: #0F172A;
          font-family: 'Manrope', system-ui, sans-serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          text-decoration: none;
          transition: all 0.25s ease;
        }

        .luxury-explore-btn:hover {
          background: #0F172A;
          color: #FFFFFF;
        }

        .luxury-nav-arrow {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          border: 1px solid #CBD5E1;
          background: transparent;
          color: #0F172A;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.25s ease;
        }

        .luxury-nav-arrow:hover:not(:disabled) {
          background: #0F172A;
          color: #FFFFFF;
          border-color: #0F172A;
        }

        .luxury-nav-arrow:disabled {
          opacity: 0.25;
          cursor: not-allowed;
        }

        .luxury-staggered-track {
          display: flex;
          align-items: flex-start;
          gap: var(--track-gap);
          overflow-x: auto;
          padding: 6px var(--track-pad) 25px;
          box-sizing: border-box;
          scrollbar-width: none;
          -ms-overflow-style: none;
          scroll-behavior: smooth;
          width: 100%;
          min-height: auto;
        }

        .luxury-staggered-track::-webkit-scrollbar {
          display: none;
        }

        @media (max-width: 1024px) {
          .luxury-categories-section {
            --track-pad: 32px;
            --track-gap: 20px;
          }
          .luxury-card {
            width: 220px !important;
            min-width: 220px !important;
            max-width: 220px !important;
            flex: 0 0 220px !important;
          }
          .luxury-card-image-wrap {
            aspect-ratio: 2 / 3 !important;
            height: auto !important;
          }
          .luxury-card.stagger-mid {
            margin-top: 15px !important;
          }
          .luxury-card.stagger-down {
            margin-top: 45px !important;
          }
          .luxury-staggered-track {
            padding: 6px var(--track-pad) 20px !important;
            gap: var(--track-gap) !important;
            min-height: auto !important;
          }
        }

        @media (max-width: 768px) {
          .luxury-categories-section {
            padding: 95px 0 40px !important;
            min-height: auto !important;
            --track-pad: 16px;
            --track-gap: 14px;
          }
          .luxury-card {
            width: 200px !important;
            min-width: 200px !important;
            max-width: 200px !important;
            flex: 0 0 200px !important;
          }
          .luxury-card-image-wrap {
            aspect-ratio: 2 / 3 !important;
            height: auto !important;
          }
          .luxury-card.stagger-mid,
          .luxury-card.stagger-down,
          .luxury-card.stagger-up {
            margin-top: 0px !important;
          }
          .luxury-staggered-track {
            padding: 6px var(--track-pad) 15px !important;
            gap: var(--track-gap) !important;
            min-height: auto !important;
          }
          .luxury-heading-line1 {
            font-size: 16px !important;
          }
          .luxury-heading-line2 {
            font-size: 22px !important;
          }
        }
      `}</style>

      {/* ── TOP HEADER (Editorial Style + EXPLORE ALL button) ── */}
      <div
        style={{
          width: "100%",
          margin: "0 auto",
          padding: "0 var(--track-pad, 48px)",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            flexWrap: "wrap",
            gap: "16px",
            marginBottom: "clamp(10px, 1.8vh, 16px)",
          }}
        >
          {/* Two-Line Editorial Typography */}
          <div>
            <span
              className="luxury-heading-line1"
              style={{
                display: "block",
                fontFamily: "'Manrope', system-ui, sans-serif",
                fontSize: "clamp(15px, 1.5vw, 19px)",
                fontWeight: 300,
                color: "#64748B",
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
                fontSize: "clamp(24px, 2.3vw, 32px)",
                fontWeight: 600,
                color: "#0F172A",
                letterSpacing: "-0.02em",
                lineHeight: 1.2,
                margin: 0,
              }}
            >
              {data?.title || "Explore Product Categories"}
            </h2>
          </div>

          {/* Right Controls: EXPLORE ALL button + Minimal Arrows */}
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <Link href="/catalogues" className="luxury-explore-btn">
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

      {/* ── FULL SCREEN STAGGERED "UPAR - NICCHE" CARDS TRACK ── */}
      <div
        ref={scrollContainerRef}
        className="luxury-staggered-track"
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
          const offsetClass = getCardOffsetClass(idx);

          return (
            <Link
              key={cat.id || idx}
              href={cat.href || `/${cat.slug}`}
              className={`luxury-card ${offsetClass}${hasHoverImg ? " has-hover-img" : ""}`}
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

              {/* Label Below Image with Diagonal Arrow (Staggers up/down with the card naturally) */}
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
