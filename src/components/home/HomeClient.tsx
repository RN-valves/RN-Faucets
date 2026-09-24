"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Header from "@/components/Header";
import { ChevronDown } from "lucide-react";
import ProductShowcaseSection from "@/components/ProductShowcaseSection";
import CategoriesSection from "@/components/CategoriesSection";
import BestSellerCategoriesSection from "@/components/BestSellerCategoriesSection";
import WhyBuySection from "@/components/WhyBuySection";
import InstagramReelsSection from "@/components/InstagramReelsSection";
import JaquarSupportSection from "@/components/JaquarSupportSection";
import BlogsSection from "@/components/BlogsSection";
import SupportLinksSection from "@/components/SupportLinksSection";
import FooterSection from "@/components/FooterSection";
import { getAdminHomeSetting } from "@/utils/adminStore";

/* ─── Sequence items ────────────────────────────────────── */
type ItemType = "video" | "image";

interface SeqItem {
  id: number | string;
  type: ItemType;
  src: string;
  title: string;
  subtitle: string;
  duration?: number; // ms — only for image items
}

/* ─── SVG Ring constants ────────────────────────────────── */
const ACTIVE_SIZE = 38;
const INACTIVE_SIZE = 11;
const SVG_VP = ACTIVE_SIZE;
const OUTER_R = 17;          // hollow white outer ring radius
const ARC_R = 12;            // thin white progress arc radius (smaller, inside outer ring)
const ARC_STROKE = 1.5;
const CIRCUMFERENCE = 2 * Math.PI * ARC_R;

/* ─── Single progress indicator (Direct DOM driven for 0 re-renders) ─── */
function ProgressRing({
  isActive,
  itemType,
  videoRef,
  imageDuration = 5000,
  onComplete,
  onClick,
  label,
}: {
  isActive: boolean;
  itemType: ItemType;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  imageDuration?: number;
  onComplete: () => void;
  onClick: () => void;
  label: string;
}) {
  const circleRef = useRef<SVGCircleElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isActive) return;

    let active = true;

    if (itemType === "video") {
      const vid = videoRef.current;
      if (!vid) return;

      const updateProgress = () => {
        if (!active || !circleRef.current || !vid.duration) return;
        const p = Math.min(Math.max(vid.currentTime / vid.duration, 0), 1);
        circleRef.current.style.strokeDashoffset = String(CIRCUMFERENCE * (1 - p));
      };

      vid.addEventListener("timeupdate", updateProgress);
      const interval = setInterval(updateProgress, 100);

      return () => {
        active = false;
        vid.removeEventListener("timeupdate", updateProgress);
        clearInterval(interval);
      };
    } else {
      // Direct DOM update on every animation frame for image timer
      const startTime = performance.now();
      const updateImageProgress = (now: number) => {
        if (!active) return;
        const elapsed = now - startTime;
        const p = Math.min(elapsed / imageDuration, 1);
        if (circleRef.current) {
          circleRef.current.style.strokeDashoffset = String(CIRCUMFERENCE * (1 - p));
        }
        if (p < 1) {
          rafRef.current = requestAnimationFrame(updateImageProgress);
        } else {
          onComplete();
        }
      };
      rafRef.current = requestAnimationFrame(updateImageProgress);

      return () => {
        active = false;
        if (rafRef.current !== null) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }
      };
    }
  }, [isActive, itemType, videoRef, imageDuration, onComplete]);

  if (!isActive) {
    /* ── Inactive: small hollow white ring ── */
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={label}
        style={{
          width: INACTIVE_SIZE,
          height: INACTIVE_SIZE,
          borderRadius: "50%",
          background: "transparent",
          border: "1.5px solid rgba(255,255,255,0.55)",
          flexShrink: 0,
          padding: 0,
          cursor: "pointer",
          transition: "opacity 0.35s ease, transform 0.2s ease",
          opacity: 0.7,
        }}
      />
    );
  }

  /* ── Active: hollow white outer ring + thin white arc inside ── */
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      style={{
        width: ACTIVE_SIZE,
        height: ACTIVE_SIZE,
        borderRadius: "50%",
        flexShrink: 0,
        padding: 0,
        background: "transparent",
        border: "none",
        cursor: "pointer",
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${SVG_VP} ${SVG_VP}`}
        style={{ transform: "rotate(-90deg)", display: "block" }}
        aria-hidden="true"
      >
        {/* Hollow white outer ring (track) */}
        <circle
          cx={SVG_VP / 2}
          cy={SVG_VP / 2}
          r={OUTER_R}
          fill="none"
          stroke="rgba(255,255,255,0.45)"
          strokeWidth={1.5}
        />
        {/* Thin white progress arc — slightly smaller radius, draws inside the outer ring */}
        <circle
          ref={circleRef}
          cx={SVG_VP / 2}
          cy={SVG_VP / 2}
          r={ARC_R}
          fill="none"
          stroke="rgba(255,255,255,0.95)"
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

interface HomeClientProps {
  initialHomeSetting?: any;
  initialCategories?: any[];
  initialProducts?: any[];
  initialBlogs?: any[];
}

export default function HomeClient({
  initialHomeSetting,
  initialCategories = [],
  initialProducts = [],
  initialBlogs = [],
}: HomeClientProps) {
  const [homeSetting, setHomeSetting] = useState<any>(initialHomeSetting || null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  const videoRef = useRef<HTMLVideoElement>(null);
  const advancingRef = useRef(false);
  const heroSectionRef = useRef<HTMLElement>(null);
  const [heroInView, setHeroInView] = useState(true);

  useEffect(() => {
    if (!initialHomeSetting) {
      getAdminHomeSetting().then((data) => {
        if (data) setHomeSetting(data);
      });
    }
  }, [initialHomeSetting]);

  /* ── Observe hero section visibility to pause video when out of viewport ── */
  useEffect(() => {
    const el = heroSectionRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setHeroInView(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Only use active items with valid sources directly from the database - zero hardcoded fallbacks
  const heroSequence: SeqItem[] =
    homeSetting?.hero && Array.isArray(homeSetting.hero)
      ? homeSetting.hero.filter((h: any) => h.active !== false && Boolean(h.src))
      : [];

  /* ── Crossfade to next item ── */
  const advance = useCallback(() => {
    if (advancingRef.current || heroSequence.length === 0) return;
    advancingRef.current = true;
    setVisible(false);

    setTimeout(() => {
      setActiveIdx((prev) => (prev + 1) % heroSequence.length);
      setVisible(true);
      advancingRef.current = false;
    }, 500);
  }, [heroSequence.length]);

  /* ── Jump directly to target item on click ── */
  const jumpTo = useCallback((targetIdx: number) => {
    if (advancingRef.current) return;
    advancingRef.current = true;
    setVisible(false);

    setTimeout(() => {
      setActiveIdx(targetIdx);
      setVisible(true);
      advancingRef.current = false;
    }, 300);
  }, []);

  const getOptimizedVideoSrc = (src?: string) => {
    if (!src) return "";
    if (src.includes("bannerVideo5.mp4")) return "/videos/optimized/bannerVideo5.mp4";
    if (src.includes("bannerVideo2.mp4")) return "/videos/optimized/bannerVideo2.mp4";
    return src;
  };

  const isVideoSlide = (item: any) => {
    if (!item || !item.src) return false;
    if (item.type === "video") return true;
    const clean = item.src.split("?")[0].toLowerCase();
    return (
      clean.endsWith(".mp4") ||
      clean.endsWith(".webm") ||
      clean.endsWith(".mov") ||
      clean.endsWith(".m4v") ||
      clean.includes("/video")
    );
  };

  /* ── React to active index & viewport visibility changes ── */
  useEffect(() => {
    if (heroSequence.length === 0) return;
    const item = heroSequence[activeIdx] || heroSequence[0];
    if (!item) return;

    const vid = videoRef.current;
    if (!vid) return;

    if (isVideoSlide(item) && heroInView) {
      vid.play().catch(() => {});
    } else {
      vid.pause();
    }
  }, [activeIdx, heroInView, heroSequence]);

  /* ── Smooth 1-wheel snap from Section 1 -> Section 2 -> Section 3 ── */
  const isSnappingRef = useRef(false);

  useEffect(() => {
    const handleWheelSnap = (e: WheelEvent) => {
      if (isSnappingRef.current || e.deltaY <= 10) return;

      const currentScroll = window.scrollY;
      const h = window.innerHeight;

      // Section 1 -> Section 2 Snap
      if (currentScroll < h * 0.8) {
        isSnappingRef.current = true;
        e.preventDefault();
        window.scrollTo({ top: h, behavior: "smooth" });
        setTimeout(() => { isSnappingRef.current = false; }, 800);
      }
      // Section 2 -> Section 3 Snap
      else if (currentScroll >= h * 0.8 && currentScroll < h * 1.8) {
        isSnappingRef.current = true;
        e.preventDefault();
        window.scrollTo({ top: h * 2, behavior: "smooth" });
        setTimeout(() => { isSnappingRef.current = false; }, 800);
      }
      // Section 3 -> Section 4 (Best Sellers) Snap
      else if (currentScroll >= h * 1.8 && currentScroll < h * 2.8) {
        isSnappingRef.current = true;
        e.preventDefault();
        window.scrollTo({ top: h * 3, behavior: "smooth" });
        setTimeout(() => { isSnappingRef.current = false; }, 800);
      }
    };

    window.addEventListener("wheel", handleWheelSnap, { passive: false });
    return () => window.removeEventListener("wheel", handleWheelSnap);
  }, []);

  const current = heroSequence[activeIdx] || heroSequence[0];

  return (
    <main
      style={{
        width: "100%",
        minHeight: "100vh",
        background: "#000",
      }}
    >
      <Header data={homeSetting?.header} />

      {/* ── 1. Hero Section ── */}
      <section
        ref={heroSectionRef}
        data-header-theme="dark"
        style={{
          position: "relative",
          width: "100%",
          height: "100vh",
          overflow: "hidden",
          background: "#000",
        }}
      >
        {/* ── Shimmer placeholder until database hero loads ── */}
        {heroSequence.length === 0 && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(90deg, #020914 0%, #081d38 50%, #020914 100%)",
              backgroundSize: "200% 100%",
            }}
            className="animate-pulse"
          />
        )}

        {/* ── Background layers directly from database (Virtualized for zero GPU lag) ── */}
        {heroSequence.map((item, i) => {
          if (activeIdx !== i) return null;
          return isVideoSlide(item) ? (
            <video
              key={item.id || i}
              ref={videoRef}
              src={getOptimizedVideoSrc(item.src)}
              autoPlay
              muted
              playsInline
              preload="metadata"
              disablePictureInPicture
              disableRemotePlayback
              onEnded={advance}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "center center",
                opacity: visible ? 1 : 0,
                transition: "opacity 0.4s ease",
                zIndex: 1,
                pointerEvents: "none",
                transform: "translate3d(0, 0, 0)",
                backfaceVisibility: "hidden",
              }}
            />
          ) : (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              key={item.id || i}
              src={item.src}
              alt={item.title || "RN Hero"}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                opacity: visible ? 1 : 0,
                transition: "opacity 0.4s ease",
                zIndex: 1,
                pointerEvents: "none",
              }}
            />
          );
        })}

        {/* ── Dark gradient for text legibility ── */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.1) 50%, transparent 100%)",
            zIndex: 2,
            pointerEvents: "none",
          }}
        />

        {/* ── Hero text + progress rings ── */}
        {heroSequence.length > 0 && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 3,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "flex-end",
              paddingBottom: "12vh",
              textAlign: "center",
              gap: 0,
              pointerEvents: "none",
            }}
          >
            {/* Label */}
            {current?.subtitle && (
              <p
                style={{
                  color: "rgba(255,255,255,0.65)",
                  fontSize: 13,
                  fontWeight: 400,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  marginBottom: 14,
                  fontFamily: "'Manrope', system-ui, sans-serif",
                  WebkitFontSmoothing: "antialiased",
                  MozOsxFontSmoothing: "grayscale" as const,
                }}
              >
                {current.subtitle}
              </p>
            )}

            {/* Title */}
            {current?.title && (
              <h1
                style={{
                  color: "rgba(255,255,255,0.96)",
                  fontSize: "clamp(28px, 5vw, 52px)",
                  fontWeight: 600,
                  lineHeight: 1.05,
                  letterSpacing: "-0.03em",
                  whiteSpace: "pre-line",
                  marginBottom: 28,
                  fontFamily: "'Manrope', system-ui, sans-serif",
                  maxWidth: 600,
                  WebkitFontSmoothing: "antialiased",
                  MozOsxFontSmoothing: "grayscale" as const,
                }}
              >
                {current.title}
              </h1>
            )}

            {/* Progress rings */}
            {heroSequence.length > 1 && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  pointerEvents: "auto",
                }}
                role="group"
                aria-label="Slide progress indicators"
              >
                {heroSequence.map((item, i) => (
                  <ProgressRing
                    key={item.id || i}
                    isActive={activeIdx === i}
                    itemType={item.type}
                    videoRef={videoRef}
                    imageDuration={item.duration}
                    onComplete={advance}
                    onClick={() => jumpTo(i)}
                    label={`Show slide ${i + 1}: ${item.subtitle || ""}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Animated Scroll Down Indicator Button */}
        <button
          type="button"
          onClick={() => {
            window.scrollTo({
              top: window.innerHeight,
              behavior: "smooth",
            });
          }}
          aria-label="Scroll down to next section"
          style={{
            position: "absolute",
            bottom: "28px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 10,
            color: "rgba(255, 255, 255, 0.8)",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "4px",
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            fontFamily: "'Manrope', system-ui, sans-serif",
            pointerEvents: "auto",
          }}
        >
          <span style={{ opacity: 0.8 }}>Scroll</span>
          <ChevronDown size={18} className="animate-bounce" />
        </button>
      </section>

      {/* ── 2. Product Showcase Section ── */}
      <ProductShowcaseSection data={homeSetting?.spaceShowcase} />

      {/* ── 3. Categories Storytelling Section ── */}
      <CategoriesSection
        data={homeSetting?.categoriesSection}
        initialCategories={initialCategories}
      />

      {/* ── 4. New Arrivals (Dark Premium / Carousel) ── */}
      <BestSellerCategoriesSection
        data={homeSetting?.bestSellersSection}
        initialProducts={initialProducts}
        initialCategories={initialCategories}
      />

      {/* ── 5. Why Buy from RN Valves & Faucets Directly ── */}
      <WhyBuySection data={homeSetting?.whyBuySection} />

      {/* ── 6. Instagram Reels ── */}
      <InstagramReelsSection data={homeSetting?.reelsSection} />

      {/* ── 7. RN Support Cards ── */}
      <JaquarSupportSection data={homeSetting?.supportCardsSection} />

      {/* ── 8. Blogs ── */}
      <BlogsSection
        data={homeSetting?.blogsSection}
        initialBlogs={initialBlogs}
      />

      {/* ── 9. Business and Support Links (Removed per user request) ──
      <SupportLinksSection data={homeSetting?.supportLinksSection} />
      ── */}

      {/* ── 10. Footer Section ── */}
      <FooterSection data={homeSetting?.footer} />
    </main>
  );
}
