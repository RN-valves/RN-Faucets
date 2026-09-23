"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const ACCENT = "#00AEEF";

const MILESTONES = [
  {
    year: "2025",
    title: "Establishing a Global Footprint",
    text: "Successfully hosted international-level exhibitions across India, establishing a strong global presence and building long-term partnerships with international clients",
  },
  {
    year: "2020",
    title: "Acknowledged as India's Most Promising Brand",
    text: "RN recognised as India's Most Promising Brand by Global Real Estate Congress Launched our factory in Sahibabad with the certificate of registration. Over 500+ employees work here. Currently launched new series of faucets",
  },
  {
    year: "2015",
    title: "Successfully exhibition of faucets and debut on all social media platforms",
    text: "Every year, we have a successful product display. Hyderabad, Mumbai, Bangalore, and Delhi all hosted exhibitions. We successfully managed to archive authorized dealers all over the country. Successfully made a space for the RN family in the capital along with 200 employees. RN made its debut on all social media platforms Our website was launched",
  },
  {
    year: "2010",
    title: "Got our quality management application",
    text: "Our clients' trust has risen to new heights. Various varieties of faucets have been introduced at various price points to satisfy the needs of customers We execute the full application of ISO90000 Quality management system from design research, development, and manufacture, as demand increases and we are trusted by the customers. RN bathroom accessories portfolio has been expanded to encompass a full range of lighting solutions for both residential and commercial applications.",
  },
  {
    year: "2005",
    title: "Growth of the firm",
    text: "We added new members to our RN family. The products demand contributed to the growth of the customers' love and trust. As a result, faucets with fashionable designs with some new valves were also released.",
  },
  {
    year: "2000",
    title: "Launch of the company",
    text: "RN Valves & Faucets came into existence Valves were launched offline.",
  },
];

interface HistoryTimelineSectionProps {
  data?: {
    visible?: boolean;
    heading?: string;
    subtitle?: string;
    milestones?: Array<{
      id: string;
      year: string;
      title: string;
      text: string;
      image?: string;
    }>;
  };
}

export default function HistoryTimelineSection({ data }: HistoryTimelineSectionProps) {
  const milestonesList = data?.milestones && data.milestones.length > 0 ? data.milestones : MILESTONES;
  const sectionHeading = data?.heading || "Milestones";
  const sectionSubtitle = data?.subtitle || "Offering cutting-edge designs and energy-saving products that are proudly manufactured in India!";

  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      const items = sectionRef.current?.querySelectorAll(".timeline-item");
      const lineProgress = sectionRef.current?.querySelector(".timeline-line-progress");

      // Animate the vertical timeline progress line
      if (lineProgress && containerRef.current) {
        gsap.fromTo(
          lineProgress,
          { height: "0%" },
          {
            height: "100%",
            ease: "none",
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top 30%",
              end: "bottom 80%",
              scrub: true,
            },
          }
        );
      }

      // Animate individual milestone cards, markers, and years
      if (items) {
        items.forEach((item) => {
          const card = item.querySelector(".timeline-card");
          const marker = item.querySelector(".timeline-marker");
          const year = item.querySelector(".timeline-year-label");
          const isLeft = item.classList.contains("is-left");

          gsap.fromTo(
            card,
            {
              opacity: 0,
              x: isLeft ? -40 : 40,
            },
            {
              opacity: 1,
              x: 0,
              duration: 0.8,
              ease: "power2.out",
              scrollTrigger: {
                trigger: item,
                start: "top 80%",
                toggleActions: "play none none reverse",
              },
            }
          );

          gsap.fromTo(
            marker,
            {
              scale: 0,
              opacity: 0,
            },
            {
              scale: 1,
              opacity: 1,
              duration: 0.5,
              ease: "back.out(1.7)",
              scrollTrigger: {
                trigger: item,
                start: "top 80%",
                toggleActions: "play none none reverse",
              },
            }
          );

          gsap.fromTo(
            year,
            {
              opacity: 0,
              y: 10,
            },
            {
              opacity: 1,
              y: 0,
              duration: 0.5,
              ease: "power2.out",
              scrollTrigger: {
                trigger: item,
                start: "top 80%",
                toggleActions: "play none none reverse",
              },
            }
          );
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [data?.visible]);

  if (data?.visible === false) return null;

  return (
    <section
      ref={sectionRef}
      data-header-theme="light"
      style={{
        background: "#FFFFFF",
        minHeight: "100vh",
        width: "100%",
        padding: "clamp(60px, 8vh, 120px) clamp(16px, 4vw, 64px)",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        position: "relative",
        overflowX: "hidden",
      }}
    >
      <style>{`
        .timeline-container {
          position: relative;
          max-width: 1100px;
          width: 100%;
          margin: 60px auto 0;
          padding: 20px 0;
        }
        .timeline-line {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          top: 0;
          bottom: 0;
          width: 3px;
          background: #E2E8F0;
          z-index: 1;
        }
        .timeline-line-progress {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          top: 0;
          width: 3px;
          background: ${ACCENT};
          z-index: 2;
          transform-origin: top;
          height: 0%;
        }
        .timeline-item {
          position: relative;
          width: 100%;
          margin-bottom: 50px;
          display: flex;
        }
        .timeline-item:last-child {
          margin-bottom: 0;
        }
        .timeline-card-wrapper {
          width: 50%;
          position: relative;
          z-index: 3;
          box-sizing: border-box;
        }
        .timeline-item.is-left {
          justify-content: flex-start;
        }
        .timeline-item.is-right {
          justify-content: flex-end;
        }
        .timeline-item.is-left .timeline-card-wrapper {
          padding-right: 45px;
        }
        .timeline-item.is-right .timeline-card-wrapper {
          padding-left: 45px;
        }
        .timeline-marker {
          position: absolute;
          left: 50%;
          top: 40px;
          width: 14px;
          height: 14px;
          background: ${ACCENT};
          border: 3px solid #FFFFFF;
          box-shadow: 0 0 0 3px ${ACCENT}, 0 2px 8px rgba(0,0,0,0.15);
          transform: translate(-50%, -50%);
          border-radius: 2px;
          z-index: 4;
        }
        .timeline-year-label {
          position: absolute;
          left: 50%;
          top: 0px;
          transform: translateX(-50%);
          font-family: 'Manrope', system-ui, sans-serif;
          font-size: 20px;
          font-weight: 800;
          color: #1A202C;
          z-index: 4;
        }
        .timeline-card {
          background: #F8FAFC;
          border-radius: 12px;
          padding: 24px 28px;
          box-shadow: 0 4px 20px rgba(7, 19, 29, 0.04);
          border: 1px solid #E2E8F0;
          position: relative;
          width: 100%;
          box-sizing: border-box;
          transition: transform 0.3s ease, box-shadow 0.3s ease, background-color 0.3s ease;
        }
        .timeline-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 30px rgba(7, 19, 29, 0.07);
          background: #FFFFFF;
        }
        .timeline-card-title {
          margin: 0 0 10px;
          font-family: 'Manrope', system-ui, sans-serif;
          font-size: 18px;
          font-weight: 700;
          color: #0F172A;
          line-height: 1.35;
        }
        .timeline-card-text {
          margin: 0;
          font-family: 'Manrope', system-ui, sans-serif;
          font-size: 14px;
          font-weight: 400;
          color: #475569;
          line-height: 1.65;
        }
        .timeline-card::after {
          content: "";
          position: absolute;
          top: 34px;
          width: 10px;
          height: 10px;
          background: inherit;
          border-top: 1px solid #E2E8F0;
          border-right: 1px solid #E2E8F0;
          z-index: -1;
        }
        .timeline-item.is-left .timeline-card::after {
          right: -6px;
          transform: rotate(45deg);
        }
        .timeline-item.is-right .timeline-card::after {
          left: -6px;
          transform: rotate(-135deg);
        }
        @media (max-width: 768px) {
          .timeline-line, .timeline-line-progress {
            left: 20px;
            transform: none;
          }
          .timeline-item {
            justify-content: flex-start !important;
            margin-bottom: 40px;
          }
          .timeline-card-wrapper {
            width: calc(100% - 40px) !important;
            padding-left: 25px !important;
            padding-right: 0 !important;
          }
          .timeline-marker {
            left: 20px !important;
            top: 42px !important;
            transform: translate(-50%, -50%) !important;
          }
          .timeline-year-label {
            left: 45px !important;
            transform: none !important;
            top: -2px !important;
            font-size: 17px;
          }
          .timeline-item.is-left .timeline-card::after,
          .timeline-item.is-right .timeline-card::after {
            left: -6px !important;
            right: auto !important;
            transform: rotate(-135deg) !important;
          }
        }
      `}</style>

      {/* Milestones Header */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", maxWidth: "800px" }}>
        <div className="mb-5 flex w-full items-center justify-center gap-4">
          <span
            className="h-px w-12 bg-gradient-to-r from-transparent to-slate-400/80 sm:w-20"
            aria-hidden
          />
          <p
            style={{
              margin: 0,
              fontSize: "12px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.28em",
              color: "#64748B",
              fontFamily: "'Manrope', system-ui, sans-serif",
            }}
          >
            Our Journey
          </p>
          <span
            className="h-px w-12 bg-gradient-to-l from-transparent to-slate-400/80 sm:w-20"
            aria-hidden
          />
        </div>

        <h2
          style={{
            fontFamily: "'Manrope', system-ui, sans-serif",
            fontWeight: 800,
            fontSize: "clamp(30px, 3.5vw, 44px)",
            letterSpacing: "-0.03em",
            color: "#0F172A",
            textAlign: "center",
            margin: 0,
          }}
        >
          {sectionHeading}
        </h2>

        <p
          style={{
            marginTop: "16px",
            maxWidth: "680px",
            color: "#475569",
            fontFamily: "'Manrope', system-ui, sans-serif",
            fontSize: "clamp(14px, 1.1vw, 16px)",
            fontWeight: 400,
            lineHeight: 1.75,
            textAlign: "center",
          }}
        >
          {sectionSubtitle}
        </p>
      </div>

      {/* Timeline Tree */}
      <div ref={containerRef} className="timeline-container">
        <div className="timeline-line" />
        <div className="timeline-line-progress" />

        {milestonesList.map((item, index) => {
          const isLeft = index % 2 === 0;
          return (
            <div
              key={item.year}
              className={`timeline-item ${isLeft ? "is-left" : "is-right"}`}
            >
              {/* Year marker and label outside card wrapper to anchor to the central line */}
              <div className="timeline-year-label">{item.year}</div>
              <div className="timeline-marker" />

              <div className="timeline-card-wrapper">
                <article className="timeline-card">
                  <h3 className="timeline-card-title">{item.title}</h3>
                  <p className="timeline-card-text">{item.text}</p>
                </article>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
