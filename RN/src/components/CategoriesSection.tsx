"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface CategoryItem {
  id: number;
  name: string;
  subtitle: string;
  image: string;
  href?: string;
}

const PASTEL_GRADIENT =
  "linear-gradient(135deg, #a8c8ff 0%, #f6d6e6 45%, #ffe8d6 100%)";

const MAIN_W = 520;
const MAIN_H = 700;
const SEC_W = 340;
const SEC_H = 560;
const GAP = 48;
const STEP = SEC_W + GAP;

const BASE_CATEGORIES: CategoryItem[] = [
  {
    id: 0,
    name: "Wash Basins",
    subtitle: "Beautifully engineered basins for every bathroom style",
    href: "/wash-basins",
    image:
      "https://hindware.com/_next/image?url=https%3A%2F%2Fhindwarestg.blob.core.windows.net%2Fcontainer1%2Fproducts%2Fe6628fa2-ac78-4b19-a704-4b441cd6ddaa.png&w=1200&q=75",
  },
  {
    id: 1,
    name: "Faucets",
    subtitle: "Precision engineering with timeless style",
    href: "/faucets",
    image:
      "https://hindware.com/_next/image?url=https%3A%2F%2Fhindwarestg.blob.core.windows.net%2Fcontainer1%2Fproducts%2F894ffe93-b067-44c2-b45d-455047b4448b.png&w=1200&q=75",
  },
  {
    id: 2,
    name: "Showers",
    subtitle: "Indulgent shower experiences for a premium lifestyle",
    image:
      "https://hindware.com/_next/image?url=https%3A%2F%2Fhindwarestg.blob.core.windows.net%2Fcontainer1%2Fproducts%2F00fb3464-ede4-477a-a0a5-1f00cf80aac3.png&w=1200&q=75",
  },
  {
    id: 3,
    name: "Water Closets",
    subtitle: "Hygienic, modern closets built for comfort",
    image:
      "https://hindware.com/_next/image?url=https%3A%2F%2Fhindwarestg.blob.core.windows.net%2Fproducts%2Fffce0ec1-9d9b-42a0-af1d-7e179eed4aa3.png&w=1200&q=75",
  },
  {
    id: 4,
    name: "Smart Appliances",
    subtitle: "Intelligent home appliances redefining convenience",
    image:
      "https://hindware.com/_next/image?url=https%3A%2F%2Fhindwarestg.blob.core.windows.net%2Fcontainer1%2Fproducts%2Fdb1b8c16-b65b-4293-bc97-c6f1b510b42d.webp&w=1200&q=75",
  },
  {
    id: 5,
    name: "Air Coolers",
    subtitle: "Energy-efficient cooling for every Indian home",
    image:
      "https://hindware.com/_next/image?url=https%3A%2F%2Fhindwarestg.blob.core.windows.net%2Fcontainer1%2Fproducts%2FWebsite-Homepage-Banners-640x990px-optimus-iPro-BLDC-Blk-1761904192697-1762151279642.webp&w=1920&q=75",
  },
];

const DISPLAY_ITEMS: CategoryItem[] = [
  ...BASE_CATEGORIES,
  ...BASE_CATEGORIES.map((c) => ({ ...c, id: c.id + 6 })),
  ...BASE_CATEGORIES.map((c) => ({ ...c, id: c.id + 12 })),
];

/* ─── Progress ring indicators ─── */
const RING_SIZE = 38;
const SVG_VP = 38;
const GREY_R = 17;
const ARC_R = 12;
const ARC_STROKE = 1.5;
const CIRCUMFERENCE = 2 * Math.PI * ARC_R;

function CategoryProgressRing({
  isActive,
  duration = 4000,
  onComplete,
  onClick,
  label,
}: {
  isActive: boolean;
  duration?: number;
  onComplete: () => void;
  onClick: () => void;
  label: string;
}) {
  const circleRef = useRef<SVGCircleElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isActive) return;

    let active = true;
    const startTime = performance.now();

    const updateProgress = (now: number) => {
      if (!active) return;
      const elapsed = now - startTime;
      const p = Math.min(elapsed / duration, 1);
      if (circleRef.current) {
        circleRef.current.style.strokeDashoffset = String(
          CIRCUMFERENCE * (1 - p)
        );
      }
      if (p < 1) {
        rafRef.current = requestAnimationFrame(updateProgress);
      } else {
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
  }, [isActive, duration, onComplete]);

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

export default function CategoriesSection() {
  const [virtualIndex, setVirtualIndex] = useState(0);
  const router = useRouter();

  const sectionRef = useRef<HTMLElement>(null);
  const leftContentRef = useRef<HTMLDivElement>(null);
  const sliderTrackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const dragDistanceRef = useRef(0);

  const isMobile = useCallback(() => {
    return typeof window !== "undefined" && window.innerWidth <= 900;
  }, []);

  const slideTo = useCallback(
    (index: number) => {
      setVirtualIndex(index);

      if (!sliderTrackRef.current || isMobile()) return;

      const xOffset = index * STEP;

      gsap.to(sliderTrackRef.current, {
        x: -xOffset,
        duration: 0.8,
        ease: "power3.out",
        onComplete: () => {
          if (index >= BASE_CATEGORIES.length * 2) {
            const resetIdx =
              (index % BASE_CATEGORIES.length) + BASE_CATEGORIES.length;
            setVirtualIndex(resetIdx);
            gsap.set(sliderTrackRef.current, { x: -(resetIdx * STEP) });
          }
        },
      });
    },
    [isMobile]
  );

  const handleNext = useCallback(() => {
    slideTo(virtualIndex + 1);
  }, [slideTo, virtualIndex]);

  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    startXRef.current = e.clientX;
    dragDistanceRef.current = 0;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    dragDistanceRef.current = e.clientX - startXRef.current;
  };

  const handleMouseUp = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;

    if (Math.abs(dragDistanceRef.current) > 40) {
      if (dragDistanceRef.current < 0) {
        slideTo(virtualIndex + 1);
      } else {
        slideTo(Math.max(0, virtualIndex - 1));
      }
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (Math.abs(e.deltaX) > 20 || Math.abs(e.deltaY) > 20) {
      if (e.deltaX > 0 || e.deltaY > 0) {
        slideTo(virtualIndex + 1);
      } else {
        slideTo(Math.max(0, virtualIndex - 1));
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

  const activeCategoryIdx = virtualIndex % BASE_CATEGORIES.length;

  return (
    <section
      ref={sectionRef}
      data-header-theme="light"
      className="categories-section"
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        background: "#f7f7f7",
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
        padding: "110px 56px 40px",
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
          align-items: center;
          justify-content: center;
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
            max-width: 100% !important;
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
          Explore Product{"\n"}Categories
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
          Top-rated, best-selling products trusted and loved by our customers.
        </p>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "18px",
            marginTop: "44px",
          }}
          role="group"
          aria-label="Category navigation indicators"
        >
          {BASE_CATEGORIES.map((cat, i) => (
            <CategoryProgressRing
              key={cat.id}
              isActive={activeCategoryIdx === i}
              duration={4000}
              onComplete={handleNext}
              onClick={() => {
                const currentGroup = Math.floor(
                  virtualIndex / BASE_CATEGORIES.length
                );
                slideTo(currentGroup * BASE_CATEGORIES.length + i);
              }}
              label={`Show category ${i + 1}: ${cat.name}`}
            />
          ))}
        </div>
      </div>

      {/* ── RIGHT SIDE: Horizontal Category Cards Slider ── */}
      <div
        className="categories-right"
        onMouseLeave={() => {
          isDraggingRef.current = false;
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
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
          {DISPLAY_ITEMS.map((cat, i) => {
            const isFeatured = virtualIndex === i;
            const cardWidth = isFeatured ? MAIN_W : SEC_W;
            const cardHeight = isFeatured ? MAIN_H : SEC_H;

            return (
              <div
                key={`${cat.name}-${i}`}
                ref={(el) => {
                  cardRefs.current[i] = el;
                }}
                onClick={() => {
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
