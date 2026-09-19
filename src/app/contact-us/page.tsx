"use client";

import { useState } from "react";
import Header from "@/components/Header";
import FooterSection from "@/components/FooterSection";
import SupportLinksSection from "@/components/SupportLinksSection";
import Link from "next/link";
import {
  User,
  Building,
  Mail,
  Phone,
  Handshake,
  MapPin,
  FileText,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  ChevronRight,
} from "lucide-react";

export default function ContactUsPage() {
  const [form, setForm] = useState({
    name: "",
    companyName: "",
    email: "",
    mobile: "",
    profession: "",
    zipcode: "",
    address: "",
    purpose: "",
  });

  const [loading, setLoading] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!form.name || !form.email || !form.mobile) {
      setErrorMsg("Please fill out your Name, Email, and Contact Number.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: form.name,
          companyName: form.companyName,
          email: form.email,
          phone: form.mobile,
          profession: form.profession,
          zipcode: form.zipcode,
          address: form.address,
          subject: form.profession
            ? `Inquiry from ${form.profession}`
            : "Contact Us Website Enquiry",
          message: form.purpose || "Enquiry submitted via Contact Us form.",
        }),
      });

      if (res.ok) {
        setSubmittedSuccess(true);
        setForm({
          name: "",
          companyName: "",
          email: "",
          mobile: "",
          profession: "",
          zipcode: "",
          address: "",
          purpose: "",
        });
      } else {
        const data = await res.json();
        setErrorMsg(data.error || "Failed to submit your enquiry. Please try again.");
      }
    } catch (err) {
      setErrorMsg("Network error. Please try again.");
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

      {/* Global CSS for luxury styling */}
      <style jsx global>{`
        .contact-page-wrap {
          width: 100vw;
          padding: 140px clamp(16px, 5vw, 80px) 70px;
          box-sizing: border-box;
          background: #ffffff;
        }
        @media (max-width: 768px) {
          .contact-page-wrap {
            padding: 110px 16px 50px;
          }
        }

        .contact-input-wrap {
          position: relative;
          display: flex;
          align-items: stretch;
          width: 100%;
          background: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.3);
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
          transition: all 0.2s ease;
        }
        .contact-input-wrap:focus-within {
          box-shadow: 0 0 0 2px #0f172a;
          border-color: #0f172a;
        }
        .contact-input-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          background: #ffffff;
          border-right: 1px solid #f1f5f9;
          color: #64748b;
          flex-shrink: 0;
        }
        .contact-input-field {
          width: 100%;
          padding: 13px 15px;
          border: none;
          outline: none;
          font-size: 13.5px;
          font-family: inherit;
          color: #0f172a;
          background: #ffffff;
        }
        .contact-input-field::placeholder {
          color: #94a3b8;
        }
        .contact-textarea-field {
          width: 100%;
          padding: 13px 15px;
          border: none;
          outline: none;
          font-size: 13.5px;
          font-family: inherit;
          color: #0f172a;
          background: #ffffff;
          resize: vertical;
          min-height: 95px;
        }
        .contact-textarea-field::placeholder {
          color: #94a3b8;
        }
        .contact-select-field {
          width: 100%;
          padding: 13px 15px;
          border: none;
          outline: none;
          font-size: 13.5px;
          font-family: inherit;
          color: #0f172a;
          background: #ffffff;
          cursor: pointer;
        }
      `}</style>

      {/* ── TOP SECTION: Head Office & Interactive Map ── */}
      <section data-header-theme="light" className="contact-page-wrap">
        <div style={{ maxWidth: "1240px", margin: "0 auto", width: "100%" }}>
          {/* Breadcrumbs Navigation */}
          <nav
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "13px",
              color: "#888888",
              marginBottom: "28px",
            }}
          >
            <Link href="/" style={{ color: "#888888", textDecoration: "none" }}>
              Home
            </Link>
            <ChevronRight size={13} />
            <span style={{ color: "#111111", fontWeight: 600 }}>Contact Us</span>
          </nav>

          {/* Centered Luxury Title */}
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <h1
              style={{
                fontSize: "clamp(30px, 3.8vw, 42px)",
                fontWeight: 700,
                color: "#111111",
                margin: "0 0 12px",
                letterSpacing: "-0.02em",
              }}
            >
              Contact Us
            </h1>
            <div
              style={{
                width: "48px",
                height: "3.5px",
                background: "#00AEEF",
                margin: "0 auto 14px",
                borderRadius: "2px",
              }}
            />
            <p style={{ fontSize: "14.5px", color: "#64748b", margin: 0, maxWidth: "580px", marginInline: "auto" }}>
              Reach out to RN Valves &amp; Faucets corporate headquarters for trade partnerships, customer support, and architectural consultations.
            </p>
          </div>

          {/* 2-Column: Head Office (Left) + Google Map (Right) */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "36px",
              alignItems: "stretch",
              marginBottom: "60px",
            }}
          >
            {/* Left: Head Office Card */}
            <div
              style={{
                background: "#F8FAFC",
                border: "1px solid #E2E8F0",
                borderRadius: "16px",
                padding: "36px 32px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: "24px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <span
                    style={{
                      display: "inline-block",
                      fontSize: "11px",
                      fontWeight: 800,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "#00AEEF",
                      marginBottom: "6px",
                    }}
                  >
                    Corporate Headquarters
                  </span>
                  <h2
                    style={{
                      fontSize: "22px",
                      fontWeight: 700,
                      color: "#111111",
                      margin: "0 0 4px",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    Head Office
                  </h2>
                  <p style={{ fontSize: "15px", fontWeight: 700, color: "#0F172A", margin: "0 0 6px" }}>
                    RN Valves &amp; Faucets
                  </p>
                  <p style={{ fontSize: "13.5px", color: "#475569", lineHeight: "1.6", margin: 0 }}>
                    B-68 SITE-4 SAHIBABAD, Ghaziabad, Uttar Pradesh 201010, India
                  </p>
                </div>

                {/* Email, Phone & Hours */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                    paddingTop: "8px",
                    borderTop: "1px solid #E2E8F0",
                  }}
                >
                  <a
                    href="mailto:enquiry@rnvalves.com"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "10px",
                      color: "#0284C7",
                      textDecoration: "none",
                      fontSize: "14px",
                      fontWeight: 600,
                    }}
                  >
                    <Mail size={17} color="#00AEEF" />
                    enquiry@rnvalves.com
                  </a>

                  <a
                    href="tel:1800123400400"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "10px",
                      color: "#0284C7",
                      textDecoration: "none",
                      fontSize: "14px",
                      fontWeight: 600,
                    }}
                  >
                    <Phone size={17} color="#00AEEF" />
                    1800 12340 0400 &nbsp;|&nbsp; 1800 212 0192
                  </a>

                  <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", color: "#64748B", fontSize: "13px" }}>
                    <Clock size={16} color="#94A3B8" />
                    Monday – Saturday: 9:30 AM – 6:30 PM IST
                  </div>
                </div>
              </div>

              {/* QR Code Block */}
              <div
                style={{
                  background: "#FFFFFF",
                  border: "1px solid #E2E8F0",
                  borderRadius: "12px",
                  padding: "16px 20px",
                  display: "flex",
                  alignItems: "center",
                  gap: "18px",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://www.rnvalves.com/uploads/catalogue/qrcodes/67fca5e484603.png"
                  alt="Scan QR for Plumber Enquiry"
                  style={{
                    width: "88px",
                    height: "88px",
                    objectFit: "contain",
                    border: "1px solid #E2E8F0",
                    borderRadius: "8px",
                    padding: "4px",
                    background: "#FFFFFF",
                    flexShrink: 0,
                  }}
                />
                <div>
                  <p style={{ fontSize: "13.5px", fontWeight: 700, color: "#0F172A", margin: "0 0 4px" }}>
                    Plumber &amp; Technician Desk
                  </p>
                  <p style={{ fontSize: "12px", color: "#64748B", margin: 0, lineHeight: 1.4 }}>
                    Scan QR code for dedicated plumber registration &amp; technical assistance.
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Google Map Embed */}
            <div
              style={{
                width: "100%",
                minHeight: "380px",
                borderRadius: "16px",
                overflow: "hidden",
                border: "1px solid #E2E8F0",
                boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
              }}
            >
              <iframe
                title="RN Valves Head Office Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14003.724647276968!2d77.33477174685295!3d28.66177976849932!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cfae9c5758a57%3A0xd35ecac368edf317!2sSahibabad%20Industrial%20Area%20Site%204%2C%20Sahibabad%2C%20Ghaziabad%2C%20Uttar%20Pradesh!5e0!3m2!1sen!2sin!4v1655725215120!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: "380px" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          {/* ── ENQUIRY FORM SECTION (Without Image, Luxury Cyan Banner) ── */}
          <div
            style={{
              borderRadius: "20px",
              overflow: "hidden",
              boxShadow: "0 10px 30px rgba(0, 160, 227, 0.15)",
              background: "#00A0E3",
              padding: "clamp(36px, 5vw, 60px)",
              color: "#ffffff",
              maxWidth: "1000px",
              margin: "0 auto",
            }}
          >
            <div style={{ textAlign: "center", marginBottom: "36px" }}>
              <h2
                style={{
                  fontSize: "clamp(24px, 3vw, 32px)",
                  fontWeight: 800,
                  color: "#ffffff",
                  lineHeight: 1.25,
                  margin: "0 0 10px",
                  letterSpacing: "-0.01em",
                }}
              >
                Looking for Bathroom Solutions? Let’s Talk – Exclusive Offers Inside!
              </h2>
              <p
                style={{
                  fontSize: "15px",
                  color: "rgba(255, 255, 255, 0.94)",
                  margin: 0,
                }}
              >
                Avail the exclusive offers and much more.
              </p>
            </div>

            {/* Feedback messages */}
            {submittedSuccess && (
              <div
                style={{
                  background: "#ffffff",
                  color: "#15803d",
                  padding: "16px 20px",
                  borderRadius: "8px",
                  marginBottom: "24px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  fontSize: "14px",
                  fontWeight: 600,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                }}
              >
                <CheckCircle2 size={20} color="#16a34a" />
                <span>Thank you! Your enquiry has been sent. Our representative will connect with you shortly.</span>
              </div>
            )}

            {errorMsg && (
              <div
                style={{
                  background: "#fef2f2",
                  color: "#b91c1c",
                  padding: "14px 18px",
                  borderRadius: "8px",
                  marginBottom: "24px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  fontSize: "13.5px",
                  fontWeight: 600,
                }}
              >
                <AlertCircle size={18} color="#dc2626" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              {/* Row 1: Full Name + Full Company Name */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                  gap: "18px",
                }}
              >
                <div className="contact-input-wrap">
                  <div className="contact-input-icon">
                    <User size={16} />
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Full Name"
                    required
                    className="contact-input-field"
                  />
                </div>

                <div className="contact-input-wrap">
                  <div className="contact-input-icon">
                    <Building size={16} />
                  </div>
                  <input
                    type="text"
                    name="companyName"
                    value={form.companyName}
                    onChange={handleChange}
                    placeholder="Full Company Name"
                    className="contact-input-field"
                  />
                </div>
              </div>

              {/* Row 2: Email Address + Contact Number */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                  gap: "18px",
                }}
              >
                <div className="contact-input-wrap">
                  <div className="contact-input-icon">
                    <Mail size={16} />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Email Address"
                    required
                    className="contact-input-field"
                  />
                </div>

                <div className="contact-input-wrap">
                  <div className="contact-input-icon">
                    <Phone size={16} />
                  </div>
                  <input
                    type="tel"
                    name="mobile"
                    value={form.mobile}
                    onChange={handleChange}
                    placeholder="Contact Number"
                    required
                    className="contact-input-field"
                  />
                </div>
              </div>

              {/* Row 3: Select Profession + Zipcode */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                  gap: "18px",
                }}
              >
                <div className="contact-input-wrap">
                  <div className="contact-input-icon">
                    <Handshake size={16} />
                  </div>
                  <select
                    name="profession"
                    value={form.profession}
                    onChange={handleChange}
                    className="contact-select-field"
                  >
                    <option value="">Select Profession</option>
                    <option value="Distributor">Distributor</option>
                    <option value="Retailer">Retailer</option>
                    <option value="Dealer">Dealer</option>
                    <option value="Architect">Architect</option>
                    <option value="Interior Designer">Interior Designer</option>
                    <option value="Consultant">Consultant</option>
                    <option value="Contractor">Contractor</option>
                    <option value="Plumber">Plumber</option>
                    <option value="Consumer">Consumer</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="contact-input-wrap">
                  <div className="contact-input-icon">
                    <MapPin size={16} />
                  </div>
                  <input
                    type="text"
                    name="zipcode"
                    value={form.zipcode}
                    onChange={handleChange}
                    placeholder="zipcode"
                    maxLength={6}
                    className="contact-input-field"
                  />
                </div>
              </div>

              {/* Row 4: Full Address */}
              <div className="contact-input-wrap">
                <div className="contact-input-icon">
                  <MapPin size={16} />
                </div>
                <input
                  type="text"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="address"
                  className="contact-input-field"
                />
              </div>

              {/* Row 5: Message / Purpose Textarea */}
              <div className="contact-input-wrap" style={{ alignItems: "flex-start" }}>
                <div className="contact-input-icon" style={{ paddingTop: "14px" }}>
                  <FileText size={16} />
                </div>
                <textarea
                  name="purpose"
                  value={form.purpose}
                  onChange={handleChange}
                  placeholder="purpose / requirements"
                  className="contact-textarea-field"
                />
              </div>

              {/* Submit Button */}
              <div style={{ textAlign: "center", marginTop: "12px" }}>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    background: "#0F172A",
                    color: "#ffffff",
                    border: "none",
                    padding: "15px 44px",
                    fontSize: "15px",
                    fontWeight: 700,
                    borderRadius: "8px",
                    cursor: loading ? "not-allowed" : "pointer",
                    opacity: loading ? 0.7 : 1,
                    transition: "all 0.2s ease",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    boxShadow: "0 4px 14px rgba(0,0,0,0.2)",
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) e.currentTarget.style.background = "#1E293B";
                  }}
                  onMouseLeave={(e) => {
                    if (!loading) e.currentTarget.style.background = "#0F172A";
                  }}
                >
                  {loading ? "Sending..." : "Send Enquiry"}
                  <Send size={16} />
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      <SupportLinksSection />
      <FooterSection />
    </main>
  );
}
