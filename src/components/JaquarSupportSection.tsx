"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const SUPPORT_CARDS = [
  {
    title: "Store Locator",
    description: "Purchase our products from RN Faucets authorized dealers only.",
    cta: "Find a Store",
    href: "/store-locator",
    image: "/uploads/support/store-locator.webp",
    overlay:
      "linear-gradient(90deg, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.58) 28%, rgba(0,0,0,0.14) 60%, rgba(0,0,0,0.06) 100%)",
  },
  {
    title: "RN Care",
    description: "Expert support. Trusted Service. Industry leading warranty.",
    cta: "Let's Connect",
    href: "/contact-us",
    image: "/uploads/support/rn-care.webp",
    overlay:
      "linear-gradient(90deg, rgba(0,0,0,0.84) 0%, rgba(0,0,0,0.7) 34%, rgba(0,0,0,0.2) 68%, rgba(0,0,0,0.08) 100%)",
  },
] as const;

interface JaquarSupportSectionProps {
  data?: {
    visible?: boolean;
    cards?: Array<{
      title: string;
      description: string;
      cta: string;
      href: string;
      image: string;
      overlay?: string;
    }>;
  };
}

export default function JaquarSupportSection({ data }: JaquarSupportSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<(HTMLAnchorElement | null)[]>([]);
  const isVisible = data?.visible !== false;

  const rawCards = data?.cards && data.cards.length > 0 ? data.cards : SUPPORT_CARDS;
  const cardsList = rawCards.map((c: any) => ({
    ...c,
    image:
      c.image && !c.image.includes("jaquar.com")
        ? c.image
        : c.title?.toLowerCase().includes("store")
        ? "/uploads/support/store-locator.webp"
        : "/uploads/support/rn-care.webp",
  }));

  useEffect(() => {
    if (!isVisible || !sectionRef.current) return;

    const ctx = gsap.context(() => {
      const validCards = cardsRef.current.filter(Boolean);
      if (validCards.length > 0) {
        gsap.fromTo(
          validCards,
          { y: 44, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1,
            stagger: 0.15,
            ease: "power3.out",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 78%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <section
      ref={sectionRef}
      data-header-theme="dark"
      className="jaquar-support-section"
      style={{
        position: "relative",
        width: "100vw",
        background: "#000000",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
      aria-label="Store locator and RN Care"
    >
      <style>{`
        .jaquar-support-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          width: 100%;
          min-height: calc(100vh - 134px);
          background: #050505;
          overflow: hidden;
        }
        .jaquar-support-card {
          position: relative;
          display: flex;
          align-items: flex-end;
          padding: 0;
          min-height: 620px;
          overflow: hidden;
          text-decoration: none;
          color: #FFFFFF;
          isolation: isolate;
        }
        .jaquar-support-card::before {
          content: "";
          position: absolute;
          inset: 0;
          background-image: var(--card-image);
          background-size: cover;
          background-position: center;
          transition: transform 0.8s ease;
          z-index: -3;
        }
        .jaquar-support-card::after {
          content: "";
          position: absolute;
          inset: 0;
          background: var(--card-overlay);
          z-index: -2;
        }
        .jaquar-support-card:hover::before {
          transform: scale(1.04);
        }
        .jaquar-support-card + .jaquar-support-card {
          border-left: 1px solid rgba(255,255,255,0.06);
        }
        .jaquar-support-content {
          width: 100%;
          max-width: 360px;
          padding: 0 56px 58px;
        }
        .jaquar-support-title {
          margin: 0 0 16px;
          font-family: 'Manrope', Helvetica, Arial, sans-serif;
          font-size: clamp(34px, 3.5vw, 56px);
          font-weight: 400;
          line-height: 1.06;
          letter-spacing: -0.03em;
          color: #FFFFFF;
        }
        .jaquar-support-description {
          margin: 0 0 28px;
          max-width: 260px;
          font-family: 'Manrope', Helvetica, Arial, sans-serif;
          font-size: 15px;
          font-weight: 400;
          line-height: 1.55;
          color: rgba(255,255,255,0.92);
        }
        .jaquar-support-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 44px;
          padding: 0 22px;
          border: 1px solid rgba(255,255,255,0.38);
          border-radius: 999px;
          font-family: 'Manrope', Helvetica, Arial, sans-serif;
          font-size: 15px;
          font-weight: 600;
          line-height: 1;
          color: #FFFFFF;
          background: rgba(10,10,10,0.12);
          backdrop-filter: blur(4px);
          transition: background 0.25s ease, border-color 0.25s ease, transform 0.25s ease;
        }
        .jaquar-support-card:hover .jaquar-support-button {
          background: rgba(255,255,255,0.12);
          border-color: rgba(255,255,255,0.62);
          transform: translateY(-1px);
        }
        @media (max-width: 1024px) {
          .jaquar-support-content {
            padding: 0 40px 44px;
          }
          .jaquar-support-card {
            min-height: 540px;
          }
        }
        @media (max-width: 768px) {
          .jaquar-support-section {
            min-height: auto !important;
            padding: 16px !important;
          }
          .jaquar-support-grid {
            grid-template-columns: 1fr;
            min-height: auto;
          }
          .jaquar-support-card {
            min-height: 420px;
          }
          .jaquar-support-card + .jaquar-support-card {
            border-left: none;
            border-top: 1px solid rgba(255,255,255,0.06);
          }
          .jaquar-support-content {
            max-width: 100%;
            padding: 0 24px 28px;
          }
          .jaquar-support-title {
            font-size: 36px;
          }
          .jaquar-support-description {
            max-width: 280px;
            margin-bottom: 22px;
          }
        }
      `}</style>

      <div className="jaquar-support-grid">
        {cardsList.map((card, index) => {
          const isConnect =
            card.cta?.toLowerCase().includes("connect") ||
            card.title?.toLowerCase().includes("care");
          const targetHref =
            card.href && card.href !== "#"
              ? card.href
              : isConnect
              ? "/contact-us"
              : "/store-locator";

          return (
            <Link
              key={card.title}
              ref={(node) => {
                cardsRef.current[index] = node as unknown as HTMLAnchorElement;
              }}
              href={targetHref}
              className="jaquar-support-card"
              style={
                {
                  "--card-image": `url("${card.image}")`,
                  "--card-overlay": card.overlay,
                } as CSSProperties
              }
            >
              <div className="jaquar-support-content">
                <h2 className="jaquar-support-title">{card.title}</h2>
                <p className="jaquar-support-description">{card.description}</p>
                <span className="jaquar-support-button">{card.cta}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
