"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import FooterSection from "@/components/FooterSection";
import SupportLinksSection from "@/components/SupportLinksSection";
import {
  getCustomerSession,
  setCustomerSession,
  clearCustomerSession,
  type CustomerSession,
} from "@/utils/customerAuth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  Mail,
  Phone,
  Building2,
  MapPin,
  Save,
  Package,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  ArrowRight,
  FileText,
  Sparkles,
} from "lucide-react";

export default function CustomerProfilePage() {
  const router = useRouter();
  const [session, setSession] = useState<CustomerSession | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [profession, setProfession] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipcode, setZipcode] = useState("");

  useEffect(() => {
    setIsMounted(true);
    const activeSession = getCustomerSession();
    if (!activeSession) {
      router.push("/login-user?redirect=/account/profile");
      return;
    }
    setSession(activeSession);
    setMobile(activeSession.mobile || "");

    // Fetch live user profile from server
    fetchProfile();
  }, [router]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/user/profile");
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setName(data.user.name || "");
          setEmail(data.user.email || "");
          setMobile(data.user.mobile || "");
          setBusinessName(data.user.businessName || "");
          setGstNumber(data.user.gstNumber || "");
          setProfession(data.user.profession || "");
          setAddress(data.user.address || "");
          setCity(data.user.city || "");
          setState(data.user.state || "");
          setZipcode(data.user.zipcode || "");

          // Update local session
          const activeSession = getCustomerSession();
          if (activeSession) {
            setCustomerSession({
              ...activeSession,
              name: data.user.name,
              email: data.user.email,
              businessName: data.user.businessName,
              gstNumber: data.user.gstNumber,
            });
          }
        }
      }
    } catch (err) {
      console.error("Failed to load profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    // Basic GST Validation if provided
    const cleanGst = gstNumber.trim().toUpperCase();
    if (cleanGst && cleanGst.length !== 15) {
      setErrorMsg("GST Number must be exactly 15 alphanumeric characters (e.g. 07AAAAA0000A1Z5).");
      setIsSaving(false);
      return;
    }

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          businessName: businessName.trim(),
          gstNumber: cleanGst,
          profession: profession.trim(),
          address: address.trim(),
          city: city.trim(),
          state: state.trim(),
          zipcode: zipcode.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save profile changes.");
      }

      setSuccessMsg("Profile and GST billing details updated successfully!");
      if (session) {
        setCustomerSession({
          ...session,
          name: data.user?.name || name,
          email: data.user?.email || email,
          businessName: data.user?.businessName || businessName,
          gstNumber: data.user?.gstNumber || cleanGst,
          userType: data.user?.userType || session.userType,
        });
      }

      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong while saving profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    clearCustomerSession();
    if (typeof window !== "undefined") {
      localStorage.removeItem("rn_admin_session");
      localStorage.removeItem("rn_user_session");
      localStorage.removeItem("rn_customer_session");
      window.location.href = "/";
    }
  };

  if (!isMounted || !session) return null;

  return (
    <main
      style={{
        minHeight: "100vh",
        width: "100%",
        background: "#FFFFFF",
        overflowX: "hidden",
      }}
    >
      <Header />

      <section
        data-header-theme="light"
        style={{
          width: "100vw",
          padding: "130px clamp(16px, 5vw, 80px) 70px",
          boxSizing: "border-box",
          fontFamily: "'Manrope', Helvetica, Arial, sans-serif",
          background: "#FFFFFF",
        }}
      >
        <div style={{ maxWidth: "1280px", margin: "0 auto", width: "100%" }}>
          {/* Breadcrumbs Navigation */}
          <nav
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "13px",
              color: "#888888",
              marginBottom: "32px",
            }}
          >
            <Link href="/" style={{ color: "#888888", textDecoration: "none" }}>
              Home
            </Link>
            <span>&gt;</span>
            <Link href="/account/orders" style={{ color: "#888888", textDecoration: "none" }}>
              My Account
            </Link>
            <span>&gt;</span>
            <span style={{ color: "#111111", fontWeight: 500 }}>Profile &amp; GST Details</span>
          </nav>

          {/* Clean Luxury Account Header Banner */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              flexWrap: "wrap",
              gap: "24px",
              paddingBottom: "32px",
              borderBottom: "1px solid #E5E5E5",
              marginBottom: "36px",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                <h1
                  style={{
                    fontSize: "clamp(26px, 3.2vw, 36px)",
                    fontWeight: 600,
                    color: "#111111",
                    margin: 0,
                    letterSpacing: "-0.02em",
                  }}
                >
                  My Profile &amp; GST Settings
                </h1>
                {gstNumber && (
                  <span
                    style={{
                      background: "#F0FDF4",
                      color: "#166534",
                      border: "1px solid #BBF7D0",
                      padding: "4px 10px",
                      borderRadius: "20px",
                      fontSize: "12px",
                      fontWeight: 700,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "5px",
                    }}
                  >
                    <ShieldCheck size={14} /> GST Verified
                  </span>
                )}
              </div>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  gap: "12px",
                  fontSize: "14px",
                  color: "#666666",
                }}
              >
                <span>
                  Customer: <strong style={{ color: "#111111", fontWeight: 600 }}>{name || session.name || "Customer"}</strong>
                </span>
                <span>•</span>
                <span>+91 {mobile || session.mobile}</span>
                {email && (
                  <>
                    <span>•</span>
                    <span>{email}</span>
                  </>
                )}
                <span>•</span>
                <span
                  style={{
                    background: "#F1F5F9",
                    padding: "3px 10px",
                    borderRadius: "20px",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#334155",
                  }}
                >
                  {session.userType === "Business" ? "B2B Channel Partner" : "Retail Customer"}
                </span>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
              <Link
                href="/account/orders"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 18px",
                  border: "1px solid #E5E5E5",
                  background: "#FFFFFF",
                  borderRadius: "6px",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#111111",
                  textDecoration: "none",
                  transition: "all 0.2s ease",
                }}
              >
                <Package size={15} />
                View My Orders
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 20px",
                  border: "1px solid #E5E5E5",
                  background: "#FFFFFF",
                  borderRadius: "6px",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#dc2626",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                <LogOut size={15} />
                Sign Out
              </button>
            </div>
          </div>

          {/* Account Sub-Navigation Tabs */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "24px",
              borderBottom: "1px solid #E5E5E5",
              marginBottom: "32px",
            }}
          >
            <Link
              href="/account/orders"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "0 0 14px 0",
                fontSize: "14px",
                fontWeight: 600,
                color: "#666666",
                textDecoration: "none",
                borderBottom: "2px solid transparent",
                transition: "all 0.2s ease",
              }}
            >
              <Package size={16} />
              My Orders &amp; Tracking
            </Link>

            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "0 0 14px 0",
                fontSize: "14px",
                fontWeight: 700,
                color: "#111111",
                borderBottom: "2px solid #111111",
              }}
            >
              <User size={16} />
              Profile &amp; GST Details
            </span>
          </div>

          {/* Status Notifications */}
          {successMsg && (
            <div
              style={{
                marginBottom: "28px",
                padding: "16px 20px",
                background: "#F0FDF4",
                border: "1px solid #BBF7D0",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                color: "#15803D",
                fontSize: "14px",
                fontWeight: 600,
              }}
            >
              <CheckCircle2 size={20} color="#16A34A" style={{ flexShrink: 0 }} />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div
              style={{
                marginBottom: "28px",
                padding: "16px 20px",
                background: "#FEF2F2",
                border: "1px solid #FECACA",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                color: "#B91C1C",
                fontSize: "14px",
                fontWeight: 600,
              }}
            >
              <AlertCircle size={20} color="#DC2626" style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          {loading ? (
            <div
              style={{
                background: "#FAFAFA",
                borderRadius: "8px",
                padding: "60px 20px",
                textAlign: "center",
                border: "1px solid #E5E5E5",
              }}
            >
              <Loader2 size={32} className="animate-spin" style={{ margin: "0 auto 16px auto", color: "#111111" }} />
              <p style={{ fontSize: "15px", color: "#666666", margin: 0 }}>
                Loading your profile and tax details...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSaveProfile} style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
              {/* Card 1: Personal Contact Information */}
              <div
                style={{
                  background: "#FFFFFF",
                  border: "1px solid #E5E5E5",
                  borderRadius: "8px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    padding: "18px 24px",
                    background: "#FAFAFA",
                    borderBottom: "1px solid #E5E5E5",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <User size={18} color="#111111" />
                    <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#111111", margin: 0 }}>
                      Personal Contact Information
                    </h2>
                  </div>
                  <span style={{ fontSize: "12px", color: "#888888" }}>Primary Account Details</span>
                </div>

                <div
                  style={{
                    padding: "24px",
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                    gap: "20px",
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "12px",
                        fontWeight: 700,
                        color: "#333333",
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                        marginBottom: "8px",
                      }}
                    >
                      Full Name <span style={{ color: "#DC2626" }}>*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "12px 14px",
                        border: "1px solid #D1D5DB",
                        borderRadius: "6px",
                        fontSize: "14px",
                        color: "#111111",
                        background: "#FFFFFF",
                        outline: "none",
                        boxSizing: "border-box",
                        transition: "border-color 0.2s ease",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = "#111111")}
                      onBlur={(e) => (e.target.style.borderColor = "#D1D5DB")}
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "12px",
                        fontWeight: 700,
                        color: "#333333",
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                        marginBottom: "8px",
                      }}
                    >
                      Registered Mobile Number
                    </label>
                    <input
                      type="text"
                      disabled
                      value={mobile ? `+91 ${mobile}` : ""}
                      style={{
                        width: "100%",
                        padding: "12px 14px",
                        border: "1px solid #E5E7EB",
                        borderRadius: "6px",
                        fontSize: "14px",
                        fontWeight: 600,
                        color: "#6B7280",
                        background: "#F9FAFB",
                        boxSizing: "border-box",
                        cursor: "not-allowed",
                      }}
                    />
                    <span style={{ display: "block", fontSize: "11px", color: "#888888", marginTop: "5px" }}>
                      Locked to your registered login phone number
                    </span>
                  </div>

                  <div style={{ gridColumn: "1 / -1" }}>
                    <label
                      style={{
                        display: "block",
                        fontSize: "12px",
                        fontWeight: 700,
                        color: "#333333",
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                        marginBottom: "8px",
                      }}
                    >
                      Email Address (For Invoices &amp; Tracking Alerts)
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. rahul.sharma@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "12px 14px",
                        border: "1px solid #D1D5DB",
                        borderRadius: "6px",
                        fontSize: "14px",
                        color: "#111111",
                        background: "#FFFFFF",
                        outline: "none",
                        boxSizing: "border-box",
                        transition: "border-color 0.2s ease",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = "#111111")}
                      onBlur={(e) => (e.target.style.borderColor = "#D1D5DB")}
                    />
                    <span style={{ display: "block", fontSize: "12px", color: "#666666", marginTop: "6px" }}>
                      Order confirmations, official GST tax invoices, and shipment tracking links are sent to this email.
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 2: GST & B2B Billing Details */}
              <div
                style={{
                  background: "#FFFFFF",
                  border: "1px solid #E5E5E5",
                  borderRadius: "8px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    padding: "18px 24px",
                    background: "#FAFAFA",
                    borderBottom: "1px solid #E5E5E5",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <Building2 size={18} color="#111111" />
                    <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#111111", margin: 0 }}>
                      GST &amp; Business Invoice Details (Optional)
                    </h2>
                  </div>
                  <span
                    style={{
                      background: "#EFF6FF",
                      color: "#1D4ED8",
                      padding: "3px 8px",
                      borderRadius: "4px",
                      fontSize: "11px",
                      fontWeight: 700,
                    }}
                  >
                    B2B Input Tax Credit
                  </span>
                </div>

                <div
                  style={{
                    padding: "24px",
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                    gap: "20px",
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "12px",
                        fontWeight: 700,
                        color: "#333333",
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                        marginBottom: "8px",
                      }}
                    >
                      GST Number (GSTIN)
                    </label>
                    <input
                      type="text"
                      maxLength={15}
                      placeholder="e.g. 07AAAAA0000A1Z5"
                      value={gstNumber}
                      onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                      style={{
                        width: "100%",
                        padding: "12px 14px",
                        border: "1px solid #D1D5DB",
                        borderRadius: "6px",
                        fontSize: "14px",
                        fontFamily: "monospace",
                        fontWeight: 700,
                        letterSpacing: "0.05em",
                        color: "#111111",
                        background: "#FFFFFF",
                        textTransform: "uppercase",
                        outline: "none",
                        boxSizing: "border-box",
                        transition: "border-color 0.2s ease",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = "#111111")}
                      onBlur={(e) => (e.target.style.borderColor = "#D1D5DB")}
                    />
                    <span style={{ display: "block", fontSize: "12px", color: "#666666", marginTop: "6px" }}>
                      15-character GSTIN. Adding this ensures your GST number prints directly on all tax invoices.
                    </span>
                  </div>

                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "12px",
                        fontWeight: 700,
                        color: "#333333",
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                        marginBottom: "8px",
                      }}
                    >
                      Company / Registered Business Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Sharma Sanitary &amp; Bath Fittings"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "12px 14px",
                        border: "1px solid #D1D5DB",
                        borderRadius: "6px",
                        fontSize: "14px",
                        color: "#111111",
                        background: "#FFFFFF",
                        outline: "none",
                        boxSizing: "border-box",
                        transition: "border-color 0.2s ease",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = "#111111")}
                      onBlur={(e) => (e.target.style.borderColor = "#D1D5DB")}
                    />
                    <span style={{ display: "block", fontSize: "12px", color: "#666666", marginTop: "6px" }}>
                      Exact legal name registered on your GST certificate.
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 3: Default Delivery Address Details */}
              <div
                style={{
                  background: "#FFFFFF",
                  border: "1px solid #E5E5E5",
                  borderRadius: "8px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    padding: "18px 24px",
                    background: "#FAFAFA",
                    borderBottom: "1px solid #E5E5E5",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <MapPin size={18} color="#111111" />
                  <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#111111", margin: 0 }}>
                    Default Shipping &amp; Billing Address
                  </h2>
                </div>

                <div
                  style={{
                    padding: "24px",
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                    gap: "20px",
                  }}
                >
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label
                      style={{
                        display: "block",
                        fontSize: "12px",
                        fontWeight: 700,
                        color: "#333333",
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                        marginBottom: "8px",
                      }}
                    >
                      Street Address / Premises
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Shop #12, Marble Market, Ring Road"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "12px 14px",
                        border: "1px solid #D1D5DB",
                        borderRadius: "6px",
                        fontSize: "14px",
                        color: "#111111",
                        background: "#FFFFFF",
                        outline: "none",
                        boxSizing: "border-box",
                        transition: "border-color 0.2s ease",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = "#111111")}
                      onBlur={(e) => (e.target.style.borderColor = "#D1D5DB")}
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "12px",
                        fontWeight: 700,
                        color: "#333333",
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                        marginBottom: "8px",
                      }}
                    >
                      City
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. New Delhi"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "12px 14px",
                        border: "1px solid #D1D5DB",
                        borderRadius: "6px",
                        fontSize: "14px",
                        color: "#111111",
                        background: "#FFFFFF",
                        outline: "none",
                        boxSizing: "border-box",
                        transition: "border-color 0.2s ease",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = "#111111")}
                      onBlur={(e) => (e.target.style.borderColor = "#D1D5DB")}
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "12px",
                        fontWeight: 700,
                        color: "#333333",
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                        marginBottom: "8px",
                      }}
                    >
                      State
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Delhi"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "12px 14px",
                        border: "1px solid #D1D5DB",
                        borderRadius: "6px",
                        fontSize: "14px",
                        color: "#111111",
                        background: "#FFFFFF",
                        outline: "none",
                        boxSizing: "border-box",
                        transition: "border-color 0.2s ease",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = "#111111")}
                      onBlur={(e) => (e.target.style.borderColor = "#D1D5DB")}
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "12px",
                        fontWeight: 700,
                        color: "#333333",
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                        marginBottom: "8px",
                      }}
                    >
                      PIN Code
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="e.g. 110001"
                      value={zipcode}
                      onChange={(e) => setZipcode(e.target.value.replace(/\D/g, ""))}
                      style={{
                        width: "100%",
                        padding: "12px 14px",
                        border: "1px solid #D1D5DB",
                        borderRadius: "6px",
                        fontSize: "14px",
                        color: "#111111",
                        background: "#FFFFFF",
                        outline: "none",
                        boxSizing: "border-box",
                        transition: "border-color 0.2s ease",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = "#111111")}
                      onBlur={(e) => (e.target.style.borderColor = "#D1D5DB")}
                    />
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  alignItems: "center",
                  gap: "16px",
                  paddingTop: "12px",
                }}
              >
                <Link
                  href="/account/orders"
                  style={{
                    padding: "12px 24px",
                    border: "1px solid #E5E5E5",
                    borderRadius: "6px",
                    background: "#FFFFFF",
                    color: "#666666",
                    fontSize: "14px",
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  Cancel
                </Link>

                <button
                  type="submit"
                  disabled={isSaving}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "12px 32px",
                    background: "#111111",
                    color: "#FFFFFF",
                    border: "none",
                    borderRadius: "6px",
                    fontSize: "14px",
                    fontWeight: 700,
                    cursor: isSaving ? "not-allowed" : "pointer",
                    opacity: isSaving ? 0.7 : 1,
                    transition: "all 0.2s ease",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  }}
                >
                  {isSaving ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Saving Details...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Save Profile &amp; GST Details
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </section>

      <SupportLinksSection />
      <FooterSection />
    </main>
  );
}
