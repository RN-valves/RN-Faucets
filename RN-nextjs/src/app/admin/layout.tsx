"use client";

import { useEffect, useState, createContext, useContext } from "react";
import { usePathname, useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { getAdminAuth, getAdminTheme, setAdminTheme } from "@/utils/adminStore";
import { AdminTheme } from "@/types/admin";
import { X } from "lucide-react";

export const AdminThemeContext = createContext<{
  theme: AdminTheme;
  toggleTheme: () => void;
}>({
  theme: "light",
  toggleTheme: () => {},
});

export const AdminMobileContext = createContext<{
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  toggleMobile: () => void;
}>({
  mobileOpen: false,
  setMobileOpen: () => {},
  toggleMobile: () => {},
});

export const useAdminTheme = () => useContext(AdminThemeContext);
export const useAdminMobile = () => useContext(AdminMobileContext);

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [theme, setThemeState] = useState<AdminTheme>("light");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setThemeState(getAdminTheme());

    const handleThemeChange = () => {
      setThemeState(getAdminTheme());
    };

    window.addEventListener("rn-theme-changed", handleThemeChange);

    const auth = getAdminAuth();
    if (pathname === "/admin/login") {
      if (auth) {
        router.push("/admin/dashboard");
      }
      return () => window.removeEventListener("rn-theme-changed", handleThemeChange);
    }

    if (!auth) {
      router.push("/admin/login");
    } else {
      setIsAuthenticated(true);
    }

    return () => window.removeEventListener("rn-theme-changed", handleThemeChange);
  }, [pathname, router]);

  // Auto-close mobile drawer on route navigation
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setAdminTheme(nextTheme);
    setThemeState(nextTheme);
  };

  const toggleMobile = () => {
    setMobileOpen((prev) => !prev);
  };

  if (!isMounted) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#F9FAFB",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#4B5563",
          fontFamily: "'Manrope', system-ui, sans-serif",
          fontWeight: 600,
        }}
      >
        Loading RN Admin Panel...
      </div>
    );
  }

  // Login page without sidebar wrapper
  if (pathname === "/admin/login") {
    return (
      <AdminThemeContext.Provider value={{ theme, toggleTheme }}>
        <AdminMobileContext.Provider value={{ mobileOpen, setMobileOpen, toggleMobile }}>
          {children}
        </AdminMobileContext.Provider>
      </AdminThemeContext.Provider>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const isDark = theme === "dark";

  return (
    <AdminThemeContext.Provider value={{ theme, toggleTheme }}>
      <AdminMobileContext.Provider value={{ mobileOpen, setMobileOpen, toggleMobile }}>
        <div
          style={{
            display: "flex",
            minHeight: "100vh",
            background: isDark ? "#090D12" : "#F4F6F9",
            color: isDark ? "#C9D1D9" : "#111827",
            fontFamily: "'Manrope', system-ui, sans-serif",
            transition: "background 0.2s, color 0.2s",
            position: "relative",
          }}
        >
          {/* Desktop Sidebar (hidden on mobile via CSS) */}
          <div className="rn-desktop-sidebar">
            <AdminSidebar theme={theme} />
          </div>

          {/* Mobile Drawer Overlay & Sidebar */}
          {mobileOpen && (
            <div className="rn-mobile-drawer-wrapper">
              <div
                className="rn-mobile-backdrop"
                onClick={() => setMobileOpen(false)}
                style={{
                  position: "fixed",
                  inset: 0,
                  background: "rgba(0,0,0,0.6)",
                  backdropFilter: "blur(4px)",
                  zIndex: 998,
                }}
              />
              <div
                className="rn-mobile-sidebar-container"
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  bottom: 0,
                  width: "280px",
                  maxHeight: "100vh",
                  overflowY: "auto",
                  zIndex: 999,
                  boxShadow: "0 10px 40px rgba(0,0,0,0.4)",
                }}
              >
                <AdminSidebar theme={theme} isMobileView onCloseMobile={() => setMobileOpen(false)} />
              </div>
            </div>
          )}

          {/* Main Content View */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              minWidth: 0,
              background: isDark ? "#090D12" : "#F4F6F9",
            }}
          >
            {children}
          </div>
        </div>

        {/* Responsive CSS Rules */}
        <style jsx global>{`
          @media (max-width: 1023px) {
            .rn-desktop-sidebar {
              display: none !important;
            }
          }
          @media (min-width: 1024px) {
            .rn-mobile-drawer-wrapper {
              display: none !important;
            }
            .rn-desktop-sidebar {
              display: block !important;
            }
          }
        `}</style>
      </AdminMobileContext.Provider>
    </AdminThemeContext.Provider>
  );
}
