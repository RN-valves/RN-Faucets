"use client";

import Header from "@/components/Header";
import FooterSection from "@/components/FooterSection";
import HistoryTimelineSection from "@/components/HistoryTimelineSection";
import NetworkSection from "@/components/network/NetworkSection";
import AwardsSection from "@/components/awards/AwardsSection";

import { useEffect, useState } from "react";
import { getAdminAboutSetting } from "@/utils/adminStore";

const ACCENT = "#00AEEF";

const ABOUT_HERO_IMAGE =
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2400&q=80";

const YOUTUBE_EMBED = "https://www.youtube.com/embed/EV7CsqilJzo";

const COUNTERS = [
  { value: "09", label: "MANUFACTURING PLANTS" },
  { value: "05", label: "DEPOTS" },
  { value: "1,500 ++", label: "CHANNEL PARTNERS" },
] as const;

const MANUFACTURING_FEATURES = [
  "High quality plasticizing capacity, due to specially designed screw barrels, ensuring homogeneity of material.",
  "Precisely controlled processing parameters ensuring consistent quality output.",
  "Higher operating speeds that increase production capacity.",
  "Power-saving measures.",
] as const;

function MissionTargetIcon() {
  return (
    <svg
      width="72"
      height="72"
      viewBox="0 0 72 72"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <circle cx="32" cy="40" r="22" stroke="#3A3A3A" strokeWidth="3.5" />
      <circle cx="32" cy="40" r="14" stroke="#3A3A3A" strokeWidth="3.5" />
      <circle cx="32" cy="40" r="6" stroke={ACCENT} strokeWidth="3.5" />
      <path
        d="M38 34 L58 14"
        stroke={ACCENT}
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <path
        d="M50 14 H58 V22"
        stroke={ACCENT}
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M58 14 L48 18 L54 24 Z" fill={ACCENT} />
    </svg>
  );
}

function CheckIcon() {
  return (
    <span
      style={{
        width: "22px",
        height: "22px",
        minWidth: "22px",
        borderRadius: "999px",
        background: ACCENT,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        marginTop: "2px",
      }}
      aria-hidden
    >
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path
          d="M2.5 6.2 L4.8 8.5 L9.5 3.5"
          stroke="#FFFFFF"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export default function AboutUsPage() {
  const [aboutSetting, setAboutSetting] = useState<any>(null);

  useEffect(() => {
    getAdminAboutSetting().then((data) => {
      if (data) setAboutSetting(data);
    });
  }, []);

  const heroImg = aboutSetting?.hero?.image || ABOUT_HERO_IMAGE;
  const introTitle = aboutSetting?.introVisionMission?.introTitle || "Offering One of the Broadest Ranges of";
  const introAccent = aboutSetting?.introVisionMission?.introAccentText || "Faucets and Plumbing Systems in india.";
  const introDesc = aboutSetting?.introVisionMission?.introDescription || "We are committed towards constant innovations in plumbing, irrigation and sewerage technologies to meet the nation's constantly increasing water demands. RN Valves constantly strives to pave the way for a future that provides clean water for everyone and everywhere; from the smallest villages to the largest cities.";
  const vision = aboutSetting?.introVisionMission?.visionText || "To be an acknowledged leader in Indian plastic Faucets industry by exceeding customers expectations and maximizing bottom line for all our stake holders.";
  const mission = aboutSetting?.introVisionMission?.missionText || "Our mission is to bring a revolution in plastic piping industry through innovative solutions which would create a profitable growth and benefit our customers & the society at large.";
  const mfgStatement = aboutSetting?.manufacturingSection?.statement || "Consistently increasing pan-India distributor base to ensure customer proximity and readiness to address their needs.";
  const mfgCounters = aboutSetting?.manufacturingSection?.counters && aboutSetting.manufacturingSection.counters.length > 0 ? aboutSetting.manufacturingSection.counters : COUNTERS;
  const mfgHeading = aboutSetting?.manufacturingSection?.heading || "State-Of-The-Art. Manufacturing and Operations Excellence.";
  const mfgDesc = aboutSetting?.manufacturingSection?.description || "Our manufacturing framework is built around advanced machinery and computerized injection moulding processes that deliver consistent, high-precision output at scale — so every product meets the same quality standard, every time.";
  const mfgFeatures = aboutSetting?.manufacturingSection?.features && aboutSetting.manufacturingSection.features.length > 0 ? aboutSetting.manufacturingSection.features : MANUFACTURING_FEATURES;
  const youtubeUrl = aboutSetting?.manufacturingSection?.youtubeEmbed || YOUTUBE_EMBED;

  return (
    <main
      style={{
        minHeight: "100vh",
        width: "100%",
        background: "#FFFFFF",
        overflowX: "hidden",
      }}
    >
      <Header />

      {/* Section 1: header + full-bleed hero image */}
      <section
        data-header-theme="dark"
        style={{
          position: "relative",
          width: "100%",
          height: "100vh",
          minHeight: "560px",
          overflow: "hidden",
          background: "#0A1D2D",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={heroImg}
          alt="RN Valves headquarters and manufacturing campus"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center",
            display: "block",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(7,19,29,0.28) 0%, rgba(7,19,29,0.08) 40%, rgba(7,19,29,0.35) 100%)",
            pointerEvents: "none",
          }}
        />
      </section>

      {/* Section 2: full-page Vision / Mission */}
      {aboutSetting?.introVisionMission?.visible !== false && (
        <section
          data-header-theme="light"
          style={{
            background: "#FFFFFF",
            minHeight: "100vh",
            height: "100vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "clamp(40px, 6vh, 72px) clamp(24px, 5vw, 80px)",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              maxWidth: "1180px",
              width: "100%",
              margin: "0 auto",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: "clamp(36px, 5.5vh, 64px)",
              flex: 1,
              minHeight: 0,
            }}
          >
            {/* Intro row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-start">
              <h2
                style={{
                  margin: 0,
                  color: "#111111",
                  fontFamily: "'Manrope', system-ui, sans-serif",
                  fontSize: "clamp(26px, 3.2vw, 40px)",
                  fontWeight: 800,
                  lineHeight: 1.18,
                  letterSpacing: "-0.03em",
                }}
              >
                {introTitle}{" "}
                <span style={{ color: ACCENT }}>
                  {introAccent}
                </span>
              </h2>

              <p
                style={{
                  margin: 0,
                  paddingTop: "6px",
                  color: "#6B6B6B",
                  fontFamily: "'Manrope', system-ui, sans-serif",
                  fontSize: "clamp(14px, 1.1vw, 16px)",
                  fontWeight: 400,
                  lineHeight: 1.75,
                }}
              >
                {introDesc}
              </p>
            </div>

            {/* Vision + Mission row */}
            <div className="grid grid-cols-1 md:grid-cols-2 items-stretch min-h-[280px] flex-1 max-h-[420px]">
              <div
                style={{
                  background: ACCENT,
                  display: "grid",
                  gridTemplateColumns: "72px 1fr",
                  alignItems: "center",
                  height: "100%",
                  minHeight: "260px",
                  padding:
                    "clamp(28px, 4vh, 40px) clamp(28px, 3vw, 44px) clamp(28px, 4vh, 40px) 18px",
                  boxSizing: "border-box",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%",
                  }}
                >
                  <span
                    style={{
                      color: "#FFFFFF",
                      fontFamily: "'Manrope', system-ui, sans-serif",
                      fontSize: "clamp(34px, 3.8vw, 50px)",
                      fontWeight: 800,
                      letterSpacing: "-0.02em",
                      lineHeight: 1,
                      textTransform: "lowercase",
                      writingMode: "vertical-rl",
                      transform: "rotate(180deg)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    vision
                  </span>
                </div>

                <p
                  style={{
                    margin: 0,
                    color: "#FFFFFF",
                    fontFamily: "'Manrope', system-ui, sans-serif",
                    fontSize: "clamp(16px, 1.3vw, 20px)",
                    fontWeight: 700,
                    lineHeight: 1.55,
                    letterSpacing: "-0.015em",
                    maxWidth: "420px",
                  }}
                >
                  {vision}
                </p>
              </div>

              <div
                style={{
                  background: "#FFFFFF",
                  borderRight: `3px solid ${ACCENT}`,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  gap: "16px",
                  padding: "clamp(28px, 4vh, 40px) clamp(28px, 3.5vw, 48px)",
                  boxSizing: "border-box",
                  height: "100%",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "18px",
                  }}
                >
                  <MissionTargetIcon />
                  <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                    <span
                      style={{
                        color: ACCENT,
                        fontFamily: "'Manrope', system-ui, sans-serif",
                        fontSize: "13px",
                        fontWeight: 700,
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        lineHeight: 1,
                      }}
                    >
                      OUR
                    </span>
                    <span
                      style={{
                        color: "#111111",
                        fontFamily: "'Manrope', system-ui, sans-serif",
                        fontSize: "clamp(26px, 2.6vw, 34px)",
                        fontWeight: 800,
                        letterSpacing: "-0.03em",
                        lineHeight: 1.1,
                      }}
                    >
                      Mission
                    </span>
                  </div>
                </div>

                <p
                  style={{
                    margin: 0,
                    color: "#6B6B6B",
                    fontFamily: "'Manrope', system-ui, sans-serif",
                    fontSize: "clamp(14px, 1.1vw, 16px)",
                    fontWeight: 400,
                    lineHeight: 1.75,
                    maxWidth: "460px",
                  }}
                >
                  {mission}
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Section 3: counters + manufacturing excellence + YouTube */}
      {aboutSetting?.manufacturingSection?.visible !== false && (
        <section
          data-header-theme="light"
          style={{
            background: "#FFFFFF",
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "clamp(48px, 7vh, 88px) clamp(24px, 5vw, 80px)",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              maxWidth: "1180px",
              width: "100%",
              margin: "0 auto",
              display: "flex",
              flexDirection: "column",
              gap: "clamp(48px, 7vh, 72px)",
            }}
          >
            {/* Counters block */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "clamp(32px, 5vh, 52px)",
              }}
            >
              <p
                style={{
                  margin: 0,
                  textAlign: "center",
                  color: "#111111",
                  fontFamily: "'Manrope', system-ui, sans-serif",
                  fontSize: "clamp(17px, 1.9vw, 23px)",
                  fontWeight: 700,
                  lineHeight: 1.45,
                  letterSpacing: "-0.02em",
                  maxWidth: "920px",
                }}
              >
                {mfgStatement}
              </p>

              <div
                className="grid grid-cols-1 sm:grid-cols-3"
                style={{
                  width: "100%",
                  maxWidth: "900px",
                  gap: "clamp(24px, 4vw, 40px)",
                }}
              >
                {mfgCounters.map((item: any, i: number) => (
                  <div
                    key={`${item.label}-${i}`}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "10px",
                      textAlign: "center",
                    }}
                  >
                    <span
                      style={{
                        color: "#111111",
                        fontFamily: "'Manrope', system-ui, sans-serif",
                        fontSize: "clamp(40px, 4.5vw, 56px)",
                        fontWeight: 800,
                        lineHeight: 1,
                        letterSpacing: "-0.04em",
                      }}
                    >
                      {item.value}
                    </span>
                    <span
                      style={{
                        color: "#8A8A8A",
                        fontFamily: "'Manrope', system-ui, sans-serif",
                        fontSize: "clamp(11px, 1vw, 13px)",
                        fontWeight: 600,
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        lineHeight: 1.3,
                      }}
                    >
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Manufacturing + video */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
              <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
                <h2
                  style={{
                    margin: 0,
                    fontFamily: "'Manrope', system-ui, sans-serif",
                    fontSize: "clamp(26px, 2.8vw, 36px)",
                    fontWeight: 800,
                    lineHeight: 1.2,
                    letterSpacing: "-0.03em",
                    color: "#111111",
                  }}
                >
                  {mfgHeading}
                </h2>

                <p
                  style={{
                    margin: 0,
                    color: "#6B6B6B",
                    fontFamily: "'Manrope', system-ui, sans-serif",
                    fontSize: "clamp(14px, 1.1vw, 16px)",
                    fontWeight: 400,
                    lineHeight: 1.75,
                  }}
                >
                  {mfgDesc}
                </p>

                <div
                  className="grid grid-cols-1 sm:grid-cols-2"
                  style={{ gap: "18px 22px", marginTop: "6px" }}
                >
                  {mfgFeatures.map((feature: string, i: number) => (
                    <div
                      key={`${feature}-${i}`}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "12px",
                      }}
                    >
                      <CheckIcon />
                      <p
                        style={{
                          margin: 0,
                          color: "#4A4A4A",
                          fontFamily: "'Manrope', system-ui, sans-serif",
                          fontSize: "13.5px",
                          fontWeight: 500,
                          lineHeight: 1.55,
                        }}
                      >
                        {feature}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div
                style={{
                  width: "100%",
                  borderRadius: "12px",
                  overflow: "hidden",
                  background: "#0A1D2D",
                  boxShadow: "0 18px 48px rgba(7, 19, 29, 0.14)",
                  aspectRatio: "16 / 9",
                }}
              >
                <iframe
                  src={youtubeUrl}
                  title="RN Valves manufacturing film"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                  style={{
                    width: "100%",
                    height: "100%",
                    border: "none",
                    display: "block",
                  }}
                />
              </div>
            </div>
          </div>
        </section>
      )}

      <HistoryTimelineSection data={aboutSetting?.timelineSection} />

      <NetworkSection data={aboutSetting?.networkSection} />

      <AwardsSection data={aboutSetting?.awardsSection} />

      <FooterSection />
    </main>
  );
}
