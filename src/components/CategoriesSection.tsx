"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ChevronLeft, ChevronRight } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export interface CategoryItem {
  id: number;
  name: string;
  subtitle: string;
  image: string;
  href?: string;
  slug?: string;
}

const PASTEL_GRADIENT =
  "linear-gradient(135deg, #a8c8ff 0%, #f6d6e6 45%, #ffe8d6 100%)";

const MAIN_W = 500;
const MAIN_H = 680;
const SEC_W = 340;
const SEC_H = 540;
const GAP = 48;
const STEP = SEC_W + GAP;

const DEFAULT_CATEGORY_PLACEHOLDER = "/api/media/website/catalogue/products/default/image.webp";

/* ─── Progress ring indicators ─── */
const RING_SIZE = 38;
const SVG_VP = 38;
const GREY_R = 17;
const ARC_R = 12;
const ARC_STROKE = 1.5;
const CIRCUMFERENCE = 2 * Math.PI * ARC_R;

function CategoryProgressRing({
  isActive,
  isPaused = false,
  duration = 4500,
  onComplete,
  onClick,
  label,
}: {
  isActive: boolean;
  isPaused?: boolean;
  duration?: number;
  onComplete: () => void;
  onClick: () => void;
  label: string;
}) {
  const circleRef = useRef<SVGCircleElement>(null);
  const rafRef = useRef<number | null>(null);
  const elapsedRef = useRef(0);
  const lastTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isActive) {
      elapsedRef.current = 0;
      lastTimeRef.current = null;
      return;
    }

    let active = true;
    lastTimeRef.current = performance.now();

    const updateProgress = (now: number) => {
      if (!active) return;
      if (lastTimeRef.current !== null && !isPaused) {
        elapsedRef.current += now - lastTimeRef.current;
      }
      lastTimeRef.current = now;

      const p = Math.min(elapsedRef.current / duration, 1);
      if (circleRef.current) {
        circleRef.current.style.strokeDashoffset = String(
          CIRCUMFERENCE * (1 - p)
        );
      }
      if (p < 1) {
        rafRef.current = requestAnimationFrame(updateProgress);
      } else {
        elapsedRef.current = 0;
        onComplete();
      }
    };

    rafRef.current = requestAnimationFrame(updateProgress);

    return () => {
      active = false;
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [isActive, isPaused, duration, onComplete]);

  if (!isActive) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={label}
        style={{
          padding: 0,
          background: "transparent",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          outline: "none",
        }}
      >
        <div
          style={{
            width: "11px",
            height: "11px",
            borderRadius: "50%",
            background: "#D7D7D7",
            transition: "all 0.35s ease-in-out",
          }}
        />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      style={{
        padding: 0,
        background: "transparent",
        border: "none",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        outline: "none",
        width: `${RING_SIZE}px`,
        height: `${RING_SIZE}px`,
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${SVG_VP} ${SVG_VP}`}
        style={{ transform: "rotate(-90deg)", display: "block" }}
      >
        <circle
          cx={SVG_VP / 2}
          cy={SVG_VP / 2}
          r={GREY_R}
          fill="none"
          stroke="#C8C8C8"
          strokeWidth={1.5}
        />
        <circle
          ref={circleRef}
          cx={SVG_VP / 2}
          cy={SVG_VP / 2}
          r={ARC_R}
          fill="none"
          stroke="#111111"
          strokeWidth={ARC_STROKE}
          strokeLinecap="butt"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE}
          style={{ willChange: "stroke-dashoffset" }}
        />
      </svg>
    </button>
  );
}


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
            id: index,
            name: cat.name,
            subtitle: cat.description || cat.title || `Explore ${cat.name} luxury collection`,
            slug: cat.slug,
            href: `/${cat.slug}`,
            image: cat.image || cat.banner || DEFAULT_CATEGORY_PLACEHOLDER,
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

  const validPropsCategories = data?.categories?.filter((c: any) => Boolean(c.image) && c.status !== "Inactive" && c.isVisibleWebsite !== false);
  const categoriesList =
    dbCategories.length > 0
      ? dbCategories
      : validPropsCategories && validPropsCategories.length > 0
      ? validPropsCategories
      : [];

  if (isLoaded && categoriesList.length === 0) return null;

  const displaySequence = categoriesList.length > 0 ? [
    ...categoriesList,
    ...categoriesList.map((c, i) => ({ ...c, id: (c.id || i) + categoriesList.length })),
    ...categoriesList.map((c, i) => ({ ...c, id: (c.id || i) + categoriesList.length * 2 })),
  ] : [];

  const [virtualIndex, setVirtualIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();

  const sectionRef = useRef<HTMLElement>(null);
  const leftContentRef = useRef<HTMLDivElement>(null);
  const sliderTrackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const startTrackXRef = useRef(0);
  const dragDistanceRef = useRef(0);
  const lastWheelTimeRef = useRef(0);

  const isMobile = useCallback(() => {
    return typeof window !== "undefined" && window.innerWidth <= 900;
  }, []);

  const slideTo = useCallback(
    (index: number) => {
      const targetIndex = Math.max(0, index);
      setVirtualIndex(targetIndex);

      if (!sliderTrackRef.current || isMobile()) return;

      const xOffset = targetIndex * STEP;

      gsap.to(sliderTrackRef.current, {
        x: -xOffset,
        duration: 0.75,
        ease: "power3.out",
        overwrite: "auto",
        onComplete: () => {
          if (categoriesList.length > 0 && targetIndex >= categoriesList.length * 2) {
            const resetIdx = (targetIndex % categoriesList.length) + categoriesList.length;
            setVirtualIndex(resetIdx);
            gsap.set(sliderTrackRef.current, { x: -(resetIdx * STEP) });
          }
        },
      });
    },
    [isMobile, categoriesList.length]
  );

  const handleNext = useCallback(() => {
    slideTo(virtualIndex + 1);
  }, [slideTo, virtualIndex]);

  const handlePrev = useCallback(() => {
    slideTo(Math.max(0, virtualIndex - 1));
  }, [slideTo, virtualIndex]);

  // ── Drag & Touch Handlers with real-time responsive tracking ──
  const handlePointerDown = (clientX: number) => {
    isDraggingRef.current = true;
    startXRef.current = clientX;
    dragDistanceRef.current = 0;
    startTrackXRef.current = -(virtualIndex * STEP);
  };

  const handlePointerMove = (clientX: number) => {
    if (!isDraggingRef.current || !sliderTrackRef.current || isMobile()) return;
    const dx = clientX - startXRef.current;
    dragDistanceRef.current = dx;
    // Live spring translation during drag
    gsap.set(sliderTrackRef.current, { x: startTrackXRef.current + dx });
  };

  const handlePointerUp = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;

    const threshold = 45;
    if (dragDistanceRef.current < -threshold) {
      slideTo(virtualIndex + 1);
    } else if (dragDistanceRef.current > threshold) {
      slideTo(Math.max(0, virtualIndex - 1));
    } else {
      // Snap back smoothly
      slideTo(virtualIndex);
    }
  };

  // ── Horizontal wheel gesture only (Never locks vertical page scroll) ──
  const handleWheel = (e: React.WheelEvent) => {
    // Only intercept if user is explicitly scrolling sideways (trackpad horizontal swipe or Shift+Wheel)
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 25) {
      const now = Date.now();
      if (now - lastWheelTimeRef.current < 350) return;
      lastWheelTimeRef.current = now;

      if (e.deltaX > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
  };

  useEffect(() => {
    if (
      !sectionRef.current ||
      !leftContentRef.current ||
      !sliderTrackRef.current
    )
      return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        leftContentRef.current,
        { x: -80, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 1.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
            toggleActions: "play none none reverse",
          },
        }
      );

      const validCards = cardRefs.current.slice(0, 6).filter(Boolean);
      if (validCards.length > 0) {
        gsap.fromTo(
          validCards,
          { x: 120, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 1.1,
            stagger: 0.15,
            ease: "power3.out",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 75%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const activeCategoryIdx = categoriesList.length > 0 ? virtualIndex % categoriesList.length : 0;

  return (
    <section
      ref={sectionRef}
      data-header-theme="light"
      className="categories-section"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        handlePointerUp();
      }}
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
        minHeight: "720px",
        background: "#f7f7f7",
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
        padding: "90px 56px 30px",
        boxSizing: "border-box",
      }}
      aria-label="Explore Product Categories"
    >
      <style>{`
        .categories-card {
          border-radius: 0;
          background: ${PASTEL_GRADIENT};
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
          overflow: hidden;
          transition:
            width 0.6s cubic-bezier(0.16, 1, 0.3, 1),
            height 0.6s cubic-bezier(0.16, 1, 0.3, 1),
            transform 0.35s ease,
            box-shadow 0.35s ease;
        }
        .categories-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.06);
        }
        .categories-product-wrap {
          position: absolute;
          left: 50%;
          top: 44%;
          transform: translate(-50%, -50%);
          width: 82%;
          height: 68%;
          display: flex;
          alignItems: center;
          justifyContent: center;
          z-index: 1;
          transition: width 0.6s cubic-bezier(0.16, 1, 0.3, 1),
            height 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .categories-card.is-featured .categories-product-wrap {
          width: 78%;
          height: 70%;
        }
        /* Soft floor reflection under product */
        .categories-product-wrap::after {
          content: "";
          position: absolute;
          left: 10%;
          right: 10%;
          bottom: -4%;
          height: 16%;
          background: radial-gradient(
            ellipse 70% 60% at 50% 40%,
            rgba(0, 0, 0, 0.08) 0%,
            rgba(0, 0, 0, 0.03) 45%,
            transparent 70%
          );
          pointer-events: none;
          z-index: 0;
          filter: blur(4px);
        }
        .categories-product-img {
          position: relative;
          z-index: 1;
          filter: drop-shadow(0 18px 28px rgba(0, 0, 0, 0.08));
        }
        .categories-card-title {
          font-family: 'Manrope', system-ui, sans-serif;
          font-size: 28px;
          font-weight: 600;
          color: #111;
          text-align: center;
          letter-spacing: -0.02em;
          line-height: 1.2;
          margin: 0;
          -webkit-font-smoothing: antialiased;
        }
        .categories-card.is-featured .categories-card-title {
          font-size: 28px;
        }

        .category-nav-arrow {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: #ffffff;
          border: 1px solid #e5e5e5;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #111111;
          cursor: pointer;
          transition: all 0.25s ease;
          box-shadow: 0 4px 12px rgba(0,0,0,0.06);
        }
        .category-nav-arrow:hover {
          background: #111111;
          color: #ffffff;
          border-color: #111111;
          transform: scale(1.06);
        }

        @media (max-width: 1200px) {
          .categories-section {
            padding: 100px 40px 40px !important;
          }
          .categories-left {
            width: 30% !important;
            padding-right: 24px !important;
          }
          .categories-right {
            width: 70% !important;
          }
          .categories-heading {
            font-size: 48px !important;
          }
          .categories-desc {
            font-size: 20px !important;
          }
        }

        @media (max-width: 900px) {
          .categories-section {
            flex-direction: column !important;
            height: auto !important;
            min-height: 100vh;
            padding: 72px 24px 48px !important;
            align-items: flex-start !important;
            overflow: visible !important;
          }
          .categories-left {
            width: 100% !important;
            height: auto !important;
            padding-right: 0 !important;
            margin-bottom: 40px;
          }
          .categories-heading {
            font-size: 40px !important;
            white-space: normal !important;
          }
          .categories-desc {
            font-size: 18px !important;
          }
          .categories-right {
            width: 100% !important;
            height: auto !important;
            overflow-x: auto !important;
            overflow-y: hidden !important;
            -webkit-overflow-scrolling: touch;
            cursor: grab !important;
            scrollbar-width: none;
          }
          .categories-right::-webkit-scrollbar {
            display: none;
          }
          .categories-track {
            padding-bottom: 12px;
            transform: none !important;
          }
          .categories-card {
            width: 88vw !important;
            height: calc(88vw * 1.35) !important;
            max-height: 560px;
          }
          .categories-card.is-featured {
            width: 88vw !important;
            height: calc(88vw * 1.35) !important;
            max-height: 620px;
          }
          .categories-card-title {
            font-size: 22px !important;
          }
        }
      `}</style>

      {/* ── LEFT CONTENT ── */}
      <div
        ref={leftContentRef}
        className="categories-left"
        style={{
          width: "28%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          zIndex: 10,
          paddingRight: "32px",
          flexShrink: 0,
        }}
      >
        <h2
          className="categories-heading"
          style={{
            fontFamily: "'Manrope', system-ui, sans-serif",
            fontWeight: 700,
            fontSize: "64px",
            lineHeight: 0.95,
            letterSpacing: "-0.04em",
            color: "#111111",
            whiteSpace: "pre-line",
            WebkitFontSmoothing: "antialiased",
            MozOsxFontSmoothing: "grayscale",
          }}
        >
          {data?.title || "Explore Product\nCategories"}
        </h2>

        <p
          className="categories-desc"
          style={{
            fontFamily: "'Manrope', system-ui, sans-serif",
            fontSize: "22px",
            fontWeight: 400,
            color: "#555555",
            maxWidth: "340px",
            marginTop: "28px",
            lineHeight: 1.45,
            WebkitFontSmoothing: "antialiased",
            MozOsxFontSmoothing: "grayscale",
          }}
        >
          {data?.description || "Top-rated, best-selling products trusted and loved by our customers."}
        </p>

        {/* Indicators + Arrow Navigation */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            maxWidth: "340px",
            marginTop: "44px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
            }}
            role="group"
            aria-label="Category navigation indicators"
          >
            {categoriesList.map((cat, i) => (
              <CategoryProgressRing
                key={cat.id || i}
                isActive={activeCategoryIdx === i}
                isPaused={isHovered || isDraggingRef.current}
                duration={4500}
                onComplete={handleNext}
                onClick={() => {
                  const currentGroup = Math.floor(
                    virtualIndex / categoriesList.length
                  );
                  slideTo(currentGroup * categoriesList.length + i);
                }}
                label={`Show category ${i + 1}: ${cat.name}`}
              />
            ))}
          </div>

          {/* Prev / Next Smooth Arrow Controls */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              type="button"
              onClick={handlePrev}
              className="category-nav-arrow"
              aria-label="Previous Category"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="category-nav-arrow"
              aria-label="Next Category"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* ── RIGHT SIDE: Horizontal Category Cards Slider ── */}
      <div
        className="categories-right"
        onMouseDown={(e) => handlePointerDown(e.clientX)}
        onMouseMove={(e) => handlePointerMove(e.clientX)}
        onMouseUp={handlePointerUp}
        onTouchStart={(e) => handlePointerDown(e.touches[0].clientX)}
        onTouchMove={(e) => handlePointerMove(e.touches[0].clientX)}
        onTouchEnd={handlePointerUp}
        onWheel={handleWheel}
        style={{
          width: "72%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          overflow: "hidden",
          position: "relative",
          cursor: isDraggingRef.current ? "grabbing" : "grab",
          userSelect: "none",
          touchAction: "pan-y",
        }}
      >
        <div
          ref={sliderTrackRef}
          className="categories-track"
          style={{
            display: "flex",
            alignItems: "center",
            gap: `${GAP}px`,
            willChange: "transform",
          }}
        >
          {displaySequence.map((cat, i) => {
            const isFeatured = virtualIndex === i;
            const cardWidth = isFeatured ? MAIN_W : SEC_W;
            const cardHeight = isFeatured ? MAIN_H : SEC_H;

            return (
              <div
                key={`${cat.name}-${i}`}
                ref={(el) => {
                  cardRefs.current[i] = el;
                }}
                onClick={(e) => {
                  // If dragging was more than 10px, do not trigger click
                  if (Math.abs(dragDistanceRef.current) > 10) return;

                  if (isFeatured && cat.href) {
                    router.push(cat.href);
                  } else {
                    slideTo(i);
                  }
                }}
                className={`categories-card${isFeatured ? " is-featured" : ""}`}
                style={{
                  width: `${cardWidth}px`,
                  height: `${cardHeight}px`,
                  position: "relative",
                  flexShrink: 0,
                  cursor: "pointer",
                }}
              >
                {/* Centered product image with soft floor reflection */}
                <div className="categories-product-wrap">
                  <div
                    className="categories-product-img"
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
                      sizes={`${cardWidth}px`}
                      unoptimized
                      style={{
                        objectFit: "contain",
                        objectPosition: "center",
                        pointerEvents: "none",
                      }}
                    />
                  </div>
                </div>

                {/* Category title — bottom center, black */}
                <div
                  style={{
                    position: "absolute",
                    bottom: isFeatured ? "40px" : "32px",
                    left: 0,
                    right: 0,
                    zIndex: 2,
                    padding: "0 24px",
                    display: "flex",
                    justifyContent: "center",
                    pointerEvents: "none",
                  }}
                >
                  <h3 className="categories-card-title">{cat.name}</h3>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

