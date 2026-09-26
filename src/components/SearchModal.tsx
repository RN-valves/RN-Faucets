"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { X, Loader2, TrendingUp, Clock, Sparkles, Search, ArrowRight } from "lucide-react";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ProductItem {
  id: string;
  code?: string;
  name: string;
  price?: number;
  inSelling?: number;
  inMrp?: number;
  category?: string;
  subcategoryId?: string;
  subcategoryName?: string;
  article?: string;
  image?: string;
}

interface CategoryItem {
  id: string;
  _id?: string;
  name: string;
  slug?: string;
  count?: number;
  type?: "category" | "subcategory";
}

const SEARCH_PLACEHOLDER_WORDS = [
  "Search Faucets...",
  "Search Diverters...",
  "Search Pillar Cocks...",
  "Search Overhead Showers...",
  "Search Single Lever Mixers...",
  "Search Marble Finish Faucets...",
  "Search Basin Mixers...",
  "Search Bath Accessories...",
];

const TRENDING_SEARCHES = [
  "Divertor",
  "Pillar Cock",
  "Single Lever",
  "Basin Mixer",
  "Overhead Shower",
  "Marble Finish",
  "Black-Chrome Dual",
  "Angle Valve",
  "Health Faucet",
  "Concealed Stop Cock",
];

const RECENT_SEARCHES_STORAGE_KEY = "rn_recent_searches";

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [matchingCategories, setMatchingCategories] = useState<CategoryItem[]>([]);
  const [allCategories, setAllCategories] = useState<CategoryItem[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Typewriter placeholder states
  const [placeholderText, setPlaceholderText] = useState("");
  const [wordIdx, setWordIdx] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load recent searches from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(RECENT_SEARCHES_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) setRecentSearches(parsed.slice(0, 6));
        }
      } catch {}
    }
  }, [isOpen]);

  const saveRecentSearch = (searchTerm: string) => {
    if (!searchTerm || !searchTerm.trim()) return;
    const term = searchTerm.trim();
    try {
      const updated = [term, ...recentSearches.filter((s) => s.toLowerCase() !== term.toLowerCase())].slice(0, 6);
      setRecentSearches(updated);
      localStorage.setItem(RECENT_SEARCHES_STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem(RECENT_SEARCHES_STORAGE_KEY);
    } catch {}
  };

  // Pre-fetch categories & subcategories once
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const [catRes, subRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/subcategories"),
        ]);

        const cats = catRes.ok ? await catRes.json() : [];
        const subs = subRes.ok ? await subRes.json() : [];

        const combined: CategoryItem[] = [];

        if (Array.isArray(cats)) {
          cats.forEach((c) => {
            combined.push({
              id: c.id || c._id,
              name: c.name,
              slug: c.slug || c.id,
              count: c.productCount || undefined,
              type: "category",
            });
          });
        }

        if (Array.isArray(subs)) {
          subs.forEach((s) => {
            combined.push({
              id: s.id || s._id,
              name: s.name,
              slug: s.slug || s.id,
              count: s.productCount || undefined,
              type: "subcategory",
            });
          });
        }

        if (isMounted) {
          setAllCategories(combined);
        }
      } catch (err) {
        console.error("Failed to prefetch search categories:", err);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Jaquar-Style Auto-Type Animation Effect
  useEffect(() => {
    if (!isOpen || query.length > 0) return;

    const currentWord = SEARCH_PLACEHOLDER_WORDS[wordIdx];
    const typingSpeed = isDeleting ? 35 : 75;

    const timer = setTimeout(() => {
      if (!isDeleting) {
        setPlaceholderText(currentWord.substring(0, placeholderText.length + 1));
        if (placeholderText.length + 1 === currentWord.length) {
          setTimeout(() => setIsDeleting(true), 1800); // Pause on completed word
        }
      } else {
        setPlaceholderText(currentWord.substring(0, placeholderText.length - 1));
        if (placeholderText.length === 0) {
          setIsDeleting(false);
          setWordIdx((prev) => (prev + 1) % SEARCH_PLACEHOLDER_WORDS.length);
        }
      }
    }, typingSpeed);

    return () => clearTimeout(timer);
  }, [isOpen, placeholderText, isDeleting, wordIdx, query]);

  // Auto-focus input when opened
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    } else {
      setQuery("");
      setProducts([]);
      setMatchingCategories([]);
    }
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Live debounced search
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setProducts([]);
      setMatchingCategories([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timeoutId = setTimeout(async () => {
      try {
        // 1. Fetch matching products from API
        const prodRes = await fetch(`/api/products?q=${encodeURIComponent(trimmed)}&limit=12`);
        let prodList: ProductItem[] = [];
        if (prodRes.ok) {
          const data = await prodRes.json();
          prodList = Array.isArray(data) ? data : data.products || [];
        }

        // Ensure category source is available
        let catSource = allCategories;
        if (catSource.length === 0) {
          try {
            const [catRes, subRes] = await Promise.all([
              fetch("/api/categories"),
              fetch("/api/subcategories"),
            ]);
            const cats = catRes.ok ? await catRes.json() : [];
            const subs = subRes.ok ? await subRes.json() : [];
            const combined: CategoryItem[] = [];
            if (Array.isArray(cats)) {
              cats.forEach((c) =>
                combined.push({
                  id: c.id || c._id,
                  name: c.name,
                  slug: c.slug || c.id,
                  count: c.productCount || undefined,
                  type: "category",
                })
              );
            }
            if (Array.isArray(subs)) {
              subs.forEach((s) =>
                combined.push({
                  id: s.id || s._id,
                  name: s.name,
                  slug: s.slug || s.id,
                  count: s.productCount || undefined,
                  type: "subcategory",
                })
              );
            }
            catSource = combined;
            setAllCategories(combined);
          } catch (e) {
            console.error("Error fetching categories during search:", e);
          }
        }

        // 2. Direct name/slug matching
        const lowerQ = trimmed.toLowerCase();
        const directMatches = catSource.filter(
          (c) =>
            c.name?.toLowerCase().includes(lowerQ) ||
            c.slug?.toLowerCase().includes(lowerQ)
        );

        // 3. Derived categories from matching products
        const productCategoryNames = new Set<string>();
        prodList.forEach((p) => {
          if (p.category) productCategoryNames.add(p.category.trim().toLowerCase());
          if (p.subcategoryName) productCategoryNames.add(p.subcategoryName.trim().toLowerCase());
        });

        const derivedCategories = catSource.filter(
          (c) =>
            productCategoryNames.has(c.name.trim().toLowerCase()) &&
            !directMatches.some(
              (dm) => dm.name.trim().toLowerCase() === c.name.trim().toLowerCase()
            )
        );

        // 4. Combine direct + derived categories
        let finalCategories = [...directMatches, ...derivedCategories];

        // 5. If fewer than 5, append top active categories as suggestions
        if (finalCategories.length < 5) {
          const existingNames = new Set(
            finalCategories.map((c) => c.name.trim().toLowerCase())
          );
          const topFallbacks = catSource
            .filter(
              (c) =>
                c.type === "category" &&
                !existingNames.has(c.name.trim().toLowerCase())
            )
            .slice(0, 5 - finalCategories.length);
          finalCategories = [...finalCategories, ...topFallbacks];
        }

        setProducts(prodList.slice(0, 8));
        setMatchingCategories(finalCategories.slice(0, 8));
      } catch (err) {
        console.error("Search fetch error:", err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timeoutId);
  }, [query, allCategories]);

  const handleProductClick = useCallback(
    (product: ProductItem) => {
      saveRecentSearch(product.name);
      onClose();
      const catSegment = (product.subcategoryId || product.category || "all")
        .toString()
        .toLowerCase()
        .replace(/\s+/g, "-");
      const prodCode = product.code || product.id;
      router.push(`/faucets/${encodeURIComponent(catSegment)}/${encodeURIComponent(prodCode)}`);
    },
    [onClose, router, recentSearches]
  );

  const handleCategoryClick = useCallback(
    (item: CategoryItem) => {
      saveRecentSearch(item.name);
      onClose();
      if (item.type === "subcategory") {
        router.push(`/faucets/${encodeURIComponent(item.slug || item.id)}`);
      } else {
        router.push(`/${encodeURIComponent(item.slug || item.id)}`);
      }
    },
    [onClose, router, recentSearches]
  );

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;
    saveRecentSearch(query);
    onClose();
    router.push(`/faucets/all?search=${encodeURIComponent(query.trim())}`);
  };

  if (!isOpen) return null;

  const hasResults = query.trim().length > 0;

  return (
    <>
      {/* ── Dimmed Backdrop for clicking outside ── */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 99998,
          backgroundColor: "rgba(0, 0, 0, 0.45)",
          backdropFilter: "blur(3px)",
          WebkitBackdropFilter: "blur(3px)",
          transition: "opacity 0.25s ease",
        }}
      />

      {/* ── Top White Search Bar Overlay (Jaquar-grade interactive search) ── */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 99999,
          backgroundColor: "#FFFFFF",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.15)",
          paddingTop: "18px",
          paddingBottom: "36px",
          paddingLeft: "24px",
          paddingRight: "24px",
          fontFamily: "'Manrope', system-ui, sans-serif",
          transition: "all 0.25s ease",
          maxHeight: "88vh",
          overflowY: "auto",
        }}
      >
        {/* Top Row: Centered Pill Input + Close Button on Far Right */}
        <div
          style={{
            position: "relative",
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Centered Form with Pill Search Input */}
          <form
            onSubmit={handleSearchSubmit}
            style={{
              position: "relative",
              width: "100%",
              maxWidth: "680px",
            }}
          >
            <div
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                width: "100%",
              }}
            >
              <Search
                size={18}
                style={{
                  position: "absolute",
                  left: "16px",
                  color: "#94a3b8",
                  pointerEvents: "none",
                }}
              />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={placeholderText || "Search products or categories..."}
                style={{
                  width: "100%",
                  height: "44px",
                  borderRadius: "9999px",
                  border: "1.5px solid #cbd5e1",
                  paddingLeft: "44px",
                  paddingRight: query ? "44px" : "20px",
                  fontSize: "14.5px",
                  fontWeight: 500,
                  color: "#0f172a",
                  outline: "none",
                  backgroundColor: "#f8fafc",
                  boxSizing: "border-box",
                  fontFamily: "inherit",
                  transition: "border-color 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#0077b6";
                  e.currentTarget.style.backgroundColor = "#FFFFFF";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0, 119, 182, 0.12)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#cbd5e1";
                  e.currentTarget.style.backgroundColor = "#f8fafc";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />

              {/* Loading / Clear Icon */}
              {loading ? (
                <span
                  style={{
                    position: "absolute",
                    right: "16px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    display: "flex",
                    alignItems: "center",
                    color: "#0077b6",
                  }}
                >
                  <Loader2 size={18} className="animate-spin" />
                </span>
              ) : query ? (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    inputRef.current?.focus();
                  }}
                  aria-label="Clear query"
                  style={{
                    position: "absolute",
                    right: "14px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                    display: "flex",
                    alignItems: "center",
                    color: "#94a3b8",
                  }}
                >
                  <X size={18} />
                </button>
              ) : null}
            </div>
          </form>

          {/* Close 'X' Button on Far Right */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            style={{
              position: "absolute",
              right: "0px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#334155",
              borderRadius: "50%",
              transition: "background 0.2s ease, color 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#f1f5f9";
              e.currentTarget.style.color = "#0f172a";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "#334155";
            }}
          >
            <X size={26} strokeWidth={1.75} />
          </button>
        </div>

        {/* ── Empty State: Popular Trending Searches & Recent Searches ── */}
        {!hasResults && (
          <div
            style={{
              maxWidth: "860px",
              margin: "32px auto 0",
              boxSizing: "border-box",
            }}
          >
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div style={{ marginBottom: "28px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "12px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      fontSize: "13px",
                      fontWeight: 700,
                      color: "#64748b",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    <Clock size={15} /> Recent Searches
                  </div>
                  <button
                    type="button"
                    onClick={clearRecentSearches}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#94a3b8",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                      padding: 0,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#94a3b8")}
                  >
                    Clear All
                  </button>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {recentSearches.map((term, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setQuery(term);
                        inputRef.current?.focus();
                      }}
                      style={{
                        padding: "6px 14px",
                        borderRadius: "20px",
                        backgroundColor: "#f1f5f9",
                        border: "1px solid #e2e8f0",
                        color: "#334155",
                        fontSize: "13px",
                        fontWeight: 500,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        transition: "all 0.15s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#e2e8f0";
                        e.currentTarget.style.color = "#0077b6";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "#f1f5f9";
                        e.currentTarget.style.color = "#334155";
                      }}
                    >
                      <Clock size={12} style={{ opacity: 0.6 }} /> {term}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Trending & Popular Searches */}
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#64748b",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  marginBottom: "12px",
                }}
              >
                <TrendingUp size={15} color="#0077b6" /> Popular Searches
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {TRENDING_SEARCHES.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setQuery(item);
                      inputRef.current?.focus();
                    }}
                    style={{
                      padding: "7px 16px",
                      borderRadius: "20px",
                      backgroundColor: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      color: "#1e293b",
                      fontSize: "13.5px",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      transition: "all 0.15s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#0077b6";
                      e.currentTarget.style.borderColor = "#0077b6";
                      e.currentTarget.style.color = "#FFFFFF";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "#f8fafc";
                      e.currentTarget.style.borderColor = "#e2e8f0";
                      e.currentTarget.style.color = "#1e293b";
                    }}
                  >
                    <Sparkles size={12} style={{ opacity: 0.8 }} /> {item}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Active Search Results: Products & Categories ── */}
        {hasResults && (
          <div
            style={{
              maxWidth: "860px",
              margin: "32px auto 0",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              columnGap: "48px",
              rowGap: "28px",
              boxSizing: "border-box",
            }}
          >
            {/* ── Left Column: Products ── */}
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "16px",
                }}
              >
                <h3
                  style={{
                    fontSize: "18px",
                    fontWeight: 700,
                    color: "#0f172a",
                    margin: 0,
                    fontFamily: "inherit",
                  }}
                >
                  Products ({products.length})
                </h3>
              </div>

              {loading ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px" }} className="animate-pulse">
                      <span style={{ color: "#94a3b8" }}>•</span>
                      <div
                        style={{
                          height: "15px",
                          width: i % 2 === 0 ? "75%" : "60%",
                          background: "linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)",
                          backgroundSize: "200% 100%",
                          borderRadius: "4px",
                        }}
                      />
                    </div>
                  ))}
                </div>
              ) : products.length > 0 ? (
                <ul
                  style={{
                    listStyle: "none",
                    padding: 0,
                    margin: 0,
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  {products.map((p) => {
                    const codePart = p.code || p.article;
                    return (
                      <li key={p.id}>
                        <button
                          type="button"
                          onClick={() => handleProductClick(p)}
                          style={{
                            background: "transparent",
                            border: "none",
                            padding: "4px 0",
                            margin: 0,
                            textAlign: "left",
                            cursor: "pointer",
                            fontSize: "14.5px",
                            color: "#1e293b",
                            lineHeight: "1.4",
                            display: "flex",
                            alignItems: "flex-start",
                            gap: "8px",
                            fontFamily: "inherit",
                            transition: "all 0.15s ease",
                            width: "100%",
                          }}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.color = "#0077b6";
                            (e.currentTarget as HTMLButtonElement).style.paddingLeft = "4px";
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.color = "#1e293b";
                            (e.currentTarget as HTMLButtonElement).style.paddingLeft = "0px";
                          }}
                        >
                          <span style={{ color: "#0077b6", flexShrink: 0, fontSize: "16px" }}>•</span>
                          <span style={{ flex: 1 }}>
                            <span style={{ fontWeight: 600 }}>{p.name}</span>
                            {codePart ? (
                              <span
                                style={{
                                  fontSize: "12px",
                                  backgroundColor: "#f1f5f9",
                                  color: "#475569",
                                  padding: "2px 6px",
                                  borderRadius: "4px",
                                  marginLeft: "6px",
                                  fontWeight: 500,
                                }}
                              >
                                {codePart}
                              </span>
                            ) : null}
                            {p.price && p.price > 0 ? (
                              <span style={{ fontSize: "12.5px", color: "#0077b6", fontWeight: 700, marginLeft: "8px" }}>
                                ₹{p.price}
                              </span>
                            ) : null}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p style={{ fontSize: "14px", color: "#64748b", margin: 0 }}>
                  No matching products found.
                </p>
              )}
            </div>

            {/* ── Right Column: Categories ── */}
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "16px",
                }}
              >
                <h3
                  style={{
                    fontSize: "18px",
                    fontWeight: 700,
                    color: "#0f172a",
                    margin: 0,
                    fontFamily: "inherit",
                  }}
                >
                  Categories ({matchingCategories.length})
                </h3>
              </div>

              {loading ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px" }} className="animate-pulse">
                      <span style={{ color: "#94a3b8" }}>•</span>
                      <div
                        style={{
                          height: "15px",
                          width: i % 2 === 0 ? "65%" : "50%",
                          background: "linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)",
                          backgroundSize: "200% 100%",
                          borderRadius: "4px",
                        }}
                      />
                    </div>
                  ))}
                </div>
              ) : matchingCategories.length > 0 ? (
                <ul
                  style={{
                    listStyle: "none",
                    padding: 0,
                    margin: 0,
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  {matchingCategories.map((c) => (
                    <li key={`${c.type}-${c.id}`}>
                      <button
                        type="button"
                        onClick={() => handleCategoryClick(c)}
                        style={{
                          background: "transparent",
                          border: "none",
                          padding: "4px 0",
                          margin: 0,
                          textAlign: "left",
                          cursor: "pointer",
                          fontSize: "14.5px",
                          color: "#1e293b",
                          lineHeight: "1.4",
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "8px",
                          fontFamily: "inherit",
                          transition: "all 0.15s ease",
                          width: "100%",
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.color = "#0077b6";
                          (e.currentTarget as HTMLButtonElement).style.paddingLeft = "4px";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.color = "#1e293b";
                          (e.currentTarget as HTMLButtonElement).style.paddingLeft = "0px";
                        }}
                      >
                        <span style={{ color: "#0077b6", flexShrink: 0, fontSize: "16px" }}>•</span>
                        <span>
                          <span style={{ fontWeight: 600 }}>{c.name}</span>
                          {c.count !== undefined && c.count > 0 ? (
                            <span style={{ color: "#64748b", marginLeft: "4px", fontSize: "12px" }}>
                              ({c.count})
                            </span>
                          ) : null}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ fontSize: "14px", color: "#64748b", margin: 0 }}>
                  No matching categories found.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Bottom View All Link when search query is entered */}
        {hasResults && !loading && (
          <div
            style={{
              maxWidth: "860px",
              margin: "24px auto 0",
              textAlign: "center",
              borderTop: "1px solid #f1f5f9",
              paddingTop: "16px",
            }}
          >
            <button
              type="button"
              onClick={() => handleSearchSubmit()}
              style={{
                background: "transparent",
                border: "none",
                color: "#0077b6",
                fontSize: "14px",
                fontWeight: 700,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
              onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
            >
              View all results for "{query}" <ArrowRight size={15} />
            </button>
          </div>
        )}
      </div>
    </>
  );
}
