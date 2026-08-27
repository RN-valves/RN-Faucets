"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import FooterSection from "@/components/FooterSection";
import SupportLinksSection from "@/components/SupportLinksSection";
import { useRouter } from "next/navigation";
import { setCustomerSession, getCustomerSession } from "@/utils/customerAuth";
import { setAdminAuth, getAdminAuth } from "@/utils/adminStore";
import {
  Phone,
  Lock,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Building2,
  UserCheck,
  KeyRound,
  Eye,
  EyeOff,
} from "lucide-react";
import Link from "next/link";

export default function CustomerLoginPage() {
  const router = useRouter();
  const [authMethod, setAuthMethod] = useState<"otp" | "password">("otp");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [userType, setUserType] = useState<"Customer" | "Business">("Customer");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [gstNumber, setGstNumber] = useState("");

  const [otp, setOtp] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [demoNotice, setDemoNotice] = useState("");

  const cleanPhone = (val?: string) => String(val || "").replace(/\D/g, "").slice(-10);

  useEffect(() => {
    const admin = getAdminAuth();
    const customer = getCustomerSession();
    if (
      admin ||
      cleanPhone(customer?.mobile) === "8737029643" ||
      customer?.userType === "Admin" ||
      customer?.role === "Super Admin"
    ) {
      window.location.href = "/admin/dashboard";
    }
  }, []);

  // Step 1: Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const phone10 = cleanPhone(mobile);
    if (!phone10 || phone10.length !== 10) {
      setErrorMsg("Please enter a valid 10-digit mobile number.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile: phone10 }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setDemoNotice(data.message);
        setStep("otp");
      } else {
        setErrorMsg(data.error || "Failed to send OTP. Try again.");
      }
    } catch (err) {
      setErrorMsg("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const fullOtp = otp.join("");
    if (fullOtp.length !== 4) {
      setErrorMsg("Please enter the complete 4-digit OTP.");
      return;
    }

    const phone10 = cleanPhone(mobile);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mobile: phone10,
          otp: fullOtp,
          name,
          email,
          userType,
          businessName,
          gstNumber,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setCustomerSession(data.user);
        if (typeof window !== "undefined") {
          localStorage.setItem("rn_user_session", JSON.stringify(data.user));
        }

        const isSuperAdminUser =
          cleanPhone(phone10) === "8737029643" ||
          cleanPhone(data.user?.mobile) === "8737029643" ||
          data.user?.userType === "Admin" ||
          data.user?.role === "Super Admin";

        if (isSuperAdminUser) {
          setAdminAuth({
            email: data.user?.email || "admin.aditya@rnvalves.com",
            name: data.user?.name || "Super Admin (Aditya)",
            role: "Super Admin",
          });
          window.location.href = "/admin/dashboard";
        } else {
          router.push("/account/orders");
        }
      } else {
        setErrorMsg(data.error || "Invalid OTP. Please enter 1234.");
      }
    } catch (err) {
      setErrorMsg("Network error during verification.");
    } finally {
      setLoading(false);
    }
  };

  // Password Login Handler
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const phone10 = cleanPhone(mobile);
    if (!phone10 || phone10.length !== 10) {
      setErrorMsg("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (!password) {
      setErrorMsg("Please enter your account password.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile: phone10, password }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setCustomerSession(data.user);
        if (typeof window !== "undefined") {
          localStorage.setItem("rn_user_session", JSON.stringify(data.user));
        }

        const isSuperAdminUser =
          cleanPhone(phone10) === "8737029643" ||
          cleanPhone(data.user?.mobile) === "8737029643" ||
          data.user?.userType === "Admin" ||
          data.user?.role === "Super Admin";

        if (isSuperAdminUser) {
          setAdminAuth({
            email: data.user?.email || "admin.aditya@rnvalves.com",
            name: data.user?.name || "Super Admin (Aditya)",
            role: "Super Admin",
          });
          window.location.href = "/admin/dashboard";
        } else {
          router.push("/account/orders");
        }
      } else {
        setErrorMsg(data.error || "Invalid login credentials.");
      }
    } catch (err) {
      setErrorMsg("Network error during password login.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const newOtp = [...otp];
    newOtp[index] = val.slice(-1);
    setOtp(newOtp);

    // Auto-focus next input
    if (val && index < 3) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  return (
    <main className="min-h-screen w-full bg-[#FFFFFF] flex flex-col font-sans text-slate-900">
      <Header />

      <section
        data-header-theme="light"
        className="flex-1 w-full pt-[130px] pb-[80px] px-4 flex items-center justify-center bg-slate-50/60"
      >
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl space-y-6 relative overflow-hidden">
          {/* Top Brand Decorative Header */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center mx-auto font-bold text-xl shadow-md">
              RN
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Customer & Partner Portal
            </h1>
            <p className="text-xs text-slate-500">
              Sign in via Mobile OTP or Password to track past orders, shipping status, and B2B pricing
            </p>
          </div>

          {/* Authentication Method Tabs (OTP vs Password) */}
          <div className="flex border-b border-slate-200">
            <button
              type="button"
              onClick={() => { setAuthMethod("otp"); setStep("phone"); setErrorMsg(""); }}
              className={`flex-1 pb-3 text-xs font-bold border-b-2 transition flex items-center justify-center gap-1.5 ${
                authMethod === "otp" ? "border-slate-900 text-slate-900" : "border-transparent text-slate-400 hover:text-slate-700"
              }`}
            >
              <Phone size={14} />
              Login via Mobile OTP
            </button>
            <button
              type="button"
              onClick={() => { setAuthMethod("password"); setErrorMsg(""); }}
              className={`flex-1 pb-3 text-xs font-bold border-b-2 transition flex items-center justify-center gap-1.5 ${
                authMethod === "password" ? "border-slate-900 text-slate-900" : "border-transparent text-slate-400 hover:text-slate-700"
              }`}
            >
              <KeyRound size={14} />
              Login via Password
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium text-center">
              {errorMsg}
            </div>
          )}

          {demoNotice && authMethod === "otp" && step === "otp" && (
            <div className="p-3 bg-amber-50 border border-amber-300 text-amber-900 rounded-xl text-xs font-medium text-center space-y-1">
              <p className="font-bold flex items-center justify-center gap-1">
                <Sparkles size={14} className="text-amber-600" />
                Demo 4-Digit OTP Sent!
              </p>
              <p className="font-mono text-xs">Enter OTP: <strong>1234</strong></p>
            </div>
          )}

          {/* OPTION 1: LOGIN VIA OTP */}
          {authMethod === "otp" && (
            <>
              {/* User Type Switcher */}
              {step === "phone" && (
                <div className="flex bg-slate-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setUserType("Customer")}
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 ${
                      userType === "Customer" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    <UserCheck size={14} />
                    Retail Consumer
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserType("Business")}
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 ${
                      userType === "Business" ? "bg-slate-900 text-white shadow-sm" : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    <Building2 size={14} />
                    B2B Business Partner
                  </button>
                </div>
              )}

              {/* STEP 1: Enter Mobile Number */}
              {step === "phone" ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                      Mobile Number *
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3.5 text-slate-500 text-sm font-bold border-r pr-2 border-slate-200">
                        +91
                      </span>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        placeholder="Enter 10-digit mobile number"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                        className="w-full pl-16 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                      />
                    </div>
                  </div>

                  {userType === "Business" && (
                    <div className="space-y-3 pt-2 border-t border-slate-100">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">
                          Business / Firm Name (Optional)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Sharma Hardware & Sanitary"
                          value={businessName}
                          onChange={(e) => setBusinessName(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">
                          GST Number (Optional)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 07AAAAA0000A1Z5"
                          value={gstNumber}
                          onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono uppercase"
                        />
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm rounded-xl transition flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                  >
                    {loading ? "Sending OTP..." : "Get Verification OTP"}
                    <ArrowRight size={16} />
                  </button>
                </form>
              ) : (
                /* STEP 2: Enter 4-Digit OTP */
                <form onSubmit={handleVerifyOtp} className="space-y-5">
                  <div className="text-center space-y-1">
                    <p className="text-xs text-slate-500">
                      Enter 4-digit OTP sent to <strong>+91 {mobile}</strong>
                    </p>
                    <button
                      type="button"
                      onClick={() => setStep("phone")}
                      className="text-xs text-sky-600 font-semibold underline"
                    >
                      Change mobile number
                    </button>
                  </div>

                  {/* 4 OTP Boxes */}
                  <div className="flex justify-center gap-3">
                    {otp.map((digit, idx) => (
                      <input
                        key={idx}
                        id={`otp-input-${idx}`}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        className="w-14 h-14 text-center text-2xl font-extrabold bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                      />
                    ))}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm rounded-xl transition flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                  >
                    {loading ? "Verifying..." : "Verify OTP & View Orders"}
                    <CheckCircle2 size={16} />
                  </button>

                  <div className="text-center text-xs text-slate-500">
                    Didn&apos;t receive code?{" "}
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      className="text-slate-900 font-bold underline"
                    >
                      Resend OTP
                    </button>
                  </div>
                </form>
              )}
            </>
          )}

          {/* OPTION 2: LOGIN VIA MOBILE + PASSWORD */}
          {authMethod === "password" && (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Mobile Number *
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-slate-500 text-sm font-bold border-r pr-2 border-slate-200">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="Enter 10-digit mobile number"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                    className="w-full pl-16 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Account Password *
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Enter account password (Demo: 123456)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-4 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-slate-400 hover:text-slate-700 p-1"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 italic">Demo Password: <strong>123456</strong></p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm rounded-xl transition flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
              >
                {loading ? "Authenticating..." : "Sign In with Password"}
                <Lock size={16} />
              </button>
            </form>
          )}

          {/* Footer Security Badge */}
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 border-t pt-4">
            <ShieldCheck size={14} className="text-emerald-600" />
            <span>256-Bit Encrypted Secure Customer Authentication</span>
          </div>
        </div>
      </section>

      <SupportLinksSection />
      <FooterSection />
    </main>
  );
}
