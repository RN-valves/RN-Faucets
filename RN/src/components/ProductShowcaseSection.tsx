"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const PRODUCT_IMAGE_URL =
  "https://hindware.com/_next/image?url=https%3A%2F%2Fhindwarestg.blob.core.windows.net%2Fcontainer1%2Fproducts%2FBathroom-1756100455419-1756463985636.webp&w=3840&q=75";

export default function ProductShowcaseSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current || !imageRef.current || !textRef.current) return;

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
          scale: 1.15,
          opacity: 0,
          y: 80,
        },
        {
          scale: 1,
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: "power3.out",
        }
      );

      // 2. Text overlay slide-up & fade-in (Explore by Space / Bathroom)
      tl.fromTo(
        textRef.current,
        {
          opacity: 0,
          y: 40,
        },
        {
          opacity: 1,
          y: 0,
          duration: 1.0,
          ease: "power3.out",
        },
        "-=0.7"
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      data-header-theme="dark"
      className="h-screen w-screen relative overflow-hidden bg-black"
      aria-label="Explore by Space - Bathroom"
    >
      {/* Background Image Scene */}
      <div
        ref={imageRef}
        className="w-full h-full relative overflow-hidden z-0"
        style={{ willChange: "transform, opacity" }}
      >
        <Image
          src={PRODUCT_IMAGE_URL}
          alt="Explore by Space - Bathroom"
          fill
          priority
          quality={100}
          unoptimized
          className="object-cover object-center w-full h-full"
        />
      </div>


      {/* Centered Bottom Text Overlay (Explore by Space / Bathroom) */}
      <div
        ref={textRef}
        className="absolute inset-0 z-20 flex flex-col items-center justify-end text-center pointer-events-none"
        style={{ paddingBottom: "20vh", willChange: "transform, opacity" }}
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
          Explore by Space
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
          Bathroom
        </h2>
      </div>
    </section>
  );
}
