"use client";

import { Search, Bell, Plus, RefreshCw, Sun, Moon, Menu, LogOut } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminTheme } from "@/types/admin";
import { useAdminMobile } from "@/app/admin/layout";
import { logoutAdmin } from "@/utils/adminStore";

interface AdminHeaderProps {
  title?: string;
  subtitle?: string;
  onRefresh?: () => void;
  theme?: AdminTheme;
  onToggleTheme?: () => void;
}

export default function AdminHeader({
  title = "Dashboard Overview",
  subtitle = "Welcome back, manage products, orders, and customer enquiries.",
  onRefresh,
  theme = "light",
  onToggleTheme,
}: AdminHeaderProps) {
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const { toggleMobile } = useAdminMobile();

  const isDark = theme === "dark";

  const handleHeaderLogout = () => {
    logoutAdmin();
    window.location.href = "/";
  };

  const bg = isDark ? "#0D1117" : "#FFFFFF";
  const border = isDark ? "#21262D" : "#E5E7EB";
  const textMain = isDark ? "#F0F6FC" : "#111827";
  const textMuted = isDark ? "#8B949E" : "#6B7280";
  const inputBg = isDark ? "#161B22" : "#F9FAFB";
  const cardBg = isDark ? "#161B22" : "#FFFFFF";

  return (
    <header
      style={{
        background: bg,
        borderBottom: `1px solid ${border}`,
        padding: "14px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "16px",
        position: "sticky",
        top: 0,
        zIndex: 30,
        fontFamily: "'Manrope', system-ui, sans-serif",
        boxShadow: isDark ? "none" : "0 1px 3px rgba(0,0,0,0.05)",
        flexWrap: "wrap",
      }}
    >
      {/* Mobile Toggle & Title Section */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
        {/* Mobile Hamburger Button (Visible on screens < 1024px) */}
        <button
          type="button"
          onClick={toggleMobile}
          className="rn-mobile-menu-btn"
          style={{
            background: inputBg,
            border: `1px solid ${border}`,
            color: textMain,
            width: "38px",
            height: "38px",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            flexShrink: 0,
          }}
          title="Open Menu Drawer"
        >
          <Menu size={20} />
        </button>

        <div>
          <h1
            style={{
              fontSize: "20px",
              fontWeight: 800,
              color: textMain,
              margin: 0,
              letterSpacing: "-0.3px",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {title}
          </h1>
          {subtitle && (
            <p className="rn-header-subtitle" style={{ fontSize: "12px", color: textMuted, margin: "2px 0 0" }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right Tools & Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
        {/* Theme Toggle Button (Light/Dark mode) */}
        {onToggleTheme && (
          <button
            type="button"
            onClick={onToggleTheme}
            style={{
              background: isDark ? "#161B22" : "#F3F4F6",
              border: `1px solid ${border}`,
              color: textMain,
              padding: "8px 12px",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: "6px",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            title={isDark ? "Switch to White Light Theme" : "Switch to Dark Theme"}
          >
            {isDark ? (
              <>
                <Sun size={15} style={{ color: "#FBBF24" }} />
                <span className="rn-btn-label">Light Mode</span>
              </>
            ) : (
              <>
                <Moon size={15} style={{ color: "#4F46E5" }} />
                <span className="rn-btn-label">Dark Mode</span>
              </>
            )}
          </button>
        )}

        {/* Refresh Button */}
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            style={{
              background: inputBg,
              border: `1px solid ${border}`,
              color: textMain,
              padding: "8px 12px",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: "6px",
              cursor: "pointer",
            }}
            title="Refresh Data"
          >
            <RefreshCw size={14} />
            <span className="rn-btn-label">Refresh</span>
          </button>
        )}

        {/* Notifications Modal Toggle */}
        <div style={{ position: "relative" }}>
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            style={{
              background: inputBg,
              border: `1px solid ${border}`,
              color: textMain,
              width: "36px",
              height: "36px",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              position: "relative",
            }}
          >
            <Bell size={17} />
            <span
              style={{
                position: "absolute",
                top: "5px",
                right: "5px",
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                background: "#059669",
                boxShadow: "0 0 6px rgba(5, 150, 105, 0.6)",
              }}
            />
          </button>

          {showNotifications && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: "44px",
                width: "290px",
                background: cardBg,
                border: `1px solid ${border}`,
                borderRadius: "10px",
                padding: "14px",
                boxShadow: "0 12px 30px rgba(0, 0, 0, 0.15)",
                zIndex: 50,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingBottom: "8px",
                  borderBottom: `1px solid ${border}`,
                  marginBottom: "10px",
                }}
              >
                <span style={{ fontSize: "13px", fontWeight: 700, color: textMain }}>
                  Notifications (2)
                </span>
                <span style={{ fontSize: "11px", color: "#0077B6", cursor: "pointer", fontWeight: 600 }}>
                  Mark all read
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ fontSize: "12px", color: textMain }}>
                  <span style={{ fontWeight: 700, color: "#0077B6" }}>New Order RN-ORD-98421</span> received for ₹6,150.
                  <div style={{ fontSize: "10px", color: textMuted, marginTop: "2px" }}>10 mins ago</div>
                </div>
                <div style={{ fontSize: "12px", color: textMain }}>
                  <span style={{ fontWeight: 700, color: "#D97706" }}>Stock Alert</span>: RN Edge Basin Mixer F410010GRT.
                  <div style={{ fontSize: "10px", color: textMuted, marginTop: "2px" }}>1 hour ago</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Header Logout Button */}
        <button
          type="button"
          onClick={handleHeaderLogout}
          style={{
            background: isDark ? "rgba(220, 38, 38, 0.15)" : "#FEE2E2",
            border: isDark ? "1px solid rgba(220, 38, 38, 0.35)" : "1px solid #FECACA",
            color: "#DC2626",
            padding: "8px 12px",
            borderRadius: "8px",
            fontSize: "12px",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: "6px",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          title="Logout from Admin Panel"
        >
          <LogOut size={14} />
          <span className="rn-btn-label">Logout</span>
        </button>
      </div>

      <style jsx global>{`
        @media (min-width: 1024px) {
          .rn-mobile-menu-btn {
            display: none !important;
          }
        }
        @media (max-width: 640px) {
          .rn-header-subtitle {
            display: none !important;
          }
          .rn-btn-label {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
}
