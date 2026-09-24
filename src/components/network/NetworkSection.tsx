"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import AnimatedCounter from "./AnimatedCounter";
import IndiaMap from "./IndiaMap";
import NetworkLegend from "./NetworkLegend";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const STATS = [
  { value: 1500, suffix: "+", label: "Channel Partners" },
  { value: 18, suffix: "+", label: "Distribution Hubs" },
  { value: 1, suffix: "", label: "Manufacturing Facility" },
  { value: 24, suffix: "/7", label: "Supply Support" },
] as const;

interface NetworkSectionProps {
  data?: {
    visible?: boolean;
    eyebrow?: string;
    heading?: string;
    description?: string;
    stats?: Array<{ value: number; suffix: string; label: string }>;
  };
}

export default function NetworkSection({ data }: NetworkSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [countersActive, setCountersActive] = useState(false);
  const isVisible = data?.visible !== false;

  const statsList = data?.stats && data.stats.length > 0 ? data.stats : STATS;
  const eyebrowText = data?.eyebrow || "Our Network";
  const headingText = data?.heading || "Strategic Distribution & Factory Network";
  const descriptionText = data?.description || "Pan India distribution network powered by 1500+ channel partners, our centralized manufacturing facility, branch offices, and warehouse hubs ensuring efficient supply and nationwide product availability.";

  useEffect(() => {
    if (!isVisible) return;
    const section = sectionRef.current;
    if (!section) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      if (reduceMotion) {
        gsap.set("[data-network-left] > *", { clearProps: "all", opacity: 1, y: 0 });
        gsap.set("[data-network-map]", { clearProps: "all", opacity: 1, scale: 1 });
        gsap.set("[data-map-pin]", { clearProps: "all", opacity: 1, scale: 1 });
        setCountersActive(true);
        return;
      }

      gsap.set("[data-network-left] > *", { opacity: 0, y: 40 });
      gsap.set("[data-network-map]", { opacity: 0, scale: 0.92 });
      gsap.set("[data-map-pin]", { opacity: 0, scale: 0.5 });
      gsap.set("[data-network-line]", { opacity: 0 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 70%",
          once: true,
          onEnter: () => setCountersActive(true),
        },
      });

      // If already in view on mount / deep-link scroll
      requestAnimationFrame(() => {
        const rect = section.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.7 && rect.bottom > 0) {
          setCountersActive(true);
        }
      });

      tl.to("[data-network-left] > *", {
        opacity: 1,
        y: 0,
        duration: 0.7,
        stagger: 0.12,
        ease: "power3.out",
      })
        .to(
          "[data-network-map]",
          {
            opacity: 1,
            scale: 1,
            duration: 0.9,
            ease: "power3.out",
          },
          "-=0.35",
        )
        .to(
          "[data-network-line]",
          {
            opacity: 0.45,
            duration: 0.6,
            stagger: 0.04,
            ease: "power2.out",
          },
          "-=0.4",
        )
        .to(
          "[data-map-pin]",
          {
            opacity: 1,
            scale: 1,
            duration: 0.45,
            stagger: 0.06,
            ease: "back.out(1.7)",
          },
          "-=0.5",
        );
    }, section);

    return () => ctx.revert();
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <section
      ref={sectionRef}
      data-header-theme="light"
      className="relative flex h-screen min-h-screen w-full items-center justify-center overflow-hidden bg-[#F8FAFC] px-[clamp(20px,5vw,72px)] py-[clamp(32px,5vh,64px)]"
      style={{ fontFamily: "'Plus Jakarta Sans', 'Manrope', system-ui, sans-serif" }}
    >
      {/* Ambient orbs + grid */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -left-24 top-16 h-72 w-72 rounded-full bg-[#00AEEF]/[0.08] blur-3xl" />
        <div className="absolute -right-16 bottom-10 h-80 w-80 rounded-full bg-[#1D4ED8]/[0.07] blur-3xl" />
        <div className="absolute left-1/3 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-[#EF4444]/[0.04] blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #94A3B8 1px, transparent 1px), linear-gradient(to bottom, #94A3B8 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      <div className="relative z-[1] mx-auto my-auto grid w-full max-w-[1180px] grid-cols-1 items-center justify-center gap-8 lg:grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)] lg:gap-10 xl:gap-14">
        {/* Left column */}
        <div data-network-left className="mx-auto flex w-full max-w-xl flex-col justify-center gap-5 md:gap-6 lg:mx-0 lg:max-w-none">
          <p className="text-[12px] font-bold uppercase tracking-[0.22em] text-[#00AEEF]">
            {eyebrowText}
          </p>

          <h2 className="max-w-xl text-4xl font-bold leading-[1.08] tracking-tight text-slate-900 md:text-5xl xl:text-[3.1rem]">
            {headingText}
          </h2>

          <p className="max-w-lg text-[15px] leading-relaxed text-slate-500 md:text-base">
            {descriptionText}
          </p>

          <div className="grid grid-cols-2 gap-3">
            {statsList.map((stat) => (
              <AnimatedCounter
                key={stat.label}
                value={stat.value}
                suffix={stat.suffix}
                label={stat.label}
                trigger={countersActive}
              />
            ))}
          </div>

          <NetworkLegend />
        </div>

        {/* Right column — map centered */}
        <div className="relative mx-auto flex w-full max-w-[520px] items-center justify-center lg:max-w-none lg:min-h-[520px]">
          <IndiaMap />
        </div>
      </div>
    </section>
  );
}
