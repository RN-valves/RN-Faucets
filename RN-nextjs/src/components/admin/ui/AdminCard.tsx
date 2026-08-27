"use client";

import React from "react";

interface AdminCardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  isDark?: boolean;
  style?: React.CSSProperties;
  className?: string;
  onClick?: () => void;
}

export default function AdminCard({
  children,
  title,
  subtitle,
  action,
  isDark = false,
  style,
  className,
  onClick,
}: AdminCardProps) {
  const bg = isDark ? "#0D1117" : "#FFFFFF";
  const border = isDark ? "1px solid #21262D" : "1px solid #E5E7EB";
  const titleColor = isDark ? "#F0F6FC" : "#111827";
  const subtitleColor = isDark ? "#8B949E" : "#6B7280";
  const shadow = isDark ? "none" : "0 2px 10px rgba(0, 0, 0, 0.04)";

  return (
    <div
      onClick={onClick}
      style={{
        background: bg,
        border: border,
        borderRadius: "12px",
        padding: "22px 24px",
        boxShadow: shadow,
        width: "100%",
        boxSizing: "border-box",
        fontFamily: "'Manrope', system-ui, sans-serif",
        ...style,
      }}
    >
      {(title || action) && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            marginBottom: "16px",
          }}
        >
          <div>
            {title && (
              <h3
                style={{
                  fontSize: "16px",
                  fontWeight: 700,
                  color: titleColor,
                  margin: 0,
                  letterSpacing: "-0.01em",
                }}
              >
                {title}
              </h3>
            )}
            {subtitle && (
              <p
                style={{
                  fontSize: "12px",
                  color: subtitleColor,
                  margin: "3px 0 0",
                }}
              >
                {subtitle}
              </p>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}

      {children}
    </div>
  );
}
