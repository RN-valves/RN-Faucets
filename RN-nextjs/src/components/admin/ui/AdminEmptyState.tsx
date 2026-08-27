"use client";

import React from "react";
import { FolderOpen } from "lucide-react";

interface AdminEmptyStateProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  isDark?: boolean;
}

export default function AdminEmptyState({
  title = "No records found",
  description = "There are no entries available for this view.",
  action,
  icon,
  isDark = false,
}: AdminEmptyStateProps) {
  const color = isDark ? "#F0F6FC" : "#111827";
  const mutedColor = isDark ? "#8B949E" : "#6B7280";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 24px",
        textAlign: "center",
        width: "100%",
        fontFamily: "'Manrope', system-ui, sans-serif",
      }}
    >
      <div
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "12px",
          background: isDark ? "#21262D" : "#F3F4F6",
          color: isDark ? "#58A6FF" : "#0077B6",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "14px",
        }}
      >
        {icon || <FolderOpen size={24} />}
      </div>

      <h4
        style={{
          fontSize: "15px",
          fontWeight: 700,
          color: color,
          margin: 0,
        }}
      >
        {title}
      </h4>

      <p
        style={{
          fontSize: "13px",
          color: mutedColor,
          margin: "4px 0 16px",
          maxWidth: "360px",
          lineHeight: 1.5,
        }}
      >
        {description}
      </p>

      {action && <div>{action}</div>}
    </div>
  );
}
