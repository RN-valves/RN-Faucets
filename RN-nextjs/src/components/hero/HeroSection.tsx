"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import HeroHeader from "./HeroHeader";
import HeroVideo from "./HeroVideo";
import CircularProgressControl from "./CircularProgressControl";
import ScrollIndicator from "./ScrollIndicator";
import { gsap } from "gsap";

/* ─── Playlist data ────────────────────────────────────── */
export interface VideoEntry {
  id: number;
  src: string;
  title: string;
  collection: string;
  label: string;
  heading: string;
  description: string;
}

const PLAYLIST: VideoEntry[] = [
  {
    id: 0,
    src: "/videos/hero-1.mp4",
    title: "Italian Collection",
    collection: "01 / 03",
    label: "Explore",
    heading: "Luxury Bathroom Faucets",
    description:
      "Hand-crafted in the tradition of Italian artisanship — where water becomes a ritual and beauty becomes permanence.",
  },
  {
    id: 1,
    src: "/videos/hero-2.mp4",
    title: "Obsidian Series",
    collection: "02 / 03",
    label: "Discover",
    heading: "Designer Rain Showers",
    description:
      "Inspired by Nordic minimalism, the Obsidian Series transforms every shower into a meditative sanctuary of pure form.",
  },
  {
    id: 2,
    src: "/videos/hero-3.mp4",
    title: "Aurum Edition",
    collection: "03 / 03",
    label: "Curated",
    heading: "Premium Bath Suites",
    description:
      "24-karat gold-finished fixtures meet cutting-edge precision engineering — an uncompromising statement of luxury.",
  },
];

/* ─── Component ────────────────────────────────────────── */
export default function HeroSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Refs for GSAP targets
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLParagraphElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const controlRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  /* ─── Entry animation ─────────────────────────────────── */
  useEffect(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      // Start everything invisible
      gsap.set(
        [
          overlayRef.current,
          headerRef.current,
          labelRef.current,
          headingRef.current,
          descRef.current,
          controlRef.current,
          infoRef.current,
          scrollRef.current,
        ],
        { autoAlpha: 0 }
      );
      gsap.set([labelRef.current, headingRef.current, descRef.current, controlRef.current, infoRef.current], {
        y: 30,
      });

      tl.to(overlayRef.current, { autoAlpha: 1, duration: 1.2 })
        .to(headerRef.current, { autoAlpha: 1, duration: 0.7 }, "-=0.6")
        .to(labelRef.current, { autoAlpha: 1, y: 0, duration: 0.7 }, "-=0.3")
        .to(headingRef.current, { autoAlpha: 1, y: 0, duration: 0.8 }, "-=0.5")
        .to(descRef.current, { autoAlpha: 1, y: 0, duration: 0.7 }, "-=0.5")
        .to(controlRef.current, { autoAlpha: 1, y: 0, duration: 0.65 }, "-=0.45")
        .to(infoRef.current, { autoAlpha: 1, y: 0, duration: 0.6 }, "-=0.4")
        .to(scrollRef.current, { autoAlpha: 1, duration: 0.5 }, "-=0.3");
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  /* ─── Fade content on video change ───────────────────── */
  const handleVideoChange = useCallback(
    (nextIndex: number) => {
      if (nextIndex === activeIndex || isAnimating) return;
      setIsAnimating(true);

      const targets = [labelRef.current, headingRef.current, descRef.current, infoRef.current];
      gsap.to(targets, {
        autoAlpha: 0,
        y: -12,
        duration: 0.25,
        ease: "power2.in",
        onComplete: () => {
          setPrevIndex(activeIndex);
          setActiveIndex(nextIndex);
          gsap.fromTo(
            targets,
            { autoAlpha: 0, y: 18 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.55,
              ease: "power3.out",
              stagger: 0.06,
              onComplete: () => setIsAnimating(false),
            }
          );
        },
      });
    },
    [activeIndex, isAnimating]
  );

  const current = PLAYLIST[activeIndex];

  return (
    <section
      ref={sectionRef}
      className="hero-section"
      aria-label="Hero -RN luxury bathware"
    >
      {/* Background video */}
      <HeroVideo
        playlist={PLAYLIST}
        activeIndex={activeIndex}
        onVideoEnd={(next) => handleVideoChange(next)}
        overlayRef={overlayRef}
      />

      {/* Fixed header */}
      <HeroHeader ref={headerRef} activeNav="Home" />

      {/* Center content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center pointer-events-none">
        <div className="hero-content flex flex-col items-center gap-5 md:gap-6 max-w-[900px] mx-auto">
          {/* Label */}
          <p
            ref={labelRef}
            className="text-[13px] md:text-[15px] font-[400] tracking-[0.3em] uppercase opacity-80"
            style={{ fontFamily: "var(--font-manrope)" }}
          >
            {current.label}
          </p>

          {/* Heading */}
          <h1
            ref={headingRef}
            className="text-[34px] sm:text-[46px] lg:text-[56px] xl:text-[64px] font-[600] leading-[1.05] tracking-[-0.04em] max-w-[850px]"
            style={{ fontFamily: "var(--font-manrope)" }}
          >
            {current.heading}
          </h1>

          {/* Description */}
          <p
            ref={descRef}
            className="text-[15px] md:text-[17px] lg:text-[18px] font-[400] leading-[1.75] opacity-90 max-w-[620px]"
            style={{ fontFamily: "var(--font-manrope)" }}
          >
            {current.description}
          </p>

          {/* Circular progress controls */}
          <div ref={controlRef} className="pointer-events-auto mt-2 md:mt-4">
            <CircularProgressControl
              playlist={PLAYLIST}
              activeIndex={activeIndex}
              onSelect={handleVideoChange}
            />
          </div>

          {/* Video info text */}
          <div
            ref={infoRef}
            className="flex items-center gap-3 mt-1 opacity-80"
            aria-live="polite"
            aria-label={`Video ${current.collection}: ${current.title}`}
          >
            <span
              className="text-[11px] font-[500] tracking-[0.2em] uppercase"
              style={{ color: "var(--brand-gold)", fontFamily: "var(--font-manrope)" }}
            >
              {current.collection}
            </span>
            <span className="w-px h-3 bg-white/40" />
            <span
              className="text-[12px] font-[400] tracking-[0.15em] uppercase"
              style={{ fontFamily: "var(--font-manrope)" }}
            >
              {current.title}
            </span>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div ref={scrollRef} className="relative z-10">
        <ScrollIndicator />
      </div>
    </section>
  );
}
