"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Loader2, ArrowRight, Layers } from "lucide-react";

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
  originalPrice?: number;
  image?: string;
  category?: string;
  subcategoryId?: string;
  subcategoryName?: string;
  article?: string;
  skuCode?: string;
  stock?: number;
  status?: string;
}

interface CategoryItem {
  id: string;
  _id?: string;
  name: string;
  slug?: string;
  image?: string;
  banner?: string;
}

const POPULAR_SEARCHES = [
  "Ball Valves",
  "PTMT Faucets",
  "Bib Cock",
  "Angle Valve",
  "Concealed Valve",
  "Pillar Cock",
  "Swan Neck",
  "Showers",
];

const DEFAULT_PRODUCT_IMAGE =
  "/api/media/website/catalogue/products/default/image.webp";

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const modalContainerRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [matchingCategories, setMatchingCategories] = useState<CategoryItem[]>([]);
  const [allCategories, setAllCategories] = useState<CategoryItem[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  // Pre-fetch categories once for instant category suggestions
  useEffect(() => {
    let isMounted = true;
    async function loadCategories() {
      try {
        const res = await fetch("/api/categories");
        if (res.ok) {
          const data = await res.json();
          if (isMounted && Array.isArray(data)) {
            setAllCategories(data);
          }
        }
      } catch (err) {
        console.error("Failed to fetch categories for search:", err);
      }
    }
    loadCategories();
    return () => {
      isMounted = false;
    };
  }, []);

  // Focus input and lock body scroll when modal opens
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    } else {
      document.body.style.overflow = "";
      setQuery("");
      setProducts([]);
      setMatchingCategories([]);
      setHasSearched(false);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Handle ESC key to close modal
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

  // Debounced search logic
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setProducts([]);
      setMatchingCategories([]);
      setLoading(false);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    const timeoutId = setTimeout(async () => {
      try {
        // 1. Search products from API
        const prodRes = await fetch(`/api/products?q=${encodeURIComponent(trimmed)}&limit=16`);
        let prodList: ProductItem[] = [];
        if (prodRes.ok) {
          const data = await prodRes.json();
          prodList = Array.isArray(data) ? data : data.products || [];
        }

        // 2. Filter matching categories client-side from cached categories
        const lowerQuery = trimmed.toLowerCase();
        const matchedCats = allCategories.filter((cat) =>
          cat.name?.toLowerCase().includes(lowerQuery)
        );

        setProducts(prodList);
        setMatchingCategories(matchedCats.slice(0, 4));
        setHasSearched(true);
      } catch (err) {
        console.error("Search fetch error:", err);
      } finally {
        setLoading(false);
      }
    }, 280);

    return () => clearTimeout(timeoutId);
  }, [query, allCategories]);

  const handleProductSelect = useCallback(
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

  const handleCategorySelect = useCallback(
    (category: CategoryItem) => {
      onClose();
      router.push(`/${category.slug || category.id}`);
    },
    [onClose, router]
  );

  const handleTagClick = useCallback((tag: string) => {
    setQuery(tag);
    inputRef.current?.focus();
  }, []);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Search Products and Collections"
      className="fixed inset-0 z-[99999] flex flex-col items-center justify-start overflow-y-auto px-4 pt-6 pb-16 md:px-8 md:pt-14"
      style={{
        backgroundColor: "rgba(15, 23, 42, 0.65)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        fontFamily: "'Manrope', system-ui, sans-serif",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {/* ── Search Container (Matches RN Valves Signature Design) ── */}
      <div
        ref={modalContainerRef}
        className="w-full max-w-5xl bg-white rounded-2xl md:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col transition-all duration-300 animate-in fade-in zoom-in-95"
      >
        {/* ── Search Top Bar ── */}
        <div className="flex items-center px-5 py-4 md:px-8 md:py-6 border-b border-slate-100 gap-3 md:gap-4 bg-white">
          <div className="text-slate-800 shrink-0">
            {loading ? (
              <Loader2 size={24} className="animate-spin text-slate-700" />
            ) : (
              <Search size={24} strokeWidth={1.8} className="text-slate-800" />
            )}
          </div>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && products.length > 0) {
                handleProductSelect(products[0]);
              }
            }}
            placeholder="Search products, collections, SKU or article codes..."
            className="w-full text-base md:text-xl font-medium text-slate-900 placeholder:text-slate-400 bg-transparent focus:outline-none"
          />

          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              aria-label="Clear search input"
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X size={18} />
            </button>
          )}

          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <button
              type="button"
              onClick={onClose}
              aria-label="Close search"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider transition-colors"
            >
              <span className="hidden sm:inline">ESC</span>
              <X size={16} strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* ── Modal Body Content ── */}
        <div className="p-5 md:p-8 bg-slate-50/50 max-h-[75vh] overflow-y-auto">
          {/* Popular Searches (Shown when query is empty) */}
          {!hasSearched && (
            <div className="space-y-6">
              <div>
                <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                  Popular Searches
                </span>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_SEARCHES.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleTagClick(tag)}
                      className="px-4 py-2 rounded-full text-xs md:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-900 hover:text-white border border-slate-200 hover:border-slate-900 shadow-sm transition-all duration-200"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Catalogue Collections */}
              {allCategories.length > 0 && (
                <div>
                  <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                    Featured Collections
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {allCategories.slice(0, 4).map((cat) => (
                      <button
                        key={cat.id || cat._id}
                        type="button"
                        onClick={() => handleCategorySelect(cat)}
                        className="group flex items-center justify-between p-3.5 rounded-xl bg-white border border-slate-200 hover:border-slate-400 hover:shadow-md transition-all text-left"
                      >
                        <span className="text-xs md:text-sm font-bold text-slate-800 group-hover:text-slate-950 truncate">
                          {cat.name}
                        </span>
                        <ArrowRight size={14} className="text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Matching Categories / Collections Pills */}
          {matchingCategories.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-1.5 mb-2.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <Layers size={14} className="text-slate-700" />
                <span>Matching Collections</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {matchingCategories.map((cat) => (
                  <button
                    key={cat.id || cat._id}
                    type="button"
                    onClick={() => handleCategorySelect(cat)}
                    className="group inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-white border border-slate-300 hover:border-slate-900 text-slate-800 text-xs font-bold transition-all shadow-sm"
                  >
                    <span>{cat.name}</span>
                    <ArrowRight size={13} className="text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Results Summary Header */}
          {hasSearched && (
            <div className="flex items-center justify-between pb-3 mb-5 border-b border-slate-200 text-xs md:text-sm text-slate-600">
              <span>
                {products.length > 0 ? (
                  <>
                    Showing <strong className="text-slate-900 font-bold">{products.length}</strong> {products.length === 1 ? "product" : "products"} for &ldquo;<span className="text-slate-900 font-bold">{query}</span>&rdquo;
                  </>
                ) : (
                  <>No products found</>
                )}
              </span>
              {products.length > 0 && (
                <span className="text-[11px] text-slate-400 hidden sm:inline uppercase font-bold tracking-wider">
                  Click product to view details
                </span>
              )}
            </div>
          )}

          {/* Products Results Grid — Exact RN Valves Card Styling */}
          {products.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {products.map((item, idx) => {
                const itemKey = item.code || item.id || `search-prod-${idx}`;
                const sellingPrice = Number(item.inSelling ?? item.price ?? 0);
                const mrp = Number(item.inMrp ?? item.originalPrice ?? 0);
                const hasDiscount = mrp > sellingPrice && sellingPrice > 0;
                const discountPercent = hasDiscount
                  ? Math.round(((mrp - sellingPrice) / mrp) * 100)
                  : 0;
                const imgUrl = item.image || DEFAULT_PRODUCT_IMAGE;

                return (
                  <div
                    key={itemKey}
                    onClick={() => handleProductSelect(item)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        handleProductSelect(item);
                      }
                    }}
                    className="group flex flex-col bg-white border border-slate-200 hover:border-slate-400 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer"
                  >
                    {/* Thumbnail Image Container */}
                    <div className="relative w-full aspect-square bg-[#F8FAFC] border-b border-slate-100 p-4 flex items-center justify-center overflow-hidden">
                      {/* Discount Badge */}
                      {hasDiscount && (
                        <span className="absolute top-2.5 left-2.5 z-10 bg-[#059669] text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded tracking-wider shadow-sm">
                          -{discountPercent}%
                        </span>
                      )}

                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imgUrl}
                        alt={item.name}
                        loading="lazy"
                        className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-[0_8px_16px_rgba(20,36,52,0.1)]"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = DEFAULT_PRODUCT_IMAGE;
                        }}
                      />
                    </div>

                    {/* Product Information */}
                    <div className="p-3.5 flex flex-col flex-1 justify-between gap-2.5">
                      <div>
                        {/* Category & Article Tag */}
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate max-w-[120px]">
                            {item.subcategoryName || item.category || "Faucets"}
                          </span>
                          {(item.article || item.code) && (
                            <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded tracking-wider uppercase shrink-0">
                              {item.article || item.code}
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <h3 className="text-xs md:text-sm font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors min-h-[34px]">
                          {item.name}
                        </h3>
                      </div>

                      {/* Pricing Row */}
                      <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-sm md:text-base font-extrabold text-slate-900">
                            {sellingPrice > 0
                              ? `₹${sellingPrice.toLocaleString("en-IN")}`
                              : "Price on Request"}
                          </span>
                          {hasDiscount && (
                            <span className="text-xs text-slate-400 line-through">
                              ₹{mrp.toLocaleString("en-IN")}
                            </span>
                          )}
                        </div>

                        <span className="text-xs font-bold text-slate-900 group-hover:translate-x-0.5 transition-transform">
                          →
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Empty State */}
          {hasSearched && products.length === 0 && !loading && (
            <div className="text-center py-12 px-4 rounded-2xl bg-white border border-slate-200">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 text-slate-500 mb-3">
                <Search size={22} strokeWidth={1.8} />
              </div>
              <h3 className="text-base md:text-lg font-bold text-slate-900 mb-1">
                No products found for &ldquo;{query}&rdquo;
              </h3>
              <p className="text-xs md:text-sm text-slate-500 max-w-md mx-auto mb-5 leading-relaxed">
                We couldn&apos;t find matching products. Try checking for typos or searching by collection name like &ldquo;Ball Valve&rdquo;, &ldquo;PTMT&rdquo;, or &ldquo;Bib Cock&rdquo;.
              </p>
              <div className="flex flex-wrap justify-center gap-2 max-w-md mx-auto">
                {POPULAR_SEARCHES.slice(0, 5).map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleTagClick(tag)}
                    className="px-3 py-1.5 rounded-full text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-900 hover:text-white border border-slate-200 transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
