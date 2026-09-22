"use client";

import { useState } from "react";
import Header from "@/components/Header";
import FooterSection from "@/components/FooterSection";
import PolicySidebar from "@/components/policy/PolicySidebar";
import Link from "next/link";
import {
  ChevronRight,
  Award,
  ShieldCheck,
  CheckCircle2,
  ZoomIn,
  X,
  Download,
  ExternalLink,
  Leaf,
  Globe,
  Flame,
} from "lucide-react";

interface CertificateItem {
  id: string;
  title: string;
  badge: string;
  imageUrl: string;
  description: string;
}

const CERTIFICATES: CertificateItem[] = [
  {
    id: "iso-9001",
    title: "ISO 9001:2015 Quality Management",
    badge: "Quality Standard",
    imageUrl: "https://www.rnvalves.com/uploads/certificates/ml-isojfifsi3umy5dycivvkcqzzeacak3bkbutb.jfif",
    description: "Certified Quality Management System covering research, product engineering, precision polymer moulding, and rigorous factory testing.",
  },
  {
    id: "cert-compliance",
    title: "Certificate of Compliance",
    badge: "Official Compliance",
    imageUrl: "https://www.rnvalves.com/uploads/certificates/rn-certificatejfife2s5u2jqyq7dsiiziotidvsiejywze.jfif",
    description: "Conformity to national plumbing apparatus performance criteria, burst pressure threshold, and endurance parameters.",
  },
  {
    id: "green-pro",
    title: "Green Product & Eco Certification",
    badge: "Sustainability",
    imageUrl: "https://www.rnvalves.com/uploads/certificates/rn-greenjfifvzqrcoklevu2bbbyfdymjiwsbo9adb.jfif",
    description: "Certified eco-friendly engineering polymer compounds compliant with GreenPro standards and sustainable resource guidelines.",
  },
  {
    id: "rn-iso-system",
    title: "International Quality Assurance ISO",
    badge: "International Standard",
    imageUrl: "https://www.rnvalves.com/uploads/certificates/rn-isojfifbnyxu2nbvh8yaoqjip7e5p9dae7sng.jfif",
    description: "Enterprise management accreditation guaranteeing continuous production monitoring, hygiene safeguards, and traceable batches.",
  },
];

const CERT_STANDARDS = [
  {
    title: "ISO 9001 & ISO 14001",
    desc: "Quality & Environmental Management Systems ensuring customer satisfaction, operational efficiency, and minimized environmental footprint.",
    icon: ShieldCheck,
  },
  {
    title: "Bureau of Indian Standards (BIS)",
    desc: "Confirms that all valves, faucets, and sanitary fittings satisfy Indian national criteria for safety, pressure load, and longevity.",
    icon: Award,
  },
  {
    title: "CE European Conformity",
    desc: "Certifies alignment with stringent European Economic Area health, environmental protection, and mechanical safety standards.",
    icon: Globe,
  },
  {
    title: "NSF / ANSI Drinking Water Safety",
    desc: "Ensures that all polymer and metallic contact materials releasing water are non-toxic, lead-free, and safe for potable water supply.",
    icon: CheckCircle2,
  },
  {
    title: "Uniform Plumbing Code (UPC)",
    desc: "Plumbing durability and hydraulic performance certification ensuring trouble-free installation across architectural projects.",
    icon: CheckCircle2,
  },
  {
    title: "Green Building (LEED / GreenPro)",
    desc: "Water conservation flow-rates and 100% recyclable engineering polymers contributing valuable credits towards green building projects.",
    icon: Leaf,
  },
];

export default function CertificatesPage() {
  const [selectedCert, setSelectedCert] = useState<CertificateItem | null>(null);

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
        .cert-card {
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 16px;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          display: flex;
          flex-direction: column;
          box-shadow: 0 2px 8px rgba(0,0,0,0.03);
          cursor: pointer;
        }
        .cert-card:hover {
          transform: translateY(-4px);
          border-color: #00AEEF;
          box-shadow: 0 12px 28px -6px rgba(0, 174, 239, 0.18);
        }
        .cert-card:hover .zoom-badge {
          opacity: 1;
          transform: scale(1);
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
            <span style={{ color: "#00AEEF", fontWeight: 600 }}>Our Certification</span>
          </nav>

          {/* Page Heading */}
          <div style={{ marginBottom: "36px" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 14px", borderRadius: "999px", background: "rgba(0, 174, 239, 0.1)", color: "#008CC1", fontSize: "12.5px", fontWeight: 600, marginBottom: "12px" }}>
              <Award size={13} /> Official ISO, BIS &amp; Quality Accreditations
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
              Our Certification
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
              Certifications play an instrumental role in verifying the engineering excellence, non-toxic water purity, and extreme endurance of all RN Valves &amp; Faucets bath fittings.
            </p>
          </div>

          {/* Main Grid: Sidebar + Certificates */}
          <div className="policy-layout-grid">
            {/* Sidebar */}
            <div>
              <PolicySidebar />
            </div>

            {/* Content Body */}
            <div>
              {/* Intro Banner */}
              <div
                style={{
                  background: "linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%)",
                  border: "1px solid #BAE6FD",
                  borderRadius: "16px",
                  padding: "24px 28px",
                  marginBottom: "36px",
                }}
              >
                <h3 style={{ margin: "0 0 10px 0", fontSize: "17px", color: "#0369A1", fontWeight: 700 }}>
                  Quality &amp; Safety Commitment
                </h3>
                <p style={{ margin: 0, fontSize: "14px", color: "#334155", lineHeight: 1.7 }}>
                  RN Valves &amp; Faucets manufactures state-of-the-art polymer taps, brass fittings, overhead showers, and sanitary solutions. Every product is backed by accredited testing to deliver uncompromised quality, zero water leakage, and superior hygiene across Indian and global environments.
                </p>
              </div>

              {/* Certificate Cards Gallery */}
              <div style={{ marginBottom: "44px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                  <div>
                    <h2 style={{ margin: 0, fontSize: "20px", color: "#0F172A", fontWeight: 700 }}>
                      Official Certificates
                    </h2>
                    <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#64748B" }}>
                      Click on any certificate to inspect in high resolution
                    </p>
                  </div>
                  <span style={{ fontSize: "12px", fontWeight: 600, color: "#0284C7", background: "#E0F2FE", padding: "4px 10px", borderRadius: "8px" }}>
                    4 Accreditations Verified
                  </span>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                    gap: "24px",
                  }}
                >
                  {CERTIFICATES.map((cert) => (
                    <div
                      key={cert.id}
                      className="cert-card"
                      onClick={() => setSelectedCert(cert)}
                    >
                      {/* Image container */}
                      <div
                        style={{
                          position: "relative",
                          width: "100%",
                          height: "320px",
                          background: "#F8FAFC",
                          borderBottom: "1px solid #E2E8F0",
                          overflow: "hidden",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: "16px",
                        }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={cert.imageUrl}
                          alt={cert.title}
                          style={{
                            maxWidth: "100%",
                            maxHeight: "100%",
                            objectFit: "contain",
                            borderRadius: "6px",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                          }}
                        />

                        {/* Hover zoom pill */}
                        <div
                          className="zoom-badge"
                          style={{
                            position: "absolute",
                            inset: 0,
                            background: "rgba(2, 43, 82, 0.45)",
                            backdropFilter: "blur(2px)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px",
                            color: "#FFFFFF",
                            fontSize: "13px",
                            fontWeight: 600,
                            opacity: 0,
                            transform: "scale(0.95)",
                            transition: "all 0.25s ease",
                          }}
                        >
                          <ZoomIn size={20} /> Inspect Certificate
                        </div>
                      </div>

                      {/* Info container */}
                      <div style={{ padding: "18px" }}>
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: 700,
                            color: "#0284C7",
                            background: "#F0F9FF",
                            border: "1px solid #BAE6FD",
                            padding: "3px 8px",
                            borderRadius: "6px",
                            textTransform: "uppercase",
                            letterSpacing: "0.04em",
                          }}
                        >
                          {cert.badge}
                        </span>
                        <h4
                          style={{
                            margin: "10px 0 6px 0",
                            fontSize: "15px",
                            fontWeight: 700,
                            color: "#0F172A",
                            lineHeight: 1.35,
                          }}
                        >
                          {cert.title}
                        </h4>
                        <p
                          style={{
                            margin: 0,
                            fontSize: "12.5px",
                            color: "#64748B",
                            lineHeight: 1.5,
                          }}
                        >
                          {cert.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Standard Compliance Highlights */}
              <div
                style={{
                  background: "#FFFFFF",
                  border: "1px solid #E2E8F0",
                  borderRadius: "20px",
                  padding: "clamp(24px, 4vw, 36px)",
                }}
              >
                <h3 style={{ margin: "0 0 8px 0", fontSize: "18px", color: "#0F172A", fontWeight: 700 }}>
                  Standard Technical Standards &amp; Certifications
                </h3>
                <p style={{ margin: "0 0 24px 0", fontSize: "14px", color: "#64748B" }}>
                  Every fitting designed by RN Valves adheres to benchmark Indian and International standard protocols:
                </p>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                    gap: "20px",
                  }}
                >
                  {CERT_STANDARDS.map((std, i) => {
                    const Icon = std.icon;
                    return (
                      <div
                        key={i}
                        style={{
                          background: "#F8FAFC",
                          border: "1px solid #E2E8F0",
                          borderRadius: "14px",
                          padding: "20px",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                          <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "#E0F2FE", color: "#0284C7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <Icon size={18} />
                          </div>
                          <h4 style={{ margin: 0, fontSize: "14.5px", color: "#0F172A", fontWeight: 700 }}>
                            {std.title}
                          </h4>
                        </div>
                        <p style={{ margin: 0, fontSize: "13px", color: "#475569", lineHeight: 1.6 }}>
                          {std.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Lightbox Modal */}
      {selectedCert && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setSelectedCert(null)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(2, 43, 82, 0.88)",
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
              maxWidth: "860px",
              width: "100%",
              maxHeight: "92vh",
              background: "#FFFFFF",
              borderRadius: "20px",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
            }}
          >
            {/* Modal header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px 24px",
                borderBottom: "1px solid #E2E8F0",
                background: "#F8FAFC",
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: "16px", color: "#0F172A", fontWeight: 700 }}>
                  {selectedCert.title}
                </h3>
                <span style={{ fontSize: "12px", color: "#64748B" }}>
                  Official RN Valves &amp; Faucets Accreditation
                </span>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <a
                  href={selectedCert.imageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "6px 12px",
                    borderRadius: "8px",
                    background: "#E0F2FE",
                    color: "#0369A1",
                    fontSize: "12.5px",
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  <ExternalLink size={14} /> Open Original
                </a>
                <button
                  onClick={() => setSelectedCert(null)}
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "8px",
                    border: "1px solid #E2E8F0",
                    background: "#FFFFFF",
                    color: "#64748B",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                  aria-label="Close certificate modal"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal image */}
            <div
              style={{
                padding: "24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflowY: "auto",
                maxHeight: "calc(92vh - 80px)",
                background: "#0F172A",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedCert.imageUrl}
                alt={selectedCert.title}
                style={{
                  maxWidth: "100%",
                  maxHeight: "75vh",
                  objectFit: "contain",
                  borderRadius: "8px",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
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
