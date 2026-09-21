"use client";

import React from "react";

export interface AdminShimmerProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  isDark?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export default function AdminShimmer({
  width = "100%",
  height = "20px",
  borderRadius = "6px",
  isDark = false,
  style,
  className = "",
}: AdminShimmerProps) {
  const baseColor = isDark ? "#161B22" : "#F3F4F6";
  const highlightColor = isDark ? "#262C36" : "#E5E7EB";

  const resolvedWidth = typeof width === "number" ? `${width}px` : width;
  const resolvedHeight = typeof height === "number" ? `${height}px` : height;
  const resolvedRadius = typeof borderRadius === "number" ? `${borderRadius}px` : borderRadius;

  return (
    <span
      className={`rn-admin-shimmer ${isDark ? "rn-admin-shimmer-dark" : "rn-admin-shimmer-light"} ${className}`}
      style={{
        display: "inline-block",
        width: resolvedWidth,
        height: resolvedHeight,
        borderRadius: resolvedRadius,
        background: `linear-gradient(90deg, ${baseColor} 0%, ${highlightColor} 50%, ${baseColor} 100%)`,
        backgroundSize: "200% 100%",
        animation: "rnAdminShimmer 1.5s ease-in-out infinite",
        verticalAlign: "middle",
        flexShrink: 0,
        ...style,
      }}
    />
  );
}
