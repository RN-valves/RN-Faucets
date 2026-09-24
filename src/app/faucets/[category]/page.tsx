"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, use, useMemo } from "react";
import Header from "@/components/Header";
import FooterSection from "@/components/FooterSection";
import { SlidersHorizontal, X, Copy, Check } from "lucide-react";

export default function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = use(params);
  const router = useRouter();

  const [copiedArt, setCopiedArt] = useState<string | null>(null);
  const [categoryData, setCategoryData] = useState<any>(null);
  const [dbProducts, setDbProducts] = useState<any[]>([]);
  const [allCategories, setAllCategories] = useState<any[]>([]);
  const [relatedSubcategories, setRelatedSubcategories] = useState<any[]>([]);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Filter states
  const [selectedNames, setSelectedNames] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        let activeSub: any = null;
        let activeCat: any = null;

        const subRes = await fetch(`/api/subcategories/${category}`);
        const subData = subRes.ok ? await subRes.json() : null;
        if (subData && !subData.error) {
          activeSub = subData;
          setCategoryData(subData);
        } else {
          const catRes = await fetch(`/api/categories/${category}`);
          const catData = catRes.ok ? await catRes.json() : null;
          if (catData && !catData.error) {
            activeCat = catData;
            setCategoryData(catData);
          }
        }

        const prodRes = await fetch(`/api/products?subcategory=${category}`);
        if (prodRes.ok) {
          const prodData = await prodRes.json();
          const items = prodData.products || prodData;
          if (Array.isArray(items) && items.length > 0) {
            setDbProducts(items);
          }
        }

        const allCatRes = await fetch("/api/categories");
        if (allCatRes.ok) {
          const catList = await allCatRes.json();
          if (Array.isArray(catList)) {
            setAllCategories(catList);
          }
        }

        const allSubRes = await fetch("/api/subcategories");
        if (allSubRes.ok) {
          const subList = await allSubRes.json();
          if (Array.isArray(subList)) {
            const parentCatName = activeSub?.categoryName || activeCat?.name || "PTMT | High Grade Engineering Polymer Faucets";
            const parentCatId = activeSub?.categoryId || activeCat?.id || activeCat?._id;

            const filtered = subList.filter((s) => {
              if (parentCatId && String(s.categoryId) === String(parentCatId)) return true;
              if (s.categoryName && parentCatName && s.categoryName.toLowerCase().trim() === parentCatName.toLowerCase().trim()) return true;
              return false;
            });

            setRelatedSubcategories(filtered.length > 0 ? filtered : subList);
          }
        }
      } catch (err) {
        console.error("Error fetching category data:", err);
      }
    }
    loadData();
  }, [category]);

  // Lock body scroll when mobile filter is open
  useEffect(() => {
    if (isMobileFilterOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileFilterOpen]);

  const baseProducts = dbProducts;

  // ── Unique Product Names and Counts ──
  const productNameCounts = useMemo(() => {
    const map = new Map<string, number>();
    baseProducts.forEach((p) => {
      const n = (p.name || "").trim();
      if (n) {
        map.set(n, (map.get(n) || 0) + 1);
      }
    });
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [baseProducts]);

  // ── Unique Available Colors and Counts ──
  const colorCounts = useMemo(() => {
    const map = new Map<string, number>();
    baseProducts.forEach((p) => {
      const c = (p.colorName || "").trim();
      if (c && c !== "-") {
        map.set(c, (map.get(c) || 0) + 1);
      }
    });
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [baseProducts]);

  // ── Unique Available Sizes and Counts ──
  const sizeCounts = useMemo(() => {
    const map = new Map<string, number>();
    baseProducts.forEach((p) => {
      const s = (p.size || "").trim();
      if (s && s !== "-") {
        map.set(s, (map.get(s) || 0) + 1);
      }
    });
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [baseProducts]);

  // ── Filter Toggle Handlers ──
  const toggleNameFilter = (name: string) => {
    setSelectedNames((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  const toggleColorFilter = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

  const toggleSizeFilter = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const clearAllFilters = () => {
    setSelectedNames([]);
    setSelectedColors([]);
    setSelectedSizes([]);
  };

  const activeFilterCount =
    selectedNames.length + selectedColors.length + selectedSizes.length;
  const hasActiveFilters = activeFilterCount > 0;

  // ── Filtered Products ──
  const displayedProducts = useMemo(() => {
    return baseProducts.filter((p) => {
      if (selectedNames.length > 0 && !selectedNames.includes((p.name || "").trim())) {
        return false;
      }
      if (selectedColors.length > 0 && !selectedColors.includes((p.colorName || "").trim())) {
        return false;
      }
      if (selectedSizes.length > 0 && !selectedSizes.includes((p.size || "").trim())) {
        return false;
      }
      return true;
    });
  }, [baseProducts, selectedNames, selectedColors, selectedSizes]);

  const formatCategoryTitle = (cat: string) => {
    return cat.charAt(0).toUpperCase() + cat.slice(1).replace(/-/g, " ");
  };

  const DEFAULT_HERO_IMAGE = "/api/media/website/catalogue/products/default/image.webp";

  const displayTitle = categoryData?.name || formatCategoryTitle(category);
  const heroImage = categoryData?.banner || categoryData?.image || DEFAULT_HERO_IMAGE;
  const parentCategoryHeading =
    categoryData?.categoryName ||
    categoryData?.parentName ||
    "PTMT | HIGH GRADE ENGINEERING POLYMER FAUCETS";

  const parentCategory = useMemo(() => {
    if (!categoryData) return null;
    return allCategories.find(
      (c) =>
        (categoryData.categoryId && String(c.id) === String(categoryData.categoryId)) ||
        (categoryData.categoryName && c.name?.toLowerCase().trim() === categoryData.categoryName?.toLowerCase().trim())
    );
  }, [categoryData, allCategories]);

  // Reusable Filter Content Element (used in desktop sidebar + mobile drawer)
  const renderFilterContent = () => (
    <>
      {/* ── 1: PRODUCTS ── */}
      <div style={{ marginBottom: "24px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "12px",
          }}
        >
          <h3 className="filter-section-heading">PRODUCTS</h3>
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              style={{
                background: "none",
                border: "none",
                color: "#0284c7",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
                padding: 0,
                textDecoration: "underline",
              }}
            >
              Clear all
            </button>
          )}
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          {productNameCounts.map(({ name, count }) => {
            const isChecked = selectedNames.includes(name);
            return (
              <label
                key={name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "8px",
                  fontSize: "13px",
                  fontFamily: "'Manrope', system-ui, sans-serif",
                  color: isChecked ? "#0f172a" : "#334155",
                  fontWeight: isChecked ? 600 : 400,
                  cursor: "pointer",
                  lineHeight: 1.35,
                  userSelect: "none",
                  padding: "3px 0",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleNameFilter(name)}
                    style={{
                      width: "16px",
                      height: "16px",
                      cursor: "pointer",
                      accentColor: "#0284c7",
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {name}
                  </span>
                </div>
                <span className="filter-count-badge">( {count} )</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* ── 2: AVAILABLE COLORS ── */}
      {colorCounts.length > 0 && (
        <div style={{ marginBottom: "24px", paddingTop: "16px", borderTop: "1px solid #f1f5f9" }}>
          <h3 className="filter-section-heading">AVAILABLE COLORS</h3>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            {colorCounts.map(({ name, count }) => {
              const isChecked = selectedColors.includes(name);
              return (
                <label
                  key={name}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "8px",
                    fontSize: "13px",
                    fontFamily: "'Manrope', system-ui, sans-serif",
                    color: isChecked ? "#0f172a" : "#334155",
                    fontWeight: isChecked ? 600 : 400,
                    cursor: "pointer",
                    lineHeight: 1.35,
                    userSelect: "none",
                    padding: "3px 0",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleColorFilter(name)}
                      style={{
                        width: "16px",
                        height: "16px",
                        cursor: "pointer",
                        accentColor: "#0284c7",
                        flexShrink: 0,
                      }}
                    />
                    <span>{name}</span>
                  </div>
                  <span className="filter-count-badge">( {count} )</span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* ── 3: AVAILABLE SIZES ── */}
      {sizeCounts.length > 0 && (
        <div style={{ marginBottom: "24px", paddingTop: "16px", borderTop: "1px solid #f1f5f9" }}>
          <h3 className="filter-section-heading">AVAILABLE SIZES</h3>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            {sizeCounts.map(({ name, count }) => {
              const isChecked = selectedSizes.includes(name);
              return (
                <label
                  key={name}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "8px",
                    fontSize: "13px",
                    fontFamily: "'Manrope', system-ui, sans-serif",
                    color: isChecked ? "#0f172a" : "#334155",
                    fontWeight: isChecked ? 600 : 400,
                    cursor: "pointer",
                    lineHeight: 1.35,
                    userSelect: "none",
                    padding: "3px 0",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleSizeFilter(name)}
                      style={{
                        width: "16px",
                        height: "16px",
                        cursor: "pointer",
                        accentColor: "#0284c7",
                        flexShrink: 0,
                      }}
                    />
                    <span>{name}</span>
                  </div>
                  <span className="filter-count-badge">( {count} )</span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* ── 4: SUBCATEGORIES ── */}
      {relatedSubcategories.length > 0 && (
        <div style={{ marginBottom: "24px", paddingTop: "16px", borderTop: "1px solid #f1f5f9" }}>
          <h3 className="filter-section-heading">{parentCategoryHeading}</h3>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            {relatedSubcategories.map((sub) => {
              const subSlug = sub.slug || sub.id;
              const isCurrentSub =
                subSlug === category ||
                (sub.name && sub.name.toLowerCase() === displayTitle.toLowerCase());

              return (
                <div
                  key={sub.id || sub.slug}
                  onClick={() => {
                    setIsMobileFilterOpen(false);
                    router.push(`/faucets/${subSlug}`);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "8px",
                    fontSize: "13px",
                    fontFamily: "'Manrope', system-ui, sans-serif",
                    color: isCurrentSub ? "#0284c7" : "#334155",
                    fontWeight: isCurrentSub ? 700 : 400,
                    cursor: "pointer",
                    lineHeight: 1.35,
                    userSelect: "none",
                    padding: "3px 0",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
                    <input
                      type="checkbox"
                      checked={isCurrentSub}
                      readOnly
                      style={{
                        width: "16px",
                        height: "16px",
                        cursor: "pointer",
                        accentColor: "#0284c7",
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {sub.name}
                    </span>
                  </div>
                  <span className="filter-count-badge">( {sub.productCount || 0} )</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── 5: ALL CATEGORIES ── */}
      {allCategories.length > 0 && (
        <div style={{ paddingTop: "16px", borderTop: "1px solid #f1f5f9" }}>
          <h3 className="filter-section-heading">ALL CATEGORIES</h3>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {allCategories.map((cat) => (
              <Link
                key={cat.id || cat.slug}
                href={`/faucets/${cat.slug || cat.id}`}
                onClick={() => setIsMobileFilterOpen(false)}
                className="category-pill"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );

  return (
    <main style={{ width: "100%", minHeight: "100vh", backgroundColor: "#ffffff" }}>
      <Header />

      {/* Responsive Inline CSS */}
      <style jsx global>{`
        .category-hero-container {
          position: relative;
          width: 100%;
          height: 100vh;
          overflow: hidden;
          background-color: #000000;
        }
        @media (max-width: 768px) {
          .category-hero-container {
            height: 48vh;
            min-height: 280px;
          }
        }

        .category-content-container {
          padding: 36px 40px 80px;
          max-width: 1640px;
          margin: 0 auto;
          background-color: #ffffff;
        }
        @media (max-width: 768px) {
          .category-content-container {
            padding: 20px 16px 60px;
          }
        }

        .desktop-filter-sidebar {
          width: 280px;
          flex-shrink: 0;
          border-right: 1px solid #f0f0f0;
          padding-right: 22px;
          padding-bottom: 40px;
          display: block;
        }
        @media (max-width: 1024px) {
          .desktop-filter-sidebar {
            display: none;
          }
        }

        .mobile-filter-trigger-btn {
          display: none;
        }
        @media (max-width: 1024px) {
          .mobile-filter-trigger-btn {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background-color: #ffffff;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            padding: 7px 14px;
            font-family: 'Manrope', system-ui, sans-serif;
            font-size: 13px;
            font-weight: 600;
            color: #111111;
            cursor: pointer;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
          }
        }

        .products-grid-responsive {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        @media (max-width: 1200px) {
          .products-grid-responsive {
            grid-template-columns: repeat(2, 1fr);
            gap: 18px;
          }
        }
        @media (max-width: 640px) {
          .products-grid-responsive {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }
        }
        @media (max-width: 360px) {
          .products-grid-responsive {
            grid-template-columns: repeat(1, 1fr);
            gap: 16px;
          }
        }

        .product-card-responsive {
          text-decoration: none;
          padding: 24px 20px 20px;
          display: flex;
          flex-direction: column;
          min-height: 560px;
          box-sizing: border-box;
          cursor: pointer;
          position: relative;
          transition: transform 0.35s ease, box-shadow 0.35s ease;
          user-select: text;
          -webkit-user-select: text;
        }
        .product-card-responsive ::selection {
          background-color: #bae6fd;
          color: #0f172a;
        }
        @media (max-width: 640px) {
          .product-card-responsive {
            padding: 14px 10px 14px;
            min-height: 380px;
          }
        }

        .product-card-img-panel {
          flex: 1 1 auto;
          width: 100%;
          min-height: 260px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          padding: 4px 4px 10px;
          box-sizing: border-box;
        }
        @media (max-width: 640px) {
          .product-card-img-panel {
            min-height: 160px;
            height: 180px;
            padding: 2px 2px 6px;
          }
        }

        .product-card-title {
          font-family: 'Manrope', system-ui, sans-serif;
          font-size: 15px;
          font-weight: 500;
          line-height: 1.4;
          color: #1a1a1a;
          margin: 0 0 8px 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          min-height: 42px;
          user-select: text;
          -webkit-user-select: text;
          cursor: text;
        }
        @media (max-width: 640px) {
          .product-card-title {
            font-size: 12.5px;
            line-height: 1.3;
            min-height: 34px;
            margin-bottom: 6px;
          }
        }

        .product-card-price {
          font-family: 'Manrope', system-ui, sans-serif;
          font-size: 21px;
          font-weight: 700;
          line-height: 1.1;
          color: #1a1a1a;
          user-select: text;
          -webkit-user-select: text;
          cursor: text;
        }
        @media (max-width: 640px) {
          .product-card-price {
            font-size: 16px;
          }
        }

        .filter-section-heading {
          font-family: 'Manrope', system-ui, sans-serif;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.04em;
          color: #0f172a;
          text-transform: uppercase;
          margin: 0 0 12px 0;
          line-height: 1.35;
        }

        .filter-count-badge {
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          padding: 1px 6px;
          font-size: 11px;
          font-weight: 700;
          color: #0f172a;
          background-color: #ffffff;
          flex-shrink: 0;
        }

        .category-pill {
          display: inline-block;
          border: 1px solid #0f172a;
          border-radius: 999px;
          padding: 5px 12px;
          font-size: 11.5px;
          font-weight: 500;
          color: #0f172a;
          text-decoration: none;
          background-color: #ffffff;
          transition: all 0.15s ease;
          line-height: 1.25;
        }
        .category-pill:hover {
          background-color: #0f172a;
          color: #ffffff;
        }
      `}</style>

      {/* ── 1. Fullscreen Hero Section ── */}
      <section data-header-theme="dark" className="category-hero-container">
        <Image
          src={heroImage}
          alt={displayTitle}
          fill
          priority
          unoptimized
          style={{
            objectFit: "cover",
            objectPosition: "center",
          }}
        />

        {/* Gradient shadow overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.15) 50%, transparent 100%)",
            pointerEvents: "none",
          }}
        />

        {/* Hero Title */}
        <div
          style={{
            position: "absolute",
            bottom: "8vh",
            left: 0,
            right: 0,
            textAlign: "center",
            zIndex: 2,
            padding: "0 16px",
          }}
        >
          <h1
            style={{
              fontFamily: "'Manrope', system-ui, sans-serif",
              fontSize: "clamp(28px, 4.5vw, 56px)",
              fontWeight: 500,
              color: "#ffffff",
              letterSpacing: "-0.02em",
              margin: 0,
            }}
          >
            {displayTitle}
          </h1>
        </div>
      </section>

      {/* ── 2. Content Section below Hero ── */}
      <section data-header-theme="light" className="category-content-container">
        {/* Breadcrumbs */}
        <nav
          aria-label="Breadcrumb"
          style={{
            fontFamily: "'Manrope', system-ui, sans-serif",
            fontSize: "13px",
            color: "#64748B",
            marginBottom: "24px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            overflowX: "auto",
            whiteSpace: "nowrap",
            paddingBottom: "4px",
          }}
        >
          <Link
            href="/"
            style={{ color: "#64748B", textDecoration: "none" }}
          >
            Home
          </Link>
          <span style={{ color: "#CBD5E1" }}>/</span>
          {parentCategory ? (
            <>
              <Link
                href={`/${parentCategory.slug}`}
                style={{ color: "#64748B", textDecoration: "none" }}
              >
                {parentCategory.name}
              </Link>
              <span style={{ color: "#CBD5E1" }}>/</span>
            </>
          ) : (
            <>
              <Link
                href="/faucets"
                style={{ color: "#64748B", textDecoration: "none" }}
              >
                Faucets
              </Link>
              <span style={{ color: "#CBD5E1" }}>/</span>
            </>
          )}
          <span style={{ color: "#0F172A", fontWeight: 600 }}>{displayTitle}</span>
        </nav>

        {/* Tab & Controls Bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid #e5e7eb",
            paddingBottom: "12px",
            marginBottom: "28px",
            gap: "12px",
          }}
        >
          <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
            <span
              style={{
                padding: "0 0 12px 0",
                marginBottom: "-13px",
                fontFamily: "'Manrope', system-ui, sans-serif",
                fontSize: "16px",
                fontWeight: 600,
                color: "#111111",
                borderBottom: "2px solid #111111",
                display: "inline-block",
              }}
            >
              {displayTitle}
            </span>
            <span
              style={{
                fontSize: "12.5px",
                color: "#6b7280",
                fontFamily: "'Manrope', system-ui, sans-serif",
              }}
            >
              ({displayedProducts.length})
            </span>
          </div>

          {/* Mobile Filter Button (visible on <= 1024px) */}
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="mobile-filter-trigger-btn"
          >
            <SlidersHorizontal size={15} />
            <span>Filters</span>
            {hasActiveFilters && (
              <span
                style={{
                  backgroundColor: "#0284c7",
                  color: "#ffffff",
                  borderRadius: "999px",
                  padding: "1px 6px",
                  fontSize: "11px",
                  fontWeight: 700,
                }}
              >
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* ── 3. Main Area: Sidebar (Desktop) + Product Grid ── */}
        <div style={{ display: "flex", gap: "32px", alignItems: "flex-start" }}>
          {/* Desktop Filter Sidebar */}
          <aside className="desktop-filter-sidebar">
            {renderFilterContent()}
          </aside>

          {/* Product Grid Area */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {displayedProducts.length === 0 ? (
              <div
                style={{
                  padding: "48px 20px",
                  textAlign: "center",
                  backgroundColor: "#f9fafb",
                  borderRadius: "12px",
                  border: "1px dashed #d1d5db",
                }}
              >
                <p
                  style={{
                    fontFamily: "'Manrope', system-ui, sans-serif",
                    fontSize: "15px",
                    fontWeight: 600,
                    color: "#374151",
                    margin: "0 0 8px 0",
                  }}
                >
                  No products found for the selected filters
                </p>
                <button
                  onClick={clearAllFilters}
                  style={{
                    marginTop: "8px",
                    padding: "8px 18px",
                    backgroundColor: "#111111",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "6px",
                    fontFamily: "'Manrope', system-ui, sans-serif",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="products-grid-responsive">
                {displayedProducts.map((product) => {
                  const prodCode = product.code || product.skuCode || product.id;
                  const articleNo = product.article || product.code || product.skuCode || "";
                  const sizeVal = product.size || "";
                  const priceVal = Number(product.inSelling ?? product.price ?? 0);
                  const productUrl = `/faucets/${category}/${encodeURIComponent(prodCode)}`;

                  return (
                    <article
                      key={product.id || prodCode}
                      className="product-card product-card-responsive group"
                      onClick={(e) => {
                        // If user selected text with mouse, do not navigate!
                        const selection = typeof window !== "undefined" ? window.getSelection() : null;
                        if (selection && selection.toString().trim().length > 0) {
                          return;
                        }
                        const target = e.target as HTMLElement;
                        if (target.closest("button") || target.closest("a") || target.closest(".copy-art-btn")) {
                          return;
                        }
                        router.push(productUrl);
                      }}
                    >
                      {/* Product Image Panel */}
                      <Link
                        href={productUrl}
                        className="product-card__image-panel product-card-img-panel"
                        style={{ textDecoration: "none", display: "flex", width: "100%" }}
                        onClick={(e) => {
                          const selection = typeof window !== "undefined" ? window.getSelection() : null;
                          if (selection && selection.toString().trim().length > 0) {
                            e.preventDefault();
                          }
                        }}
                      >
                        <img
                          src={product.image || "/api/media/website/catalogue/products/default/image.webp"}
                          alt={product.name}
                          draggable={false}
                          style={{
                            width: "100%",
                            height: "100%",
                            maxWidth: "96%",
                            maxHeight: "100%",
                            objectFit: "contain",
                            transform: "scale(1.12)",
                            transition: "transform 0.45s ease",
                            userSelect: "none",
                          }}
                          className="group-hover:scale-[1.18]"
                        />
                      </Link>

                      {/* Editorial Title + Specs + Price */}
                      <div
                        style={{
                          flexShrink: 0,
                          marginTop: "8px",
                          padding: "0 2px",
                          userSelect: "text",
                          WebkitUserSelect: "text",
                        }}
                      >
                        <h3
                          className="product-card-title"
                          style={{
                            userSelect: "text",
                            WebkitUserSelect: "text",
                            cursor: "text",
                          }}
                        >
                          <Link
                            href={productUrl}
                            draggable={false}
                            style={{
                              color: "inherit",
                              textDecoration: "none",
                              userSelect: "text",
                              WebkitUserSelect: "text",
                              cursor: "text",
                            }}
                            onClick={(e) => {
                              const selection = typeof window !== "undefined" ? window.getSelection() : null;
                              if (selection && selection.toString().trim().length > 0) {
                                e.preventDefault();
                              }
                            }}
                          >
                            {product.name}
                          </Link>
                        </h3>

                        {/* Size & Article Number info row */}
                        {(articleNo || sizeVal) && (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              flexWrap: "wrap",
                              gap: "4px",
                              marginBottom: "8px",
                              fontFamily: "'Manrope', system-ui, sans-serif",
                              fontSize: "11px",
                              lineHeight: 1.2,
                              userSelect: "text",
                              WebkitUserSelect: "text",
                            }}
                          >
                            {articleNo ? (
                              <span
                                style={{
                                  color: "#4b5563",
                                  fontWeight: 500,
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "3px",
                                  userSelect: "text",
                                  WebkitUserSelect: "text",
                                  cursor: "text",
                                }}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <span
                                  style={{
                                    color: "#8c96a3",
                                    fontSize: "10px",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.04em",
                                    fontWeight: 600,
                                    userSelect: "text",
                                    WebkitUserSelect: "text",
                                    cursor: "text",
                                  }}
                                >
                                  Art:
                                </span>
                                <span
                                  style={{
                                    fontWeight: 600,
                                    color: "#1f2937",
                                    userSelect: "text",
                                    WebkitUserSelect: "text",
                                    cursor: "text",
                                  }}
                                >
                                  {articleNo}
                                </span>
                                <button
                                  type="button"
                                  className="copy-art-btn"
                                  title="Copy Art number"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    if (typeof navigator !== "undefined" && navigator.clipboard) {
                                      navigator.clipboard.writeText(articleNo);
                                      setCopiedArt(articleNo);
                                      setTimeout(() => setCopiedArt(null), 1800);
                                    }
                                  }}
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    padding: "2px 4px",
                                    marginLeft: "2px",
                                    background: copiedArt === articleNo ? "rgba(22, 163, 74, 0.12)" : "rgba(0, 0, 0, 0.04)",
                                    border: copiedArt === articleNo ? "1px solid rgba(22, 163, 74, 0.3)" : "1px solid rgba(0, 0, 0, 0.08)",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                    color: copiedArt === articleNo ? "#16a34a" : "#64748b",
                                    transition: "all 0.2s ease",
                                  }}
                                >
                                  {copiedArt === articleNo ? (
                                    <span style={{ display: "inline-flex", alignItems: "center", gap: "2px", fontSize: "9px", fontWeight: 700 }}>
                                      <Check size={10} strokeWidth={2.5} />
                                      <span>Copied</span>
                                    </span>
                                  ) : (
                                    <Copy size={10} strokeWidth={2} />
                                  )}
                                </button>
                              </span>
                            ) : (
                              <span />
                            )}

                            {sizeVal && (
                              <span
                                style={{
                                  color: "#334155",
                                  fontWeight: 600,
                                  fontSize: "10.5px",
                                  backgroundColor: "rgba(0, 0, 0, 0.05)",
                                  padding: "2px 6px",
                                  borderRadius: "4px",
                                  whiteSpace: "nowrap",
                                  userSelect: "text",
                                  WebkitUserSelect: "text",
                                  cursor: "text",
                                }}
                                onClick={(e) => e.stopPropagation()}
                              >
                                Size: {sizeVal}
                              </span>
                            )}
                          </div>
                        )}

                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            paddingTop: "2px",
                            userSelect: "text",
                            WebkitUserSelect: "text",
                          }}
                        >
                          <span
                            className="product-card-price"
                            style={{
                              userSelect: "text",
                              WebkitUserSelect: "text",
                              cursor: "text",
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            ₹{priceVal.toLocaleString("en-IN")}/-
                          </span>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── 4. Mobile Slide-up Filter Modal / Drawer ── */}
      {isMobileFilterOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
          }}
        >
          {/* Backdrop overlay */}
          <div
            onClick={() => setIsMobileFilterOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0, 0, 0, 0.55)",
              backdropFilter: "blur(2px)",
              transition: "opacity 0.25s ease",
            }}
          />

          {/* Drawer container */}
          <div
            style={{
              position: "relative",
              zIndex: 10000,
              backgroundColor: "#ffffff",
              borderTopLeftRadius: "20px",
              borderTopRightRadius: "20px",
              maxHeight: "88vh",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 -10px 30px rgba(0, 0, 0, 0.2)",
              animation: "slideUp 0.3s ease-out",
            }}
          >
            {/* Drawer Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "16px 20px",
                borderBottom: "1px solid #e5e7eb",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <h3
                  style={{
                    fontFamily: "'Manrope', system-ui, sans-serif",
                    fontSize: "16px",
                    fontWeight: 800,
                    color: "#111111",
                    margin: 0,
                  }}
                >
                  Filters
                </h3>
                {hasActiveFilters && (
                  <span
                    style={{
                      backgroundColor: "#0284c7",
                      color: "#ffffff",
                      borderRadius: "999px",
                      padding: "1px 7px",
                      fontSize: "11px",
                      fontWeight: 700,
                    }}
                  >
                    {activeFilterCount}
                  </span>
                )}
              </div>

              <button
                onClick={() => setIsMobileFilterOpen(false)}
                style={{
                  background: "#f3f4f6",
                  border: "none",
                  borderRadius: "50%",
                  width: "32px",
                  height: "32px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "#374151",
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Drawer Scrollable Content */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "18px 20px 24px",
              }}
            >
              {renderFilterContent()}
            </div>

            {/* Drawer Footer Actions */}
            <div
              style={{
                display: "flex",
                gap: "12px",
                padding: "14px 20px",
                borderTop: "1px solid #e5e7eb",
                backgroundColor: "#ffffff",
              }}
            >
              <button
                onClick={clearAllFilters}
                style={{
                  flex: 1,
                  padding: "12px 16px",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  backgroundColor: "#ffffff",
                  color: "#111111",
                  fontFamily: "'Manrope', system-ui, sans-serif",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Clear All
              </button>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                style={{
                  flex: 2,
                  padding: "12px 16px",
                  border: "none",
                  borderRadius: "8px",
                  backgroundColor: "#111111",
                  color: "#ffffff",
                  fontFamily: "'Manrope', system-ui, sans-serif",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Apply ({displayedProducts.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Buttons are provided globally via FloatingActionButtons */}
      <FooterSection />
    </main>
  );
}
