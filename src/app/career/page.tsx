"use client";

import { useState, useRef } from "react";
import Header from "@/components/Header";
import FooterSection from "@/components/FooterSection";
import Link from "next/link";
import {
  Briefcase,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  Users,
  Award,
  TrendingUp,
  ShieldCheck,
  ChevronRight,
  Mail,
  Phone,
  Building2,
  FileText,
  User,
  HeartHandshake,
} from "lucide-react";

const ACCENT = "#00AEEF";
const PRIMARY_NAVY = "#022B52";

const STATS = [
  { value: "26+", label: "Years of Legacy", desc: "Trusted manufacturing since 2000" },
  { value: "5,000+", label: "Channel Partners", desc: "Pan-India dealer & showroom network" },
  { value: "7,000+", label: "Products & SKUs", desc: "PTMT & luxury CP brass fittings" },
  { value: "100%", label: "Merit-Based Growth", desc: "Transparent career advancement" },
];

const VALUES = [
  {
    icon: TrendingUp,
    title: "Accelerated Career Growth",
    description:
      "Merit-based promotions, regular technical workshops, and direct guidance from industry pioneers.",
  },
  {
    icon: Award,
    title: "26+ Years of Stability",
    description:
      "Join one of India's most recognized bath fittings brands with a centralized modern campus in Sahibabad.",
  },
  {
    icon: Users,
    title: "Empowering Work Culture",
    description:
      "An atmosphere of mutual trust, operational freedom, and collaboration where creative ideas become reality.",
  },
  {
    icon: ShieldCheck,
    title: "Competitive Compensation",
    description:
      "Attractive salary packages, performance bonuses, comprehensive family health coverage, and welfare perks.",
  },
];

interface JobOpening {
  id: string;
  title: string;
  department: string;
  category: "sales" | "plant" | "tooling" | "marketing";
  location: string;
  type: string;
  experience: string;
  description: string;
  responsibilities: string[];
}

const OPEN_POSITIONS: JobOpening[] = [
  {
    id: "asm-b2b",
    title: "Area Sales Manager (B2B / Project Sales)",
    department: "Sales & Distribution",
    category: "sales",
    location: "Ghaziabad / Delhi NCR",
    type: "Full Time",
    experience: "3 - 6 Years",
    description:
      "Drive channel partner expansion, build deep relationships with distributors, sanitaryware showrooms, and builders across designated territory.",
    responsibilities: [
      "Expand primary and secondary distributor networks across target territories.",
      "Engage with leading architects, MEP consultants, and builders for project orders.",
      "Achieve monthly and annual sales revenue targets with healthy product mix.",
    ],
  },
  {
    id: "qa-engineer",
    title: "Quality Assurance & Inspection Engineer",
    department: "Manufacturing & QA",
    category: "plant",
    location: "Sahibabad Plant, Ghaziabad",
    type: "Full Time",
    experience: "2 - 5 Years",
    description:
      "Lead dimensional inspection, hydrostatic burst pressure testing, and polymer batch consistency checks across our PTMT and CP faucet lines.",
    responsibilities: [
      "Conduct in-process and final lot inspections under ISO & BIS guidelines.",
      "Perform high-pressure burst and leakage tests on newly assembled taps.",
      "Implement Kaizen and 5S initiatives across injection moulding lines.",
    ],
  },
  {
    id: "tool-specialist",
    title: "Tool & Die Specialist (Polymer Injection Moulding)",
    department: "Tooling & Production",
    category: "tooling",
    location: "Sahibabad Plant, Ghaziabad",
    type: "Full Time",
    experience: "4 - 8 Years",
    description:
      "Expertise in multi-cavity injection moulding tools, mold maintenance, and precision machining for high-grade polymer plumbing components.",
    responsibilities: [
      "Maintain, service, and optimize high-precision multi-cavity moulds.",
      "Troubleshoot tool defects to minimize cycle times and component flash.",
      "Collaborate with R&D team on prototype tooling for new faucet collections.",
    ],
  },
  {
    id: "channel-exec",
    title: "Channel Development Executive",
    department: "Sales & Distribution",
    category: "sales",
    location: "Pan-India (Multiple Regions)",
    type: "Full Time",
    experience: "1 - 4 Years",
    description:
      "Onboard new retail counters, coordinate product sample displays, and manage dealer relationships to boost brand visibility.",
    responsibilities: [
      "Identify high-potential sanitaryware counters and onboard new dealers.",
      "Ensure optimal placement of RN display boards and POS materials.",
      "Conduct dealer meets and collect ground-level market feedback.",
    ],
  },
  {
    id: "digital-marketing",
    title: "Digital Marketing & Brand Communications",
    department: "Marketing",
    category: "marketing",
    location: "Corporate Office, Ghaziabad",
    type: "Full Time",
    experience: "2 - 4 Years",
    description:
      "Manage social media branding, dealer campaign collaterals, performance marketing, and digital catalog discovery across key platforms.",
    responsibilities: [
      "Plan and execute creative digital campaigns highlighting RN product durability.",
      "Coordinate product shoots, 3D render collaterals, and digital brochures.",
      "Monitor SEO, website lead acquisition, and social engagement metrics.",
    ],
  },
];

export default function CareerPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    position: "General Application",
    experience: "1-3 Years",
    location: "",
    resumeLink: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const formRef = useRef<HTMLDivElement>(null);

  const filteredPositions =
    selectedCategory === "all"
      ? OPEN_POSITIONS
      : OPEN_POSITIONS.filter((p) => p.category === selectedCategory);

  const handleApplyClick = (positionTitle: string) => {
    setForm((prev) => ({ ...prev, position: positionTitle }));
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!form.name || !form.email || !form.mobile) {
      setErrorMsg("Please fill out your Name, Email, and Mobile number.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: form.name,
          email: form.email,
          phone: form.mobile,
          profession: form.position,
          address: form.location || "Not specified",
          subject: `Career Application: ${form.position}`,
          message: `Position: ${form.position}\nExperience: ${form.experience}\nCurrent City: ${form.location || "N/A"}\nResume/Link: ${form.resumeLink || "N/A"}\n\nNote:\n${form.message || "Submitted via website career application form."}`,
        }),
      });

      if (res.ok) {
        setSubmitted(true);
        setForm({
          name: "",
          email: "",
          mobile: "",
          position: "General Application",
          experience: "1-3 Years",
          location: "",
          resumeLink: "",
          message: "",
        });
      } else {
        const data = await res.json();
        setErrorMsg(data.error || "Failed to submit application. Please email careers@rnvalves.com.");
      }
    } catch {
      setErrorMsg("Network error. Please email your resume directly to careers@rnvalves.com.");
    } finally {
      setLoading(false);
    }
  };

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

      {/* Embedded pure CSS matching contact-us and certificates patterns */}
      <style>{`
        .career-page-wrap {
          width: 100%;
          max-width: 1280px;
          margin: 0 auto;
          padding: 130px clamp(16px, 5vw, 60px) 80px;
          box-sizing: border-box;
          background: #ffffff;
        }
        @media (max-width: 768px) {
          .career-page-wrap {
            padding: 105px 16px 50px;
          }
        }
        .career-input-wrap {
          position: relative;
          display: flex;
          align-items: stretch;
          width: 100%;
          background: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid #e2e8f0;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .career-input-wrap:focus-within {
          border-color: #00AEEF;
          box-shadow: 0 0 0 3px rgba(0, 174, 239, 0.15);
        }
        .career-input-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          background: #f8fafc;
          border-right: 1px solid #e2e8f0;
          color: #64748b;
          flex-shrink: 0;
        }
        .career-input-field {
          width: 100%;
          padding: 12px 14px;
          border: none;
          outline: none;
          font-size: 14px;
          font-family: inherit;
          color: #0f172a;
          background: #ffffff;
        }
        .career-input-field::placeholder {
          color: #94a3b8;
        }
        .career-textarea-field {
          width: 100%;
          padding: 12px 14px;
          border: none;
          outline: none;
          font-size: 14px;
          font-family: inherit;
          color: #0f172a;
          background: #ffffff;
          resize: vertical;
          min-height: 95px;
        }
        .career-textarea-field::placeholder {
          color: #94a3b8;
        }
        .career-select-field {
          width: 100%;
          padding: 12px 14px;
          border: none;
          outline: none;
          font-size: 14px;
          font-family: inherit;
          color: #0f172a;
          background: #ffffff;
          cursor: pointer;
        }
        .career-card-hover {
          transition: all 0.28s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .career-card-hover:hover {
          transform: translateY(-4px);
          border-color: #00AEEF !important;
          box-shadow: 0 14px 32px -8px rgba(2, 43, 82, 0.12) !important;
        }
        .filter-pill {
          padding: 8px 18px;
          border-radius: 999px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          border: 1px solid #e2e8f0;
          background: #ffffff;
          color: #64748b;
        }
        .filter-pill.active {
          background: #022B52;
          color: #ffffff;
          border-color: #022B52;
          box-shadow: 0 4px 12px rgba(2, 43, 82, 0.2);
        }
        .filter-pill:hover:not(.active) {
          border-color: #00AEEF;
          color: #00AEEF;
        }
      `}</style>

      <div className="career-page-wrap">
        {/* ── Breadcrumb ── */}
        <nav
          aria-label="Breadcrumb"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "13px",
            color: "#888888",
            marginBottom: "28px",
          }}
        >
          <Link href="/" style={{ color: "#888888", textDecoration: "none" }} className="hover:text-slate-900">
            Home
          </Link>
          <ChevronRight size={13} />
          <span style={{ color: "#64748B" }}>Company</span>
          <ChevronRight size={13} />
          <span style={{ color: ACCENT, fontWeight: 600 }}>Career with Us</span>
        </nav>

        {/* ── Header Title & Brand Statement ── */}
        <div style={{ marginBottom: "50px" }}>
          <span
            style={{
              display: "inline-block",
              fontSize: "11px",
              fontWeight: 800,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: ACCENT,
              marginBottom: "10px",
            }}
          >
            Join Our Growing Family
          </span>
          <h1
            style={{
              fontSize: "clamp(32px, 3.8vw, 46px)",
              fontWeight: 800,
              color: "#0F172A",
              margin: "0 0 16px",
              letterSpacing: "-0.03em",
              lineHeight: 1.15,
            }}
          >
            Career with <span style={{ color: ACCENT }}>Us</span>
          </h1>
          <p
            style={{
              fontSize: "clamp(15px, 1.1vw, 16.5px)",
              color: "#475569",
              maxWidth: "920px",
              lineHeight: 1.75,
              margin: "0 0 14px 0",
            }}
          >
            We, at RN Valves, believe in empowering the growth and development of aspiring professionals by providing a workspace full of rewarding opportunities.
          </p>
          <p
            style={{
              fontSize: "clamp(14px, 1vw, 15px)",
              color: "#64748B",
              maxWidth: "920px",
              lineHeight: 1.75,
              margin: 0,
            }}
          >
            We constantly seek aspiring individuals who are looking for the right opportunity to work with full dedication and diligence to contribute to the success of the company. We, on the other hand, offer an environment full of trust and freedom to enhance the capabilities of individuals and help them sharpen their skills with expert guidance.
          </p>
        </div>

        {/* ── Key Company Metrics Bar ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "20px",
            marginBottom: "64px",
            width: "100%",
          }}
        >
          {STATS.map((stat) => (
            <div
              key={stat.label}
              style={{
                background: "#FFFFFF",
                border: "1px solid #E2E8F0",
                borderRadius: "14px",
                padding: "24px 22px",
                boxShadow: "0 2px 6px rgba(0, 0, 0, 0.02)",
                borderTop: `3px solid ${ACCENT}`,
              }}
            >
              <div
                style={{
                  fontSize: "32px",
                  fontWeight: 800,
                  color: PRIMARY_NAVY,
                  letterSpacing: "-0.02em",
                  lineHeight: 1,
                  marginBottom: "8px",
                }}
              >
                {stat.value}
              </div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "#0F172A", marginBottom: "4px" }}>
                {stat.label}
              </div>
              <div style={{ fontSize: "12.5px", color: "#64748B", lineHeight: 1.5 }}>
                {stat.desc}
              </div>
            </div>
          ))}
        </div>

        {/* ── Why Build Your Career at RN Valves ── */}
        <div style={{ marginBottom: "70px" }}>
          <div style={{ marginBottom: "26px" }}>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 800,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: ACCENT,
                display: "block",
                marginBottom: "8px",
              }}
            >
              Workplace Culture &amp; Benefits
            </span>
            <h2
              style={{
                fontSize: "clamp(24px, 2.6vw, 32px)",
                fontWeight: 800,
                color: "#0F172A",
                margin: 0,
                letterSpacing: "-0.02em",
              }}
            >
              Why Build Your Future with RN Valves?
            </h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "24px",
              width: "100%",
            }}
          >
            {VALUES.map((item) => {
              const IconComponent = item.icon;
              return (
                <div
                  key={item.title}
                  className="career-card-hover"
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid #E2E8F0",
                    borderRadius: "16px",
                    padding: "28px 24px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                  }}
                >
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "12px",
                      background: "rgba(0, 174, 239, 0.08)",
                      border: "1px solid rgba(0, 174, 239, 0.18)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: ACCENT,
                      marginBottom: "18px",
                    }}
                  >
                    <IconComponent size={24} strokeWidth={2} />
                  </div>
                  <h3
                    style={{
                      fontSize: "17px",
                      fontWeight: 700,
                      color: "#0F172A",
                      margin: "0 0 10px 0",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {item.title}
                  </h3>
                  <p
                    style={{
                      fontSize: "13.5px",
                      color: "#64748B",
                      lineHeight: 1.65,
                      margin: 0,
                    }}
                  >
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── We Are Hiring (Job Openings) ── */}
        <div style={{ marginBottom: "70px" }}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "flex-end",
              justifyContent: "space-between",
              gap: "16px",
              marginBottom: "26px",
            }}
          >
            <div>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 800,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: ACCENT,
                  display: "block",
                  marginBottom: "8px",
                }}
              >
                Current Openings
              </span>
              <h2
                style={{
                  fontSize: "clamp(24px, 2.6vw, 32px)",
                  fontWeight: 800,
                  color: "#0F172A",
                  margin: 0,
                  letterSpacing: "-0.02em",
                }}
              >
                We Are Hiring
              </h2>
            </div>

            {/* Department Filters */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {[
                { label: "All Roles", value: "all" },
                { label: "Sales & Distribution", value: "sales" },
                { label: "Plant & QA", value: "plant" },
                { label: "Tooling & R&D", value: "tooling" },
                { label: "Marketing", value: "marketing" },
              ].map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setSelectedCategory(tab.value)}
                  className={`filter-pill ${selectedCategory === tab.value ? "active" : ""}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Job Listings Cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: "18px", width: "100%" }}>
            {filteredPositions.map((pos) => (
              <div
                key={pos.id}
                className="career-card-hover"
                style={{
                  background: "#FFFFFF",
                  border: "1px solid #E2E8F0",
                  borderRadius: "16px",
                  padding: "26px 28px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: "20px",
                  }}
                >
                  <div style={{ flex: "1 1 560px", minWidth: 280 }}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "10px" }}>
                      <span
                        style={{
                          fontSize: "11.5px",
                          fontWeight: 700,
                          padding: "4px 10px",
                          borderRadius: "6px",
                          background: "#F1F5F9",
                          color: "#334155",
                        }}
                      >
                        {pos.department}
                      </span>
                      <span
                        style={{
                          fontSize: "11.5px",
                          fontWeight: 700,
                          padding: "4px 10px",
                          borderRadius: "6px",
                          background: "rgba(16, 185, 129, 0.1)",
                          color: "#059669",
                          border: "1px solid rgba(16, 185, 129, 0.2)",
                        }}
                      >
                        {pos.type}
                      </span>
                    </div>

                    <h3
                      style={{
                        fontSize: "19px",
                        fontWeight: 700,
                        color: "#0F172A",
                        margin: "0 0 10px 0",
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {pos.title}
                    </h3>

                    <p style={{ fontSize: "14px", color: "#64748B", lineHeight: 1.65, margin: "0 0 14px 0" }}>
                      {pos.description}
                    </p>

                    {/* Key responsibilities */}
                    <ul style={{ margin: "0 0 16px 0", paddingLeft: "18px", color: "#475569", fontSize: "13px" }}>
                      {pos.responsibilities.map((r, idx) => (
                        <li key={idx} style={{ marginBottom: "5px", lineHeight: 1.5 }}>
                          {r}
                        </li>
                      ))}
                    </ul>

                    {/* Meta tags */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "18px", fontSize: "13px", color: "#64748B" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <MapPin size={15} color={ACCENT} />
                        {pos.location}
                      </span>
                      <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <Briefcase size={15} color={ACCENT} />
                        {pos.experience}
                      </span>
                    </div>
                  </div>

                  {/* Apply Button */}
                  <div style={{ alignSelf: "center" }}>
                    <button
                      type="button"
                      onClick={() => handleApplyClick(pos.title)}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        padding: "12px 24px",
                        background: PRIMARY_NAVY,
                        color: "#FFFFFF",
                        fontSize: "13.5px",
                        fontWeight: 700,
                        borderRadius: "8px",
                        border: "none",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        boxShadow: "0 4px 14px rgba(2, 43, 82, 0.2)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = ACCENT;
                        e.currentTarget.style.boxShadow = "0 6px 18px rgba(0, 174, 239, 0.35)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = PRIMARY_NAVY;
                        e.currentTarget.style.boxShadow = "0 4px 14px rgba(2, 43, 82, 0.2)";
                      }}
                    >
                      Apply for Role
                      <ChevronRight size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Direct Application Form Section ── */}
        <div
          ref={formRef}
          style={{
            background: "#FFFFFF",
            border: "1px solid #E2E8F0",
            borderRadius: "20px",
            padding: "clamp(24px, 4vw, 44px)",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.04)",
            width: "100%",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.2fr 1fr",
              gap: "48px",
              alignItems: "start",
            }}
            className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr]"
          >
            {/* Form Column */}
            <div>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 800,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: ACCENT,
                  display: "block",
                  marginBottom: "8px",
                }}
              >
                Recruitment Application
              </span>
              <h2
                style={{
                  fontSize: "clamp(22px, 2.5vw, 28px)",
                  fontWeight: 800,
                  color: "#0F172A",
                  margin: "0 0 10px 0",
                  letterSpacing: "-0.02em",
                }}
              >
                Submit Your Application
              </h2>
              <p style={{ fontSize: "14px", color: "#64748B", lineHeight: 1.6, margin: "0 0 24px 0" }}>
                Fill out the form below. Our HR recruitment team directly reviews all applications and connects with qualified applicants within 48 business hours.
              </p>

              {submitted ? (
                <div
                  style={{
                    background: "rgba(16, 185, 129, 0.08)",
                    border: "1px solid rgba(16, 185, 129, 0.3)",
                    borderRadius: "12px",
                    padding: "28px",
                    textAlign: "center",
                  }}
                >
                  <CheckCircle2 size={44} color="#059669" style={{ margin: "0 auto 12px" }} />
                  <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#065F46", margin: "0 0 6px 0" }}>
                    Application Submitted Successfully!
                  </h3>
                  <p style={{ fontSize: "14px", color: "#047857", lineHeight: 1.6, margin: 0 }}>
                    Thank you for your interest in joining RN Valves &amp; Faucets. Your profile has been forwarded to our HR talent acquisition team.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {errorMsg && (
                    <div
                      style={{
                        background: "#FEF2F2",
                        border: "1px solid #FCA5A5",
                        color: "#991B1B",
                        fontSize: "13.5px",
                        borderRadius: "8px",
                        padding: "10px 14px",
                      }}
                    >
                      {errorMsg}
                    </div>
                  )}

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }} className="grid grid-cols-1 sm:grid-cols-2">
                    <div>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "6px" }}>
                        Full Name *
                      </label>
                      <div className="career-input-wrap">
                        <div className="career-input-icon">
                          <User size={16} />
                        </div>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Rahul Sharma"
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          className="career-input-field"
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "6px" }}>
                        Email Address *
                      </label>
                      <div className="career-input-wrap">
                        <div className="career-input-icon">
                          <Mail size={16} />
                        </div>
                        <input
                          type="email"
                          required
                          placeholder="e.g. rahul@example.com"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          className="career-input-field"
                        />
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }} className="grid grid-cols-1 sm:grid-cols-2">
                    <div>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "6px" }}>
                        Contact Number *
                      </label>
                      <div className="career-input-wrap">
                        <div className="career-input-icon">
                          <Phone size={16} />
                        </div>
                        <input
                          type="tel"
                          required
                          placeholder="+91 98765 43210"
                          value={form.mobile}
                          onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                          className="career-input-field"
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "6px" }}>
                        Position Applied For
                      </label>
                      <div className="career-input-wrap">
                        <div className="career-input-icon">
                          <Briefcase size={16} />
                        </div>
                        <select
                          value={form.position}
                          onChange={(e) => setForm({ ...form, position: e.target.value })}
                          className="career-select-field"
                        >
                          <option value="General Application">General Application (Any Department)</option>
                          {OPEN_POSITIONS.map((p) => (
                            <option key={p.id} value={p.title}>
                              {p.title}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }} className="grid grid-cols-1 sm:grid-cols-2">
                    <div>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "6px" }}>
                        Total Experience
                      </label>
                      <div className="career-input-wrap">
                        <div className="career-input-icon">
                          <Clock size={16} />
                        </div>
                        <select
                          value={form.experience}
                          onChange={(e) => setForm({ ...form, experience: e.target.value })}
                          className="career-select-field"
                        >
                          <option value="Fresher / < 1 Year">Fresher / &lt; 1 Year</option>
                          <option value="1-3 Years">1 - 3 Years</option>
                          <option value="3-5 Years">3 - 5 Years</option>
                          <option value="5-8 Years">5 - 8 Years</option>
                          <option value="8+ Years">8+ Years Senior Level</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "6px" }}>
                        Current City / Location
                      </label>
                      <div className="career-input-wrap">
                        <div className="career-input-icon">
                          <MapPin size={16} />
                        </div>
                        <input
                          type="text"
                          placeholder="e.g. Delhi NCR, Jaipur, etc."
                          value={form.location}
                          onChange={(e) => setForm({ ...form, location: e.target.value })}
                          className="career-input-field"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "6px" }}>
                      Resume Link / LinkedIn Profile URL
                    </label>
                    <div className="career-input-wrap">
                      <div className="career-input-icon">
                        <FileText size={16} />
                      </div>
                      <input
                        type="url"
                        placeholder="https://drive.google.com/... or LinkedIn URL"
                        value={form.resumeLink}
                        onChange={(e) => setForm({ ...form, resumeLink: e.target.value })}
                        className="career-input-field"
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "6px" }}>
                      Professional Summary / Cover Note
                    </label>
                    <div className="career-input-wrap">
                      <textarea
                        rows={3}
                        placeholder="Briefly describe your key achievements, skills, and why you wish to join RN Valves & Faucets..."
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        className="career-textarea-field"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      padding: "14px 28px",
                      background: `linear-gradient(135deg, ${ACCENT} 0%, #0077B6 100%)`,
                      color: "#FFFFFF",
                      fontSize: "14px",
                      fontWeight: 700,
                      borderRadius: "8px",
                      border: "none",
                      cursor: loading ? "not-allowed" : "pointer",
                      boxShadow: "0 8px 24px -4px rgba(0, 174, 239, 0.35)",
                      transition: "opacity 0.2s ease",
                      marginTop: "8px",
                    }}
                    onMouseEnter={(e) => {
                      if (!loading) e.currentTarget.style.opacity = "0.92";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = "1";
                    }}
                  >
                    <Send size={16} />
                    {loading ? "Submitting Application..." : "Submit Application"}
                  </button>
                </form>
              )}
            </div>

            {/* Sidebar Column */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div
                style={{
                  background: "#F8FAFC",
                  border: "1px solid #E2E8F0",
                  borderRadius: "16px",
                  padding: "28px 24px",
                }}
              >
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 800,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: ACCENT,
                    display: "block",
                    marginBottom: "8px",
                  }}
                >
                  Direct Recruitment Desk
                </span>
                <h3
                  style={{
                    fontSize: "18px",
                    fontWeight: 700,
                    color: "#0F172A",
                    margin: "0 0 14px 0",
                  }}
                >
                  Connect with HR
                </h3>
                <p style={{ fontSize: "13.5px", color: "#64748B", lineHeight: 1.6, margin: "0 0 20px 0" }}>
                  Prefer to email your resume directly? Send your CV along with target designation to our talent acquisition team.
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "8px",
                        background: "#FFFFFF",
                        border: "1px solid #E2E8F0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: ACCENT,
                        flexShrink: 0,
                      }}
                    >
                      <Mail size={16} />
                    </div>
                    <div>
                      <div style={{ fontSize: "12px", color: "#64748B" }}>Careers Email</div>
                      <a
                        href="mailto:careers@rnvalves.com"
                        style={{
                          fontSize: "14px",
                          fontWeight: 700,
                          color: PRIMARY_NAVY,
                          textDecoration: "none",
                        }}
                        className="hover:underline"
                      >
                        careers@rnvalves.com
                      </a>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "8px",
                        background: "#FFFFFF",
                        border: "1px solid #E2E8F0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: ACCENT,
                        flexShrink: 0,
                      }}
                    >
                      <Phone size={16} />
                    </div>
                    <div>
                      <div style={{ fontSize: "12px", color: "#64748B" }}>HR / Toll Free Helpline</div>
                      <a
                        href="tel:1800123400400"
                        style={{
                          fontSize: "14px",
                          fontWeight: 700,
                          color: PRIMARY_NAVY,
                          textDecoration: "none",
                        }}
                        className="hover:underline"
                      >
                        1800 12340 0400
                      </a>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "8px",
                        background: "#FFFFFF",
                        border: "1px solid #E2E8F0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: ACCENT,
                        flexShrink: 0,
                      }}
                    >
                      <Building2 size={16} />
                    </div>
                    <div>
                      <div style={{ fontSize: "12px", color: "#64748B" }}>Works &amp; Head Office</div>
                      <div style={{ fontSize: "13px", fontWeight: 600, color: "#334155", lineHeight: 1.5 }}>
                        B-68 Site-4 Sahibabad Industrial Area, Ghaziabad, UP 201010
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Diversity commitment card */}
              <div
                style={{
                  background: "rgba(0, 174, 239, 0.05)",
                  border: "1px solid rgba(0, 174, 239, 0.2)",
                  borderRadius: "16px",
                  padding: "22px 20px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                  <HeartHandshake size={20} color={ACCENT} />
                  <span style={{ fontSize: "14px", fontWeight: 700, color: PRIMARY_NAVY }}>
                    Equal Opportunity Employer
                  </span>
                </div>
                <p style={{ fontSize: "13px", color: "#475569", lineHeight: 1.6, margin: 0 }}>
                  We evaluate all candidates solely on skill, merit, and integrity, providing an inclusive growth environment for every team member.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <FooterSection />
    </main>
  );
}
