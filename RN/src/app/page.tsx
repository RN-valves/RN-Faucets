"use client";

import { useEffect, useRef, useState, useCallback } from "react";

import Header from "@/components/Header";
import ProductShowcaseSection from "@/components/ProductShowcaseSection";
import CategoriesSection from "@/components/CategoriesSection";
import BestSellerCategoriesSection from "@/components/BestSellerCategoriesSection";
import WhyBuySection from "@/components/WhyBuySection";
import InstagramReelsSection from "@/components/InstagramReelsSection";
import JaquarSupportSection from "@/components/JaquarSupportSection";
import BlogsSection from "@/components/BlogsSection";
import SupportLinksSection from "@/components/SupportLinksSection";
import FooterSection from "@/components/FooterSection";

/* ─── Sequence items ────────────────────────────────────── */
type ItemType = "video" | "image";

interface SeqItem {
  id: number;
  type: ItemType;
  src: string;
  title: string;
  subtitle: string;
  duration?: number; // ms — only for image items
}

const SEQUENCE: SeqItem[] = [
  {
    id: 0,
    type: "video",
    src: "/videos/hero-1.mp4",
    title: "Hindware Italian\nCollection Faucets",
    subtitle: "Explore",
  },
  {
    id: 1,
    type: "image",
    src: "https://hindware.com/_next/image?url=https%3A%2F%2Fhindwarestg.blob.core.windows.net%2Fcontainer1%2Fproducts%2Fd6f29531-45cd-41d2-a009-f59dcf820662.png&w=3840&q=75",
    title: "Obsidian\nBath Series",
    subtitle: "Discover",
    duration: 5000,
  },
  {
    id: 2,
    type: "image",
    src: "https://hindware.com/_next/image?url=https%3A%2F%2Fhindwarestg.blob.core.windows.net%2Fcontainer1%2Fproducts%2F1ba8187d-97fb-486b-ba1b-69922db73b9e.png&w=3840&q=75",
    title: "Aurum\nEdition",
    subtitle: "Curated",
    duration: 5000,
  },
];

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
      // Direct DOM update on every animation frame for video playback
      const updateVideoProgress = () => {
        if (!active) return;
        const vid = videoRef.current;
        if (vid && vid.duration > 0 && isFinite(vid.duration) && circleRef.current) {
          const p = Math.min(Math.max(vid.currentTime / vid.duration, 0), 1);
          circleRef.current.style.strokeDashoffset = String(CIRCUMFERENCE * (1 - p));
        }
        rafRef.current = requestAnimationFrame(updateVideoProgress);
      };
      rafRef.current = requestAnimationFrame(updateVideoProgress);
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
    }

    return () => {
      active = false;
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
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

/* ─── Main Page ─────────────────────────────────────────── */
export default function Home() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  const videoRef = useRef<HTMLVideoElement>(null);
  const advancingRef = useRef(false);

  /* ── Crossfade to next item ── */
  const advance = useCallback(() => {
    if (advancingRef.current) return;
    advancingRef.current = true;
    setVisible(false);

    setTimeout(() => {
      setActiveIdx((prev) => (prev + 1) % SEQUENCE.length);
      setVisible(true);
      advancingRef.current = false;
    }, 500);
  }, []);

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

  /* ── React to active index changes ── */
  useEffect(() => {
    const item = SEQUENCE[activeIdx];

    if (item.type === "video") {
      const vid = videoRef.current;
      if (vid) {
        vid.currentTime = 0;
        const playPromise = vid.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            // Silently handled if browser requires click
          });
        }
      }
    }
  }, [activeIdx]);

  const current = SEQUENCE[activeIdx];

  return (
    <main
      style={{
        width: "100%",
        minHeight: "100vh",
        background: "#000",
      }}
    >
      <Header />
      {/* ── 1. Hero Section ── */}
      <section
        data-header-theme="dark"
        style={{
          position: "relative",
          width: "100vw",
          height: "100vh",
          overflow: "hidden",
          background: "#000",
        }}
      >
        {/* ── Background layers ── */}
        {SEQUENCE.map((item, i) => (
          item.type === "video" ? (
            <video
              key={item.id}
              ref={videoRef}
              src={item.src}
              autoPlay
              muted
              playsInline
              preload="auto"
              onEnded={advance}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                opacity: activeIdx === i ? (visible ? 1 : 0) : 0,
                transition: "opacity 0.5s ease",
                zIndex: activeIdx === i ? 1 : 0,
                pointerEvents: "none",
              }}
            />
          ) : (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              key={item.id}
              src={item.src}
              alt={item.title}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                opacity: activeIdx === i ? (visible ? 1 : 0) : 0,
                transition: "opacity 0.5s ease",
                zIndex: activeIdx === i ? 1 : 0,
                pointerEvents: "none",
              }}
            />
          )
        ))}

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

          {/* Title */}
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

          {/* Progress rings */}
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
            {SEQUENCE.map((item, i) => (
              <ProgressRing
                key={item.id}
                isActive={activeIdx === i}
                itemType={item.type}
                videoRef={videoRef}
                imageDuration={item.duration}
                onComplete={advance}
                onClick={() => jumpTo(i)}
                label={`Show slide ${i + 1}: ${item.subtitle}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── 2. Product Showcase Section ── */}
      <ProductShowcaseSection />

      {/* ── 3. Categories Storytelling Section ── */}
      <CategoriesSection />

      {/* ── 4. Best Seller Categories (Dark Premium) ── */}
      <BestSellerCategoriesSection />

      {/* ── 5. Why Buy from Hindware Directly ── */}
      <WhyBuySection />

      {/* ── 6. Instagram Reels ── */}
      <InstagramReelsSection />

      {/* ── 7. Jaquar Support ── */}
      <JaquarSupportSection />

      {/* ── 8. Blogs ── */}
      <BlogsSection />

      {/* ── 9. Business and Support Links ── */}
      <SupportLinksSection />

      <FooterSection />
    </main>
  );
}
