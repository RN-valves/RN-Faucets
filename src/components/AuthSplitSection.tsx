"use client";

import { useState, useEffect } from "react";
import { ChevronDown, CheckCircle, ArrowLeft, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { setAdminAuth, getAdminAuth, logoutAdmin } from "@/utils/adminStore";
import { setCustomerSession, getCustomerSession, clearCustomerSession } from "@/utils/customerAuth";

const LOGIN_BG = "/uploads/auth/login-bg.jpg";

export default function AuthSplitSection() {
  const router = useRouter();
  const [step, setStep] = useState<"mobile" | "otp" | "success">("mobile");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [timer, setTimer] = useState(30);

  // Current logged in user state check
  const [currentUser, setCurrentUser] = useState<{
    mobile: string;
    name?: string;
    userCode: string;
  } | null>(null);

  const cleanPhone = (val?: string) => String(val || "").replace(/\D/g, "").slice(-10);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const admin = getAdminAuth();
      const customer = getCustomerSession();
      const stored = localStorage.getItem("rn_user_session");
      let userObj = null;
      if (stored) {
        try {
          userObj = JSON.parse(stored);
          setCurrentUser(userObj);
        } catch {
          // ignore
        }
      } else if (customer) {
        setCurrentUser(customer);
        userObj = customer;
      }

      if (
        admin ||
        cleanPhone(userObj?.mobile) === "8737029643" ||
        userObj?.userType === "Admin" ||
        userObj?.role === "Super Admin" ||
        cleanPhone(customer?.mobile) === "8737029643" ||
        customer?.userType === "Admin"
      ) {
        setAdminAuth({
          email: "admin.aditya@rnvalves.com",
          name: "Super Admin (Aditya)",
          role: "Super Admin",
        });
        window.location.href = "/admin/dashboard";
      }
    }
  }, []);

  // Timer countdown when on OTP step
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === "otp" && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  // Step 1: Send OTP handler
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (mobile.length < 10 || !agreed) return;

    setLoading(true);
    setErrorMessage("");
    setInfoMessage("");

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile }),
      });
      const data = await res.json();

      if (data.success) {
        setInfoMessage(data.message || "OTP sent successfully!");
        setStep("otp");
        setTimer(30);
      } else {
        setErrorMessage(data.message || "Failed to send OTP. Try again.");
      }
    } catch {
      setErrorMessage("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP handler
  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (otp.length !== 4) return;

    setLoading(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile, otp }),
      });
      const data = await res.json();

      if (data.success) {
        if (typeof window !== "undefined") {
          localStorage.setItem("rn_user_session", JSON.stringify(data.user));
        }
        setCustomerSession(data.user);
        setCurrentUser(data.user);

        const isSuperAdminUser =
          cleanPhone(mobile) === "8737029643" ||
          cleanPhone(data.user?.mobile) === "8737029643" ||
          data.user?.userType === "Admin" ||
          data.user?.role === "Super Admin";

        if (isSuperAdminUser) {
          setAdminAuth({
            email: data.user?.email || "admin.aditya@rnvalves.com",
            name: data.user?.name || "Super Admin (Aditya)",
            role: "Super Admin",
          });
          setStep("success");
          setTimeout(() => {
            window.location.href = "/admin/dashboard";
          }, 300);
        } else {
          setStep("success");
          setTimeout(() => {
            router.push("/");
          }, 1200);
        }
      } else {
        setErrorMessage(data.message || "Invalid OTP. Try again.");
      }
    } catch {
      setErrorMessage("Verification server error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logoutAdmin();
    setCurrentUser(null);
    setStep("mobile");
    setMobile("");
    setOtp("");
    setAgreed(false);
    window.location.href = "/";
  };

  return (
    <div
      id="login-user-content"
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
          minHeight: "min(72vh, 640px)",
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) minmax(360px, 1fr)",
          background: "#ffffff",
          boxShadow: "0 8px 34px rgba(0,0,0,0.08)",
          overflow: "hidden",
        }}
      >
        {/* Left Side Banner Image */}
        <div
          style={{
            minHeight: "520px",
            backgroundImage: `url(${LOGIN_BG})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        {/* Right Side Form Panel */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "clamp(28px, 5vw, 56px)",
            background: "#ffffff",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "340px",
              fontFamily: "'Manrope', system-ui, sans-serif",
            }}
          >
            {/* ── ALREADY LOGGED IN VIEW ── */}
            {currentUser && step !== "otp" ? (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <CheckCircle
                  size={52}
                  color="#059669"
                  style={{ margin: "0 auto 16px" }}
                />
                <h2
                  style={{
                    fontSize: "22px",
                    fontWeight: 700,
                    color: "#1b1b1b",
                    margin: "0 0 8px",
                  }}
                >
                  Welcome Back!
                </h2>
                <p style={{ color: "#555", fontSize: "14px", margin: "0 0 6px" }}>
                  Logged in as <strong>+91 {currentUser.mobile}</strong>
                </p>
                <p
                  style={{
                    color: "#0077B6",
                    fontSize: "12.5px",
                    fontWeight: 600,
                    margin: "0 0 24px",
                  }}
                >
                  User Code: {currentUser.userCode}
                </p>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  {currentUser.mobile === "8737029643" && (
                    <button
                      type="button"
                      onClick={() => {
                        setAdminAuth({
                          email: "admin.aditya@rnvalves.com",
                          name: "Super Admin (Aditya)",
                          role: "Super Admin",
                        });
                        router.push("/admin/dashboard");
                      }}
                      style={{
                        padding: "12px 24px",
                        background: "#0077B6",
                        color: "#fff",
                        border: "none",
                        fontWeight: 700,
                        fontSize: "14px",
                        cursor: "pointer",
                      }}
                    >
                      Open Admin Dashboard →
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => router.push("/")}
                    style={{
                      padding: "12px 24px",
                      background: "#1b1b1b",
                      color: "#fff",
                      border: "none",
                      fontWeight: 600,
                      fontSize: "14px",
                      cursor: "pointer",
                    }}
                  >
                    Go to Homepage
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    style={{
                      padding: "10px 24px",
                      background: "transparent",
                      color: "#dc2626",
                      border: "1px solid #fee2e2",
                      fontWeight: 600,
                      fontSize: "13.5px",
                      cursor: "pointer",
                    }}
                  >
                    Logout Account
                  </button>
                </div>
              </div>
            ) : step === "success" ? (
              /* ── SUCCESS ANIMATION STEP ── */
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <CheckCircle
                  size={60}
                  color="#059669"
                  style={{ margin: "0 auto 16px" }}
                />
                <h2
                  style={{
                    fontSize: "22px",
                    fontWeight: 700,
                    color: "#1b1b1b",
                    margin: "0 0 8px",
                  }}
                >
                  Login Successful!
                </h2>
                <p style={{ color: "#555", fontSize: "14px" }}>
                  Redirecting to RN Valves & Faucets store...
                </p>
              </div>
            ) : step === "otp" ? (
              /* ── STEP 2: VERIFY OTP ── */
              <form onSubmit={handleVerifyOtp}>
                <button
                  type="button"
                  onClick={() => setStep("mobile")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    background: "transparent",
                    border: "none",
                    color: "#666",
                    fontSize: "13px",
                    cursor: "pointer",
                    padding: 0,
                    marginBottom: "16px",
                  }}
                >
                  <ArrowLeft size={14} /> Back to mobile entry
                </button>

                <h1
                  style={{
                    margin: "0 0 8px",
                    color: "#1b1b1b",
                    fontSize: "30px",
                    fontWeight: 600,
                    lineHeight: 1.1,
                  }}
                >
                  Enter Verification Code
                </h1>

                <p
                  style={{
                    margin: "0 0 20px",
                    color: "#555",
                    fontSize: "14px",
                    lineHeight: 1.6,
                  }}
                >
                  We have sent a 4-digit OTP code to <br />
                  <strong style={{ color: "#1b1b1b" }}>+91 {mobile}</strong>
                </p>

                {infoMessage && (
                  <div
                    style={{
                      background: "#e0f2fe",
                      color: "#0369a1",
                      border: "1px solid #bae6fd",
                      padding: "10px 14px",
                      borderRadius: "4px",
                      fontSize: "12.5px",
                      marginBottom: "16px",
                    }}
                  >
                    {infoMessage}
                  </div>
                )}

                {errorMessage && (
                  <div
                    style={{
                      background: "#fee2e2",
                      color: "#991b1b",
                      border: "1px solid #fecaca",
                      padding: "10px 14px",
                      borderRadius: "4px",
                      fontSize: "12.5px",
                      marginBottom: "16px",
                    }}
                  >
                    {errorMessage}
                  </div>
                )}

                <div style={{ marginBottom: "18px" }}>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoFocus
                    placeholder="Enter 4-digit OTP"
                    value={otp}
                    onChange={(e) =>
                      setOtp(e.target.value.replace(/\D/g, "").slice(0, 4))
                    }
                    maxLength={4}
                    style={{
                      width: "100%",
                      height: "48px",
                      border: "1px solid #d1d5db",
                      padding: "0 14px",
                      fontSize: "18px",
                      letterSpacing: "4px",
                      fontWeight: 600,
                      color: "#1b1b1b",
                      textAlign: "center",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "20px",
                    fontSize: "13px",
                  }}
                >
                  <span style={{ color: "#777" }}>
                    {timer > 0 ? `Resend OTP in ${timer}s` : "Didn't get OTP?"}
                  </span>
                  {timer === 0 && (
                    <button
                      type="button"
                      onClick={() => handleSendOtp()}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "#0077B6",
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <RefreshCw size={13} /> Resend OTP
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={otp.length !== 4 || loading}
                  style={{
                    width: "100%",
                    padding: "13px 26px",
                    border: "none",
                    background:
                      otp.length !== 4 || loading ? "#b7b7b7" : "#1b1b1b",
                    color: "#ffffff",
                    fontSize: "14px",
                    fontWeight: 600,
                    cursor:
                      otp.length !== 4 || loading ? "not-allowed" : "pointer",
                  }}
                >
                  {loading ? "Verifying..." : "Verify & Sign In"}
                </button>
              </form>
            ) : (
              /* ── STEP 1: MOBILE NUMBER ENTRY ── */
              <form onSubmit={handleSendOtp}>
                <h1
                  style={{
                    margin: "0 0 10px",
                    color: "#1b1b1b",
                    fontSize: "36px",
                    fontWeight: 500,
                    lineHeight: 1.1,
                    letterSpacing: "-0.02em",
                  }}
                >
                  Let&apos;s Get Started!
                </h1>

                <p
                  style={{
                    margin: "0 0 24px",
                    color: "#4f4f4f",
                    fontSize: "16px",
                    lineHeight: 1.7,
                  }}
                >
                  Please log in to access your account and enjoy all the
                  exclusive features.
                </p>

                {errorMessage && (
                  <div
                    style={{
                      background: "#fee2e2",
                      color: "#991b1b",
                      border: "1px solid #fecaca",
                      padding: "10px 14px",
                      borderRadius: "4px",
                      fontSize: "12.5px",
                      marginBottom: "16px",
                    }}
                  >
                    {errorMessage}
                  </div>
                )}

                <div
                  style={{
                    display: "flex",
                    alignItems: "stretch",
                    height: "48px",
                    border: "1px solid #e5e5e5",
                    background: "#ffffff",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      padding: "0 12px",
                      borderRight: "1px solid #e8e8e8",
                      color: "#777777",
                      fontSize: "14px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <span>+91</span>
                    <ChevronDown size={14} strokeWidth={1.5} color="#8a8a8a" />
                  </div>
                  <input
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    placeholder="Mobile No*"
                    value={mobile}
                    onChange={(e) =>
                      setMobile(
                        e.target.value.replace(/\D/g, "").slice(0, 10)
                      )
                    }
                    style={{
                      flex: 1,
                      minWidth: 0,
                      border: "none",
                      outline: "none",
                      padding: "0 14px",
                      color: "#202020",
                      fontSize: "14px",
                      fontFamily: "'Manrope', system-ui, sans-serif",
                      background: "transparent",
                    }}
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    marginTop: "12px",
                  }}
                >
                  <button
                    type="button"
                    style={{
                      border: "none",
                      background: "transparent",
                      padding: 0,
                      color: "#1d1d1d",
                      fontSize: "14px",
                      fontWeight: 500,
                      textDecoration: "underline",
                      textUnderlineOffset: "3px",
                      cursor: "pointer",
                    }}
                  >
                    Continue with Email
                  </button>
                </div>

                <label
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "10px",
                    marginTop: "22px",
                    color: "#5b5b5b",
                    fontSize: "12.5px",
                    lineHeight: 1.55,
                    cursor: "pointer",
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
                        fontSize: "12.5px",
                        fontWeight: 600,
                      }}
                    >
                      Privacy Policy
                    </Link>{" "}
                    and give my consent.
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={mobile.length < 10 || !agreed || loading}
                  style={{
                    display: "block",
                    minWidth: "132px",
                    margin: "26px auto 0",
                    padding: "13px 26px",
                    border: "none",
                    background:
                      mobile.length < 10 || !agreed || loading
                        ? "#b7b7b7"
                        : "#555555",
                    color: "#ffffff",
                    fontSize: "14px",
                    fontWeight: 600,
                    cursor:
                      mobile.length < 10 || !agreed || loading
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  {loading ? "Sending..." : "Send OTP"}
                </button>

                <p
                  style={{
                    margin: "22px 0 0",
                    textAlign: "center",
                    color: "#707070",
                    fontSize: "14px",
                  }}
                >
                  Don&apos;t have an account?
                </p>

                <div
                  style={{
                    marginTop: "12px",
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "10px",
                    color: "#444444",
                    fontSize: "14px",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => router.push("/retail-user-registration")}
                    style={{
                      border: "none",
                      background: "transparent",
                      padding: 0,
                      color: "#1d1d1d",
                      textDecoration: "underline",
                      textUnderlineOffset: "3px",
                      cursor: "pointer",
                      fontSize: "14px",
                    }}
                  >
                    Join as Personal User
                  </button>
                  <span style={{ color: "#8a8a8a" }}>OR</span>
                  <button
                    type="button"
                    onClick={() => router.push("/business-user-registration")}
                    style={{
                      border: "none",
                      background: "transparent",
                      padding: 0,
                      color: "#1d1d1d",
                      textDecoration: "underline",
                      textUnderlineOffset: "3px",
                      cursor: "pointer",
                      fontSize: "14px",
                    }}
                  >
                    Join as Business User
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
