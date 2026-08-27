"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import AwardCard, { type Award } from "./AwardCard";
import SectionHeading from "./SectionHeading";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const AWARDS: Award[] = [
  {
    id: "creative-campaign",
    title: "Best Creative Campaign",
    organization: "Customer FEST Awards",
    description:
      "Recognized for excellence in customer engagement, brand communication, and loyalty-driven marketing initiatives.",
    year: "2024",
  },
  {
    id: "manufacturing-excellence",
    title: "Manufacturing Competitiveness Gold",
    organization: "NAMC National Awards",
    description:
      "Honored for precision manufacturing systems, quality consistency, and operational excellence across production facilities.",
    year: "2022",
  },
  {
    id: "innovation-leadership",
    title: "Innovation Leadership Award",
    organization: "Indian Plumbing Association",
    description:
      "Celebrated for pioneering product engineering, water-efficient designs, and forward-looking industry solutions.",
    year: "2023",
  },
  {
    id: "channel-partner",
    title: "Trusted Channel Partner Brand",
    organization: "National Trade Excellence Forum",
    description:
      "Awarded for pan-India distributor growth, service readiness, and enduring trust across the retail network.",
    year: "2021",
  },
];

interface AwardsSectionProps {
  data?: {
    visible?: boolean;
    eyebrow?: string;
    title?: string;
    description?: string;
    awards?: Award[];
  };
}

export default function AwardsSection({ data }: AwardsSectionProps) {
  if (data?.visible === false) return null;

  const awardsList = data?.awards && data.awards.length > 0 ? data.awards : AWARDS;
  const eyebrowText = data?.eyebrow || "Achievements";
  const titleText = data?.title || "Awards & Recognition";
  const descText = data?.description || "Celebrating our commitment to quality, innovation, customer trust, and manufacturing excellence through nationally recognized achievements and industry honors.";

  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      if (reduceMotion) {
        gsap.set("[data-awards-heading] > *, [data-award-card]", {
          clearProps: "all",
          opacity: 1,
          y: 0,
        });
        return;
      }

      gsap.set("[data-awards-heading] > *", { opacity: 0, y: 28 });
      gsap.set("[data-award-card]", { opacity: 0, y: 60 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 70%",
          once: true,
        },
      });

      tl.to("[data-awards-heading] > *", {
        opacity: 1,
        y: 0,
        duration: 0.65,
        stagger: 0.12,
        ease: "power3.out",
      }).to(
        "[data-award-card]",
        {
          opacity: 1,
          y: 0,
          duration: 0.75,
          stagger: 0.15,
          ease: "power3.out",
        },
        "-=0.25",
      );

      // Subtle continuous float on trophies
      gsap.to("[data-award-trophy]", {
        y: -6,
        duration: 4,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        stagger: {
          each: 0.4,
          from: "random",
        },
      });

      // Soft parallax on decorative orbs
      gsap.to("[data-awards-orb]", {
        y: (i) => (i % 2 === 0 ? -24 : 18),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top bottom",
          end: "bottom top",
          scrub: 1.2,
        },
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      data-header-theme="light"
      className="relative flex h-screen min-h-screen w-full items-center justify-center overflow-hidden px-[clamp(20px,5vw,72px)] py-[clamp(72px,10vh,110px)]"
      style={{
        fontFamily: "'Plus Jakarta Sans', 'Manrope', system-ui, sans-serif",
        background:
          "linear-gradient(165deg, #F8FAFC 0%, #EEF2F7 48%, #E2E8F0 100%)",
      }}
      aria-labelledby="awards-heading"
    >
      {/* Ambient layers */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div
          data-awards-orb
          className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-[#D4A017]/[0.08] blur-3xl"
        />
        <div
          data-awards-orb
          className="absolute -right-16 bottom-8 h-80 w-80 rounded-full bg-[#00AEEF]/[0.07] blur-3xl"
        />
        <div
          data-awards-orb
          className="absolute left-1/2 top-1/3 h-56 w-56 -translate-x-1/2 rounded-full bg-[#1D4ED8]/[0.05] blur-3xl"
        />
        <div
          className="absolute inset-0 opacity-[0.045]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #94A3B8 1px, transparent 1px), linear-gradient(to bottom, #94A3B8 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />
        {/* Floating particles */}
        {[
          { t: "18%", l: "12%", s: 3 },
          { t: "28%", l: "78%", s: 2 },
          { t: "62%", l: "8%", s: 2 },
          { t: "70%", l: "88%", s: 3 },
          { t: "42%", l: "52%", s: 2 },
          { t: "85%", l: "40%", s: 2 },
        ].map((p, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-slate-400/30"
            style={{
              top: p.t,
              left: p.l,
              width: p.s,
              height: p.s,
            }}
          />
        ))}
      </div>

      <div className="relative z-[1] mx-auto flex w-full max-w-[1240px] flex-col items-center gap-10 md:gap-12 lg:gap-14">
        <div id="awards-heading">
          <SectionHeading
            eyebrow={eyebrowText}
            title={titleText}
            description={descText}
          />
        </div>

        {/* Awards — 4 cols desktop, 2 tablet, snap carousel mobile */}
        <div className="flex w-full snap-x snap-mandatory gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-2 md:gap-5 md:overflow-visible md:pb-0 lg:grid-cols-4 lg:gap-6 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {awardsList.map((award) => (
            <div
              key={award.id}
              className="w-[82%] min-w-[82%] shrink-0 snap-center sm:w-[70%] sm:min-w-[70%] md:w-auto md:min-w-0 md:shrink"
            >
              <AwardCard award={award} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
