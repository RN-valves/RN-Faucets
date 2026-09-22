"use client";

import { useState } from "react";
import Header from "@/components/Header";
import FooterSection from "@/components/FooterSection";
import PolicySidebar from "@/components/policy/PolicySidebar";
import Link from "next/link";
import {
  ChevronRight,
  HeartHandshake,
  Sparkles,
  Users,
  GraduationCap,
  Globe2,
  ZoomIn,
  X,
  Calendar,
  Layers,
} from "lucide-react";

const EXHIBITION_IMAGES = [
  "https://www.rnvalves.com/uploads/exhibition/1736500463-exhibition-1jpeg.jpeg",
  "https://www.rnvalves.com/uploads/exhibition/1736500538-exhibition-2jpeg.jpeg",
  "https://www.rnvalves.com/uploads/exhibition/1736500551-exhibition-3jpeg.jpeg",
  "https://www.rnvalves.com/uploads/exhibition/1736500561-exhibition-4jpeg.jpeg",
  "https://www.rnvalves.com/uploads/exhibition/1736500570-exhibition-5jpeg.jpeg",
  "https://www.rnvalves.com/uploads/exhibition/1736500586-exhibition-6jpeg.jpeg",
  "https://www.rnvalves.com/uploads/exhibition/1736500597-exhibition-7jpeg.jpeg",
  "https://www.rnvalves.com/uploads/exhibition/1745061610-dsc-00010jpg.JPG",
  "https://www.rnvalves.com/uploads/exhibition/1745061656-dsc-99870jpg.JPG",
  "https://www.rnvalves.com/uploads/exhibition/1745061683-dsc-0025jpg.JPG",
  "https://www.rnvalves.com/uploads/exhibition/1745061699-dsc-00060jpg.JPG",
  "https://www.rnvalves.com/uploads/exhibition/1745061708-dsc-00130jpg.JPG",
  "https://www.rnvalves.com/uploads/exhibition/1745061721-dsc-0034jpg.JPG",
  "https://www.rnvalves.com/uploads/exhibition/1745061729-dsc-0031jpg.JPG",
  "https://www.rnvalves.com/uploads/exhibition/1745061740-dsc-0035jpg.JPG",
  "https://www.rnvalves.com/uploads/exhibition/1745061757-dsc-99410jpg.JPG",
  "https://www.rnvalves.com/uploads/exhibition/1745061776-dsc-99460jpg.JPG",
  "https://www.rnvalves.com/uploads/exhibition/1745061855-dsc-99430jpg.JPG",
  "https://www.rnvalves.com/uploads/exhibition/1745061954-dsc-99480jpg.JPG",
  "https://www.rnvalves.com/uploads/exhibition/1745061984-dsc-99540jpg.JPG",
  "https://www.rnvalves.com/uploads/exhibition/1745062008-dsc-99640jpg.JPG",
  "https://www.rnvalves.com/uploads/exhibition/1745062032-dsc-9989jpg.JPG",
  "https://www.rnvalves.com/uploads/exhibition/1745062060-dsc-99910jpg.JPG",
];

const CSR_PILLARS = [
  {
    title: "Swachh & Swastha Bharat",
    desc: "Promoting hygiene, clean water conservation, and disease prevention through high-grade polymer plumbing accessible to every household.",
    icon: Sparkles,
  },
  {
    title: "Plumber Skill Development",
    desc: "Empowering grassroots plumbing professionals with advanced technical workshops, installation certifications, and safety toolkits.",
    icon: GraduationCap,
  },
  {
    title: "Eco-Friendly Manufacturing",
    desc: "100% recyclable polymer formulations, zero-water-waste closed cooling loops, and high-efficiency low-carbon injection machinery.",
    icon: Globe2,
  },
  {
    title: "Community & Society Upliftment",
    desc: "Partnering with educational and civic initiatives across rural and urban clusters to build sustainable public sanitation.",
    icon: Users,
  },
];

export default function CorporateSocialResponsibilityPage() {
  const [activePhoto, setActivePhoto] = useState<string | null>(null);

  return (
    <div style={{ minHeight: "100vh", background: "#FFFFFF", fontFamily: "'Manrope', 'Poppins', sans-serif" }}>
      <Header />

      <style jsx global>{`
        .policy-page-wrap {
          width: 100vw;
          padding: 130px clamp(16px, 5vw, 80px) 70px;
          box-sizing: border-box;
          background: #ffffff;
        }
        @media (max-width: 768px) {
          .policy-page-wrap {
            padding: 105px 16px 50px;
          }
        }
        .policy-layout-grid {
          display: grid;
          grid-template-columns: 340px 1fr;
          gap: 48px;
          align-items: start;
        }
        @media (max-width: 992px) {
          .policy-layout-grid {
            grid-template-columns: 1fr;
            gap: 32px;
          }
        }
        .gallery-card {
          position: relative;
          border-radius: 12px;
          overflow: hidden;
          background: #F1F5F9;
          aspect-ratio: 4 / 3;
          border: 1px solid #E2E8F0;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .gallery-card:hover {
          transform: translateY(-4px);
          border-color: #00AEEF;
          box-shadow: 0 10px 24px -4px rgba(0, 174, 239, 0.2);
        }
        .gallery-card img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease;
        }
        .gallery-card:hover img {
          transform: scale(1.05);
        }
        .gallery-card .gallery-overlay {
          position: absolute;
          inset: 0;
          background: rgba(2, 43, 82, 0.45);
          backdrop-filter: blur(1.5px);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.2s ease;
          color: #FFFFFF;
        }
        .gallery-card:hover .gallery-overlay {
          opacity: 1;
        }
      `}</style>

      <main className="policy-page-wrap">
        <div style={{ maxWidth: "1280px", margin: "0 auto", width: "100%" }}>
          {/* Breadcrumbs */}
          <nav
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "13px",
              color: "#888888",
              marginBottom: "24px",
            }}
          >
            <Link href="/" style={{ color: "#888888", textDecoration: "none" }}>
              Home
            </Link>
            <ChevronRight size={13} />
            <span style={{ color: "#64748B" }}>Company</span>
            <ChevronRight size={13} />
            <span style={{ color: "#00AEEF", fontWeight: 600 }}>Corporate Social Responsibility</span>
          </nav>

          {/* Page Heading */}
          <div style={{ marginBottom: "36px" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 14px", borderRadius: "999px", background: "rgba(0, 174, 239, 0.1)", color: "#008CC1", fontSize: "12.5px", fontWeight: 600, marginBottom: "12px" }}>
              <HeartHandshake size={13} /> Community Welfare &amp; Sustainable Industry
            </div>
            <h1
              style={{
                fontSize: "clamp(28px, 3.5vw, 40px)",
                fontWeight: 800,
                color: "#0F172A",
                margin: "0 0 10px",
                letterSpacing: "-0.02em",
              }}
            >
              Corporate Social Responsibility (CSR)
            </h1>
            <div
              style={{
                width: "48px",
                height: "3.5px",
                background: "#00AEEF",
                borderRadius: "2px",
                marginBottom: "12px",
              }}
            />
            <p style={{ fontSize: "14.5px", color: "#64748B", margin: 0, maxWidth: "720px" }}>
              We firmly believe in empowering social and economic development through clean water technology, plumber skill training, and environmental stewardship.
            </p>
          </div>

          {/* Main Grid: Sidebar + CSR Content */}
          <div className="policy-layout-grid">
            {/* Sidebar */}
            <div>
              <PolicySidebar />
            </div>

            {/* Content Body */}
            <div>
              {/* Mission Statement Card */}
              <div
                style={{
                  background: "linear-gradient(135deg, #022B52 0%, #034177 100%)",
                  borderRadius: "20px",
                  padding: "clamp(28px, 4vw, 44px)",
                  color: "#FFFFFF",
                  boxShadow: "0 10px 30px -6px rgba(2, 43, 82, 0.25)",
                  marginBottom: "36px",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div style={{ position: "relative", zIndex: 1 }}>
                  <span
                    style={{
                      display: "inline-block",
                      background: "rgba(0, 174, 239, 0.2)",
                      border: "1px solid rgba(0, 174, 239, 0.4)",
                      color: "#38BDF8",
                      fontSize: "12px",
                      fontWeight: 700,
                      padding: "4px 12px",
                      borderRadius: "999px",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      marginBottom: "16px",
                    }}
                  >
                    Vision: Swachh, Swastha Avam Shikshit Bharat
                  </span>
                  <h2
                    style={{
                      fontSize: "clamp(20px, 2.5vw, 26px)",
                      fontWeight: 700,
                      margin: "0 0 16px 0",
                      lineHeight: 1.35,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    Empowering Societal &amp; Environmental Well-being
                  </h2>
                  <p
                    style={{
                      fontSize: "15px",
                      color: "rgba(255, 255, 255, 0.9)",
                      lineHeight: 1.8,
                      margin: "0 0 16px 0",
                    }}
                  >
                    We, at <strong>RN Valves &amp; Faucets</strong>, firmly believe in empowering social and economic development by providing technology and expertise. With our constant efforts in upbringing growth in social responsibilities, we are determined towards the welfare of society and the environment.
                  </p>
                  <p
                    style={{
                      fontSize: "14.5px",
                      color: "rgba(255, 255, 255, 0.8)",
                      lineHeight: 1.75,
                      margin: 0,
                    }}
                  >
                    The RN Valves cluster is a quickly growing multi-diversified Valves and Faucets Manufacturer. Today, it caters to varied socio-economic segments with brands like Precious, Ornate, and CP Fittings, alongside RN Valves within the premium segment. RN Valves cluster is an undisputed leader of the organized marketplace for faucets and valves in India, and one of the quickest growing across the nation. Moving forward with our vision of achieving a <em>&ldquo;Swachh, Swastha Avam Shikshit Bharat&rdquo;</em>, we the family of RN Valves are tenacious towards creating a lasting difference in society.
                  </p>
                </div>
              </div>

              {/* 4 Pillars */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                  gap: "20px",
                  marginBottom: "44px",
                }}
              >
                {CSR_PILLARS.map((pillar, i) => {
                  const Icon = pillar.icon;
                  return (
                    <div
                      key={i}
                      style={{
                        background: "#FFFFFF",
                        border: "1px solid #E2E8F0",
                        borderRadius: "16px",
                        padding: "24px",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.02)",
                      }}
                    >
                      <div
                        style={{
                          width: "38px",
                          height: "38px",
                          borderRadius: "10px",
                          background: "#E0F2FE",
                          color: "#0284C7",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          marginBottom: "14px",
                        }}
                      >
                        <Icon size={20} />
                      </div>
                      <h4
                        style={{
                          margin: "0 0 8px 0",
                          fontSize: "16px",
                          color: "#0F172A",
                          fontWeight: 700,
                        }}
                      >
                        {pillar.title}
                      </h4>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "13.5px",
                          color: "#64748B",
                          lineHeight: 1.6,
                        }}
                      >
                        {pillar.desc}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Exhibitions & Community Events Gallery */}
              <div
                style={{
                  background: "#FFFFFF",
                  border: "1px solid #E2E8F0",
                  borderRadius: "20px",
                  padding: "clamp(24px, 4vw, 36px)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: "20px", color: "#0F172A", fontWeight: 700 }}>
                      Our Successful Exhibitions &amp; Outreach
                    </h3>
                    <p style={{ margin: "4px 0 0 0", fontSize: "13.5px", color: "#64748B" }}>
                      Trade summits, plumber training conventions, and architectural showcases across India
                    </p>
                  </div>
                  <span style={{ fontSize: "12px", fontWeight: 600, color: "#0284C7", background: "#E0F2FE", padding: "4px 12px", borderRadius: "8px" }}>
                    {EXHIBITION_IMAGES.length} Photo Highlights
                  </span>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                    gap: "14px",
                  }}
                >
                  {EXHIBITION_IMAGES.map((imgUrl, idx) => (
                    <div
                      key={idx}
                      className="gallery-card"
                      onClick={() => setActivePhoto(imgUrl)}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imgUrl}
                        alt={`RN Successful Exhibition ${idx + 1}`}
                        loading="lazy"
                      />
                      <div className="gallery-overlay">
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 600 }}>
                          <ZoomIn size={16} /> View
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Lightbox Modal */}
      {activePhoto && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setActivePhoto(null)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(2, 43, 82, 0.9)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              maxWidth: "960px",
              width: "100%",
              maxHeight: "92vh",
              background: "#0F172A",
              borderRadius: "16px",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7)",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 20px",
                background: "rgba(15, 23, 42, 0.9)",
                borderBottom: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <span style={{ fontSize: "13.5px", color: "#E2E8F0", fontWeight: 600 }}>
                RN Valves &amp; Faucets &mdash; Exhibition &amp; CSR Archive
              </span>
              <button
                onClick={() => setActivePhoto(null)}
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  border: "1px solid rgba(255,255,255,0.2)",
                  background: "transparent",
                  color: "#FFFFFF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
                aria-label="Close photo"
              >
                <X size={18} />
              </button>
            </div>

            {/* Photo */}
            <div
              style={{
                padding: "16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                maxHeight: "calc(92vh - 60px)",
                overflow: "hidden",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activePhoto}
                alt="RN Exhibition Full"
                style={{
                  maxWidth: "100%",
                  maxHeight: "80vh",
                  objectFit: "contain",
                  borderRadius: "8px",
                }}
              />
            </div>
          </div>
        </div>
      )}

      <FooterSection />
    </div>
  );
}
