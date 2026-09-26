"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, use, useMemo, useRef, Suspense } from "react";
import Header from "@/components/Header";
import FooterSection from "@/components/FooterSection";
import { SlidersHorizontal, X, Search, RotateCcw, Loader2 } from "lucide-react";

// Convert human size strings (e.g. 1/2", 3/4", 15mm, 25mm, 4", 100mm) into comparable numeric mm values
function parseSizeValue(sizeStr: string): number {
  if (!sizeStr) return 999999;
  const s = sizeStr.toLowerCase().trim();

  // Fraction inch check (e.g. 1/2", 3/4", 1-1/4", 1/2 inch)
  const fracMatch = s.match(/^(\d+)?\s*(\d+)\/(\d+)/);
  if (fracMatch) {
    const whole = fracMatch[1] ? parseFloat(fracMatch[1]) : 0;
    const num = parseFloat(fracMatch[2]);
    const den = parseFloat(fracMatch[3]);
    const inches = whole + num / den;
    return inches * 25.4;
  }

  // Decimal/Integer inch check (e.g. 4", 6", 8", 1", 2.5")
  const inchMatch = s.match(/^(\d+(?:\.\d+)?)\s*(?:"|inch|in\b)/);
  if (inchMatch) {
    return parseFloat(inchMatch[1]) * 25.4;
  }

  // Millimeter check (e.g. 15mm, 20 mm, 25mm, 100mm)
  const mmMatch = s.match(/^(\d+(?:\.\d+)?)\s*(?:mm|m\b)/);
  if (mmMatch) {
    return parseFloat(mmMatch[1]);
  }

  // Standalone numbers
  const numMatch = s.match(/^(\d+(?:\.\d+)?)/);
  if (numMatch) {
    const val = parseFloat(numMatch[1]);
    return val <= 12 ? val * 25.4 : val;
  }

  return 999999;
}

const COLOR_ORDER: Record<string, number> = {
  chrome: 1,
  "chrome plated": 1,
  "chrome finish": 1,
  "chrome black": 2,
  "black matte": 3,
  "matte black": 3,
  black: 3,
  "rose gold": 4,
  gold: 5,
  white: 6,
  "white gloss": 6,
  "white matte": 6,
  ivory: 7,
};

const COLOR_SWATCHES: Record<string, string> = {
  chrome: "linear-gradient(135deg, #e2e8f0 0%, #94a3b8 50%, #cbd5e1 100%)",
  "chrome plated": "linear-gradient(135deg, #e2e8f0 0%, #94a3b8 50%, #cbd5e1 100%)",
  "chrome finish": "linear-gradient(135deg, #e2e8f0 0%, #94a3b8 50%, #cbd5e1 100%)",
  "chrome black": "linear-gradient(135deg, #1e293b 0%, #475569 50%, #0f172a 100%)",
  "matte black": "#18181b",
  "black matte": "#18181b",
  black: "#09090b",
  "rose gold": "linear-gradient(135deg, #fbcfe8 0%, #f472b6 50%, #fb7185 100%)",
  gold: "linear-gradient(135deg, #fef08a 0%, #eab308 50%, #ca8a04 100%)",
  white: "#ffffff",
  "white gloss": "#ffffff",
  "white matte": "#f8fafc",
  ivory: "#fef3c7",
};

function getColorPriority(color: string): number {
  const c = (color || "").toLowerCase().trim();
  for (const [key, priority] of Object.entries(COLOR_ORDER)) {
    if (c.includes(key)) return priority;
  }
  return 50;
}

// Helper to extract base product family name (e.g. "Angle Cock", "Bib Cock", "Pillar Cock")
function getBaseProductName(name: string): string {
  if (!name) return "";
  let base = name;
  base = base.replace(
    /,\s*(Nickel Plated|Brass Finish|Chrome Finish|Chrome Plated|Chrome Black|Chrome|Matte Black|Black Matte|Black|Rose Gold|Gold|White Gloss|White Matte|White|Ivory).*$/i,
    ""
  );
  base = base.replace(
    /\s*-\s*(Nickel Plated|Brass Finish|Chrome Finish|Chrome Plated|Chrome Black|Chrome|Matte Black|Black Matte|Black|Rose Gold|Gold|White Gloss|White Matte|White|Ivory).*$/i,
    ""
  );
  base = base.replace(
    /\s*\((Nickel Plated|Brass Finish|Chrome Finish|Chrome Plated|Chrome Black|Chrome|Matte Black|Black Matte|Black|Rose Gold|Gold|White Gloss|White Matte|White|Ivory)\)/i,
    ""
  );
  return base.trim();
}

function CategoryPageContent({ category }: { category: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search") || searchParams.get("q") || "";

  const [categoryData, setCategoryData] = useState<any>(null);
  const [dbProducts, setDbProducts] = useState<any[]>([]);
  const [allCategories, setAllCategories] = useState<any[]>([]);
  const [relatedSubcategories, setRelatedSubcategories] = useState<any[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Filter & Sort states
  const [selectedNames, setSelectedNames] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [minPriceInput, setMinPriceInput] = useState<string>("");
  const [maxPriceInput, setMaxPriceInput] = useState<string>("");
  const [isPriceExpanded, setIsPriceExpanded] = useState<boolean>(true);
  const [sortBy, setSortBy] = useState<string>("recommended");

  // Infinite Scroll Pagination State (25 items per chunk)
  const [visibleCount, setVisibleCount] = useState<number>(25);
  const scrollTriggerRef = useRef<HTMLDivElement>(null);

  // Reset pagination when category, search, or filters change
  useEffect(() => {
    setVisibleCount(25);
  }, [category, searchQuery, selectedNames, selectedColors, selectedSizes, selectedCollections, minPriceInput, maxPriceInput, sortBy]);

  // Load Data
  useEffect(() => {
    async function loadData() {
      setIsLoadingProducts(true);
      try {
        let activeSub: any = null;
        let activeCat: any = null;

        if (category && category !== "all") {
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
        }

        // Fetch products based on category / search query
        let url = "/api/products";
        if (searchQuery) {
          url = `/api/products?q=${encodeURIComponent(searchQuery)}`;
          if (category && category !== "all") {
            url += `&category=${encodeURIComponent(category)}`;
          }
        } else if (category && category !== "all") {
          url = `/api/products?subcategory=${encodeURIComponent(category)}`;
        }

        const prodRes = await fetch(url);
        if (prodRes.ok) {
          const prodData = await prodRes.json();
          const items = prodData.products || prodData;
          if (Array.isArray(items)) {
            setDbProducts(items);
          }
        }

        // Fetch category & subcategory navigation lists
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
            const parentCatName =
              activeSub?.categoryName ||
              activeCat?.name ||
              "PTMT | High Grade Engineering Polymer Faucets";
            const parentCatId = activeSub?.categoryId || activeCat?.id || activeCat?._id;

            const filtered = subList.filter((s) => {
              if (parentCatId && String(s.categoryId) === String(parentCatId)) return true;
              if (
                s.categoryName &&
                parentCatName &&
                s.categoryName.toLowerCase().trim() === parentCatName.toLowerCase().trim()
              )
                return true;
              return false;
            });

            setRelatedSubcategories(filtered.length > 0 ? filtered : subList);
          }
        }
      } catch (err) {
        console.error("Error fetching category products:", err);
      } finally {
        setIsLoadingProducts(false);
      }
    }
    loadData();
  }, [category, searchQuery]);

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

  // Compute Min & Max Price bounds across all loaded products
  const { minAvailablePrice, maxAvailablePrice } = useMemo(() => {
    let min = Infinity;
    let max = 0;
    baseProducts.forEach((p) => {
      const pr = Number(p.inSelling ?? p.price ?? 0);
      if (pr > 0) {
        if (pr < min) min = pr;
        if (pr > max) max = pr;
      }
    });
    return {
      minAvailablePrice: min === Infinity ? 0 : min,
      maxAvailablePrice: max === 0 ? 10000 : max,
    };
  }, [baseProducts]);

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
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" }));
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
      .sort((a, b) => {
        const pA = getColorPriority(a.name);
        const pB = getColorPriority(b.name);
        if (pA !== pB) return pA - pB;
        return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" });
      });
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
      .sort((a, b) => {
        const sA = parseSizeValue(a.name);
        const sB = parseSizeValue(b.name);
        if (sA !== sB) return sA - sB;
        return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" });
      });
  }, [baseProducts]);

  // ── Unique Available Collections / Series ──
  const collectionCounts = useMemo(() => {
    const map = new Map<string, number>();
    baseProducts.forEach((p) => {
      const col = (p.collectionName || p.series || p.subcategoryName || "").trim();
      if (col && col !== "-") {
        map.set(col, (map.get(col) || 0) + 1);
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

  const toggleCollectionFilter = (col: string) => {
    setSelectedCollections((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
    );
  };

  const clearAllFilters = () => {
    setSelectedNames([]);
    setSelectedColors([]);
    setSelectedSizes([]);
    setSelectedCollections([]);
    setMinPriceInput("");
    setMaxPriceInput("");
  };

  const activeFilterCount =
    selectedNames.length +
    selectedColors.length +
    selectedSizes.length +
    selectedCollections.length +
    (minPriceInput ? 1 : 0) +
    (maxPriceInput ? 1 : 0);
  const hasActiveFilters = activeFilterCount > 0;

  // ── Filtered & Intelligently Sorted Products ──
  const displayedProducts = useMemo(() => {
    const minP = parseFloat(minPriceInput);
    const maxP = parseFloat(maxPriceInput);

    const filtered = baseProducts.filter((p) => {
      const price = Number(p.inSelling ?? p.price ?? 0);
      if (!isNaN(minP) && price < minP) return false;
      if (!isNaN(maxP) && price > maxP) return false;

      if (selectedNames.length > 0 && !selectedNames.includes((p.name || "").trim())) {
        return false;
      }
      if (selectedColors.length > 0 && !selectedColors.includes((p.colorName || "").trim())) {
        return false;
      }
      if (selectedSizes.length > 0 && !selectedSizes.includes((p.size || "").trim())) {
        return false;
      }
      if (
        selectedCollections.length > 0 &&
        !selectedCollections.includes((p.collectionName || p.series || p.subcategoryName || "").trim())
      ) {
        return false;
      }
      return true;
    });

    return filtered.sort((a, b) => {
      if (sortBy === "price_low_high") {
        const priceA = Number(a.inSelling ?? a.price ?? 0);
        const priceB = Number(b.inSelling ?? b.price ?? 0);
        return priceA - priceB;
      }
      if (sortBy === "price_high_low") {
        const priceA = Number(a.inSelling ?? a.price ?? 0);
        const priceB = Number(b.inSelling ?? b.price ?? 0);
        return priceB - priceA;
      }
      if (sortBy === "name_a_z") {
        return (a.name || "").localeCompare(b.name || "", undefined, { numeric: true, sensitivity: "base" });
      }
      if (sortBy === "name_z_a") {
        return (b.name || "").localeCompare(a.name || "", undefined, { numeric: true, sensitivity: "base" });
      }
      if (sortBy === "size_small_large") {
        const sA = parseSizeValue(a.size || "");
        const sB = parseSizeValue(b.size || "");
        if (sA !== sB) return sA - sB;
        return (a.name || "").localeCompare(b.name || "");
      }
      if (sortBy === "size_large_small") {
        const sA = parseSizeValue(a.size || "");
        const sB = parseSizeValue(b.size || "");
        if (sA !== sB) return sB - sA;
        return (a.name || "").localeCompare(b.name || "");
      }
      if (sortBy === "newest") {
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }

      // Default: Recommended Intelligent Grouping
      const baseA = getBaseProductName(a.name || "");
      const baseB = getBaseProductName(b.name || "");
      const baseCompare = baseA.localeCompare(baseB, undefined, { numeric: true, sensitivity: "base" });
      if (baseCompare !== 0) return baseCompare;

      const sizeA = parseSizeValue(a.size || "");
      const sizeB = parseSizeValue(b.size || "");
      if (sizeA !== sizeB) return sizeA - sizeB;

      const colorA = getColorPriority(a.colorName || a.name || "");
      const colorB = getColorPriority(b.colorName || b.name || "");
      if (colorA !== colorB) return colorA - colorB;

      const fullNameCompare = (a.name || "").localeCompare(b.name || "", undefined, { numeric: true, sensitivity: "base" });
      if (fullNameCompare !== 0) return fullNameCompare;

      const artA = String(a.article || a.code || "");
      const artB = String(b.article || b.code || "");
      const artCompare = artA.localeCompare(artB, undefined, { numeric: true, sensitivity: "base" });
      if (artCompare !== 0) return artCompare;

      return Number(a.inSelling ?? a.price ?? 0) - Number(b.inSelling ?? b.price ?? 0);
    });
  }, [baseProducts, selectedNames, selectedColors, selectedSizes, selectedCollections, minPriceInput, maxPriceInput, sortBy]);

  // Infinite Scroll Slice (25 items per chunk)
  const visibleProducts = useMemo(() => {
    return displayedProducts.slice(0, visibleCount);
  }, [displayedProducts, visibleCount]);

  const hasMoreProducts = visibleCount < displayedProducts.length;

  // IntersectionObserver to automatically load next 25 products as user scrolls
  useEffect(() => {
    const trigger = scrollTriggerRef.current;
    if (!trigger || !hasMoreProducts) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => prev + 25);
        }
      },
      { rootMargin: "350px" }
    );

    observer.observe(trigger);
    return () => observer.disconnect();
  }, [hasMoreProducts]);

  const formatCategoryTitle = (cat: string) => {
    if (!cat || cat === "all") return "All Products";
    return cat.charAt(0).toUpperCase() + cat.slice(1).replace(/-/g, " ");
  };

  const DEFAULT_HERO_IMAGE = "/api/media/website/catalogue/products/default/image.webp";

  const displayTitle = searchQuery
    ? `Search: "${searchQuery}"`
    : categoryData?.name || formatCategoryTitle(category);

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
        (categoryData.categoryName &&
          c.name?.toLowerCase().trim() === categoryData.categoryName?.toLowerCase().trim())
    );
  }, [categoryData, allCategories]);

  const currentMin = minPriceInput !== "" ? Number(minPriceInput) : minAvailablePrice;
  const currentMax = maxPriceInput !== "" ? Number(maxPriceInput) : maxAvailablePrice;
  const priceSpan = Math.max(1, maxAvailablePrice - minAvailablePrice);
  const minPercent = Math.max(0, Math.min(100, ((currentMin - minAvailablePrice) / priceSpan) * 100));
  const maxPercent = Math.max(0, Math.min(100, ((currentMax - minAvailablePrice) / priceSpan) * 100));

  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.min(Number(e.target.value), currentMax);
    setMinPriceInput(val === minAvailablePrice && currentMax === maxAvailablePrice ? "" : String(val));
  };

  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.max(Number(e.target.value), currentMin);
    setMaxPriceInput(val === maxAvailablePrice && currentMin === minAvailablePrice ? "" : String(val));
  };

  // Reusable Filter Content Element (used in desktop sidebar + mobile drawer)
  const renderFilterContent = () => (
    <>
      {/* ── 1: PRICE RANGE FILTER ── */}
      <div style={{ marginBottom: "24px" }}>
        <div
          onClick={() => setIsPriceExpanded((prev) => !prev)}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            cursor: "pointer",
            userSelect: "none",
            paddingBottom: "8px",
          }}
        >
          <span
            style={{
              fontFamily: "'Manrope', system-ui, sans-serif",
              fontSize: "15px",
              fontWeight: 400,
              color: "#1e293b",
            }}
          >
            Price
          </span>
          <button
            type="button"
            style={{
              background: "none",
              border: "none",
              fontSize: "18px",
              fontWeight: 400,
              color: "#334155",
              cursor: "pointer",
              padding: "0 4px",
              lineHeight: 1,
            }}
            aria-label={isPriceExpanded ? "Collapse price filter" : "Expand price filter"}
          >
            {isPriceExpanded ? "—" : "+"}
          </button>
        </div>

        {/* Divider line under header */}
        <div style={{ height: "1px", backgroundColor: "#e2e8f0", marginBottom: "14px" }} />

        {isPriceExpanded && (
          <div style={{ padding: "0 2px" }}>
            {/* Price values (Min on left, Max on right) */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "12px",
                fontFamily: "'Manrope', system-ui, sans-serif",
                fontSize: "15px",
                fontWeight: 400,
                color: "#1e293b",
              }}
            >
              <span>{currentMin}</span>
              <span>{currentMax}</span>
            </div>

            {/* Dual Slider Track */}
            <div
              style={{
                position: "relative",
                width: "100%",
                height: "24px",
                display: "flex",
                alignItems: "center",
              }}
            >
              {/* Base Track */}
              <div
                style={{
                  position: "absolute",
                  width: "100%",
                  height: "6px",
                  backgroundColor: "#e5e7eb",
                  borderRadius: "3px",
                }}
              />

              {/* Active Highlighted Track */}
              <div
                style={{
                  position: "absolute",
                  left: `${minPercent}%`,
                  width: `${Math.max(0, maxPercent - minPercent)}%`,
                  height: "6px",
                  backgroundColor: "#cbd5e1",
                  borderRadius: "3px",
                }}
              />

              {/* Min Range Input */}
              <input
                type="range"
                min={minAvailablePrice}
                max={maxAvailablePrice}
                step={1}
                value={currentMin}
                onChange={handleMinPriceChange}
                className="price-dual-range-input"
                style={{
                  zIndex: currentMin > maxAvailablePrice - (maxAvailablePrice - minAvailablePrice) * 0.05 ? 20 : 10,
                }}
              />

              {/* Max Range Input */}
              <input
                type="range"
                min={minAvailablePrice}
                max={maxAvailablePrice}
                step={1}
                value={currentMax}
                onChange={handleMaxPriceChange}
                className="price-dual-range-input"
                style={{
                  zIndex: 15,
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* ── 2: PRODUCTS (Family Types) ── */}
      {productNameCounts.length > 0 && (
        <div style={{ marginBottom: "24px", paddingTop: "16px", borderTop: "1px solid #f1f5f9" }}>
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
              maxHeight: "220px",
              overflowY: "auto",
              paddingRight: "6px",
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
      )}

      {/* ── 3: AVAILABLE COLORS / FINISHES ── */}
      {colorCounts.length > 0 && (
        <div style={{ marginBottom: "24px", paddingTop: "16px", borderTop: "1px solid #f1f5f9" }}>
          <h3 className="filter-section-heading">AVAILABLE COLORS</h3>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              maxHeight: "200px",
              overflowY: "auto",
              paddingRight: "6px",
            }}
          >
            {colorCounts.map(({ name, count }) => {
              const isChecked = selectedColors.includes(name);
              const swatch = COLOR_SWATCHES[name.toLowerCase()] || "#94a3b8";

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
                    <span
                      style={{
                        width: "12px",
                        height: "12px",
                        borderRadius: "50%",
                        background: swatch,
                        border: "1px solid rgba(0,0,0,0.15)",
                        display: "inline-block",
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

      {/* ── 4: AVAILABLE SIZES ── */}
      {sizeCounts.length > 0 && (
        <div style={{ marginBottom: "24px", paddingTop: "16px", borderTop: "1px solid #f1f5f9" }}>
          <h3 className="filter-section-heading">AVAILABLE SIZES</h3>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              maxHeight: "180px",
              overflowY: "auto",
              paddingRight: "6px",
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

      {/* ── 5: COLLECTIONS / SERIES ── */}
      {collectionCounts.length > 1 && (
        <div style={{ marginBottom: "24px", paddingTop: "16px", borderTop: "1px solid #f1f5f9" }}>
          <h3 className="filter-section-heading">COLLECTIONS</h3>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              maxHeight: "180px",
              overflowY: "auto",
              paddingRight: "6px",
            }}
          >
            {collectionCounts.map(({ name, count }) => {
              const isChecked = selectedCollections.includes(name);
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
                      onChange={() => toggleCollectionFilter(name)}
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
      )}

      {/* ── 6: SUBCATEGORIES ── */}
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

      {/* ── 7: ALL CATEGORIES ── */}
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
          height: ${searchQuery ? "38vh" : "100vh"};
          min-height: ${searchQuery ? "260px" : "480px"};
          overflow: hidden;
        }

        .category-content-container {
          max-width: 1540px;
          margin: 0 auto;
          padding: 40px 32px 100px;
        }

        @media (max-width: 768px) {
          .category-content-container {
            padding: 24px 16px 80px;
          }
        }

        .desktop-filter-sidebar {
          width: 280px;
          flex-shrink: 0;
          display: block;
          position: sticky;
          top: 80px;
          max-height: calc(100vh - 100px);
          overflow-y: auto;
          padding-right: 14px;
          scrollbar-width: thin;
        }

        .desktop-filter-sidebar::-webkit-scrollbar {
          width: 5px;
        }
        .desktop-filter-sidebar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 999px;
        }

        .mobile-filter-trigger-btn {
          display: none;
        }

        @media (max-width: 1024px) {
          .desktop-filter-sidebar {
            display: none !important;
          }
          .mobile-filter-trigger-btn {
            display: inline-flex !important;
            align-items: center;
            gap: 8px;
            padding: 8px 16px;
            background-color: #0f172a;
            color: #ffffff;
            border-radius: 8px;
            font-family: 'Manrope', system-ui, sans-serif;
            font-size: 13px;
            font-weight: 700;
            border: none;
            cursor: pointer;
            box-shadow: 0 2px 6px rgba(0,0,0,0.12);
          }
        }

        .products-grid-responsive {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 28px 24px;
        }

        @media (min-width: 1600px) {
          .products-grid-responsive {
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 32px 28px;
          }
        }

        @media (max-width: 1200px) {
          .products-grid-responsive {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 20px 16px;
          }
        }

        @media (max-width: 640px) {
          .products-grid-responsive {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 14px 10px;
          }
        }

        .product-card-responsive {
          display: flex;
          flex-direction: column;
          background: #ffffff;
          border: 1px solid #f1f5f9;
          border-radius: 12px;
          padding: 14px;
          transition: all 0.25s ease;
          position: relative;
          cursor: pointer;
        }

        .product-card-responsive:hover {
          border-color: #cbd5e1;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.06);
          transform: translateY(-2px);
        }

        .product-card-img-panel {
          position: relative;
          width: 100%;
          height: 230px;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #f8fafc;
          border-radius: 8px;
          overflow: hidden;
          padding: 12px;
        }

        @media (max-width: 640px) {
          .product-card-img-panel {
            height: 165px;
            padding: 8px;
          }
        }

        .product-card-title {
          font-family: 'Manrope', system-ui, sans-serif;
          font-size: 14px;
          font-weight: 600;
          line-height: 1.35;
          color: #0f172a;
          margin: 0 0 4px 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          min-height: 38px;
        }

        @media (max-width: 640px) {
          .product-card-title {
            font-size: 12.5px;
            min-height: 34px;
          }
        }

        .product-card-price {
          font-family: 'Manrope', system-ui, sans-serif;
          font-size: 17px;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: -0.01em;
        }

        @media (max-width: 640px) {
          .product-card-price {
            font-size: 14px;
          }
        }

        .filter-section-heading {
          font-family: 'Manrope', system-ui, sans-serif;
          font-size: 12.5px;
          font-weight: 800;
          letter-spacing: 0.05em;
          color: #0f172a;
          text-transform: uppercase;
          margin: 0 0 10px 0;
          line-height: 1.35;
        }

        .filter-count-badge {
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          padding: 1px 6px;
          font-size: 11px;
          font-weight: 700;
          color: #64748b;
          background-color: #ffffff;
          flex-shrink: 0;
        }

        .category-pill {
          display: inline-block;
          border: 1px solid #e2e8f0;
          border-radius: 999px;
          padding: 5px 12px;
          font-size: 11.5px;
          font-weight: 500;
          color: #334155;
          text-decoration: none;
          background-color: #ffffff;
          transition: all 0.15s ease;
          line-height: 1.25;
        }
        .category-pill:hover {
          background-color: #0f172a;
          color: #ffffff;
          border-color: #0f172a;
        }

        .price-dual-range-input {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 100%;
          pointer-events: none;
          -webkit-appearance: none;
          appearance: none;
          background: transparent;
          margin: 0;
          padding: 0;
          outline: none;
        }

        .price-dual-range-input::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          pointer-events: auto;
          width: 15px;
          height: 20px;
          background-color: #f8fafc;
          border: 1.5px solid #cbd5e1;
          border-radius: 4px;
          cursor: ew-resize;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
          transition: border-color 0.15s ease, background-color 0.15s ease;
        }

        .price-dual-range-input::-webkit-slider-thumb:hover {
          border-color: #94a3b8;
          background-color: #ffffff;
        }

        .price-dual-range-input::-webkit-slider-thumb:active {
          border-color: #64748b;
          background-color: #ffffff;
        }

        .price-dual-range-input::-moz-range-thumb {
          pointer-events: auto;
          width: 15px;
          height: 20px;
          background-color: #f8fafc;
          border: 1.5px solid #cbd5e1;
          border-radius: 4px;
          cursor: ew-resize;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
        }
      `}</style>

      {/* ── 1. Fullscreen / Hero Section ── */}
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
              "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.25) 50%, transparent 100%)",
            pointerEvents: "none",
          }}
        />

        {/* Hero Title */}
        <div
          style={{
            position: "absolute",
            bottom: searchQuery ? "4vh" : "8vh",
            left: 0,
            right: 0,
            textAlign: "center",
            zIndex: 2,
            padding: "0 16px",
          }}
        >
          {searchQuery && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(255,255,255,0.15)", backdropFilter: "blur(6px)", padding: "4px 14px", borderRadius: "999px", color: "#ffffff", fontSize: "12px", fontWeight: 700, marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              <Search size={13} /> Product Search Results
            </div>
          )}
          <h1
            style={{
              fontFamily: "'Manrope', system-ui, sans-serif",
              fontSize: searchQuery ? "clamp(24px, 3.5vw, 42px)" : "clamp(28px, 4.5vw, 56px)",
              fontWeight: 600,
              color: "#ffffff",
              letterSpacing: "-0.02em",
              margin: 0,
            }}
          >
            {displayTitle}
          </h1>
          {searchQuery && (
            <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "14px", marginTop: "6px", fontFamily: "'Manrope', system-ui, sans-serif" }}>
              Found {displayedProducts.length} matching products
            </p>
          )}
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
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            overflowX: "auto",
            whiteSpace: "nowrap",
            paddingBottom: "4px",
          }}
        >
          <Link href="/" style={{ color: "#64748B", textDecoration: "none" }}>
            Home
          </Link>
          <span style={{ color: "#CBD5E1" }}>/</span>
          {searchQuery ? (
            <>
              <Link href="/faucets/all" style={{ color: "#64748B", textDecoration: "none" }}>
                Products
              </Link>
              <span style={{ color: "#CBD5E1" }}>/</span>
              <span style={{ color: "#0F172A", fontWeight: 600 }}>Search</span>
            </>
          ) : parentCategory ? (
            <>
              <Link href={`/${parentCategory.slug}`} style={{ color: "#64748B", textDecoration: "none" }}>
                {parentCategory.name}
              </Link>
              <span style={{ color: "#CBD5E1" }}>/</span>
              <span style={{ color: "#0F172A", fontWeight: 600 }}>{displayTitle}</span>
            </>
          ) : (
            <>
              <Link href="/faucets/all" style={{ color: "#64748B", textDecoration: "none" }}>
                Faucets
              </Link>
              <span style={{ color: "#CBD5E1" }}>/</span>
              <span style={{ color: "#0F172A", fontWeight: 600 }}>{displayTitle}</span>
            </>
          )}
        </nav>

        {/* Tab & Controls Bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid #e5e7eb",
            paddingBottom: "12px",
            marginBottom: "20px",
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
                fontWeight: 700,
                color: "#111111",
                borderBottom: "2px solid #111111",
                display: "inline-block",
              }}
            >
              {displayTitle}
            </span>
            <span
              style={{
                fontSize: "13px",
                color: "#6b7280",
                fontFamily: "'Manrope', system-ui, sans-serif",
                fontWeight: 600,
              }}
            >
              Showing {Math.min(visibleCount, displayedProducts.length)} of {displayedProducts.length}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {/* Sort By Dropdown */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span
                style={{
                  fontFamily: "'Manrope', system-ui, sans-serif",
                  fontSize: "12.5px",
                  fontWeight: 600,
                  color: "#64748b",
                  whiteSpace: "nowrap",
                }}
              >
                Sort:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  padding: "6px 12px",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  backgroundColor: "#ffffff",
                  fontFamily: "'Manrope', system-ui, sans-serif",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#0f172a",
                  cursor: "pointer",
                  outline: "none",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                }}
              >
                <option value="recommended">Recommended (Grouped A-Z)</option>
                <option value="size_small_large">Size: Small to Large</option>
                <option value="size_large_small">Size: Large to Small</option>
                <option value="price_low_high">Price: Low to High</option>
                <option value="price_high_low">Price: High to Low</option>
                <option value="name_a_z">Name: A to Z</option>
                <option value="name_z_a">Name: Z to A</option>
                <option value="newest">Newest Arrivals</option>
              </select>
            </div>

            {/* Mobile Filter Trigger */}
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
        </div>

        {/* Active Filter Badges / Chips */}
        {hasActiveFilters && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "20px" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Active Filters:</span>
            {searchQuery && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#f1f5f9", padding: "4px 10px", borderRadius: "999px", fontSize: "12px", fontWeight: 600, color: "#0f172a" }}>
                Search: &quot;{searchQuery}&quot;
                <button type="button" onClick={() => router.push(`/faucets/${category}`)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "#64748b" }}><X size={13} /></button>
              </span>
            )}
            {minPriceInput && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#e0f2fe", padding: "4px 10px", borderRadius: "999px", fontSize: "12px", fontWeight: 600, color: "#0369a1" }}>
                Min: ₹{minPriceInput}
                <button type="button" onClick={() => setMinPriceInput("")} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "#0369a1" }}><X size={13} /></button>
              </span>
            )}
            {maxPriceInput && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#e0f2fe", padding: "4px 10px", borderRadius: "999px", fontSize: "12px", fontWeight: 600, color: "#0369a1" }}>
                Max: ₹{maxPriceInput}
                <button type="button" onClick={() => setMaxPriceInput("")} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "#0369a1" }}><X size={13} /></button>
              </span>
            )}
            {selectedNames.map((n) => (
              <span key={n} style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#f1f5f9", padding: "4px 10px", borderRadius: "999px", fontSize: "12px", fontWeight: 600, color: "#0f172a" }}>
                {n}
                <button type="button" onClick={() => toggleNameFilter(n)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "#64748b" }}><X size={13} /></button>
              </span>
            ))}
            {selectedColors.map((c) => (
              <span key={c} style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#f1f5f9", padding: "4px 10px", borderRadius: "999px", fontSize: "12px", fontWeight: 600, color: "#0f172a" }}>
                Color: {c}
                <button type="button" onClick={() => toggleColorFilter(c)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "#64748b" }}><X size={13} /></button>
              </span>
            ))}
            {selectedSizes.map((s) => (
              <span key={s} style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#f1f5f9", padding: "4px 10px", borderRadius: "999px", fontSize: "12px", fontWeight: 600, color: "#0f172a" }}>
                Size: {s}
                <button type="button" onClick={() => toggleSizeFilter(s)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "#64748b" }}><X size={13} /></button>
              </span>
            ))}
            {selectedCollections.map((col) => (
              <span key={col} style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#f1f5f9", padding: "4px 10px", borderRadius: "999px", fontSize: "12px", fontWeight: 600, color: "#0f172a" }}>
                Collection: {col}
                <button type="button" onClick={() => toggleCollectionFilter(col)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "#64748b" }}><X size={13} /></button>
              </span>
            ))}
            <button
              onClick={clearAllFilters}
              style={{
                background: "none",
                border: "none",
                color: "#ef4444",
                fontSize: "12px",
                fontWeight: 700,
                cursor: "pointer",
                padding: "2px 6px",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <RotateCcw size={12} /> Clear all
            </button>
          </div>
        )}

        {/* ── 3. Main Area: Sidebar (Desktop) + Product Grid ── */}
        <div style={{ display: "flex", gap: "32px", alignItems: "flex-start" }}>
          {/* Desktop Filter Sidebar */}
          <aside className="desktop-filter-sidebar">
            {renderFilterContent()}
          </aside>

          {/* Product Grid Area */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {isLoadingProducts ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "24px" }}>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} style={{ height: "320px", borderRadius: "12px", background: "#f1f5f9", animation: "pulse 1.5s infinite" }} />
                ))}
              </div>
            ) : displayedProducts.length === 0 ? (
              <div
                style={{
                  padding: "64px 20px",
                  textAlign: "center",
                  backgroundColor: "#f8fafc",
                  borderRadius: "16px",
                  border: "1px dashed #cbd5e1",
                }}
              >
                <div style={{ width: "52px", height: "52px", borderRadius: "50%", backgroundColor: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", color: "#64748b" }}>
                  <Search size={26} />
                </div>
                <h3
                  style={{
                    fontFamily: "'Manrope', system-ui, sans-serif",
                    fontSize: "18px",
                    fontWeight: 800,
                    color: "#0f172a",
                    margin: "0 0 6px 0",
                  }}
                >
                  {searchQuery ? `No products matching "${searchQuery}"` : "No products found for the selected filters"}
                </h3>
                <p style={{ fontSize: "14px", color: "#64748b", maxWidth: "420px", margin: "0 auto 18px", lineHeight: 1.5 }}>
                  Try searching by SKU code, article number, or clear active price &amp; color filters.
                </p>
                <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
                  {hasActiveFilters && (
                    <button
                      onClick={clearAllFilters}
                      style={{
                        padding: "9px 20px",
                        backgroundColor: "#0f172a",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: "8px",
                        fontFamily: "'Manrope', system-ui, sans-serif",
                        fontSize: "13.5px",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      Reset Filters
                    </button>
                  )}
                  {searchQuery && (
                    <button
                      onClick={() => router.push(`/faucets/${category}`)}
                      style={{
                        padding: "9px 20px",
                        backgroundColor: "#ffffff",
                        color: "#0f172a",
                        border: "1px solid #cbd5e1",
                        borderRadius: "8px",
                        fontFamily: "'Manrope', system-ui, sans-serif",
                        fontSize: "13.5px",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      Clear Search
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <>
                <div className="products-grid-responsive">
                  {visibleProducts.map((product) => {
                    const prodCode = product.code || product.skuCode || product.id;
                    const articleNo = product.article || product.code || product.skuCode || "";
                    const sizeVal = product.size || "";
                    const priceVal = Number(product.inSelling ?? product.price ?? 0);
                    const catSegment = (product.subcategoryId || product.category || category || "all")
                      .toString()
                      .toLowerCase()
                      .replace(/\s+/g, "-");
                    const productUrl = `/faucets/${catSegment}/${encodeURIComponent(prodCode)}`;

                    return (
                      <article
                        key={product.id || prodCode}
                        className="product-card product-card-responsive group"
                        onClick={(e) => {
                          const selection = typeof window !== "undefined" ? window.getSelection() : null;
                          if (selection && selection.toString().trim().length > 0) {
                            return;
                          }
                          const target = e.target as HTMLElement;
                          if (target.closest("button") || target.closest("a")) {
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

                {/* Infinite Scroll Trigger & Loader */}
                {hasMoreProducts && (
                  <div
                    ref={scrollTriggerRef}
                    style={{
                      padding: "36px 0",
                      textAlign: "center",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "10px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#64748b", fontSize: "13px", fontWeight: 600, fontFamily: "'Manrope', system-ui, sans-serif" }}>
                      <Loader2 size={18} className="animate-spin text-sky-600" />
                      Loading more products... ({displayedProducts.length - visibleCount} remaining)
                    </div>
                    <button
                      type="button"
                      onClick={() => setVisibleCount((prev) => prev + 25)}
                      style={{
                        padding: "8px 20px",
                        borderRadius: "8px",
                        border: "1px solid #cbd5e1",
                        background: "#ffffff",
                        color: "#0f172a",
                        fontSize: "12.5px",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      Load Next 25 Products
                    </button>
                  </div>
                )}
              </>
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

      <FooterSection />
    </main>
  );
}

export default function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = use(params);

  return (
    <Suspense
      fallback={
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#ffffff" }}>
          <Loader2 size={32} className="animate-spin text-sky-600" />
        </div>
      }
    >
      <CategoryPageContent category={category} />
    </Suspense>
  );
}
