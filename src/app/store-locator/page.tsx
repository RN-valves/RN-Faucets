"use client";

import Link from "next/link";
import Header from "@/components/Header";
import FooterSection from "@/components/FooterSection";
import SupportLinksSection from "@/components/SupportLinksSection";
import {
  MapPin,
  Sparkles,
  Phone,
  MessageCircle,
  Building2,
  Compass,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Clock,
} from "lucide-react";

export default function UserStoreLocatorPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        width: "100%",
        background: "#FFFFFF",
        overflowX: "hidden",
        fontFamily: "'Manrope', system-ui, -apple-system, sans-serif",
      }}
    >
      <Header />

      {/* ── MAIN CONTENT CONTAINER ── */}
      <section
        data-header-theme="light"
        style={{
          width: "100%",
          maxWidth: "1240px",
          margin: "0 auto",
          padding: "140px clamp(20px, 5vw, 80px) 90px",
          boxSizing: "border-box",
        }}
      >
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "13px",
            color: "#888888",
            marginBottom: "32px",
          }}
        >
          <Link href="/" style={{ color: "#888888", textDecoration: "none", transition: "color 0.2s" }} className="hover:text-slate-900">
            Home
          </Link>
          <ChevronRight size={13} />
          <span style={{ color: "#111111", fontWeight: 600 }}>Store Locator</span>
        </nav>

        {/* Header Title Section */}
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          {/* Subtle Category Tag */}
          <span
            style={{
              display: "inline-block",
              fontSize: "11px",
              fontWeight: 800,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#00AEEF",
              marginBottom: "10px",
            }}
          >
            Experience Centres &amp; Partner Network
          </span>

          <h1
            style={{
              fontSize: "clamp(32px, 4vw, 46px)",
              fontWeight: 700,
              color: "#0F172A",
              margin: "0 0 14px",
              letterSpacing: "-0.02em",
              lineHeight: 1.15,
            }}
          >
            Find a Store
          </h1>

          <div
            style={{
              width: "48px",
              height: "3.5px",
              background: "#00AEEF",
              margin: "0 auto 20px",
              borderRadius: "2px",
            }}
          />

          <p
            style={{
              fontSize: "15px",
              color: "#64748B",
              margin: "0 auto",
              maxWidth: "620px",
              lineHeight: 1.7,
            }}
          >
            Experience RN Valves &amp; Faucets in person. Discover full bath concept displays, live water-flow exhibits, and tailored architectural support.
          </p>
        </div>

        {/* ── COMING SOON LUXURY HERO CARD ── */}
        <div
          style={{
            position: "relative",
            background: "linear-gradient(145deg, #091726 0%, #0F2742 55%, #0A1D33 100%)",
            borderRadius: "24px",
            overflow: "hidden",
            padding: "clamp(40px, 6vw, 70px) clamp(24px, 5vw, 60px)",
            color: "#FFFFFF",
            boxShadow: "0 20px 40px -15px rgba(10, 29, 51, 0.25)",
            marginBottom: "50px",
          }}
        >
          {/* Subtle luxury ambient glow effect */}
          <div
            style={{
              position: "absolute",
              top: "-80px",
              right: "-80px",
              width: "280px",
              height: "280px",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(0, 174, 239, 0.25) 0%, rgba(0, 174, 239, 0) 70%)",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "-100px",
              left: "-100px",
              width: "320px",
              height: "320px",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(0, 174, 239, 0.15) 0%, rgba(0, 174, 239, 0) 70%)",
              pointerEvents: "none",
            }}
          />

          <div
            style={{
              position: "relative",
              zIndex: 2,
              maxWidth: "680px",
              margin: "0 auto",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            {/* Sleek Coming Soon Pill */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px 16px",
                borderRadius: "999px",
                background: "rgba(0, 174, 239, 0.12)",
                border: "1px solid rgba(0, 174, 239, 0.35)",
                color: "#38BDF8",
                fontSize: "12px",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: "24px",
              }}
            >
              <Sparkles size={14} className="text-[#38BDF8] animate-pulse" />
              <span>Interactive GPS Locator • Coming Soon</span>
            </div>

            {/* Headline */}
            <h2
              style={{
                fontSize: "clamp(24px, 3.2vw, 36px)",
                fontWeight: 700,
                color: "#FFFFFF",
                letterSpacing: "-0.01em",
                lineHeight: 1.25,
                marginBottom: "16px",
              }}
            >
              Nationwide Store Locator is Underway
            </h2>

            {/* Editorial copy */}
            <p
              style={{
                fontSize: "15px",
                lineHeight: 1.7,
                color: "#94A3B8",
                marginBottom: "32px",
              }}
            >
              We are currently integrating real-time geolocation mapping, live showroom inventory status, and certified dealer contact listings across India.
            </p>

            {/* Quick action buttons */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "center",
                gap: "14px",
                width: "100%",
              }}
            >
              <a
                href="https://wa.me/918737029643?text=Hi%20RN%20Valves,%20please%20help%20me%20find%20an%20authorized%20store%20near%20my%20city."
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  padding: "13px 26px",
                  borderRadius: "10px",
                  background: "#10B981",
                  color: "#FFFFFF",
                  fontWeight: 700,
                  fontSize: "13.5px",
                  textDecoration: "none",
                  boxShadow: "0 8px 20px rgba(16, 185, 129, 0.3)",
                  transition: "all 0.2s ease",
                }}
                className="hover:bg-emerald-600 hover:-translate-y-0.5"
              >
                <MessageCircle size={17} />
                <span>Locate via WhatsApp</span>
              </a>

              <Link
                href="/contact-us"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  padding: "13px 24px",
                  borderRadius: "10px",
                  background: "rgba(255, 255, 255, 0.08)",
                  border: "1px solid rgba(255, 255, 255, 0.18)",
                  color: "#FFFFFF",
                  fontWeight: 600,
                  fontSize: "13.5px",
                  textDecoration: "none",
                  transition: "all 0.2s ease",
                }}
                className="hover:bg-white/15 hover:-translate-y-0.5"
              >
                <span>Speak with Our Team</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>

        {/* ── 3 EDITORIAL LUXURY PILLARS ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "24px",
            marginBottom: "50px",
          }}
        >
          {/* Card 1 */}
          <div
            style={{
              background: "#F8FAFC",
              border: "1px solid #E2E8F0",
              borderRadius: "16px",
              padding: "32px 28px",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
              boxShadow: "0 2px 6px rgba(0, 0, 0, 0.02)",
            }}
          >
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "10px",
                background: "rgba(0, 174, 239, 0.1)",
                color: "#00AEEF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Building2 size={20} />
            </div>
            <h3
              style={{
                fontSize: "18px",
                fontWeight: 700,
                color: "#0F172A",
                margin: 0,
                letterSpacing: "-0.01em",
              }}
            >
              Architectural Showrooms
            </h3>
            <p style={{ fontSize: "14px", color: "#64748B", lineHeight: 1.65, margin: 0 }}>
              Curated display spaces showcasing the entire RN collection of faucets, showers, vanity solutions, and precision health faucets.
            </p>
          </div>

          {/* Card 2 */}
          <div
            style={{
              background: "#F8FAFC",
              border: "1px solid #E2E8F0",
              borderRadius: "16px",
              padding: "32px 28px",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
              boxShadow: "0 2px 6px rgba(0, 0, 0, 0.02)",
            }}
          >
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "10px",
                background: "rgba(0, 174, 239, 0.1)",
                color: "#00AEEF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Compass size={20} />
            </div>
            <h3
              style={{
                fontSize: "18px",
                fontWeight: 700,
                color: "#0F172A",
                margin: 0,
                letterSpacing: "-0.01em",
              }}
            >
              Live Water-Flow Experience
            </h3>
            <p style={{ fontSize: "14px", color: "#64748B", lineHeight: 1.65, margin: 0 }}>
              Test flow dynamics, thermostatic control, water conservation aerators, and touch-feel finish durability before purchasing.
            </p>
          </div>

          {/* Card 3 */}
          <div
            style={{
              background: "#F8FAFC",
              border: "1px solid #E2E8F0",
              borderRadius: "16px",
              padding: "32px 28px",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
              boxShadow: "0 2px 6px rgba(0, 0, 0, 0.02)",
            }}
          >
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "10px",
                background: "rgba(0, 174, 239, 0.1)",
                color: "#00AEEF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ShieldCheck size={20} />
            </div>
            <h3
              style={{
                fontSize: "18px",
                fontWeight: 700,
                color: "#0F172A",
                margin: 0,
                letterSpacing: "-0.01em",
              }}
            >
              Certified Authenticity
            </h3>
            <p style={{ fontSize: "14px", color: "#64748B", lineHeight: 1.65, margin: 0 }}>
              Official brand warranty, genuine spare parts, and direct manufacturer service backing through all authorized retail partners.
            </p>
          </div>
        </div>

        {/* ── CONCIERGE ASSISTANCE STRIP ── */}
        <div
          style={{
            background: "#FFFFFF",
            border: "1px solid #E2E8F0",
            borderRadius: "18px",
            padding: "32px 36px",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "24px",
            boxShadow: "0 4px 14px rgba(0, 0, 0, 0.03)",
          }}
        >
          <div style={{ maxWidth: "560px" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "11px",
                fontWeight: 800,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#00AEEF",
                marginBottom: "6px",
              }}
            >
              <Clock size={13} />
              <span>Immediate Assistance</span>
            </div>
            <h3
              style={{
                fontSize: "20px",
                fontWeight: 700,
                color: "#0F172A",
                margin: "0 0 6px",
                letterSpacing: "-0.01em",
              }}
            >
              Need a store address right now?
            </h3>
            <p style={{ fontSize: "14px", color: "#64748B", lineHeight: 1.6, margin: 0 }}>
              Share your location with our team, and we will direct you to the nearest authorized showroom or dealer counter.
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
            <a
              href="tel:+918737029643"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px 20px",
                borderRadius: "8px",
                background: "#0F172A",
                color: "#FFFFFF",
                fontSize: "13px",
                fontWeight: 600,
                textDecoration: "none",
                transition: "background 0.2s",
              }}
              className="hover:bg-slate-800"
            >
              <Phone size={15} />
              <span>+91 87370 29643</span>
            </a>

            <a
              href="https://wa.me/918737029643?text=Hi%20RN%20Valves,%20please%20share%20the%20nearest%20store%20address%20for%20my%20location."
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px 20px",
                borderRadius: "8px",
                background: "#F1F5F9",
                border: "1px solid #CBD5E1",
                color: "#0F172A",
                fontSize: "13px",
                fontWeight: 600,
                textDecoration: "none",
                transition: "all 0.2s",
              }}
              className="hover:bg-slate-200"
            >
              <MessageCircle size={15} className="text-emerald-600" />
              <span>Chat on WhatsApp</span>
            </a>
          </div>
        </div>
      </section>

      <SupportLinksSection />
      <FooterSection />
    </main>
  );
}
