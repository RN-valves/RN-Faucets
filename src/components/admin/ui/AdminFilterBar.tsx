"use client";

import React from "react";
import AdminInput from "./AdminInput";

interface AdminFilterBarProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  searchPlaceholder?: string;
  filters?: React.ReactNode;
  actions?: React.ReactNode;
  isDark?: boolean;
}

export default function AdminFilterBar({
  searchQuery = "",
  onSearchChange,
  searchPlaceholder = "Search records...",
  filters,
  actions,
  isDark = false,
}: AdminFilterBarProps) {
  const bg = isDark ? "#0D1117" : "#FFFFFF";
  const border = isDark ? "1px solid #21262D" : "1px solid #E5E7EB";

  return (
    <div
      style={{
        background: bg,
        border: border,
        borderRadius: "10px",
        padding: "14px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "14px",
        flexWrap: "wrap",
        marginBottom: "20px",
        boxSizing: "border-box",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1, minWidth: "260px" }}>
        {onSearchChange && (
          <div style={{ flex: 1, maxWidth: "420px" }}>
            <AdminInput
              isSearch
              isDark={isDark}
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        )}

        {filters && (
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            {filters}
          </div>
        )}
      </div>

      {actions && (
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {actions}
        </div>
      )}
    </div>
  );
}
