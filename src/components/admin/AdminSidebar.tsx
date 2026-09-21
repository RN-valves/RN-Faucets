"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LogOut,
  ChevronLeft,
  ChevronRight,
  Store,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";
import {
  setAdminAuth,
  logoutAdmin,
  getAdminProducts,
  getAdminCategories,
  getAdminSubcategories,
  getAdminCatalogues,
  getAdminOrders,
  getAdminEnquiries,
  getAdminAttributes,
  getAdminSizes,
  getAdminColors,
} from "@/utils/adminStore";
import { AdminTheme } from "@/types/admin";
import { adminNavigationConfig, SidebarNavItem } from "@/config/adminNavigation";
import SidebarDropdownItem from "./SidebarDropdownItem";

interface AdminSidebarProps {
  theme?: AdminTheme;
  isMobileView?: boolean;
  onCloseMobile?: () => void;
}

export default function AdminSidebar({
  theme = "light",
  isMobileView = false,
  onCloseMobile,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  const isDark = theme === "dark";

  // Single Active Dropdown State (Accordion - only one open at a time)
  const [openDropdownId, setOpenDropdownId] = useState<string | null>("catalogue");

  // Dynamic Counts state initialized to defaults
  const [counts, setCounts] = useState<Record<string, number>>({
    content: 6,
    catalogue: 98,
    size: 182,
    color: 68,
    bullets: 527,
    category: 15,
    subcategory: 121,
    products: 7341,
    productImages: 13976,
    customers: 960,
    customer_network: 960,
    enquiries: 471,
    orders: 696,
    payments: 559,
    careers: 0,
    blogs: 46,
    news: 5,
    countries: 1,
    states: 37,
    cities: 783,
    pincodes: 19407,
    brands: 4,
    shipping: 1,
    users: 10,
    remarks: 19,
    materials: 10,
    banners: 5,
    discount_code: 10,
    remark_logs: 1262,
  });

  // Auto-expand active child's parent menu on route change
  useEffect(() => {
    const activeParent = adminNavigationConfig.find((item) =>
      item.children?.some((child) => {
        if (child.href.includes("?")) {
          const [path, query] = child.href.split("?");
          return pathname === path && typeof window !== "undefined" && window.location.search.includes(query);
        }
        return pathname === child.href;
      })
    );
    if (activeParent) {
      setOpenDropdownId(activeParent.id);
    }
  }, [pathname]);

  // Toggle handler for accordion behavior (opens target, closes any currently open)
  const handleToggleDropdown = (id: string) => {
    setOpenDropdownId((prev) => (prev === id ? null : id));
  };

  // Fetch real counts from DB dynamically
  useEffect(() => {
    let isMounted = true;

    const fetchCounts = () => {
      Promise.all([
        getAdminProducts(),
        getAdminCategories(),
        getAdminSubcategories(),
        getAdminCatalogues(),
        getAdminOrders(),
        getAdminEnquiries(),
        getAdminAttributes(),
        getAdminSizes(),
        getAdminColors(),
        fetch("/api/customers").then((r) => (r.ok ? r.json() : null)).catch(() => null),
        fetch("/api/bullets?sub=product&limit=1").then((r) => (r.ok ? r.json() : null)).catch(() => null),
        fetch("/api/news").then((r) => (r.ok ? r.json() : null)).catch(() => null),
        fetch("/api/blogs").then((r) => (r.ok ? r.json() : null)).catch(() => null),
        fetch("/api/payments?limit=1").then((r) => (r.ok ? r.json() : null)).catch(() => null),
      ]).then(([prods, cats, subs, pdfs, ords, enqs, attrs, sizeRes, colorRes, custData, bulletData, newsData, blogData, paymentData]) => {
        if (!isMounted) return;
        setCounts((prev) => ({
          ...prev,
          products: prods.length || prev.products,
          category: cats.length || prev.category,
          subcategory: subs.length || prev.subcategory,
          catalogue: pdfs.length || prev.catalogue,
          orders: ords.length || prev.orders,
          enquiries: enqs.length || prev.enquiries,
          customers: custData?.counts?.total || custData?.users?.length || prev.customers,
          customer_network: custData?.counts?.total || custData?.users?.length || prev.customers,
          size: typeof sizeRes?.total === "number" ? sizeRes.total : prev.size,
          color: typeof colorRes?.total === "number" ? colorRes.total : prev.color,
          brands: attrs.filter((a) => a.type === "Brand").length || prev.brands,
          materials: attrs.filter((a) => a.type === "Material").length || prev.materials,
          bullets: typeof bulletData?.total === "number" ? bulletData.total : prev.bullets,
          news: typeof newsData?.total === "number" ? newsData.total : prev.news,
          blogs: typeof blogData?.total === "number" ? blogData.total : prev.blogs,
          payments: typeof paymentData?.total === "number" ? paymentData.total : prev.payments,
        }));
      });
    };

    fetchCounts();
    window.addEventListener("rn-admin-data-changed", fetchCounts);

    return () => {
      isMounted = false;
      window.removeEventListener("rn-admin-data-changed", fetchCounts);
    };
  }, []);

  const handleLogout = () => {
    logoutAdmin();
    window.location.href = "/";
  };

  // Color tokens matching theme
  const bg = isDark ? "#0D1117" : "#FFFFFF";
  const border = isDark ? "#21262D" : "#E5E7EB";
  const textMain = isDark ? "#F0F6FC" : "#111827";
  const textMuted = isDark ? "#8B949E" : "#4B5563";
  const hoverBg = isDark ? "#161B22" : "#F3F4F6";
  const badgeBg = isDark ? "#21262D" : "#E5E7EB";
  const badgeText = isDark ? "#C9D1D9" : "#374151";

  const activeRowBg = isDark ? "#162238" : "#F0F5FF";
  const activeRowText = isDark ? "#58A6FF" : "#3B82F6";
  const activeAccentBar = "#3B82F6";

  const isRouteActive = (item: SidebarNavItem) => {
    if (!item.href) return false;
    if (item.href === "/admin/dashboard") return pathname === "/admin/dashboard";
    return pathname.startsWith(item.href);
  };

  return (
    <aside
      style={{
        width: isMobileView ? "100%" : collapsed ? "80px" : "270px",
        minHeight: "100vh",
        background: bg,
        borderRight: isMobileView ? "none" : `1px solid ${border}`,
        display: "flex",
        flexDirection: "column",
        transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
        position: isMobileView ? "relative" : "sticky",
        top: 0,
        zIndex: 40,
        boxSizing: "border-box",
        fontFamily: "'Manrope', system-ui, sans-serif",
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          padding: "20px 18px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: `1px solid ${border}`,
        }}
      >
        <Link
          href="/admin/dashboard"
          onClick={() => {
            if (isMobileView && onCloseMobile) onCloseMobile();
          }}
          style={{
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://www.rnvalves.com/uploads/logo/rn-logosvgrhp9isxc7mdnyofdf3iumzuy2s8zld.svg"
            alt="RN Valves & Faucets"
            style={{
              height: "32px",
              width: "auto",
              objectFit: "contain",
              display: "block",
            }}
          />
          {(!collapsed || isMobileView) && (
            <span
              style={{
                fontSize: "14px",
                fontWeight: 800,
                color: textMain,
                letterSpacing: "0.01em",
                lineHeight: "1.2",
              }}
            >
              RN Valves & Faucets
            </span>
          )}
        </Link>

        {isMobileView ? (
          <button
            type="button"
            onClick={onCloseMobile}
            style={{
              background: hoverBg,
              border: `1px solid ${border}`,
              borderRadius: "6px",
              color: textMuted,
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
            title="Close Drawer"
          >
            <X size={18} />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            style={{
              background: hoverBg,
              border: `1px solid ${border}`,
              borderRadius: "6px",
              color: textMuted,
              width: "28px",
              height: "28px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        )}
      </div>

      {/* Navigation List */}
      <nav
        style={{
          padding: "16px 12px",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: "4px",
          overflowY: "auto",
        }}
      >
        {adminNavigationConfig.map((item) => {
          // Section Header Rendering
          if (item.sectionHeader) {
            if (collapsed && !isMobileView) return <div key={item.id} style={{ height: "1px", background: border, margin: "10px 0" }} />;
            return (
              <div
                key={item.id}
                style={{
                  fontSize: "10px",
                  fontWeight: 800,
                  color: textMuted,
                  letterSpacing: "0.08em",
                  marginTop: "14px",
                  marginBottom: "4px",
                  paddingLeft: "12px",
                  textTransform: "uppercase",
                }}
              >
                {item.sectionHeader}
              </div>
            );
          }

          // Reusable Accordion Dropdown Component
          if (item.children && item.children.length > 0) {
            return (
              <SidebarDropdownItem
                key={item.id}
                item={item}
                pathname={pathname}
                isCollapsed={collapsed && !isMobileView}
                isDark={isDark}
                isOpen={openDropdownId === item.id}
                onToggle={() => handleToggleDropdown(item.id)}
                dynamicCounts={counts}
                onCloseMobile={onCloseMobile}
              />
            );
          }

          // Single Link Row
          const active = isRouteActive(item);
          const Icon = item.icon;
          const badgeKey = item.countKey || item.id;
          const badgeValue =
            badgeKey && counts[badgeKey] !== undefined
              ? counts[badgeKey]
              : item.id && counts[item.id] !== undefined
              ? counts[item.id]
              : item.badge;

          return (
            <Link
              key={item.id}
              href={item.href || "#"}
              onClick={() => {
                if (isMobileView && onCloseMobile) onCloseMobile();
              }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: collapsed && !isMobileView ? "center" : "space-between",
                padding: collapsed && !isMobileView ? "10px 0" : "10px 14px",
                borderRadius: "8px",
                textDecoration: "none",
                fontSize: "14px",
                fontWeight: active ? 700 : 600,
                color: active ? activeRowText : textMuted,
                background: active ? activeRowBg : "transparent",
                borderLeft: active ? `3.5px solid ${activeAccentBar}` : "3.5px solid transparent",
                transition: "all 0.15s ease",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                {Icon && <Icon size={18} style={{ color: active ? activeRowText : textMuted }} />}
                {(!collapsed || isMobileView) && <span>{item.label}</span>}
              </div>

              {(!collapsed || isMobileView) && badgeValue !== undefined && (
                <span
                  style={{
                    background: badgeBg,
                    color: badgeText,
                    fontSize: "11px",
                    fontWeight: 700,
                    padding: "2px 7px",
                    borderRadius: "6px",
                    minWidth: "18px",
                    textAlign: "center",
                  }}
                >
                  {typeof badgeValue === "number" ? badgeValue.toLocaleString() : badgeValue}
                </span>
              )}
            </Link>
          );
        })}

        <div style={{ height: "1px", background: border, margin: "14px 0" }} />

        <Link
          href="/"
          target="_blank"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: collapsed && !isMobileView ? "10px 0" : "10px 14px",
            justifyContent: collapsed && !isMobileView ? "center" : "flex-start",
            borderRadius: "8px",
            textDecoration: "none",
            fontSize: "14px",
            fontWeight: 600,
            color: textMuted,
          }}
        >
          <Store size={18} />
          {(!collapsed || isMobileView) && <span>View RN Website</span>}
        </Link>
      </nav>

      {/* User Profile & Logout */}
      <div
        style={{
          padding: "16px 14px",
          borderTop: `1px solid ${border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed && !isMobileView ? "center" : "space-between",
          background: hoverBg,
        }}
      >
        {(!collapsed || isMobileView) && (
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "34px",
                height: "34px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #0077B6 0%, #0096C7 100%)",
                color: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: "14px",
              }}
            >
              RN
            </div>
            <div>
              <div style={{ fontSize: "13px", fontWeight: 800, color: textMain }}>RN Admin</div>
              <div style={{ fontSize: "11px", color: textMuted }}>admin@rnvalves.com</div>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={handleLogout}
          style={{
            background: "transparent",
            border: "none",
            color: "#DC2626",
            cursor: "pointer",
            padding: "6px",
            borderRadius: "6px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          title="Logout"
        >
          <LogOut size={18} />
        </button>
      </div>
    </aside>
  );
}
