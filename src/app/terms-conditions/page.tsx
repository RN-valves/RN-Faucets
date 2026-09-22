"use client";

import Header from "@/components/Header";
import FooterSection from "@/components/FooterSection";
import PolicySidebar from "@/components/policy/PolicySidebar";
import Link from "next/link";
import {
  ChevronRight,
  FileText,
  CreditCard,
  Truck,
  Clock,
  CheckCircle2,
  AlertCircle,
  PackageCheck,
  ShieldAlert,
} from "lucide-react";

export default function TermsConditionsPage() {
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
        .tc-card {
          border-radius: 16px;
          padding: 24px;
          border: 1px solid #E2E8F0;
          background: #FFFFFF;
          margin-bottom: 24px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.02);
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
            <span style={{ color: "#00AEEF", fontWeight: 600 }}>Terms &amp; Conditions</span>
          </nav>

          {/* Page Heading */}
          <div style={{ marginBottom: "36px" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 14px", borderRadius: "999px", background: "rgba(0, 174, 239, 0.1)", color: "#008CC1", fontSize: "12.5px", fontWeight: 600, marginBottom: "12px" }}>
              <FileText size={13} /> Orders, Procurement &amp; Delivery Terms
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
              Terms &amp; Conditions
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
              General trade terms, payment protocols, minimum order thresholds, and dispatch schedules governing all transactions with RN Valves &amp; Faucets.
            </p>
          </div>

          {/* Main Grid: Sidebar + Terms */}
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
            >
              {/* Section 1: Orders T&C */}
              <div className="tc-card" style={{ borderLeft: "4px solid #00AEEF" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#E0F2FE", color: "#0284C7", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <CreditCard size={18} />
                  </div>
                  <div>
                    <h2 style={{ margin: 0, fontSize: "18px", color: "#0F172A", fontWeight: 700 }}>
                      Orders Terms &amp; Conditions
                    </h2>
                    <span style={{ fontSize: "12.5px", color: "#64748B" }}>Payment and Order Processing</span>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                    <CheckCircle2 size={18} color="#00AEEF" style={{ flexShrink: 0, marginTop: "2px" }} />
                    <p style={{ margin: 0, fontSize: "14px", color: "#334155", lineHeight: 1.6 }}>
                      <strong>High Value Orders (Above ₹50,000):</strong> Payment for all purchase orders above ₹50,000 must be completed through authenticated online banking / RTGS / NEFT or verified gateway as guided by company sales executives prior to consignment release.
                    </p>
                  </div>

                  <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                    <CheckCircle2 size={18} color="#00AEEF" style={{ flexShrink: 0, marginTop: "2px" }} />
                    <p style={{ margin: 0, fontSize: "14px", color: "#334155", lineHeight: 1.6 }}>
                      <strong>Minimum Purchase Order Value:</strong> Direct delivery services are not available for purchase orders below <strong>₹3,000</strong> (except when fulfilled directly via authorized ex-dealer showrooms or counter collections).
                    </p>
                  </div>

                  <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                    <CheckCircle2 size={18} color="#00AEEF" style={{ flexShrink: 0, marginTop: "2px" }} />
                    <p style={{ margin: 0, fontSize: "14px", color: "#334155", lineHeight: 1.6 }}>
                      <strong>Out of Stock &amp; Custom Orders:</strong> In case of temporary product unavailability or custom high-grade project orders, please write directly to <a href="mailto:sales@rnvalves.com" style={{ color: "#0284C7", fontWeight: 600 }}>sales@rnvalves.com</a> or <a href="mailto:enquiry@rnvalves.com" style={{ color: "#0284C7", fontWeight: 600 }}>enquiry@rnvalves.com</a> for prioritized procurement timelines.
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 2: Delivery Charges */}
              <div className="tc-card" style={{ borderLeft: "4px solid #10B981" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#D1FAE5", color: "#059669", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Truck size={18} />
                  </div>
                  <div>
                    <h2 style={{ margin: 0, fontSize: "18px", color: "#0F172A", fontWeight: 700 }}>
                      Delivery Charges &amp; Shipping Rates
                    </h2>
                    <span style={{ fontSize: "12.5px", color: "#64748B" }}>Consignment Freight Policy</span>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px", marginTop: "12px" }}>
                  <div style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: "12px", padding: "18px" }}>
                    <span style={{ display: "inline-block", background: "#16A34A", color: "#FFFFFF", fontSize: "11.5px", fontWeight: 700, padding: "2px 8px", borderRadius: "6px", marginBottom: "8px" }}>
                      ZERO FREIGHT
                    </span>
                    <h4 style={{ margin: "0 0 6px 0", fontSize: "16px", color: "#166534", fontWeight: 700 }}>
                      Orders of ₹10,000 or More
                    </h4>
                    <p style={{ margin: 0, fontSize: "13.5px", color: "#14532D", lineHeight: 1.5 }}>
                      Enjoy 100% <strong>Free Delivery</strong> on all orders with a total invoice value of ₹10,000 or above across eligible territory partner zones.
                    </p>
                  </div>

                  <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "12px", padding: "18px" }}>
                    <span style={{ display: "inline-block", background: "#64748B", color: "#FFFFFF", fontSize: "11.5px", fontWeight: 700, padding: "2px 8px", borderRadius: "6px", marginBottom: "8px" }}>
                      FLAT RATE
                    </span>
                    <h4 style={{ margin: "0 0 6px 0", fontSize: "16px", color: "#1E293B", fontWeight: 700 }}>
                      Orders Below ₹10,000
                    </h4>
                    <p style={{ margin: 0, fontSize: "13.5px", color: "#475569", lineHeight: 1.5 }}>
                      A standardized delivery charge of <strong>₹250</strong> is applied (subject to revision based on destination state, hill terrain, or remote pin codes).
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 3: Delivery Timelines */}
              <div className="tc-card" style={{ borderLeft: "4px solid #F59E0B" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#FEF3C7", color: "#D97706", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Clock size={18} />
                  </div>
                  <div>
                    <h2 style={{ margin: 0, fontSize: "18px", color: "#0F172A", fontWeight: 700 }}>
                      Estimated Delivery Timelines
                    </h2>
                    <span style={{ fontSize: "12.5px", color: "#64748B" }}>Transit schedules by inventory classification</span>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div style={{ background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: "12px", padding: "18px" }}>
                    <h4 style={{ margin: "0 0 6px 0", fontSize: "15px", color: "#92400E", fontWeight: 700 }}>
                      1. Standard In-Stock Items (15 to 18 Days)
                    </h4>
                    <p style={{ margin: 0, fontSize: "13.5px", color: "#78350F", lineHeight: 1.6 }}>
                      Articles marked as &ldquo;In Stock&rdquo; serviced by RN Valves regional channel partners will be delivered within <strong>15&ndash;18 business days</strong>. For locations serviced from our Central Warehouse in Delhi/NCR via commercial transport services, transit requires <strong>21&ndash;25 days</strong> depending on geographical location. Business days exclude Sundays and national holidays.
                    </p>
                  </div>

                  <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "12px", padding: "18px" }}>
                    <h4 style={{ margin: "0 0 6px 0", fontSize: "15px", color: "#0F172A", fontWeight: 700 }}>
                      2. Specialized / Imported Components (21+ Days)
                    </h4>
                    <p style={{ margin: 0, fontSize: "13.5px", color: "#475569", lineHeight: 1.6 }}>
                      Items designated with extended procurement lead times or specialized luxury fixtures requiring overseas component importation may require <strong>21 or more business days</strong>. Rest assured our logistics dispatch desk coordinates proactively to track your consignment until delivery.
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 4: Mode of Delivery */}
              <div className="tc-card" style={{ borderLeft: "4px solid #6366F1", marginBottom: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#EEF2FF", color: "#4F46E5", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <PackageCheck size={18} />
                  </div>
                  <div>
                    <h2 style={{ margin: 0, fontSize: "18px", color: "#0F172A", fontWeight: 700 }}>
                      Mode of Delivery
                    </h2>
                    <span style={{ fontSize: "12.5px", color: "#64748B" }}>Authorized transport logistics network</span>
                  </div>
                </div>
                <p style={{ margin: 0, fontSize: "14px", color: "#334155", lineHeight: 1.7 }}>
                  We process all domestic deliveries exclusively through certified commercial Transport and authorized RN Valves &amp; Faucets Channel Partners. Consignees receive an official Bilty / Tracking ID upon consignment handover to follow their shipment in real time.
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
