"use client";

import Header from "@/components/Header";
import FooterSection from "@/components/FooterSection";
import PolicySidebar from "@/components/policy/PolicySidebar";
import Link from "next/link";
import {
  ChevronRight,
  ShieldCheck,
  Download,
  FileText,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  Wrench,
  Sparkles,
  PhoneCall,
  MessageCircle,
  Mail,
  MapPin,
  Globe,
  ClipboardCheck,
} from "lucide-react";

const WARRANTY_PDF_URL = "/documents/RN_CP_Fittings_Warranty_Policy.pdf";
const WARRANTY_PDF_FILENAME = "RN_CP_Fittings_Warranty_Policy_Effective_01_Oct_2026_v1.1.pdf";

const WARRANTY_PERIOD_GROUPS = [
  {
    group: "FAUCETS AND MIXERS",
    rows: [
      { item: "Body of CP faucets (brass)", residential: "10 years", commercial: "5 years" },
      { item: "Chrome finish*", residential: "10 years", commercial: "5 years" },
      { item: "Coloured / non-chrome finishes", residential: "2 years", commercial: "1 year" },
      { item: "Single-lever mixer body", residential: "10 years", commercial: "3 years" },
      { item: "Pressmatic faucet body", residential: "10 years", commercial: "3 years" },
      { item: "Sensor faucet body", residential: "5 years", commercial: "1 year" },
      { item: "Sensor internal / electronic parts", residential: "Nil", commercial: "Nil" },
      { item: "Project CP faucets**", residential: "2 years", commercial: "1 year" },
    ],
  },
  {
    group: "CARTRIDGES",
    rows: [
      { item: "Standard cartridge / internal mechanism***", residential: "10 years", commercial: "3 years" },
      { item: "Single-lever mixer cartridge", residential: "10 years", commercial: "2 years" },
      { item: "Diverter cartridge", residential: "10 years", commercial: "2 years" },
    ],
  },
  {
    group: "VALVES",
    rows: [
      { item: "Forged brass valves", residential: "7 years", commercial: "7 years" },
      { item: "Project angle valves (brass)", residential: "2 years", commercial: "1 year" },
      { item: "Metropole flush valve", residential: "2 years", commercial: "1 year" },
    ],
  },
  {
    group: "SHOWERS",
    rows: [
      { item: "SS or brass overhead / rain / hand shower‡", residential: "2 years", commercial: "2 years" },
      { item: "ABS/PTMT overhead / rain / hand shower", residential: "2 years", commercial: "1 year" },
      { item: "Shower arms", residential: "5 years", commercial: "5 years" },
    ],
  },
  {
    group: "HEALTH FAUCETS",
    rows: [
      { item: "PTMT health faucet", residential: "3 years", commercial: "1 year" },
      { item: "ABS chrome-plated health faucet", residential: "2 years", commercial: "1 year" },
    ],
  },
  {
    group: "ACCESSORIES AND CONNECTIONS",
    rows: [
      { item: "CP accessories (holders, etc.)", residential: "2 years", commercial: "1 year" },
      { item: "Flexible hoses and pipes", residential: "2 years", commercial: "1 year" },
      { item: "Connection tubes", residential: "2 years", commercial: "1 year" },
    ],
  },
  {
    group: "CONSUMABLES",
    rows: [
      {
        item: "Washers, aerators, O-rings, rubber/plastic parts, batteries, spares and other consumables",
        residential: "Nil",
        commercial: "Nil",
      },
    ],
  },
];

const OPERATING_LIMITS = [
  { group: "CP faucets, mixers and cartridges", maxPressure: "5 bar", maxTemp: "80°C" },
  { group: "Forged brass valves (PN40 rated)", maxPressure: "40 bar", maxTemp: "90°C" },
  { group: "Project angle valves (brass)", maxPressure: "16 bar", maxTemp: "90°C" },
  { group: "Metropole flush valve", maxPressure: "8 bar", maxTemp: "5–45°C" },
  { group: "Showers, shower arms and health faucets", maxPressure: "5 bar", maxTemp: "60°C" },
  { group: "Flexible hoses, pipes and connection tubes", maxPressure: "10 bar", maxTemp: "90°C" },
];

export default function WarrantyPolicyPage() {
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
        .legal-prose h2, .legal-prose h3, .legal-prose h4 {
          color: #0F172A;
          font-weight: 700;
          letter-spacing: -0.01em;
          margin-top: 32px;
          margin-bottom: 12px;
        }
        .legal-prose h2 {
          font-size: 21px;
          color: #063963;
          border-bottom: 1.5px solid #E2E8F0;
          padding-bottom: 10px;
        }
        .legal-prose h3 {
          font-size: 16.5px;
          color: #0077B6;
          margin-top: 22px;
          margin-bottom: 10px;
        }
        .legal-prose p {
          font-size: 14.5px;
          color: #334155;
          line-height: 1.78;
          margin-bottom: 14px;
        }
        .legal-prose ul, .legal-prose ol {
          margin-bottom: 18px;
          padding-left: 22px;
        }
        .legal-prose li {
          font-size: 14px;
          color: #334155;
          line-height: 1.72;
          margin-bottom: 7px;
        }
        .legal-prose a {
          color: #0284C7;
          text-decoration: underline;
          text-underline-offset: 3px;
        }
        .warranty-table-wrap {
          width: 100%;
          overflow-x: auto;
          border: 1px solid #CBD5E1;
          border-radius: 12px;
          margin: 18px 0;
        }
        .warranty-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 560px;
          font-size: 13.5px;
        }
        .warranty-table th {
          background: #063963;
          color: #FFFFFF;
          font-weight: 700;
          padding: 12px 16px;
          text-align: left;
        }
        .warranty-table td {
          padding: 10px 16px;
          border-bottom: 1px solid #E2E8F0;
          color: #1E293B;
        }
        .warranty-table tr:last-child td {
          border-bottom: none;
        }
        .warranty-group-row td {
          background: #E0F2FE;
          color: #0077B6;
          font-weight: 800;
          font-size: 12.5px;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          padding: 9px 16px;
        }
        .warranty-callout-row {
          display: grid;
          grid-template-columns: 160px 1fr;
          border: 1px solid #063963;
          border-radius: 10px;
          overflow: hidden;
          margin-bottom: 16px;
        }
        @media (max-width: 640px) {
          .warranty-callout-row {
            grid-template-columns: 1fr;
          }
        }
        .toc-card {
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          border-radius: 14px;
          padding: 22px 26px;
          margin: 24px 0;
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
            <span style={{ color: "#64748B" }}>Policies</span>
            <ChevronRight size={13} />
            <span style={{ color: "#00AEEF", fontWeight: 600 }}>Warranty Policy</span>
          </nav>

          {/* Page Heading + Top PDF Download Actions */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "flex-end",
              justifyContent: "space-between",
              gap: "24px",
              marginBottom: "36px",
            }}
          >
            <div style={{ maxWidth: "720px" }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "6px 14px",
                  borderRadius: "999px",
                  background: "rgba(0, 174, 239, 0.1)",
                  color: "#008CC1",
                  fontSize: "12.5px",
                  fontWeight: 600,
                  marginBottom: "12px",
                }}
              >
                <ShieldCheck size={14} /> Official CP Fittings Warranty Policy (Version 1.1 — Oct 2026)
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
                CP Fittings Warranty Policy
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
              <p style={{ fontSize: "14.5px", color: "#64748B", margin: 0 }}>
                Manufacturing-defect coverage, service terms, operating limits, and product-care requirements for RN Valves &amp; Faucets.
              </p>
            </div>

            {/* Primary Download & View PDF Action Buttons */}
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "12px" }}>
              <a
                href={WARRANTY_PDF_URL}
                download={WARRANTY_PDF_FILENAME}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "13px 22px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #022B52 0%, #0077B6 100%)",
                  color: "#FFFFFF",
                  fontSize: "14px",
                  fontWeight: 700,
                  textDecoration: "none",
                  boxShadow: "0 10px 24px -6px rgba(0, 119, 182, 0.35)",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                }}
              >
                <Download size={17} />
                <span>Download Warranty PDF</span>
              </a>

              <a
                href={WARRANTY_PDF_URL}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "13px 18px",
                  borderRadius: "12px",
                  background: "#F8FAFC",
                  border: "1px solid #CBD5E1",
                  color: "#0F172A",
                  fontSize: "14px",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                <ExternalLink size={16} color="#0284C7" />
                <span>View PDF (7 Pages)</span>
              </a>
            </div>
          </div>

          {/* Main Grid: Sidebar + Policy Content */}
          <div className="policy-layout-grid">
            {/* Sidebar */}
            <div>
              <PolicySidebar />
            </div>

            {/* Content Body */}
            <article
              style={{
                background: "#FFFFFF",
                border: "1px solid #E2E8F0",
                borderRadius: "20px",
                padding: "clamp(24px, 4vw, 44px)",
                boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
              }}
              className="legal-prose"
            >
              {/* Official Document Header Banner */}
              <div
                style={{
                  background: "linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%)",
                  border: "1px solid #BAE6FD",
                  borderRadius: "16px",
                  padding: "22px 26px",
                  marginBottom: "24px",
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "16px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "12px",
                      background: "#063963",
                      color: "#FFFFFF",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <FileText size={24} />
                  </div>
                  <div>
                    <div style={{ fontSize: "15.5px", fontWeight: 800, color: "#063963" }}>
                      Official Warranty Policy Booklet (PDF)
                    </div>
                    <div style={{ fontSize: "13px", color: "#334155", marginTop: "2px" }}>
                      Version 1.1 • Effective 01 October 2026 • 7 Pages • Issued by RN Faucets Private Limited
                    </div>
                  </div>
                </div>
                <a
                  href={WARRANTY_PDF_URL}
                  download={WARRANTY_PDF_FILENAME}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "10px 18px",
                    borderRadius: "10px",
                    background: "#063963",
                    color: "#FFFFFF",
                    fontSize: "13px",
                    fontWeight: 700,
                    textDecoration: "none",
                  }}
                >
                  <Download size={15} /> Download Official PDF
                </a>
              </div>

              {/* Policy Metadata 2x2 Grid (From Page 1) */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                  border: "1.5px solid #063963",
                  borderRadius: "12px",
                  overflow: "hidden",
                  background: "#EBF5FB",
                  marginBottom: "22px",
                }}
              >
                <div style={{ padding: "16px 20px", borderBottom: "1px solid #CBD5E1", borderRight: "1px solid #CBD5E1" }}>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: "#0F172A", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    Issued by
                  </div>
                  <div style={{ fontSize: "14.5px", fontWeight: 600, color: "#1E293B", marginTop: "4px" }}>
                    RN Faucets Private Limited
                  </div>
                </div>
                <div style={{ padding: "16px 20px", borderBottom: "1px solid #CBD5E1" }}>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: "#0F172A", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    Effective from
                  </div>
                  <div style={{ fontSize: "14.5px", fontWeight: 600, color: "#1E293B", marginTop: "4px" }}>
                    01 October 2026
                  </div>
                </div>
                <div style={{ padding: "16px 20px", borderRight: "1px solid #CBD5E1" }}>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: "#0F172A", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    Applies to
                  </div>
                  <div style={{ fontSize: "14.5px", fontWeight: 600, color: "#1E293B", marginTop: "4px" }}>
                    Eligible RN CP fittings and listed products
                  </div>
                </div>
                <div style={{ padding: "16px 20px" }}>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: "#0F172A", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    Policy version
                  </div>
                  <div style={{ fontSize: "14.5px", fontWeight: 600, color: "#1E293B", marginTop: "4px" }}>
                    Version 1.1 - October 2026
                  </div>
                </div>
              </div>

              {/* VALIDITY & IMPORTANT Boxes (From Page 1) */}
              <div className="warranty-callout-row">
                <div
                  style={{
                    background: "#063963",
                    color: "#FFFFFF",
                    fontWeight: 800,
                    fontSize: "14px",
                    letterSpacing: "0.04em",
                    display: "flex",
                    alignItems: "center",
                    padding: "18px 20px",
                  }}
                >
                  VALIDITY
                </div>
                <div style={{ background: "#EBF5FB", padding: "16px 20px", fontSize: "14px", color: "#0F172A", lineHeight: 1.65 }}>
                  This warranty is valid only for products listed in the <strong>RN Price List, Version 3.6, dated 15 May 2026</strong>, and:
                  <ul style={{ margin: "6px 0 0", paddingLeft: "18px" }}>
                    <li style={{ marginBottom: "4px" }}>
                      <strong>End consumers:</strong> products purchased on or after 01 October 2026.
                    </li>
                    <li style={{ marginBottom: 0 }}>
                      <strong>Distributors, dealers, direct dealers and retailers:</strong> products purchased from RN on or after 01 July 2026.
                    </li>
                  </ul>
                </div>
              </div>

              <div className="warranty-callout-row">
                <div
                  style={{
                    background: "#063963",
                    color: "#FFFFFF",
                    fontWeight: 800,
                    fontSize: "14px",
                    letterSpacing: "0.04em",
                    display: "flex",
                    alignItems: "center",
                    padding: "18px 20px",
                  }}
                >
                  IMPORTANT
                </div>
                <div style={{ background: "#EBF5FB", padding: "16px 20px", fontSize: "14px", color: "#0F172A", lineHeight: 1.65 }}>
                  This is a limited warranty against manufacturing defects. Coverage is subject to proof of purchase, proper installation, normal use within the stated operating limits, maintenance requirements and the exclusions in this policy. Statutory consumer rights remain unaffected.
                </div>
              </div>

              {/* Table of Contents */}
              <div className="toc-card">
                <h4 style={{ margin: "0 0 12px 0", fontSize: "15px", color: "#0F172A" }}>Table of Contents</h4>
                <ol style={{ margin: 0, paddingLeft: "20px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "6px 24px" }}>
                  <li><a href="#policy-scope">Policy Scope</a></li>
                  <li><a href="#section-1">1. Warranty Period by Product &amp; Operating Limits</a></li>
                  <li><a href="#section-2">2. RN Value-Added Services</a></li>
                  <li><a href="#section-3">3. Warranty Registration</a></li>
                  <li><a href="#section-4">4. Warranty Terms and Conditions</a></li>
                  <li><a href="#section-5">5. Warranty Exclusions</a></li>
                  <li><a href="#section-6">6. Maintenance Guidelines</a></li>
                  <li><a href="#section-7">7. Installation Guidelines</a></li>
                  <li><a href="#section-8">8. Customer Care and Claim Checklist</a></li>
                </ol>
              </div>

              {/* Policy Scope (Page 2) */}
              <h2 id="policy-scope">Policy Scope</h2>
              <p>
                RN Valves &amp; Faucets warrants eligible products against manufacturing defects in material and workmanship under normal use, for the periods stated below. “CP faucets” include pillar cocks, bib cocks, sink cocks, swan-neck faucets, basin mixers, wall mixers, single-lever mixers, diverters and angle valves.
              </p>
              <p>
                This policy applies to products listed in the RN Price List, Version 3.6, dated 15 May 2026, purchased by end consumers on or after 01 October 2026, or purchased from RN by distributors, dealers, direct dealers and retailers on or after 01 July 2026. It covers CP products and only the showers and health faucets expressly listed below. Other PTMT ranges remain subject to their separate warranty terms.
              </p>

              {/* 1. Warranty Period by Product (Page 2) */}
              <h2 id="section-1">1. Warranty Period by Product<sup>†</sup></h2>
              <div className="warranty-table-wrap">
                <table className="warranty-table">
                  <thead>
                    <tr>
                      <th style={{ width: "56%" }}>Product / part</th>
                      <th style={{ width: "22%", textAlign: "center" }}>Residential</th>
                      <th style={{ width: "22%", textAlign: "center" }}>Commercial</th>
                    </tr>
                  </thead>
                  <tbody>
                    {WARRANTY_PERIOD_GROUPS.map((group) => (
                      <>
                        <tr key={group.group} className="warranty-group-row">
                          <td colSpan={3}>{group.group}</td>
                        </tr>
                        {group.rows.map((row) => (
                          <tr key={row.item}>
                            <td style={{ fontWeight: 500 }}>{row.item}</td>
                            <td style={{ textAlign: "center", fontWeight: 600 }}>{row.residential}</td>
                            <td style={{ textAlign: "center", fontWeight: 600 }}>{row.commercial}</td>
                          </tr>
                        ))}
                      </>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Footnotes from Page 2 & Page 3 */}
              <div
                style={{
                  background: "#F8FAFC",
                  border: "1px solid #E2E8F0",
                  borderRadius: "12px",
                  padding: "16px 20px",
                  fontSize: "13px",
                  color: "#475569",
                  lineHeight: 1.65,
                  marginBottom: "24px",
                }}
              >
                <p style={{ margin: "0 0 8px", fontSize: "13px" }}>
                  <strong>*</strong> Chrome-finish coverage applies only to proven manufacturing defects in plating, such as abnormal peeling or blistering under normal use. It does not cover water spots, scaling, scratching, normal fading, chemical attack or corrosion caused by site conditions.
                </p>
                <p style={{ margin: "0 0 8px", fontSize: "13px" }}>
                  <strong>**</strong> A written project quotation, purchase order or warranty schedule will prevail if it expressly states different project-specific terms.
                </p>
                <p style={{ margin: "0 0 8px", fontSize: "13px" }}>
                  <strong>***</strong> Applies to standard cartridges of CP faucets, other than the separately listed single-lever and diverter cartridges. Pressmatic faucet cartridges are covered for 2 years (residential) and 1 year (commercial).
                </p>
                <p style={{ margin: 0, fontSize: "13px" }}>
                  <strong>‡</strong> SS or brass showers are guaranteed against manufacturing defects only. Rust, corrosion or discolouration is not covered.
                </p>
              </div>

              {/* Operating Limits Table (Page 3) */}
              <h3>† Operating Limits</h3>
              <p>
                The warranty applies only when products are used within the following limits. <strong>Recommended water quality: TDS 100–300 ppm.</strong>
              </p>
              <div className="warranty-table-wrap">
                <table className="warranty-table">
                  <thead>
                    <tr>
                      <th style={{ width: "52%" }}>Product group</th>
                      <th style={{ width: "24%", textAlign: "center" }}>Max. pressure</th>
                      <th style={{ width: "24%", textAlign: "center" }}>Max. water temperature</th>
                    </tr>
                  </thead>
                  <tbody>
                    {OPERATING_LIMITS.map((row) => (
                      <tr key={row.group}>
                        <td style={{ fontWeight: 500 }}>{row.group}</td>
                        <td style={{ textAlign: "center", fontWeight: 600 }}>{row.maxPressure}</td>
                        <td style={{ textAlign: "center", fontWeight: 600 }}>{row.maxTemp}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 2. RN Value-Added Services (Page 3) */}
              <h2 id="section-2">2. RN Value-Added Services</h2>
              <ol>
                <li>
                  Pre- and post-installation guidance from RN specialists through “Talk to an Expert” on{" "}
                  <a href="https://www.rnvalves.com" target="_blank" rel="noopener noreferrer">
                    www.rnvalves.com
                  </a>{" "}
                  or customer care.
                </li>
                <li>
                  Genuine RN replacement handles and spare parts available through authorised dealers and distributors, subject to availability.
                </li>
                <li>
                  Plumber training on correct installation of RN CP fittings, on request or as published on the website.
                </li>
              </ol>

              {/* 3. Warranty Registration (Page 3) */}
              <h2 id="section-3">3. Warranty Registration</h2>
              <ol>
                <li>
                  Customers can register the warranty on the <strong>RN Faucets</strong> mobile app within <strong>45 days</strong> of the purchase date. Registration helps RN process claims faster.
                </li>
                <li>
                  To register, upload a valid GST invoice/purchase bill, product details and product code. RN may request photographs of the product and installation.
                </li>
                <li>
                  Registration does not itself confirm claim eligibility; every claim remains subject to inspection and this policy.
                </li>
                <li>
                  Quote the registration confirmation from the app when raising a claim.
                </li>
              </ol>

              {/* 4. Warranty Terms and Conditions (Pages 3, 4, 5) */}
              <h2 id="section-4">4. Warranty Terms and Conditions</h2>

              <h3>Coverage</h3>
              <ol>
                <li>
                  Coverage is limited to manufacturing defects in material and workmanship under normal use and applies for the periods in Section 1.
                </li>
                <li>
                  Performance defects are covered. Cosmetic conditions are covered only where the relevant finish warranty expressly applies and a manufacturing defect is established.
                </li>
                <li>
                  Commercial use includes hotels, offices, hospitals, institutions, restaurants, public facilities, rental/common areas and other non-household or high-frequency use.
                </li>
                <li>
                  The product must have been purchased from RN directly or from an authorised RN dealer/distributor.
                </li>
                <li>
                  Bulk and project orders may carry separate written terms communicated with the quotation, purchase order or invoice; those terms prevail only to the extent of a clear inconsistency.
                </li>
                <li>
                  The warranty is void if the original product identification label or code has been removed, altered or tampered with.
                </li>
              </ol>

              <h3>How to Claim</h3>
              <ol>
                <li>
                  Raise the claim through the selling authorised dealer/distributor or RN customer care at{" "}
                  <a href="tel:9891201208">98912 01208</a>.
                </li>
                <li>
                  Provide the original GST invoice/purchase bill, completed dealer-stamped warranty card where issued, RN Faucets app registration details, product code, photographs/video and complaint description.
                </li>
                <li>
                  The defective product or part and installation site must be made available to authorised service personnel.
                </li>
                <li>
                  RN may inspect or test the product, installation, water conditions and connected plumbing before deciding the claim. Where relevant, the customer may be asked to provide or permit a water-quality/pressure test.
                </li>
                <li>
                  A complaint number should be obtained and quoted in all follow-up. RN will communicate the next action after receiving the required information; actual resolution time may depend on inspection, location and spare availability.
                </li>
              </ol>

              <h3>Repair and Replacement</h3>
              <ol>
                <li>
                  RN will decide, after inspection, whether the defect is covered and whether repair or replacement is appropriate.
                </li>
                <li>
                  For an accepted claim, the covered replacement part and authorised repair are free, subject to the service-charge rules below.
                </li>
                <li>
                  If the same model or finish is unavailable, RN may offer an equivalent model or finish. Any customer-requested upgrade or price difference is payable by the customer.
                </li>
                <li>
                  Replaced parts/products become RN property. The customer must return the defective item as directed.
                </li>
                <li>
                  A product replacement will ordinarily be collected from the selling dealer or another dealer/service point assigned by RN, unless RN confirms another arrangement.
                </li>
              </ol>

              <h3>Service Charges</h3>
              <ol>
                <li>
                  From the fourth year after purchase, technician visits are chargeable. Covered warranty parts remain free for the full warranty period.
                </li>
                <li>
                  If, on inspection, the product is found to be working correctly, or the problem is caused by something other than a manufacturing defect in the RN product (such as plumbing, water pressure, water quality, installation, other fittings or misuse), the customer must pay the applicable service visit and inspection charges, even within the warranty period.
                </li>
                <li>
                  RN will not carry out repairs for problems not caused by a manufacturing defect in the RN product. The service visit charge remains payable by the customer for the visit made.
                </li>
                <li>
                  New-product installation, removal, re-installation, masonry and civil work are not included.
                </li>
                <li>
                  No charge will be made for a covered replacement part itself. Taxes or statutory levies are payable only where legally required or where the customer chooses a chargeable upgrade/non-warranty part.
                </li>
              </ol>

              <h3>Warranty Period Rules</h3>
              <ol>
                <li>The warranty starts on the invoice date, even if installation occurs later.</li>
                <li>
                  Repair or replacement does not restart or extend the warranty; cover continues for the unexpired original period.
                </li>
                <li>Repair, transit and non-use time are not added to the warranty period.</li>
              </ol>

              <h3>Limitation of Liability</h3>
              <ol>
                <li>
                  The warranty does not cover installation, removal, re-installation, labour, civil, masonry, tile or finishing costs unless RN expressly approves otherwise in writing.
                </li>
                <li>
                  To the extent permitted by applicable law, RN is not liable for indirect, incidental or consequential loss, including damage caused by leakage to property.
                </li>
                <li>
                  RN’s aggregate contractual liability is limited to the original purchase price of the affected product.
                </li>
                <li>
                  The contractual remedy is repair or replacement, subject always to non-excludable rights under applicable law.
                </li>
                <li>
                  RN is not responsible for reasonable delay caused by inspection requirements, transport constraints or temporary non-availability of parts/products.
                </li>
              </ol>

              <h3>General</h3>
              <ol>
                <li>
                  This document is RN’s written contractual warranty for the covered products. Verbal promises by a dealer, distributor or employee are not binding.
                </li>
                <li>
                  No dealer, distributor or employee may vary these terms or make additional commitments unless authorised by RN in writing.
                </li>
                <li>
                  Fraudulent, altered or duplicate documents, false claims or deliberate concealment may result in rejection of the claim.
                </li>
                <li>
                  Information submitted for registration, claims or service may be used to validate the claim, contact the customer, arrange service and maintain warranty records in accordance with applicable law.
                </li>
                <li>
                  RN may revise warranty terms prospectively. The terms applicable on the product’s invoice date will govern that purchase, unless a later change is more favourable to the customer.
                </li>
                <li>
                  Nothing in this policy limits rights available under the Consumer Protection Act, 2019 or other applicable law.
                </li>
                <li>
                  The laws of India apply. Subject to applicable consumer law and the jurisdiction available to consumers under it, other disputes are subject to the courts of Delhi.
                </li>
              </ol>

              {/* 5. Warranty Exclusions (Page 5) */}
              <h2 id="section-5">5. Warranty Exclusions</h2>

              <h3>Water and Site Conditions</h3>
              <ol>
                <li>Scale build-up caused by hard water.</li>
                <li>Sand, rust, debris, excessive TDS or other impurities in the water supply.</li>
                <li>Cartridge damage where no suitable in-line or tank-outlet filter is installed.</li>
                <li>Water pressure or temperature outside the operating limits in Section 1 (†), or water hammer.</li>
                <li>Corrosion caused by sewer gases, salt-based water softeners or incompatible chemicals.</li>
                <li>Damage caused by the product remaining unused for more than 6 months.</li>
                <li>Coastal-air surface damage where the product is not cleaned and dried regularly.</li>
              </ol>

              <h3>Installation and Handling</h3>
              <ol>
                <li>Installation contrary to RN instructions or applicable plumbing practice.</li>
                <li>Installation by an untrained person or poor plumbing workmanship.</li>
                <li>Repair, alteration or modification by a person not authorised by RN.</li>
                <li>Tampering, misuse, abuse, impact or physical breakage.</li>
                <li>Damage during transport, storage, construction, shifting or customer handling after delivery.</li>
                <li>Use of non-RN, incompatible or non-standard connecting parts, hoses, angle valves, sealants or tools.</li>
                <li>Defects caused by masonry, civil, plumbing, electrical or waterproofing work.</li>
              </ol>

              <h3>Cleaning, Finish and Wear</h3>
              <ol>
                <li>
                  Acidic or abrasive cleaners, ammonia, bleach, wax, alcohol, solvents, toilet/tile cleaners or cleaning powder.
                </li>
                <li>Acid fumes or construction chemicals.</li>
                <li>
                  Damage to coloured/non-chrome coating from harsh cleaners, hair dye, bath oils/salts, coarse cloths, scrubbers, sunlight or chemicals.
                </li>
                <li>
                  Normal wear, minor colour variation, water spots, scratches and gradual finish fading not caused by a manufacturing defect.
                </li>
                <li>Failure to follow RN care and maintenance instructions.</li>
                <li>Routine descaling or cleaning of aerators, nozzles and other serviceable parts.</li>
              </ol>

              <h3>Showers, Sensor Faucets and Flush Valves</h3>
              <ol>
                <li>Blocked shower or health-faucet nozzles caused by hard water, debris or scale.</li>
                <li>ABS showers/health faucets exposed to hot water above 60°C, direct sunlight or excessive heat.</li>
                <li>
                  Sensor-faucet damage from voltage fluctuation, incorrect supply, water ingress into electronics or failure to replace batteries.
                </li>
                <li>Sensor problems caused by dirt on the sensor window or reflective surfaces near the sensor.</li>
                <li>Flush-valve problems caused by debris, scale or inadequate/excessive supply pressure.</li>
              </ol>

              <h3>Other Exclusions</h3>
              <ol>
                <li>Fire, flood, earthquake, lightning, natural disaster, act of God or another event beyond reasonable control.</li>
                <li>Rodents, pests, pets, accidents or deliberate damage.</li>
                <li>Defects reported after the applicable warranty period.</li>
                <li>Products whose identity, code or purchase proof cannot reasonably be verified.</li>
              </ol>

              {/* 6. Maintenance Guidelines (Page 6) */}
              <h2 id="section-6">6. Maintenance Guidelines</h2>

              <h3>Daily Care</h3>
              <ol>
                <li>Clean with a soft damp cloth or mild soap solution, then wipe dry.</li>
                <li>Do not use salt, vinegar, acid-based descalers, flush cleaners, tile cleaners or chemical cleaners.</li>
                <li>Clean the aerator regularly for smooth, splash-free flow.</li>
              </ol>

              <h3>Coloured and Special Finishes</h3>
              <ol>
                <li>Use only plain water or mild soap with a soft damp cloth.</li>
                <li>Never use emery paper, scrubbers, steel wool or cleaning powder.</li>
                <li>Remove hair dye, bath oils, salts and cosmetics immediately.</li>
              </ol>

              <h3>Showers and Health Faucets</h3>
              <ol>
                <li>Rub flexible nozzles gently with fingers to clear scale.</li>
                <li>Clean metal shower heads with mild soap solution only; never use acid or descaler.</li>
              </ol>

              <h3>Sensor Faucets</h3>
              <ol>
                <li>Keep the sensor window clean and dry; use a soft cloth only.</li>
                <li>Replace batteries when the low-battery indicator appears.</li>
                <li>Do not spray water directly on the electronic unit.</li>
              </ol>

              <h3>Protection Reminders</h3>
              <ul>
                <li><strong>Water scaling:</strong> Dry edges and corners regularly to prevent mineral deposits.</li>
                <li><strong>Acid fumes:</strong> Cover fittings and ventilate the room during tile/floor cleaning.</li>
                <li><strong>Scratching:</strong> Use only a soft, fluffy cloth.</li>
                <li><strong>Coastal air:</strong> Clean and dry the product more frequently to reduce salt-related spotting.</li>
              </ul>

              {/* 7. Installation Guidelines (Page 6) */}
              <h2 id="section-7">7. Installation Guidelines</h2>
              <ol>
                <li>Flush supply pipes thoroughly before installation.</li>
                <li>Install a suitable in-line or tank-outlet filter to protect cartridges and mechanisms.</li>
                <li>Install fittings after masonry and painting; otherwise protect them with a clean cloth or polythene cover.</li>
                <li>Use suitable RN-recommended PTFE/Teflon tape on threaded joints and do not over-tighten.</li>
                <li>Check supply pressure and temperature against the operating limits in Section 1 (†).</li>
                <li>Test every joint and fitting for leakage before tiling or closing the wall.</li>
                <li>Photograph concealed piping before closing the wall for future service.</li>
                <li>Retain the invoice, product packaging/code and installer details.</li>
              </ol>

              {/* 8. Customer Care and Claim Checklist (Page 7) */}
              <h2 id="section-8">8. Customer Care and Claim Checklist</h2>

              {/* NEED SERVICE Banner */}
              <div
                style={{
                  background: "#063963",
                  color: "#FFFFFF",
                  borderRadius: "14px",
                  padding: "24px 28px",
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "20px",
                  marginBottom: "22px",
                }}
              >
                <div style={{ fontSize: "clamp(20px, 2.5vw, 26px)", fontWeight: 800, letterSpacing: "0.02em" }}>
                  NEED SERVICE?
                </div>
                <div style={{ flex: "1 1 320px" }}>
                  <div style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.08em", color: "#BAE6FD", fontWeight: 700 }}>
                    Customer Care
                  </div>
                  <div style={{ fontSize: "24px", fontWeight: 800, margin: "2px 0 6px" }}>
                    <a href="tel:9891201208" style={{ color: "#FFFFFF", textDecoration: "none" }}>
                      98912 01208
                    </a>
                  </div>
                  <div style={{ fontSize: "13.5px", color: "#E0F2FE", lineHeight: 1.55 }}>
                    Register on the RN Faucets app within 45 days for faster service.
                    <br />
                    Keep your invoice and product code ready.
                  </div>
                </div>
              </div>

              {/* Customer Care Details Table */}
              <div className="warranty-table-wrap">
                <table className="warranty-table">
                  <tbody>
                    <tr>
                      <td style={{ width: "32%", background: "#EBF5FB", fontWeight: 700, color: "#063963" }}>
                        Warranty registration
                      </td>
                      <td>RN Faucets app, within 45 days of purchase</td>
                    </tr>
                    <tr>
                      <td style={{ background: "#EBF5FB", fontWeight: 700, color: "#063963" }}>
                        Customer care / complaints
                      </td>
                      <td>
                        <a href="tel:9891201208">98912 01208</a>
                      </td>
                    </tr>
                    <tr>
                      <td style={{ background: "#EBF5FB", fontWeight: 700, color: "#063963" }}>
                        WhatsApp
                      </td>
                      <td>
                        <a href="https://wa.me/919811103377" target="_blank" rel="noopener noreferrer">
                          98111 03377
                        </a>
                      </td>
                    </tr>
                    <tr>
                      <td style={{ background: "#EBF5FB", fontWeight: 700, color: "#063963" }}>
                        Toll-free
                      </td>
                      <td>
                        <a href="tel:1800123400400">1800 123 400 400</a>
                      </td>
                    </tr>
                    <tr>
                      <td style={{ background: "#EBF5FB", fontWeight: 700, color: "#063963" }}>
                        Email
                      </td>
                      <td>
                        <a href="mailto:enquiry@rnvalves.com">enquiry@rnvalves.com</a>
                      </td>
                    </tr>
                    <tr>
                      <td style={{ background: "#EBF5FB", fontWeight: 700, color: "#063963" }}>
                        Website
                      </td>
                      <td>
                        <a href="https://www.rnvalves.com" target="_blank" rel="noopener noreferrer">
                          www.rnvalves.com
                        </a>
                      </td>
                    </tr>
                    <tr>
                      <td style={{ background: "#EBF5FB", fontWeight: 700, color: "#063963" }}>
                        Address
                      </td>
                      <td>B-68, Site 4, Sahibabad Industrial Area, Ghaziabad, Uttar Pradesh</td>
                    </tr>
                    <tr>
                      <td style={{ background: "#EBF5FB", fontWeight: 700, color: "#063963" }}>
                        Claim route
                      </td>
                      <td>Selling authorised dealer/distributor or RN customer care</td>
                    </tr>
                    <tr>
                      <td style={{ background: "#EBF5FB", fontWeight: 700, color: "#063963" }}>
                        Keep ready
                      </td>
                      <td>
                        Invoice, app registration details, dealer-stamped warranty card, product code, photographs/video, installation address and complaint details
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Before Raising a Claim Checklist */}
              <h3>Before Raising a Claim</h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                  gap: "12px",
                  marginBottom: "24px",
                }}
              >
                {[
                  "Valid GST invoice / purchase bill",
                  "RN Faucets app registration details",
                  "Dealer-stamped warranty card, where issued",
                  "Product code / identification label",
                  "Photos or video showing the issue",
                  "Installed-site address and contact person",
                  "Complaint number recorded for follow-up",
                ].map((item) => (
                  <div
                    key={item}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "12px 16px",
                      borderRadius: "10px",
                      background: "#F8FAFC",
                      border: "1px solid #E2E8F0",
                      fontSize: "13.5px",
                      fontWeight: 600,
                      color: "#1E293B",
                    }}
                  >
                    <CheckCircle2 size={17} color="#0077B6" style={{ flexShrink: 0 }} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              {/* CUSTOMER NOTE Box */}
              <div className="warranty-callout-row">
                <div
                  style={{
                    background: "#063963",
                    color: "#FFFFFF",
                    fontWeight: 800,
                    fontSize: "13.5px",
                    letterSpacing: "0.04em",
                    display: "flex",
                    alignItems: "center",
                    padding: "18px 20px",
                  }}
                >
                  CUSTOMER NOTE
                </div>
                <div style={{ background: "#EBF5FB", padding: "16px 20px", fontSize: "14px", color: "#0F172A", lineHeight: 1.65 }}>
                  Do not dismantle the product or appoint an unauthorised repairer before RN inspection, except where immediate action is reasonably necessary to prevent further property damage. In that situation, photograph the condition and retain replaced parts and supporting bills.
                </div>
              </div>

              {/* Bottom Download Warranty Policy PDF Bar */}
              <div
                style={{
                  marginTop: "32px",
                  padding: "24px 28px",
                  borderRadius: "16px",
                  background: "#F8FAFC",
                  border: "1px solid #CBD5E1",
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "16px",
                }}
              >
                <div>
                  <div style={{ fontSize: "15.5px", fontWeight: 800, color: "#0F172A" }}>
                    Need a Printable Copy of the Warranty Policy?
                  </div>
                  <div style={{ fontSize: "13px", color: "#64748B", marginTop: "3px" }}>
                    Download the complete 7-page official RN CP Fittings Warranty Policy PDF for your records.
                  </div>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                  <a
                    href={WARRANTY_PDF_URL}
                    download={WARRANTY_PDF_FILENAME}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "11px 20px",
                      borderRadius: "10px",
                      background: "#0077B6",
                      color: "#FFFFFF",
                      fontSize: "13.5px",
                      fontWeight: 700,
                      textDecoration: "none",
                    }}
                  >
                    <Download size={16} /> Download PDF
                  </a>
                  <a
                    href={WARRANTY_PDF_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "11px 18px",
                      borderRadius: "10px",
                      background: "#FFFFFF",
                      border: "1px solid #CBD5E1",
                      color: "#0F172A",
                      fontSize: "13.5px",
                      fontWeight: 600,
                      textDecoration: "none",
                    }}
                  >
                    <ExternalLink size={15} color="#0284C7" /> Open in Browser
                  </a>
                </div>
              </div>
            </article>
          </div>
        </div>
      </main>

      <FooterSection />
    </div>
  );
}
