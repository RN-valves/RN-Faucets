"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp, Circle } from "lucide-react";
import { SidebarNavItem } from "@/config/adminNavigation";

interface SidebarDropdownItemProps {
  item: SidebarNavItem;
  pathname: string;
  isCollapsed: boolean;
  isDark: boolean;
  isOpen: boolean;
  onToggle: () => void;
  dynamicCounts?: Record<string, number>;
  onCloseMobile?: () => void;
}

export default function SidebarDropdownItem({
  item,
  pathname,
  isCollapsed,
  isDark,
  isOpen,
  onToggle,
  dynamicCounts = {},
  onCloseMobile,
}: SidebarDropdownItemProps) {
  const router = useRouter();

  // Helper to check if any child is active
  const isChildActive = (href: string) => {
    if (href.includes("?")) {
      const [path, query] = href.split("?");
      return pathname === path && typeof window !== "undefined" && window.location.search.includes(query);
    }
    return pathname === href;
  };

  const hasActiveChild = item.children?.some((child) => isChildActive(child.href)) || false;

  // Color tokens matching screenshot
  const textMuted = isDark ? "#8B949E" : "#4B5563";
  const parentActiveBorder = isDark ? "1px solid #1F6FEB" : "1.5px solid #ADC8FF";
  const parentActiveBg = isDark ? "#131D2E" : "#F0F5FF";
  const parentActiveText = isDark ? "#58A6FF" : "#3B82F6";

  const badgeBg = isDark ? "#21262D" : "#E5E7EB";
  const badgeText = isDark ? "#C9D1D9" : "#374151";

  const Icon = item.icon;

  const targetHref = item.href || (item.children && item.children.length > 0 ? item.children[0].href : "#");

  const handleParentClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onToggle();
  };

  const handleArrowClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggle();
  };

  if (isCollapsed) {
    return (
      <div style={{ position: "relative" }}>
        <button
          type="button"
          onClick={handleParentClick}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "10px 0",
            borderRadius: "8px",
            border: isOpen || hasActiveChild ? parentActiveBorder : "1px solid transparent",
            background: isOpen || hasActiveChild ? parentActiveBg : "transparent",
            color: isOpen || hasActiveChild ? parentActiveText : textMuted,
            cursor: "pointer",
            width: "100%",
          }}
          title={item.label}
        >
          {Icon && <Icon size={18} />}
        </button>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: "2px" }}>
      {/* Parent Header Row */}
      <div
        onClick={handleParentClick}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 14px",
          borderRadius: "8px",
          border: isOpen || hasActiveChild ? parentActiveBorder : "1px solid transparent",
          background: isOpen || hasActiveChild ? parentActiveBg : "transparent",
          color: isOpen || hasActiveChild ? parentActiveText : textMuted,
          fontSize: "14px",
          fontWeight: 700,
          cursor: "pointer",
          width: "100%",
          transition: "all 0.15s ease",
          userSelect: "none",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {Icon && <Icon size={18} style={{ color: isOpen || hasActiveChild ? parentActiveText : textMuted }} />}
          <span>{item.label}</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          {item.badge !== undefined && (
            <span
              style={{
                background: badgeBg,
                color: badgeText,
                fontSize: "11px",
                fontWeight: 700,
                padding: "2px 7px",
                borderRadius: "10px",
              }}
            >
              {item.badge}
            </span>
          )}

          <button
            type="button"
            onClick={handleArrowClick}
            style={{
              background: "transparent",
              border: "none",
              color: textMuted,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "2px",
              cursor: "pointer",
            }}
            title={isOpen ? "Collapse Sub-Menu" : "Expand Sub-Menu"}
          >
            {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Children Sub-Menu */}
      {isOpen && item.children && (
        <div style={{ display: "flex", flexDirection: "column", gap: "2px", marginTop: "4px", paddingLeft: "32px" }}>
          {item.children.map((child) => {
            const active = isChildActive(child.href);
            const badgeValue = child.countKey && dynamicCounts[child.countKey] !== undefined
              ? dynamicCounts[child.countKey]
              : child.badge;

            return (
              <Link
                key={child.id}
                href={child.href}
                onClick={() => {
                  if (onCloseMobile) onCloseMobile();
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 10px",
                  borderRadius: "6px",
                  textDecoration: "none",
                  fontSize: "13px",
                  fontWeight: active ? 700 : 500,
                  color: active ? (isDark ? "#F0F6FC" : "#0077B6") : textMuted,
                  background: active ? (isDark ? "#1F6FEB22" : "#F0F5FF") : "transparent",
                  transition: "all 0.15s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Circle
                    size={5}
                    style={{
                      fill: active ? "#0077B6" : "transparent",
                      color: active ? "#0077B6" : textMuted,
                    }}
                  />
                  <span>{child.label}</span>
                </div>

                {badgeValue !== undefined && (
                  <span
                    style={{
                      background: active ? "#0077B6" : badgeBg,
                      color: active ? "#FFFFFF" : badgeText,
                      fontSize: "11px",
                      fontWeight: 700,
                      padding: "2px 7px",
                      borderRadius: "6px",
                      minWidth: "18px",
                      textAlign: "center",
                    }}
                  >
                    {badgeValue.toLocaleString()}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
