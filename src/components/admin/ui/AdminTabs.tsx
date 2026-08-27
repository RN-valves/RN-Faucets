"use client";

import React from "react";

export interface AdminTabItem {
  id: string;
  label: string;
  count?: number | string;
  icon?: React.ReactNode;
}

interface AdminTabsProps {
  tabs: AdminTabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  isDark?: boolean;
  rightAction?: React.ReactNode;
}

export default function AdminTabs({
  tabs,
  activeTab,
  onChange,
  isDark = false,
  rightAction,
}: AdminTabsProps) {
  const borderBottom = isDark ? "1px solid #21262D" : "1px solid #E5E7EB";
  const activeColor = "#0077B6";
  const inactiveColor = isDark ? "#8B949E" : "#6B7280";
  const hoverColor = isDark ? "#F0F6FC" : "#111827";
  const badgeBg = isDark ? "#21262D" : "#E5E7EB";
  const activeBadgeBg = "#0077B6";
  const activeBadgeText = "#FFFFFF";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: borderBottom,
        gap: "16px",
        marginBottom: "20px",
        flexWrap: "wrap",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "24px",
          overflowX: "auto",
          maxWidth: "100%",
        }}
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                paddingBottom: "12px",
                borderBottom: isActive ? `2px solid ${activeColor}` : "2px solid transparent",
                background: "transparent",
                borderTop: "none",
                borderLeft: "none",
                borderRight: "none",
                fontSize: "13.5px",
                fontWeight: isActive ? 700 : 600,
                color: isActive ? activeColor : inactiveColor,
                cursor: "pointer",
                transition: "all 0.15s ease",
                whiteSpace: "nowrap",
                fontFamily: "'Manrope', system-ui, sans-serif",
              }}
            >
              {tab.icon && <span>{tab.icon}</span>}
              <span>{tab.label}</span>

              {tab.count !== undefined && (
                <span
                  style={{
                    background: isActive ? activeBadgeBg : badgeBg,
                    color: isActive ? activeBadgeText : inactiveColor,
                    fontSize: "11px",
                    fontWeight: 700,
                    padding: "2px 7px",
                    borderRadius: "6px",
                    minWidth: "18px",
                    textAlign: "center",
                  }}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {rightAction && (
        <div style={{ paddingBottom: "8px" }}>
          {rightAction}
        </div>
      )}
    </div>
  );
}
