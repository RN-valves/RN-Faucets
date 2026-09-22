"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import { setCustomerSession } from "@/utils/customerAuth";

const BUSINESS_BG = "/uploads/auth/business-bg.jpg";

const COUNTRY_CODES = ["+91", "+1", "+44", "+61", "+971"];

export default function BusinessUserRegistrationSection() {
  const router = useRouter();

  // Company Details
  const [companyName, setCompanyName] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");

  // Contact Person Details
  const [fullName, setFullName] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");

  // Misc
  const [agreed, setAgreed] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const isFormValid =
    companyName.trim() &&
    gstNumber.trim() &&
    fullName.trim() &&
    mobile.length === 10 &&
    email.includes("@") &&
    agreed;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setErrorMsg("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mobile,
          name: fullName,
          email,
          userType: "Business",
          businessName: companyName,
          gstNumber,
          isDirectRegistration: true,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCustomerSession(data.user);
        if (typeof window !== "undefined") {
          localStorage.setItem("rn_user_session", JSON.stringify(data.user));
        }
        router.push("/account/orders");
      } else {
        setErrorMsg(data.error || "Registration failed. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    boxSizing: "border-box",
    height: "46px",
    border: "1px solid #e0e0e0",
    borderRadius: "2px",
    padding: "0 14px",
    fontSize: "13.5px",
    color: "#222",
    fontFamily: "'Manrope', system-ui, sans-serif",
    outline: "none",
    background: "#fff",
    transition: "border-color 0.18s",
  };

  return (
    <div
      id="business-registration-content"
      style={{
        width: "100%",
        maxWidth: "1280px",
        margin: "0 auto",
        padding: "0 clamp(16px, 3vw, 28px)",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: "100%",
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.05fr) minmax(380px, 1fr)",
          background: "#ffffff",
          boxShadow: "0 8px 34px rgba(0,0,0,0.09)",
          overflow: "hidden",
          minHeight: "min(75vh, 660px)",
        }}
      >
        {/* ── LEFT: Image ── */}
        <div
          style={{
            position: "relative",
            minHeight: "520px",
          }}
        >
          <Image
            src={BUSINESS_BG}
            alt="Anti-skid tile showcase"
            fill
            style={{ objectFit: "cover", objectPosition: "center" }}
            priority
            unoptimized
          />
        </div>

        {/* ── RIGHT: Form Panel ── */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            padding: "clamp(28px, 4vw, 48px) clamp(24px, 4vw, 44px)",
            background: "#ffffff",
            overflowY: "auto",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "380px",
              fontFamily: "'Manrope', system-ui, sans-serif",
            }}
          >
            {/* Title */}
            <h1
              style={{
                margin: "0 0 6px",
                color: "#1b1b1b",
                fontSize: "clamp(20px, 2.2vw, 26px)",
                fontWeight: 600,
                lineHeight: 1.25,
                letterSpacing: "-0.01em",
              }}
            >
              Join as Business User Registration
            </h1>

            <p
              style={{
                margin: "0 0 22px",
                color: "#4f4f4f",
                fontSize: "13.5px",
                lineHeight: 1.65,
              }}
            >
              Complete the form below to{" "}
              <span style={{ color: "#b5873a", fontWeight: 600 }}>unlock</span>{" "}
              exclusive features and benefits.
            </p>

            {/* ── Company Details ── */}
            <p
              style={{
                margin: "0 0 10px",
                color: "#1b1b1b",
                fontSize: "13px",
                fontWeight: 600,
                letterSpacing: "0.01em",
              }}
            >
              Company Details
            </p>

            {/* Row: Company Name + GST */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px",
                marginBottom: "10px",
              }}
            >
              <input
                type="text"
                placeholder="Name of Company*"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                style={inputStyle}
              />
              <input
                type="text"
                placeholder="Company GST number*"
                value={gstNumber}
                onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                style={inputStyle}
              />
            </div>

            {/* Company Address */}
            <input
              type="text"
              placeholder="Company Address"
              value={companyAddress}
              onChange={(e) => setCompanyAddress(e.target.value)}
              style={{ ...inputStyle, marginBottom: "18px" }}
            />

            {/* ── Contact Person Details ── */}
            <p
              style={{
                margin: "0 0 10px",
                color: "#1b1b1b",
                fontSize: "13px",
                fontWeight: 600,
                letterSpacing: "0.01em",
              }}
            >
              Contact Person Details
            </p>

            {/* Row: Full Name + Mobile */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px",
                marginBottom: "10px",
              }}
            >
              <input
                type="text"
                placeholder="Full Name*"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                style={inputStyle}
              />

              {/* Mobile with country code */}
              <div
                style={{
                  display: "flex",
                  height: "46px",
                  border: "1px solid #e0e0e0",
                  borderRadius: "2px",
                  overflow: "visible",
                  position: "relative",
                }}
              >
                {/* Country code selector */}
                <button
                  type="button"
                  onClick={() => setShowDropdown((p) => !p)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "3px",
                    padding: "0 8px",
                    background: "transparent",
                    border: "none",
                    borderRight: "1px solid #e0e0e0",
                    color: "#555",
                    fontSize: "13px",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}

                >
                  {countryCode}
                  <ChevronDown size={13} strokeWidth={1.8} color="#8a8a8a" />
                </button>

                {showDropdown && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      zIndex: 99,
                      background: "#fff",
                      border: "1px solid #e0e0e0",
                      borderRadius: "2px",
                      boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
                      minWidth: "80px",
                    }}
                  >
                    {COUNTRY_CODES.map((code) => (
                      <button
                        key={code}
                        type="button"
                        onClick={() => {
                          setCountryCode(code);
                          setShowDropdown(false);
                        }}
                        style={{
                          display: "block",
                          width: "100%",
                          padding: "8px 12px",
                          background:
                            code === countryCode ? "#f5f5f5" : "transparent",
                          border: "none",
                          textAlign: "left",
                          fontSize: "13px",
                          color: "#222",
                          cursor: "pointer",
                        }}
                      >
                        {code}
                      </button>
                    ))}
                  </div>
                )}

                <input
                  type="tel"
                  inputMode="numeric"
                  placeholder="Mobile No*"
                  value={mobile}
                  onChange={(e) =>
                    setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))
                  }
                  style={{
                    flex: 1,
                    minWidth: 0,
                    border: "none",
                    outline: "none",
                    padding: "0 10px",
                    fontSize: "13px",
                    color: "#222",
                    fontFamily: "'Manrope', system-ui, sans-serif",
                    background: "transparent",
                  }}
                />
              </div>
            </div>

            {/* Email */}
            <input
              type="email"
              placeholder="Email ID*"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ ...inputStyle, marginBottom: "14px" }}
            />

            {/* Privacy Policy Checkbox */}
            <label
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "9px",
                color: "#5b5b5b",
                fontSize: "12px",
                lineHeight: 1.55,
                cursor: "pointer",
                marginBottom: "18px",
              }}
            >
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                style={{
                  marginTop: "2px",
                  accentColor: "#2d2d2d",
                  flexShrink: 0,
                }}
              />
              <span>
                I have gone through the{" "}
                <Link
                  href="/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    color: "#00AEEF",
                    textDecoration: "underline",
                    cursor: "pointer",
                    fontSize: "12px",
                    fontWeight: 600,
                  }}
                >
                  Privacy Policy
                </Link>{" "}
                and give my consent.
              </span>
            </label>

            {errorMsg && (
              <div
                style={{
                  marginBottom: "16px",
                  padding: "10px 14px",
                  background: "#fff1f0",
                  border: "1px solid #ffa39e",
                  borderRadius: "4px",
                  color: "#cf1322",
                  fontSize: "13px",
                  textAlign: "center",
                }}
              >
                {errorMsg}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!isFormValid || loading}
              style={{
                display: "block",
                padding: "12px 32px",
                border: "none",
                background: !isFormValid ? "#b7b7b7" : "#3d3d3d",
                color: "#ffffff",
                fontSize: "14px",
                fontWeight: 600,
                cursor: !isFormValid ? "not-allowed" : "pointer",
                letterSpacing: "0.03em",
                transition: "background 0.2s",
                borderRadius: "2px",
                marginBottom: "14px",
              }}
            >
              Submit
            </button>

            {/* Already have account */}
            <p
              style={{
                margin: "0 0 16px",
                color: "#555",
                fontSize: "13px",
              }}
            >
              Already have an account.{" "}
              <button
                type="button"
                onClick={() => router.push("/login-user")}
                style={{
                  border: "none",
                  background: "transparent",
                  padding: 0,
                  color: "#1d6cb0",
                  textDecoration: "underline",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: 600,
                }}
              >
                Login Now
              </button>
            </p>

            {/* Join as Personal User card */}
            <button
              type="button"
              onClick={() => router.push("/retail-user-registration")}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
                padding: "14px 16px",
                border: "1px solid #e8e8e8",
                borderRadius: "4px",
                background: "#f9f9f9",
                cursor: "pointer",
                textAlign: "left",
                gap: "12px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                {/* Icon placeholder */}
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    flexShrink: 0,
                    background: "#ececec",
                    borderRadius: "4px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#888"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M3 9h18M9 21V9" />
                  </svg>
                </div>
                <div>
                  <p
                    style={{
                      margin: 0,
                      fontWeight: 700,
                      fontSize: "13px",
                      color: "#1b1b1b",
                    }}
                  >
                    Join as Personal User
                  </p>
                  <p
                    style={{
                      margin: "2px 0 0",
                      fontSize: "11.5px",
                      color: "#888",
                      lineHeight: 1.45,
                    }}
                  >
                    Take the first step toward a better,
                    <br />
                    more personalized experience.
                  </p>
                </div>
              </div>
              <ChevronRight size={18} strokeWidth={1.6} color="#999" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
