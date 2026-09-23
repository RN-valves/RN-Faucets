"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { X, Loader2 } from "lucide-react";

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
}

interface CategoryItem {
  id: string;
  _id?: string;
  name: string;
  slug?: string;
  count?: number;
  type?: "category" | "subcategory";
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [matchingCategories, setMatchingCategories] = useState<CategoryItem[]>([]);
  const [allCategories, setAllCategories] = useState<CategoryItem[]>([]);

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
        const prodRes = await fetch(`/api/products?q=${encodeURIComponent(trimmed)}&limit=10`);
        let prodList: ProductItem[] = [];
        if (prodRes.ok) {
          const data = await prodRes.json();
          prodList = Array.isArray(data) ? data : data.products || [];
        }

        // 2. Filter matching categories and subcategories
        const lowerQ = trimmed.toLowerCase();
        const matchedCats = allCategories.filter((c) =>
          c.name?.toLowerCase().includes(lowerQ)
        );

        setProducts(prodList.slice(0, 8));
        setMatchingCategories(matchedCats.slice(0, 8));
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
      onClose();
      const catSegment = (product.subcategoryId || product.category || "all")
        .toString()
        .toLowerCase()
        .replace(/\s+/g, "-");
      const prodCode = product.code || product.id;
      router.push(`/faucets/${encodeURIComponent(catSegment)}/${encodeURIComponent(prodCode)}`);
    },
    [onClose, router]
  );

  const handleCategoryClick = useCallback(
    (item: CategoryItem) => {
      onClose();
      if (item.type === "subcategory") {
        router.push(`/faucets/${encodeURIComponent(item.slug || item.id)}`);
      } else {
        router.push(`/${encodeURIComponent(item.slug || item.id)}`);
      }
    },
    [onClose, router]
  );

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
          backgroundColor: "rgba(0, 0, 0, 0.35)",
          backdropFilter: "blur(2px)",
          WebkitBackdropFilter: "blur(2px)",
          transition: "opacity 0.25s ease",
        }}
      />

      {/* ── Top White Search Bar Overlay (Matches Screenshot Exactly) ── */}
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
          boxShadow: "0 6px 24px rgba(0, 0, 0, 0.12)",
          paddingTop: "14px",
          paddingBottom: hasResults ? "36px" : "16px",
          paddingLeft: "24px",
          paddingRight: "24px",
          fontFamily: "'Manrope', system-ui, sans-serif",
          transition: "all 0.25s ease",
          maxHeight: "85vh",
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
          {/* Centered Pill Search Input */}
          <div
            style={{
              position: "relative",
              width: "100%",
              maxWidth: "600px",
            }}
          >
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products or categories.."
              style={{
                width: "100%",
                height: "38px",
                borderRadius: "9999px",
                border: "1px solid #71717a",
                paddingLeft: "20px",
                paddingRight: query ? "40px" : "20px",
                fontSize: "14px",
                color: "#18181b",
                outline: "none",
                backgroundColor: "#FFFFFF",
                boxSizing: "border-box",
                fontFamily: "inherit",
              }}
            />

            {/* Loading / Clear Icon */}
            {loading ? (
              <span
                style={{
                  position: "absolute",
                  right: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  display: "flex",
                  alignItems: "center",
                  color: "#71717a",
                }}
              >
                <Loader2 size={16} className="animate-spin" />
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
                  color: "#71717a",
                }}
              >
                <X size={16} />
              </button>
            ) : null}
          </div>

          {/* Close 'X' Button on Far Right (Top right corner) */}
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
              padding: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#18181b",
            }}
          >
            <X size={26} strokeWidth={1.5} />
          </button>
        </div>

        {/* ── Two Column Results Area: Products & Categories ── */}
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
            {/* ── Left Column: Products: ── */}
            <div>
              <h3
                style={{
                  fontSize: "20px",
                  fontWeight: 700,
                  color: "#0f172a",
                  margin: "0 0 16px 0",
                  fontFamily: "inherit",
                }}
              >
                Products:
              </h3>

              {products.length > 0 ? (
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
                            padding: 0,
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
                            transition: "color 0.15s ease",
                          }}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.color = "#0077b6";
                            (e.currentTarget as HTMLButtonElement).style.textDecoration = "underline";
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.color = "#1e293b";
                            (e.currentTarget as HTMLButtonElement).style.textDecoration = "none";
                          }}
                        >
                          <span style={{ color: "#475569", flexShrink: 0, fontSize: "16px" }}>•</span>
                          <span>
                            {p.name}
                            {codePart ? (
                              <span style={{ color: "#64748b", marginLeft: "4px" }}>
                                ({codePart})
                              </span>
                            ) : null}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : !loading ? (
                <p style={{ fontSize: "14px", color: "#64748b", margin: 0 }}>
                  No matching products found.
                </p>
              ) : null}
            </div>

            {/* ── Right Column: Categories: ── */}
            <div>
              <h3
                style={{
                  fontSize: "20px",
                  fontWeight: 700,
                  color: "#0f172a",
                  margin: "0 0 16px 0",
                  fontFamily: "inherit",
                }}
              >
                Categories:
              </h3>

              {matchingCategories.length > 0 ? (
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
                          padding: 0,
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
                          transition: "color 0.15s ease",
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.color = "#0077b6";
                          (e.currentTarget as HTMLButtonElement).style.textDecoration = "underline";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.color = "#1e293b";
                          (e.currentTarget as HTMLButtonElement).style.textDecoration = "none";
                        }}
                      >
                        <span style={{ color: "#475569", flexShrink: 0, fontSize: "16px" }}>•</span>
                        <span>
                          {c.name}
                          {c.count !== undefined && c.count > 0 ? (
                            <span style={{ color: "#64748b", marginLeft: "4px" }}>
                              ({c.count})
                            </span>
                          ) : null}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : !loading ? (
                <p style={{ fontSize: "14px", color: "#64748b", margin: 0 }}>
                  No matching categories found.
                </p>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
