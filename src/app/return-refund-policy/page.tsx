"use client";

import Header from "@/components/Header";
import FooterSection from "@/components/FooterSection";
import PolicySidebar from "@/components/policy/PolicySidebar";
import Link from "next/link";
import {
  ChevronRight,
  RotateCcw,
  AlertTriangle,
  FileCheck2,
  Truck,
  CheckCircle2,
  Calendar,
  DollarSign,
  FileText,
} from "lucide-react";

export default function ReturnRefundPolicyPage() {
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
        .rule-card {
          border-radius: 14px;
          padding: 22px;
          border: 1px solid #E2E8F0;
          background: #F8FAFC;
          margin-bottom: 20px;
          transition: all 0.2s ease;
        }
        .rule-card:hover {
          border-color: #CBD5E1;
          box-shadow: 0 4px 12px rgba(0,0,0,0.03);
        }
        .document-item {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 12px;
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
            <span style={{ color: "#00AEEF", fontWeight: 600 }}>Return &amp; Refund Policy</span>
          </nav>

          {/* Page Heading */}
          <div style={{ marginBottom: "36px" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 14px", borderRadius: "999px", background: "rgba(0, 174, 239, 0.1)", color: "#008CC1", fontSize: "12.5px", fontWeight: 600, marginBottom: "12px" }}>
              <RotateCcw size={13} /> Official Goods Return (G.R.) Guidelines
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
              Return &amp; Refund Policy
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
              Comprehensive operational guidelines for goods return, manufacturing warranty claims, freight terms, and mandatory statutory documentation.
            </p>
          </div>

          {/* Main Grid: Sidebar + Policy Details */}
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
              {/* Intro Banner */}
              <div
                style={{
                  background: "#F0F9FF",
                  borderLeft: "4px solid #00AEEF",
                  borderRadius: "8px",
                  padding: "18px 22px",
                  marginBottom: "32px",
                }}
              >
                <h3 style={{ margin: "0 0 8px 0", fontSize: "16px", color: "#0369A1", fontWeight: 700 }}>
                  Standard Goods Return (G.R.) Protocol
                </h3>
                <p style={{ margin: 0, fontSize: "14px", color: "#334155", lineHeight: 1.6 }}>
                  Though we try our level best to ensure 100% correct delivery as per your purchase order, in case of any discrepancy in goods received, please review the formal return terms below before dispatching consignments.
                </p>
              </div>

              {/* 4 Core Return Rules */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px", marginBottom: "32px" }}>
                {/* Rule 1 */}
                <div className="rule-card">
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                    <Calendar size={20} color="#0284C7" />
                    <h4 style={{ margin: 0, fontSize: "15.5px", color: "#0F172A", fontWeight: 700 }}>
                      7 to 15 Days Notification
                    </h4>
                  </div>
                  <p style={{ margin: 0, fontSize: "13.5px", color: "#475569", lineHeight: 1.6 }}>
                    Kindly inform your assigned Sales Executive or CRM immediately. If approved in writing, arrange to return items within a week or maximum <strong>15 days from invoicing</strong>, whichever is earlier.
                  </p>
                </div>

                {/* Rule 2 */}
                <div className="rule-card">
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                    <CheckCircle2 size={20} color="#16A34A" />
                    <h4 style={{ margin: 0, fontSize: "15.5px", color: "#0F172A", fontWeight: 700 }}>
                      Manufacturing Defects (90 Days)
                    </h4>
                  </div>
                  <p style={{ margin: 0, fontSize: "13.5px", color: "#475569", lineHeight: 1.6 }}>
                    In case of return due to manufacturing defects, only verified defective goods are accepted after confirmation in writing, returned within <strong>90 days from date of supply</strong>. Defective goods will be replaced with the exact same article.
                  </p>
                </div>

                {/* Rule 3 */}
                <div className="rule-card">
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                    <AlertTriangle size={20} color="#EA580C" />
                    <h4 style={{ margin: 0, fontSize: "15.5px", color: "#0F172A", fontWeight: 700 }}>
                      25% Debit for Unauthorized Returns
                    </h4>
                  </div>
                  <p style={{ margin: 0, fontSize: "13.5px", color: "#475569", lineHeight: 1.6 }}>
                    If any goods are returned without prior written confirmation from the official email ID <strong>enquiry@rnvalves.com</strong>, the company will debit <strong>25% of net Goods Return amount</strong> (based on invoice MRP or current MRP, whichever is lower).
                  </p>
                </div>

                {/* Rule 4 */}
                <div className="rule-card">
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                    <Truck size={20} color="#4F46E5" />
                    <h4 style={{ margin: 0, fontSize: "15.5px", color: "#0F172A", fontWeight: 700 }}>
                      Freight Paid Requirement
                    </h4>
                  </div>
                  <p style={{ margin: 0, fontSize: "13.5px", color: "#475569", lineHeight: 1.6 }}>
                    As RN Valves delivers goods freight paid, the same standard is expected from distributors: all return consignments must be dispatched <strong>Freight Paid</strong>. Unpaid freight charges will be debited to customer account.
                  </p>
                </div>
              </div>

              {/* Ineligible Items */}
              <div
                style={{
                  background: "#FFFBEB",
                  border: "1px solid #FDE68A",
                  borderRadius: "14px",
                  padding: "22px",
                  marginBottom: "32px",
                }}
              >
                <h4 style={{ margin: "0 0 8px 0", fontSize: "15px", color: "#92400E", fontWeight: 700 }}>
                  Items Strictly Not Accepted for Return
                </h4>
                <p style={{ margin: "0 0 10px 0", fontSize: "13.5px", color: "#78350F", lineHeight: 1.6 }}>
                  The following items cannot be accepted under any circumstances:
                </p>
                <ul style={{ margin: 0, paddingLeft: "20px", fontSize: "13.5px", color: "#78350F", lineHeight: 1.7 }}>
                  <li>Articles discontinued or decommissioned by the company</li>
                  <li>Broken assortment sizes or unboxed single units</li>
                  <li>Loose stock not preserved in standard company master packaging</li>
                </ul>
              </div>

              {/* Mandatory Documents Checklist */}
              <h3 style={{ fontSize: "18px", color: "#0F172A", fontWeight: 700, margin: "0 0 16px 0" }}>
                Mandatory Documentation Checklist for Returning Goods
              </h3>
              <p style={{ fontSize: "14px", color: "#475569", margin: "0 0 16px 0" }}>
                For account reconciliation and statutory compliance, all return shipments must include the following verified documents:
              </p>

              <div>
                <div className="document-item">
                  <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#E0F2FE", color: "#0369A1", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "13px", flexShrink: 0 }}>
                    1
                  </div>
                  <div>
                    <h5 style={{ margin: "0 0 4px 0", fontSize: "14.5px", color: "#0F172A", fontWeight: 600 }}>
                      Debit Note with Pertaining Invoice Reference
                    </h5>
                    <p style={{ margin: 0, fontSize: "13px", color: "#64748B", lineHeight: 1.5 }}>
                      Must clearly state Item Code, Product Series, Size, Quantity, MRP, Original Invoice Number, and exact reason for return.
                    </p>
                  </div>
                </div>

                <div className="document-item">
                  <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#E0F2FE", color: "#0369A1", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "13px", flexShrink: 0 }}>
                    2
                  </div>
                  <div>
                    <h5 style={{ margin: "0 0 4px 0", fontSize: "14.5px", color: "#0F172A", fontWeight: 600 }}>
                      Way Bill / Road Permit (e-Way Bill)
                    </h5>
                    <p style={{ margin: 0, fontSize: "13px", color: "#64748B", lineHeight: 1.5 }}>
                      Valid statutory road permit generated for the return consignment destination.
                    </p>
                  </div>
                </div>

                <div className="document-item">
                  <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#E0F2FE", color: "#0369A1", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "13px", flexShrink: 0 }}>
                    3
                  </div>
                  <div>
                    <h5 style={{ margin: "0 0 4px 0", fontSize: "14.5px", color: "#0F172A", fontWeight: 600 }}>
                      Original Transporter Bilty (L.R. Copy)
                    </h5>
                    <p style={{ margin: 0, fontSize: "13px", color: "#64748B", lineHeight: 1.5 }}>
                      Properly stamped consignment receipt from the accredited logistics transporter with "Freight Paid" clearly marked.
                    </p>
                  </div>
                </div>

                <div className="document-item">
                  <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#E0F2FE", color: "#0369A1", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "13px", flexShrink: 0 }}>
                    4
                  </div>
                  <div>
                    <h5 style={{ margin: "0 0 4px 0", fontSize: "14.5px", color: "#0F172A", fontWeight: 600 }}>
                      Other Related Documents &amp; Declarations
                    </h5>
                    <p style={{ margin: 0, fontSize: "13px", color: "#64748B", lineHeight: 1.5 }}>
                      Any statutory interstate declaration forms or GST credit adjustment paperwork.
                    </p>
                  </div>
                </div>
              </div>

              {/* Statutory Compliance Note */}
              <div
                style={{
                  background: "#F8FAFC",
                  border: "1px solid #E2E8F0",
                  borderRadius: "14px",
                  padding: "20px 24px",
                  marginTop: "28px",
                }}
              >
                <h4 style={{ margin: "0 0 8px 0", fontSize: "14px", color: "#0F172A", fontWeight: 700 }}>
                  Statutory Tax Compliance Clause
                </h4>
                <p style={{ margin: 0, fontSize: "13px", color: "#475569", lineHeight: 1.6 }}>
                  These documents must be duly filled, verified, and signed by the sender. <strong>M/s RN Faucets Pvt Ltd</strong> will not be held liable for any penalty arising from discrepancies, incomplete documentation, or expired permits, and all such levies will be debited to the sender&apos;s account. We request all channel partners and clients to strictly adhere to these guidelines.
                </p>
              </div>

              {/* Support prompt */}
              <div style={{ marginTop: "28px", textAlign: "center", padding: "20px", background: "#F1F5F9", borderRadius: "12px" }}>
                <p style={{ margin: "0 0 8px 0", fontSize: "14px", color: "#1E293B", fontWeight: 600 }}>
                  Need to initiate a return or verify a replacement?
                </p>
                <p style={{ margin: 0, fontSize: "13px", color: "#64748B" }}>
                  Email your Debit Note and Invoice copy to <a href="mailto:enquiry@rnvalves.com" style={{ color: "#0284C7", fontWeight: 600 }}>enquiry@rnvalves.com</a> or speak with your Area Sales Manager.
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
