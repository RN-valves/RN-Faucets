"use client";

import Header from "@/components/Header";
import FooterSection from "@/components/FooterSection";
import PolicySidebar from "@/components/policy/PolicySidebar";
import Link from "next/link";
import { ChevronRight, Shield, Award, CheckCircle2, Lock, MapPin, Mail, Eye } from "lucide-react";

export default function PrivacyPolicyPage() {
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
          margin-top: 28px;
          margin-bottom: 12px;
        }
        .legal-prose h2 {
          font-size: 20px;
          border-bottom: 1px solid #E2E8F0;
          padding-bottom: 8px;
        }
        .legal-prose h3 {
          font-size: 17px;
        }
        .legal-prose p {
          font-size: 14.5px;
          color: #334155;
          line-height: 1.8;
          margin-bottom: 16px;
        }
        .legal-prose ul, .legal-prose ol {
          margin-bottom: 20px;
          padding-left: 24px;
        }
        .legal-prose li {
          font-size: 14px;
          color: #334155;
          line-height: 1.75;
          margin-bottom: 8px;
        }
        .legal-prose a {
          color: #0284C7;
          text-decoration: underline;
          text-underline-offset: 3px;
        }
        .quality-policy-card {
          background: linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%);
          border: 1px solid #BAE6FD;
          border-radius: 16px;
          padding: 28px;
          margin: 28px 0;
        }
        .toc-card {
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          border-radius: 14px;
          padding: 24px 28px;
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
            <span style={{ color: "#00AEEF", fontWeight: 600 }}>Privacy Policy</span>
          </nav>

          {/* Page Heading */}
          <div style={{ marginBottom: "36px" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 14px", borderRadius: "999px", background: "rgba(0, 174, 239, 0.1)", color: "#008CC1", fontSize: "12.5px", fontWeight: 600, marginBottom: "12px" }}>
              <Lock size={13} /> Official Privacy & Data Protection Statement
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
              Privacy Policy
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
              We, at RN Valves & Faucets, assure you that your information is safe with us. We are committed to safeguarding your privacy to the fullest extent under Indian law.
            </p>
          </div>

          {/* Main Grid: Sidebar + Policy Text */}
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
              <p>
                We, at <strong>RN Valves &amp; Faucets</strong>, assure you that your information is safe with us. We are committed to your privacy to the fullest. This Privacy Policy explains how we collect, protect, and process data provided by visitors, customers, and partners across our websites and mobile services.
              </p>

              <h3>Personal Information Required for Processing:</h3>
              <ul>
                <li>Name, contact information, telephone number, and email address</li>
                <li>Business address, company credentials, and billing details</li>
                <li>Information related to service, sample delivery, and product consignments</li>
                <li>Transaction and invoice details for payments and orders</li>
                <li>Necessary credentials required to deliver customer care and warranty support</li>
              </ul>

              <h3>Channels of Online Data Collection:</h3>
              <ul>
                <li>Official Website: <a href="https://www.rnvalves.com" target="_blank" rel="noopener noreferrer">www.rnvalves.com</a></li>
                <li>Social Media Channels (Facebook, Instagram, LinkedIn, YouTube)</li>
                <li>Direct messaging apps and WhatsApp customer support (+91 9319888435)</li>
              </ul>

              <p>
                All the information gathered is kept confidential and is strictly accessible only by authorized officials of our company to provide superior products and services. The distribution or disclosure of any information is conducted in accordance with this policy and governed by the laws of India.
              </p>

              {/* Quality Policy Box */}
              <div className="quality-policy-card">
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                  <Award size={24} color="#0284C7" />
                  <h3 style={{ margin: 0, color: "#0369A1", fontSize: "18px" }}>Quality Policy &amp; ISO Certification</h3>
                </div>
                <p style={{ margin: "0 0 12px 0", color: "#0F172A", fontSize: "14px" }}>
                  Quality is the center of our enterprise management. We execute the full implementation of the <strong>ISO 9000 Quality Management System</strong> from design research, development, to automated injection moulding and machining. The whole process of tracking and inspection ensures that every process is strictly controlled to guarantee consistent, defect-free excellence.
                </p>
                <p style={{ margin: 0, color: "#0F172A", fontSize: "14px" }}>
                  Inspection is a critical vehicle to control and verify product performance. All raw polymers, brass rods, spare components, and cartridge units undergo early-stage stress and flow-rate testing; non-conforming items are eliminated immediately.
                </p>
              </div>

              <h2>Summary of Key Points</h2>
              <p>
                This summary provides essential highlights regarding how your data is handled. We process personal information depending on how you interact with RN Valves &amp; Faucets, the products you purchase, and whether you use our dealer application or portal. We never sell your personal data to unauthorized third-party advertisers.
              </p>

              {/* Table of Contents */}
              <div className="toc-card">
                <h4 style={{ margin: "0 0 14px 0", fontSize: "15px", color: "#0F172A" }}>Table of Contents</h4>
                <ol style={{ margin: 0, paddingLeft: "20px" }}>
                  <li><a href="#section-1">1. What Information Do We Collect?</a></li>
                  <li><a href="#section-2">2. How Do We Process Your Information?</a></li>
                  <li><a href="#section-3">3. When And With Whom Do We Share Your Personal Information?</a></li>
                  <li><a href="#section-4">4. How Long Do We Keep Your Information?</a></li>
                  <li><a href="#section-5">5. Do We Collect Information From Minors?</a></li>
                  <li><a href="#section-6">6. What Are Your Privacy Rights?</a></li>
                  <li><a href="#section-7">7. Controls For Do-Not-Track Features</a></li>
                  <li><a href="#section-8">8. Do We Make Updates To This Notice?</a></li>
                  <li><a href="#section-9">9. How Can You Contact Us About This Notice?</a></li>
                </ol>
              </div>

              <h2 id="section-1">1. What Information Do We Collect?</h2>
              <p>
                We collect personal information that you voluntarily provide when registering on our services, expressing interest in dealership opportunities, subscribing to brochures, or placing an order.
              </p>
              <p>
                <strong>Application Data &amp; Location Tracking:</strong> If you use our mobile enterprise application, we may request access to geolocation data (GPS coordinates) while the application is active or running in the background. This data is utilized solely to calculate sales representative visits, verify distributor check-ins, record field attendance, and coordinate order dispatch. You maintain full control over location permissions in your mobile device settings.
              </p>

              <h2 id="section-2">2. How Do We Process Your Information?</h2>
              <p>
                We process your information to administer our services, verify orders, calculate shipping charges, coordinate dispatch with transport agencies, prevent fraudulent attempts, and comply with state and national tax documentation requirements.
              </p>

              <h2 id="section-3">3. When And With Whom Do We Share Your Information?</h2>
              <p>
                We share information strictly with verified partners essential to order completion:
              </p>
              <ul>
                <li>Google Maps Platform APIs for address autofill and route optimization</li>
                <li>Registered logistics and cargo transport agencies for physical consignment delivery</li>
                <li>Legal and statutory authorities when mandated by official subpoenas or regulatory guidelines</li>
              </ul>

              <h2 id="section-4">4. How Long Do We Keep Your Information?</h2>
              <p>
                We retain customer records only for as long as necessary to fulfill trade warranties, maintain tax audit trails, and support active accounts. When no ongoing business need exists, data is either securely anonymized or permanently purged from operational databases.
              </p>

              <h2 id="section-5">5. Do We Collect Information From Minors?</h2>
              <p>
                We do not knowingly solicit data from or market to individuals under 18 years of age. Our products, dealership registrations, and trade services are intended for adult consumers, plumbing professionals, architects, and registered businesses.
              </p>

              <h2 id="section-6">6. What Are Your Privacy Rights?</h2>
              <p>
                You may review, update, or request deactivation of your account at any time by contacting our support desk. You also have the right to withdraw consent for marketing communications.
              </p>

              <h2 id="section-7">7. Controls For Do-Not-Track Features</h2>
              <p>
                Most modern browsers include Do-Not-Track (DNT) signals. Our website respects standard browser privacy preferences and maintains minimal cookie usage strictly for session security and shopping cart operations.
              </p>

              <h2 id="section-8">8. Updates To This Notice</h2>
              <p>
                We may periodically update this policy to reflect operational improvements or regulatory updates. The latest version will always be published on this page with an updated timestamp.
              </p>

              <h2 id="section-9">9. How Can You Contact Us?</h2>
              <p>
                For questions regarding this policy or data inquiries, contact us at:
              </p>
              <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "12px", padding: "20px", marginTop: "12px" }}>
                <p style={{ margin: "0 0 6px 0", fontWeight: 700, color: "#0F172A" }}>
                  RN Valves &amp; Faucets
                </p>
                <p style={{ margin: "0 0 6px 0", color: "#475569" }}>
                  B-68, Site-IV, Sahibabad Industrial Area, Ghaziabad, Uttar Pradesh - 201010, India
                </p>
                <p style={{ margin: "0", color: "#475569" }}>
                  Email: <a href="mailto:info@rnvalves.com">info@rnvalves.com</a> / <a href="mailto:enquiry@rnvalves.com">enquiry@rnvalves.com</a> | Toll-Free: 1800 212 0192
                </p>
              </div>
            </article>
          </div>
        </div>
      </main>

      <FooterSection />
    </div>
  );
}
