"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface ProductShowcaseProps {
  data?: {
    visible?: boolean;
    image?: string;
    subtitle?: string;
    title?: string;
  };
}

export default function ProductShowcaseSection({ data }: ProductShowcaseProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  const rawImageUrl = data?.image || "";
  const imageUrl = rawImageUrl
    ? rawImageUrl.startsWith("/api/media/") && !rawImageUrl.includes("w=")
      ? `${rawImageUrl}${rawImageUrl.includes("?") ? "&" : "?"}w=1400&q=78`
      : rawImageUrl
    : "";
  const subtitleText = data?.subtitle || "Explore by Space";
  const titleText = data?.title || "Bathroom";

  const isVisible = data?.visible !== false && Boolean(imageUrl);

  useEffect(() => {
    if (!isVisible || !sectionRef.current || !imageRef.current || !textRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 75%",
          toggleActions: "play none none reverse",
        },
      });

      // 1. Fullscreen background image reveal
      tl.fromTo(
        imageRef.current,
        {
          scale: 1.08,
          opacity: 0.95,
          y: 30,
        },
        {
          scale: 1,
          opacity: 1,
          y: 0,
          duration: 1.1,
          ease: "power3.out",
        }
      );

      // 2. Text overlay slide-up & fade-in (Explore by Space / Bathroom)
      tl.fromTo(
        textRef.current,
        {
          opacity: 0.95,
          y: 24,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: "power3.out",
        },
        "-=0.7"
      );
    }, sectionRef);

    return () => ctx.revert();
  }, [isVisible]);

  if (!isVisible || !imageUrl) return null;

  return (
    <section
      ref={sectionRef}
      data-header-theme="dark"
      className="rn-showcase-section relative overflow-hidden bg-black w-full"
      aria-label="Explore by Space - Bathroom"
    >
      <style>{`
        .rn-showcase-section {
          height: min(100vh, 62vw);
          min-height: 440px;
        }
        .rn-showcase-text-overlay {
          padding: 0 20px clamp(48px, 8vw, 120px);
        }
        @media (max-width: 1024px) and (min-width: 769px) {
          .rn-showcase-section {
            height: clamp(480px, 60vw, 640px);
            min-height: 480px;
          }
          .rn-showcase-text-overlay {
            padding: 0 24px 64px;
          }
        }
        @media (max-width: 768px) {
          .rn-showcase-section {
            height: clamp(380px, 56vh, 480px);
            min-height: 380px;
          }
          .rn-showcase-text-overlay {
            padding: 0 16px 44px;
          }
        }
        @media (max-width: 920px) and (max-height: 500px) {
          .rn-showcase-section {
            height: clamp(300px, 85vh, 400px);
            min-height: 300px;
          }
          .rn-showcase-text-overlay {
            padding: 0 16px 32px;
          }
        }
      `}</style>
      {/* Background Image Scene */}
      <div
        ref={imageRef}
        className="w-full h-full relative overflow-hidden z-0"
        style={{ willChange: "transform, opacity" }}
      >
        <Image
          src={imageUrl}
          alt={titleText}
          width={1400}
          height={900}
          sizes="100vw"
          loading="lazy"
          decoding="async"
          quality={78}
          unoptimized={imageUrl.startsWith("/api/media/")}
          className="object-cover object-center w-full h-full"
        />
      </div>


      {/* Centered Bottom Text Overlay (Explore by Space / Bathroom) */}
      <div
        ref={textRef}
        className="rn-showcase-text-overlay absolute inset-0 z-20 flex flex-col items-center justify-end text-center pointer-events-none"
        style={{ willChange: "transform, opacity" }}
      >
        <p
          style={{
            color: "rgba(255, 255, 255, 0.9)",
            fontSize: "clamp(18px, 2.2vw, 24px)",
            fontWeight: 400,
            fontFamily: "'Manrope', system-ui, sans-serif",
            letterSpacing: "0.01em",
            marginBottom: "4px",
            WebkitFontSmoothing: "antialiased",
            MozOsxFontSmoothing: "grayscale" as const,
          }}
        >
          {subtitleText}
        </p>
        <h2
          style={{
            color: "#ffffff",
            fontSize: "clamp(32px, 4vw, 50px)",
            fontWeight: 500,
            fontFamily: "'Manrope', system-ui, sans-serif",
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            WebkitFontSmoothing: "antialiased",
            MozOsxFontSmoothing: "grayscale" as const,
          }}
        >
          {titleText}
        </h2>
      </div>
    </section>
  );
}
