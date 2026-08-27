"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, ShieldCheck, ArrowRight, CheckCircle2, Sun, Moon } from "lucide-react";
import { setAdminAuth } from "@/utils/adminStore";
import { useAdminTheme } from "@/app/admin/layout";

export default function AdminLoginPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useAdminTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isDark = theme === "dark";

  const bg = isDark
    ? "radial-gradient(ellipse at top, #161B22 0%, #090D12 100%)"
    : "linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)";
  const cardBg = isDark ? "#0D1117" : "#FFFFFF";
  const border = isDark ? "#30363D" : "#E5E7EB";
  const textMain = isDark ? "#F0F6FC" : "#111827";
  const textMuted = isDark ? "#8B949E" : "#6B7280";
  const inputBg = isDark ? "#161B22" : "#F9FAFB";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    setTimeout(() => {
      const cleanInput = email.trim();
      if (
        (cleanInput === "8737029643" || cleanInput === "admin.aditya@rnvalves.com" || cleanInput === "admin@rnvalves.com") &&
        (password === "aditya@123" || password === "rnadmin123" || password === "123456" || password === "1234")
      ) {
        const adminObj = {
          email: "admin.aditya@rnvalves.com",
          name: "Super Admin (Aditya)",
          role: "Super Admin" as const,
        };
        setAdminAuth(adminObj);
        if (typeof window !== "undefined") {
          localStorage.setItem("rn_user_session", JSON.stringify({
            mobile: "8737029643",
            name: "Super Admin (Aditya)",
            userType: "Admin",
            role: "Super Admin",
            email: "admin.aditya@rnvalves.com",
            userCode: "RN-ADM-001"
          }));
          localStorage.setItem("rn_customer_session", JSON.stringify({
            mobile: "8737029643",
            name: "Super Admin (Aditya)",
            userType: "Admin",
            role: "Super Admin",
            email: "admin.aditya@rnvalves.com",
            userCode: "RN-ADM-001"
          }));
        }
        router.replace("/admin/dashboard");
      } else {
        setError("Invalid mobile number/email or password. Please try again.");
        setLoading(false);
      }
    }, 300);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        background: bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        fontFamily: "'Manrope', system-ui, sans-serif",
        boxSizing: "border-box",
        position: "relative",
      }}
    >
      {/* Theme Toggle Top Right */}
      <button
        type="button"
        onClick={toggleTheme}
        style={{
          position: "absolute",
          top: "24px",
          right: "24px",
          background: cardBg,
          border: `1px solid ${border}`,
          borderRadius: "8px",
          padding: "8px 14px",
          color: textMain,
          fontSize: "13px",
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          gap: "8px",
          cursor: "pointer",
          boxShadow: isDark ? "none" : "0 4px 12px rgba(0,0,0,0.05)",
        }}
      >
        {isDark ? (
          <>
            <Sun size={16} style={{ color: "#FBBF24" }} /> Light Mode
          </>
        ) : (
          <>
            <Moon size={16} style={{ color: "#4F46E5" }} /> Dark Mode
          </>
        )}
      </button>

      <div
        style={{
          width: "100%",
          maxWidth: "440px",
          background: cardBg,
          border: `1px solid ${border}`,
          borderRadius: "16px",
          padding: "40px 36px",
          boxShadow: isDark
            ? "0 20px 50px rgba(0, 0, 0, 0.6)"
            : "0 20px 40px rgba(0, 119, 182, 0.1)",
          display: "flex",
          flexDirection: "column",
          gap: "28px",
        }}
      >
        {/* Brand & Title */}
        <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://www.rnvalves.com/uploads/logo/rn-logosvgrhp9isxc7mdnyofdf3iumzuy2s8zld.svg"
            alt="RN Valves & Faucets"
            style={{
              maxHeight: "52px",
              maxWidth: "220px",
              objectFit: "contain",
              display: "block",
              marginBottom: "16px",
            }}
          />
          <h1 style={{ fontSize: "24px", fontWeight: 800, color: textMain, margin: 0 }}>
            RN Valves & Faucets Admin
          </h1>
          <p style={{ fontSize: "13.5px", color: textMuted, margin: "6px 0 0" }}>
            Sign in to manage valves, faucets, catalog, and orders.
          </p>
        </div>

        {error && (
          <div
            style={{
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              borderRadius: "8px",
              padding: "12px",
              fontSize: "13px",
              color: "#EF4444",
              textAlign: "center",
              fontWeight: 600,
            }}
          >
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={{ fontSize: "13px", fontWeight: 700, color: textMain }}>
              Admin Mobile Number / Email
            </label>
            <div style={{ position: "relative" }}>
              <Mail
                size={18}
                style={{
                  position: "absolute",
                  left: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: textMuted,
                }}
              />
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter mobile number or email"
                style={{
                  width: "100%",
                  background: inputBg,
                  border: `1px solid ${border}`,
                  borderRadius: "8px",
                  padding: "12px 14px 12px 42px",
                  fontSize: "14px",
                  color: textMain,
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={{ fontSize: "13px", fontWeight: 700, color: textMain }}>
              Password
            </label>
            <div style={{ position: "relative" }}>
              <Lock
                size={18}
                style={{
                  position: "absolute",
                  left: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: textMuted,
                }}
              />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: "100%",
                  background: inputBg,
                  border: `1px solid ${border}`,
                  borderRadius: "8px",
                  padding: "12px 14px 12px 42px",
                  fontSize: "14px",
                  color: textMain,
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: "8px",
              background: "linear-gradient(135deg, #0077B6 0%, #0096C7 100%)",
              color: "#FFFFFF",
              border: "none",
              borderRadius: "8px",
              padding: "14px",
              fontSize: "14.5px",
              fontWeight: 800,
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              boxShadow: "0 4px 16px rgba(0, 119, 182, 0.35)",
            }}
          >
            {loading ? "Signing in..." : "Sign In to RN Admin Panel"}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>
      </div>
    </div>
  );
}
