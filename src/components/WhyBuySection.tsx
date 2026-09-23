"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface TrustItem {
  title: string;
  description: string;
  linkLabel?: string;
  href?: string;
}

const TRUST_ITEMS: TrustItem[] = [
  {
    title: "Free and fast delivery. Same day dispatch*.",
    description:
      "Enjoy fast, free delivery with same-day dispatch for an enhanced shopping experience.",
    linkLabel: "See Terms",
    href: "/terms-conditions",
  },
  {
    title: "Simple returns - Return your order within 7 days*.",
    description: "Benefit from our 7 day return policy.",
    linkLabel: "See Terms",
    href: "/return-refund-policy",
  },
  {
    title: "Professional Installation - RN Faucets approved installation available*.",
    description: "Benefit from professional brand installation services.",
    linkLabel: "Find Out More",
    href: "/contact-us",
  },
  {
    title: "Assistance from RN Faucets specialists, Live Chat.",
    description:
      "Live chat with RN Faucets product specialist and find your right product.",
    linkLabel: "Contact Us",
    href: "/contact-us",
  },
];

interface WhyBuySectionProps {
  data?: {
    visible?: boolean;
    heading?: string;
    items?: Array<{
      title: string;
      description: string;
      linkLabel?: string;
      href?: string;
    }>;
  };
}

export default function WhyBuySection({ data }: WhyBuySectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const columnsRef = useRef<HTMLDivElement>(null);
  const isVisible = data?.visible !== false;

  const headingText = data?.heading || "Why Buy from RN Faucets Directly";
  const rawItems = data?.items && Array.isArray(data.items) ? data.items : [];
  if (!isVisible || rawItems.length === 0) return null;

  const itemsList = rawItems.map((item: any) => {
    return {
      ...item,
      href: item.href || "/contact-us",
      linkLabel: item.linkLabel || "Learn More",
    };
  });

  useEffect(() => {
    if (!isVisible || !sectionRef.current || !headingRef.current || !columnsRef.current)
      return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        headingRef.current,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        }
      );

      const cols = columnsRef.current?.querySelectorAll(".why-buy-col");
      if (cols && cols.length > 0) {
        gsap.fromTo(
          cols,
          { y: 36, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.9,
            stagger: 0.12,
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
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <section
      ref={sectionRef}
      data-header-theme="light"
      className="why-buy-section"
      style={{
        position: "relative",
        width: "100vw",
        background: "#FFFFFF",
        padding: "120px 64px 88px",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
      aria-label="Why Buy from RN Faucets Directly"
    >
      <style>{`
        .why-buy-link {
          color: #111111;
          text-decoration: underline;
          text-underline-offset: 2px;
          text-decoration-thickness: 1px;
          transition: opacity 0.25s ease;
        }
        .why-buy-link:hover {
          opacity: 0.55;
        }
        .why-buy-col + .why-buy-col {
          border-left: 1px solid #D0D0D0;
          padding-left: 36px;
        }
        @media (max-width: 1100px) {
          .why-buy-section {
            padding: 72px 40px 80px !important;
          }
          .why-buy-col + .why-buy-col {
            padding-left: 24px;
          }
          .why-buy-heading {
            font-size: 40px !important;
            margin-bottom: 52px !important;
          }
        }
        @media (max-width: 800px) {
          .why-buy-section {
            padding: 56px 24px 64px !important;
          }
          .why-buy-grid {
            display: flex !important;
            flex-direction: column !important;
            gap: 0 !important;
          }
          .why-buy-col {
            padding: 24px 0 !important;
            border-left: none !important;
            border-bottom: 1px solid #E5E5E5;
          }
          .why-buy-col:last-child {
            border-bottom: none;
          }
          .why-buy-col + .why-buy-col {
            border-left: none;
            padding-left: 0;
          }
          .why-buy-heading {
            font-size: 32px !important;
            margin-bottom: 28px !important;
            text-align: left !important;
          }
        }
      `}</style>

      <h2
        ref={headingRef}
        className="why-buy-heading"
        style={{
          margin: "0 0 76px 0",
          fontFamily: "'Manrope', Helvetica, Arial, sans-serif",
          fontSize: "clamp(32px, 3.8vw, 56px)",
          fontWeight: 400,
          lineHeight: 1.08,
          letterSpacing: "-0.03em",
          color: "#111111",
          maxWidth: "800px",
        }}
      >
        {headingText}
      </h2>

      <div
        ref={columnsRef}
        className="why-buy-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 0,
          maxWidth: "1280px",
          margin: "0 auto",
          width: "100%",
        }}
      >
        {itemsList.map((item, idx) => (
          <div
            key={`${item.title}-${idx}`}
            className="why-buy-col"
            style={{
              paddingRight: "32px",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
              boxSizing: "border-box",
            }}
          >
            <h3
              style={{
                fontFamily: "'Manrope', Helvetica, Arial, sans-serif",
                fontWeight: 700,
                fontSize: "17px",
                lineHeight: 1.35,
                letterSpacing: "-0.01em",
                color: "#111111",
                margin: 0,
                WebkitFontSmoothing: "antialiased",
                MozOsxFontSmoothing: "grayscale",
              }}
            >
              {item.title}
            </h3>

            <p
              style={{
                fontFamily: "'Manrope', Helvetica, Arial, sans-serif",
                fontWeight: 400,
                fontSize: "14px",
                lineHeight: 1.5,
                letterSpacing: "0",
                color: "#111111",
                margin: 0,
                WebkitFontSmoothing: "antialiased",
                MozOsxFontSmoothing: "grayscale",
              }}
            >
              {item.description}
            </p>

            {item.linkLabel && (
              <a
                href={item.href || "#"}
                className="why-buy-link"
                style={{
                  fontFamily: "'Manrope', Helvetica, Arial, sans-serif",
                  fontWeight: 400,
                  fontSize: "14px",
                  lineHeight: 1.4,
                  marginTop: "2px",
                  alignSelf: "flex-start",
                  WebkitFontSmoothing: "antialiased",
                }}
              >
                {item.linkLabel}
              </a>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
