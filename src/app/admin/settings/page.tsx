"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import AdminHeader from "@/components/admin/AdminHeader";
import { useAdminTheme } from "@/app/admin/layout";
import { Save, Tag, DollarSign, Store, CheckCircle2 } from "lucide-react";

export default function AdminSettingsPage() {
  const { theme, toggleTheme } = useAdminTheme();
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (searchParams.get("tab") === "home") {
      router.replace("/admin/settings/home");
    } else if (searchParams.get("tab") === "about") {
      router.replace("/admin/settings/about");
    }
  }, [searchParams, router]);

  const [storeName, setStoreName] = useState("RN Valves & Faucets");
  const [contactEmail, setContactEmail] = useState("support@rnvalves.com");
  const [contactPhone, setContactPhone] = useState("+91 1800 123 4567");
  const [currencySymbol, setCurrencySymbol] = useState("₹");
  const [gstRate, setGstRate] = useState("18");
  const [activeCoupon, setActiveCoupon] = useState("RN05OFF");
  const [couponDiscount, setCouponDiscount] = useState("5");
  const [savedSuccess, setSavedSuccess] = useState(false);

  const isDark = theme === "dark";

  // Color tokens
  const cardBg = isDark ? "#0D1117" : "#FFFFFF";
  const border = isDark ? "#21262D" : "#E5E7EB";
  const textMain = isDark ? "#F0F6FC" : "#111827";
  const textMuted = isDark ? "#8B949E" : "#6B7280";
  const inputBg = isDark ? "#161B22" : "#F9FAFB";
  const shadow = isDark ? "none" : "0 2px 10px rgba(0, 0, 0, 0.04)";

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
    }, 3000);
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <AdminHeader
        title="RN Store Settings"
        subtitle="Manage store identity, taxation, promo coupons, and helpline contacts."
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <main
        style={{
          padding: "32px",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          maxWidth: "1000px",
          margin: "0 auto",
          width: "100%",
          boxSizing: "border-box",
          fontFamily: "'Manrope', system-ui, sans-serif",
        }}
      >
        <div style={{ background: isDark ? "#1F6FEB1A" : "#E0F2FE", border: "1px solid #0077B6", borderRadius: "10px", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <div style={{ fontWeight: 800, color: "#0077B6", fontSize: "15px" }}>Website Photos & Assets Manager</div>
            <div style={{ fontSize: "13px", color: textMuted, marginTop: "2px" }}>Update customer login banners, dealer registration photos, logos, and fallback placeholders.</div>
          </div>
          <button
            onClick={() => router.push("/admin/settings/photos")}
            style={{ padding: "8px 18px", borderRadius: "8px", border: "none", background: "#0077B6", color: "#FFFFFF", fontWeight: 700, cursor: "pointer", fontSize: "13px" }}
          >
            Manage Photos & Assets →
          </button>
        </div>

        <div style={{ background: isDark ? "rgba(255,255,255,0.03)" : "#F9FAFB", border: `1px solid ${border}`, borderRadius: "10px", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <div style={{ fontWeight: 800, color: textMain, fontSize: "15px" }}>Website Home Setting Module</div>
            <div style={{ fontSize: "13px", color: textMuted, marginTop: "2px" }}>Manage Hero carousel, space showcase, product categories, best sellers, and footer settings.</div>
          </div>
          <button
            onClick={() => router.push("/admin/settings/home")}
            style={{ padding: "8px 18px", borderRadius: "8px", border: `1px solid ${border}`, background: isDark ? "#21262D" : "#FFFFFF", color: textMain, fontWeight: 700, cursor: "pointer", fontSize: "13px" }}
          >
            Open Home Setting →
          </button>
        </div>

        {savedSuccess && (
          <div
            style={{
              background: isDark ? "rgba(35, 134, 54, 0.15)" : "#D1FAE5",
              border: "1px solid #10B981",
              borderRadius: "8px",
              padding: "14px 18px",
              color: isDark ? "#3FB950" : "#065F46",
              fontSize: "14px",
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <CheckCircle2 size={18} /> RN Valves store settings updated successfully!
          </div>
        )}

        <form onSubmit={handleSaveSettings} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Store Identity */}
          <div
            style={{
              background: cardBg,
              border: `1px solid ${border}`,
              borderRadius: "12px",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "18px",
              boxShadow: shadow,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#0077B6" }}>
              <Store size={20} />
              <h3 style={{ fontSize: "17px", fontWeight: 800, color: textMain, margin: 0 }}>
                Store Identity
              </h3>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "13px", fontWeight: 700, color: textMain }}>
                  Brand Store Name
                </label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  style={{
                    width: "100%",
                    background: inputBg,
                    border: `1px solid ${border}`,
                    borderRadius: "8px",
                    padding: "10px",
                    color: textMain,
                    fontSize: "13.5px",
                    marginTop: "4px",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ fontSize: "13px", fontWeight: 700, color: textMain }}>
                    Customer Support Email
                  </label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    style={{
                      width: "100%",
                      background: inputBg,
                      border: `1px solid ${border}`,
                      borderRadius: "8px",
                      padding: "10px",
                      color: textMain,
                      fontSize: "13.5px",
                      marginTop: "4px",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "13px", fontWeight: 700, color: textMain }}>
                    Toll-Free Helpline Number
                  </label>
                  <input
                    type="text"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    style={{
                      width: "100%",
                      background: inputBg,
                      border: `1px solid ${border}`,
                      borderRadius: "8px",
                      padding: "10px",
                      color: textMain,
                      fontSize: "13.5px",
                      marginTop: "4px",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Pricing & GST Rules */}
          <div
            style={{
              background: cardBg,
              border: `1px solid ${border}`,
              borderRadius: "12px",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "18px",
              boxShadow: shadow,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#059669" }}>
              <DollarSign size={20} />
              <h3 style={{ fontSize: "17px", fontWeight: 800, color: textMain, margin: 0 }}>
                Taxation & Currency Rules
              </h3>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ fontSize: "13px", fontWeight: 700, color: textMain }}>
                  Primary Currency Symbol
                </label>
                <input
                  type="text"
                  value={currencySymbol}
                  onChange={(e) => setCurrencySymbol(e.target.value)}
                  style={{
                    width: "100%",
                    background: inputBg,
                    border: `1px solid ${border}`,
                    borderRadius: "8px",
                    padding: "10px",
                    color: textMain,
                    fontSize: "13.5px",
                    marginTop: "4px",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: "13px", fontWeight: 700, color: textMain }}>
                  Standard GST Rate (%)
                </label>
                <input
                  type="number"
                  value={gstRate}
                  onChange={(e) => setGstRate(e.target.value)}
                  style={{
                    width: "100%",
                    background: inputBg,
                    border: `1px solid ${border}`,
                    borderRadius: "8px",
                    padding: "10px",
                    color: textMain,
                    fontSize: "13.5px",
                    marginTop: "4px",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Promo Coupons */}
          <div
            style={{
              background: cardBg,
              border: `1px solid ${border}`,
              borderRadius: "12px",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "18px",
              boxShadow: shadow,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#D97706" }}>
              <Tag size={20} />
              <h3 style={{ fontSize: "17px", fontWeight: 800, color: textMain, margin: 0 }}>
                Promo Discount Coupons
              </h3>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ fontSize: "13px", fontWeight: 700, color: textMain }}>
                  Active Coupon Code
                </label>
                <input
                  type="text"
                  value={activeCoupon}
                  onChange={(e) => setActiveCoupon(e.target.value)}
                  style={{
                    width: "100%",
                    background: inputBg,
                    border: `1px solid ${border}`,
                    borderRadius: "8px",
                    padding: "10px",
                    color: textMain,
                    fontSize: "13.5px",
                    marginTop: "4px",
                    outline: "none",
                    boxSizing: "border-box",
                    textTransform: "uppercase",
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: "13px", fontWeight: 700, color: textMain }}>
                  Discount Percentage (%)
                </label>
                <input
                  type="number"
                  value={couponDiscount}
                  onChange={(e) => setCouponDiscount(e.target.value)}
                  style={{
                    width: "100%",
                    background: inputBg,
                    border: `1px solid ${border}`,
                    borderRadius: "8px",
                    padding: "10px",
                    color: textMain,
                    fontSize: "13.5px",
                    marginTop: "4px",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              type="submit"
              style={{
                background: "linear-gradient(135deg, #0077B6 0%, #0096C7 100%)",
                color: "#FFFFFF",
                border: "none",
                borderRadius: "8px",
                padding: "12px 28px",
                fontSize: "14px",
                fontWeight: 800,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 4px 16px rgba(0, 119, 182, 0.3)",
              }}
            >
              <Save size={16} /> Save RN Settings
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
