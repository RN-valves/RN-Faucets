"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronRight, ArrowRight } from "lucide-react";
import { preheatImage } from "@/utils/catalogueCache";

export type MegaMenuType = "ptmt" | "cp" | "showers";

export interface MegaCategoryInfo {
  id: string;
  name: string;
  shortName: string;
  slug: string;
  banner: string;
  exploreLabel: string;
}

export interface MegaSubcategoryItem {
  id: string;
  name: string;
  slug: string;
  image?: string;
  banner?: string;
  categoryId: string;
  categoryName?: string;
  displayOrder?: number;
}

const MEGA_CATEGORIES: Record<MegaMenuType, MegaCategoryInfo> = {
  ptmt: {
    id: "4",
    name: "PTMT | High Grade Engineering Polymer Faucets",
    shortName: "PTMT Faucets",
    slug: "ptmt-taps-or-faucets",
    banner: "/api/media/website/catalogue/categories/4/banner.webp?v=1787994196092",
    exploreLabel: "Explore All PTMT Faucets",
  },
  cp: {
    id: "2",
    name: "CP Faucets",
    shortName: "CP Faucets",
    slug: "cp-faucets",
    banner: "/api/media/website/catalogue/categories/2/banner.webp?v=1789540805783",
    exploreLabel: "Explore All CP Faucets",
  },
  showers: {
    id: "3",
    name: "Showers",
    shortName: "Showers",
    slug: "showers",
    banner: "/api/media/website/catalogue/categories/3/banner.webp?v=1789538692896",
    exploreLabel: "Explore All Showers",
  },
};

interface HeaderMegaMenuProps {
  activeMenu: MegaMenuType | null;
  onClose: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

let cachedMegaSubcategories: MegaSubcategoryItem[] | null = null;

export default function HeaderMegaMenu({
  activeMenu,
  onClose,
  onMouseEnter,
  onMouseLeave,
}: HeaderMegaMenuProps) {
  const router = useRouter();
  const [subcategories, setSubcategories] = useState<MegaSubcategoryItem[]>(
    cachedMegaSubcategories || []
  );
  const [hoveredSub, setHoveredSub] = useState<MegaSubcategoryItem | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch subcategories once when menu first becomes active
  useEffect(() => {
    if (!activeMenu) return;
    if (cachedMegaSubcategories && cachedMegaSubcategories.length > 0) {
      if (subcategories.length === 0) {
        setSubcategories(cachedMegaSubcategories);
      }
      return;
    }

    let isMounted = true;
    async function loadSubs() {
      try {
        setLoading(true);
        const res = await fetch("/api/subcategories");
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data)) {
          cachedMegaSubcategories = data;
          if (isMounted) {
            setSubcategories(data);
          }
        }
      } catch (err) {
        console.error("Failed to load subcategories for mega menu:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadSubs();
    return () => {
      isMounted = false;
    };
  }, [activeMenu, subcategories.length]);

  // Reset hovered subcategory whenever active category changes
  useEffect(() => {
    setHoveredSub(null);
  }, [activeMenu]);

  // Active Category Info
  const catInfo = activeMenu ? MEGA_CATEGORIES[activeMenu] : null;

  // Filter subcategories for the active menu and sort strictly by rank (displayOrder)
  const filteredSubs = useMemo(() => {
    if (!catInfo || !subcategories.length) return [];

    return subcategories
      .filter((s) => {
        if (activeMenu === "ptmt") {
          return s.categoryId === "4";
        }
        if (activeMenu === "cp") {
          return s.categoryId === "2";
        }
        if (activeMenu === "showers") {
          return s.categoryId === "3" || s.categoryId === "8";
        }
        return false;
      })
      .filter((s: any) => s.status !== "Inactive" && s.isVisibleWebsite !== false)
      .sort((a, b) => {
        const rankA = typeof a.displayOrder === "number" ? a.displayOrder : 99999;
        const rankB = typeof b.displayOrder === "number" ? b.displayOrder : 99999;
        if (rankA !== rankB) return rankA - rankB;
        return (a.name || "").localeCompare(b.name || "");
      });
  }, [activeMenu, catInfo, subcategories]);

  // Preload only top 4 banners initially to avoid saturating browser network connections
  useEffect(() => {
    if (!filteredSubs.length) return;
    filteredSubs.slice(0, 4).forEach((sub) => {
      const bannerUrl = sub.banner || sub.image;
      if (bannerUrl) preheatImage(bannerUrl);
    });
  }, [filteredSubs]);

  // Split into 3 or 4 balanced columns (Jaquar style, reading vertically downwards by rank)
  const columns = useMemo(() => {
    if (!filteredSubs.length) return [];
    const numCols = filteredSubs.length > 20 ? 4 : filteredSubs.length > 8 ? 3 : 2;
    const itemsPerCol = Math.ceil(filteredSubs.length / numCols);
    const cols: MegaSubcategoryItem[][] = [];

    for (let i = 0; i < numCols; i++) {
      const colItems = filteredSubs.slice(i * itemsPerCol, (i + 1) * itemsPerCol);
      if (colItems.length > 0) {
        cols.push(colItems);
      }
    }

    return cols;
  }, [filteredSubs]);

  if (!activeMenu || !catInfo) return null;

  // Active preview banner and title (dynamically updates when hovering over any collection)
  const isCleanUrl = (url?: string) =>
    Boolean(url && !url.includes("www.rnvalves.com") && !url.includes("uploads"));

  const previewBanner =
    (hoveredSub && (isCleanUrl(hoveredSub.banner) ? hoveredSub.banner : isCleanUrl(hoveredSub.image) ? hoveredSub.image : null)) ||
    catInfo.banner;

  const previewTitle = hoveredSub?.name || catInfo.shortName;
  const previewLink = hoveredSub ? `/faucets/${hoveredSub.slug}` : `/faucets/${catInfo.slug}`;
  const previewDescription =
    (hoveredSub as any)?.description ||
    `Precision-engineered ${catInfo.shortName.toLowerCase()} crafted for enduring performance, style, and luxury.`;

  const handleNavigate = (url: string) => {
    onClose();
    router.push(url);
  };

  return (
    <div
      className="rn-header-megamenu-wrapper"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        position: "fixed",
        top: 56,
        left: 0,
        width: "100%",
        zIndex: 9998,
        background: "#FFFFFF",
        borderTop: "1px solid rgba(0, 0, 0, 0.08)",
        borderBottom: "1px solid #E5E7EB",
        boxShadow: "0 28px 50px -15px rgba(0, 0, 0, 0.12)",
        animation: "rnMegaMenuFadeIn 0.22s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      <style>{`
        @keyframes rnMegaMenuFadeIn {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .rn-megamenu-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 12px;
          border-radius: 6px;
          color: #27272A;
          text-decoration: none;
          font-family: 'Manrope', system-ui, sans-serif;
          font-size: 14px;
          font-weight: 500;
          line-height: 1.35;
          letter-spacing: -0.01em;
          transition: all 0.18s ease;
          cursor: pointer;
        }

        .rn-megamenu-item:hover,
        .rn-megamenu-item.is-active {
          color: #0077B6;
          background-color: #F8FAFC;
          font-weight: 600;
          transform: translateX(3px);
        }

        .rn-megamenu-item .item-arrow {
          opacity: 0;
          transform: translateX(-4px);
          transition: all 0.18s ease;
        }

        .rn-megamenu-item:hover .item-arrow,
        .rn-megamenu-item.is-active .item-arrow {
          opacity: 1;
          transform: translateX(0);
          color: #0077B6;
        }

        .rn-megamenu-banner-card {
          position: relative;
          width: 100%;
          height: 250px;
          border-radius: 14px;
          overflow: hidden;
          background-color: #0f172a;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
          cursor: pointer;
        }

        .rn-megamenu-banner-card img {
          transition: transform 0.45s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .rn-megamenu-banner-card:hover img {
          transform: scale(1.04);
        }

        .rn-megamenu-content {
          max-width: 1440px;
          margin: 0 auto;
          padding: 28px clamp(20px, 3.5vw, 56px) 32px;
          display: flex;
          gap: clamp(24px, 3.5vw, 48px);
          align-items: flex-start;
          box-sizing: border-box;
          max-height: calc(100vh - 56px);
          overflow-y: auto;
        }

        .rn-megamenu-preview-col {
          width: clamp(280px, 26vw, 390px);
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        @media (max-width: 1200px) {
          .rn-megamenu-cols-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
          .rn-megamenu-preview-col {
            width: 260px !important;
          }
          .rn-megamenu-banner-card {
            height: 200px !important;
          }
        }
      `}</style>

      {/* Main Content Area */}
      <div className="rn-megamenu-content">
        {/* Left / Middle: Multi-Column Collections & Subcategories */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Header Row above columns */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              paddingBottom: "16px",
              marginBottom: "20px",
              borderBottom: "1px solid #F1F5F9",
            }}
          >
            <div style={{ display: "flex", alignItems: "baseline", gap: "10px" }}>
              <span
                style={{
                  fontFamily: "'Manrope', system-ui, sans-serif",
                  fontSize: "17px",
                  fontWeight: 700,
                  color: "#0F172A",
                  letterSpacing: "-0.01em",
                }}
              >
                {catInfo.shortName} Collections
              </span>
            </div>

            <button
              type="button"
              onClick={() => handleNavigate(`/faucets/${catInfo.slug}`)}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "5px",
                color: "#0077B6",
                fontSize: "13px",
                fontWeight: 600,
                padding: "4px 8px",
                borderRadius: "4px",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#F0F9FF";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <span>{catInfo.exploreLabel}</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Columns of Subcategories / Collections */}
          {loading && !filteredSubs.length ? (
            <div style={{ padding: "40px 0", color: "#64748B", fontSize: "14px" }}>
              Loading {catInfo.shortName} collections...
            </div>
          ) : (
            <div
              className="rn-megamenu-cols-grid"
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${columns.length || 3}, minmax(0, 1fr))`,
                gap: "8px 20px",
                alignItems: "start",
                maxHeight: "380px",
                overflowY: "auto",
                paddingRight: "8px",
              }}
            >
              {columns.map((col, cIdx) => (
                <div key={cIdx} style={{ display: "flex", flexDirection: "column", gap: "3px", minWidth: 0 }}>
                  {col.map((sub) => {
                    const isActive = hoveredSub?.id === sub.id;
                    return (
                      <div
                        key={sub.id || sub.slug}
                        className={`rn-megamenu-item${isActive ? " is-active" : ""}`}
                        onMouseEnter={() => {
                          setHoveredSub(sub);
                          if (sub.banner || sub.image) preheatImage(sub.banner || sub.image);
                        }}
                        onClick={() => handleNavigate(`/faucets/${sub.slug}`)}
                      >
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {sub.name}
                        </span>
                        <ChevronRight size={14} className="item-arrow" />
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Section: Interactive Featured Banner & Preview (Updates on hover) */}
        <div className="rn-megamenu-preview-col">
          {/* Card Media Preview */}
          <div
            className="rn-megamenu-banner-card"
            onClick={() => handleNavigate(previewLink)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={previewBanner}
              src={previewBanner}
              alt={previewTitle}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "center",
                display: "block",
              }}
              onError={(e) => {
                const target = e.currentTarget;
                if (target.src !== catInfo.banner) {
                  target.src = catInfo.banner;
                }
              }}
            />

            {/* Gradient Overlay */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.65) 100%)",
                pointerEvents: "none",
              }}
            />

            {/* Floating Title on Banner */}
            <div
              style={{
                position: "absolute",
                bottom: "16px",
                left: "18px",
                right: "18px",
                color: "#FFFFFF",
                pointerEvents: "none",
              }}
            >
              <h4
                style={{
                  margin: 0,
                  fontFamily: "'Manrope', system-ui, sans-serif",
                  fontSize: "19px",
                  fontWeight: 700,
                  lineHeight: 1.25,
                  letterSpacing: "-0.01em",
                  textShadow: "0 2px 8px rgba(0,0,0,0.5)",
                }}
              >
                {previewTitle}
              </h4>
            </div>
          </div>

          {/* Bottom Descriptive Row with Action Link */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <p
              style={{
                margin: 0,
                fontSize: "13px",
                color: "#64748B",
                lineHeight: 1.45,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {previewDescription}
            </p>

            <button
              type="button"
              onClick={() => handleNavigate(previewLink)}
              style={{
                alignSelf: "flex-start",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: "2px 0",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontFamily: "'Manrope', system-ui, sans-serif",
                fontSize: "14px",
                fontWeight: 700,
                color: "#0077B6",
                transition: "gap 0.2s ease, color 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.gap = "9px";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.gap = "6px";
              }}
            >
              <span>{hoveredSub ? `View ${hoveredSub.name}` : catInfo.exploreLabel}</span>
              <ChevronRight size={15} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
