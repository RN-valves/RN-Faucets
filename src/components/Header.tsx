"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronRight, Heart, Search, ShoppingBag, User, X, Shield, LogOut } from "lucide-react";
import SearchModal from "./SearchModal";
import { getCartItems } from "@/utils/cart";
import { getCustomerSession, clearCustomerSession, CustomerSession } from "@/utils/customerAuth";
import { getAdminAuth, logoutAdmin } from "@/utils/adminStore";

const USER_MENU_LINKS = [
  "About Us",
  "Our Products",
  "Become A Channel Partner",
  "Blogs",
  "Contact Us",
] as const;

const USER_MENU_ROUTES: Partial<Record<(typeof USER_MENU_LINKS)[number], string>> = {
  "About Us": "/about-us",
  "Become A Channel Partner": "/business-user-registration",
  "Blogs": "/blogs",
  "Contact Us": "/contact-us",
};

interface DynamicCategory {
  _id?: string;
  id: string;
  name: string;
  slug: string;
  image?: string;
  banner?: string;
  icon?: string;
  description?: string;
}

interface DynamicSubcategory {
  _id?: string;
  id: string;
  categoryId: string;
  categoryName?: string;
  name: string;
  slug: string;
  image?: string;
  banner?: string;
  description?: string;
}

let cachedCategories: DynamicCategory[] | null = null;
let cachedSubcategories: DynamicSubcategory[] | null = null;
let isPreloadingCatalogue = false;

function preloadCatalogueData() {
  if (cachedCategories && cachedSubcategories) return;
  if (isPreloadingCatalogue) return;
  isPreloadingCatalogue = true;
  Promise.all([
    fetch("/api/categories").then((r) => (r.ok ? r.json() : [])),
    fetch("/api/subcategories").then((r) => (r.ok ? r.json() : [])),
  ])
    .then(([cats, subs]) => {
      if (Array.isArray(cats) && cats.length > 0) cachedCategories = cats;
      if (Array.isArray(subs) && subs.length > 0) cachedSubcategories = subs;
    })
    .catch(() => {})
    .finally(() => {
      isPreloadingCatalogue = false;
    });
}

function CatalogueDashboard({
  onClose,
  onBack,
}: {
  onClose?: () => void;
  onBack?: () => void;
}) {
  const router = useRouter();
  const [categories, setCategories] = useState<DynamicCategory[]>(cachedCategories || []);
  const [subcategories, setSubcategories] = useState<DynamicSubcategory[]>(cachedSubcategories || []);
  const [activeCategoryId, setActiveCategoryId] = useState<string>(
    cachedCategories && cachedCategories.length > 0
      ? cachedCategories[0].id || (cachedCategories[0] as any)._id || cachedCategories[0].slug
      : ""
  );
  const [loading, setLoading] = useState(!cachedCategories || cachedCategories.length === 0);

  useEffect(() => {
    if (cachedCategories && cachedSubcategories && cachedCategories.length > 0) {
      setCategories(cachedCategories);
      setSubcategories(cachedSubcategories);
      setActiveCategoryId(cachedCategories[0].id || (cachedCategories[0] as any)._id || cachedCategories[0].slug);
      setLoading(false);
      return;
    }

    async function loadCatalogueData() {
      try {
        setLoading(true);
        const [catRes, subRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/subcategories"),
        ]);

        const cats = catRes.ok ? await catRes.json() : [];
        const subs = subRes.ok ? await subRes.json() : [];

        if (Array.isArray(cats) && cats.length > 0) {
          cachedCategories = cats;
          setCategories(cats);
          setActiveCategoryId(cats[0].id || (cats[0] as any)._id || cats[0].slug);
        }
        if (Array.isArray(subs) && subs.length > 0) {
          cachedSubcategories = subs;
          setSubcategories(subs);
        }
      } catch (err) {
        console.error("Failed to load dynamic catalogue dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadCatalogueData();
  }, []);

  const activeCategory =
    categories.find(
      (c) =>
        c.id === activeCategoryId ||
        (c as any)._id === activeCategoryId ||
        c.slug === activeCategoryId
    ) || categories[0];

  // Match subcategories for current category
  const activeSubcategories = subcategories.filter((sub) => {
    if (!activeCategory) return false;
    const catId = activeCategory.id || (activeCategory as any)._id;
    return (
      String(sub.categoryId) === String(catId) ||
      (sub.categoryName &&
        activeCategory.name &&
        sub.categoryName.toLowerCase().trim() === activeCategory.name.toLowerCase().trim())
    );
  });

  const getCardImage = (imgSrc?: string, fallbackIdx: number = 0) => {
    if (imgSrc && imgSrc.trim() && !imgSrc.includes("coresg-normal.trae.ai") && !imgSrc.includes("www.rnvalves.com")) {
      return imgSrc;
    }
    return "/api/media/website/catalogue/products/default/image.webp";
  };

  const getCategoryThumbnail = (cat: DynamicCategory, idx: number) => {
    if (cat.icon && cat.icon.trim() && !cat.icon.includes("coresg-normal.trae.ai") && !cat.icon.includes("www.rnvalves.com")) {
      return cat.icon;
    }
    if (cat.image && cat.image.trim() && !cat.image.includes("coresg-normal.trae.ai") && !cat.image.includes("www.rnvalves.com")) {
      return cat.image;
    }
    const catId = cat.id || (cat as any)._id;
    const matchingSub = subcategories.find(
      (s) =>
        (String(s.categoryId) === String(catId) ||
          (s.categoryName && cat.name && s.categoryName.toLowerCase().trim() === cat.name.toLowerCase().trim())) &&
        s.image &&
        !s.image.includes("www.rnvalves.com")
    );
    if (matchingSub?.image) {
      return matchingSub.image;
    }
    return getCardImage(cat.image, idx);
  };

  const handleNavigate = (path: string) => {
    if (onClose) onClose();
    router.push(path);
  };

  return (
    <div className="catalogue-canvas">
      {/* ── Mobile / Tablet Top Bar with Back and Close Controls ── */}
      <div className="catalogue-mobile-topbar">
        <button
          type="button"
          onClick={onBack}
          className="catalogue-back-btn"
          aria-label="Back to main menu"
        >
          <ChevronRight size={18} style={{ transform: "rotate(180deg)" }} />
          <span>Menu</span>
        </button>
        <span className="catalogue-topbar-title">Our Products</span>
        <button
          type="button"
          onClick={onClose}
          className="catalogue-mobile-close-btn"
          aria-label="Close menu"
        >
          <X size={22} />
        </button>
      </div>

      {/* ── 1. Categories Column: Left/Middle List ── */}
      <aside className="catalogue-categories-aside">
        <div className="catalogue-categories-header">
          <span className="catalogue-categories-header-title">
            Categories
          </span>
          <span className="catalogue-categories-header-count">
            {categories.length} Ranges
          </span>
        </div>

        <div className="catalogue-categories-list">
          {loading && categories.length === 0 ? (
            [1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="animate-pulse"
                style={{
                  height: "58px",
                  borderRadius: "12px",
                  background: "rgba(226, 234, 242, 0.8)",
                  border: "1px solid rgba(148, 163, 184, 0.2)",
                  flexShrink: 0,
                }}
              />
            ))
          ) : categories.map((item, idx) => {
            const isSelected =
              activeCategoryId === item.id ||
              activeCategoryId === (item as any)._id ||
              activeCategoryId === item.slug;
            const thumbnailImg = getCategoryThumbnail(item, idx);

            return (
              <button
                key={item.id || idx}
                type="button"
                onClick={() => setActiveCategoryId(item.id || (item as any)._id || item.slug)}
                className={`catalogue-category-btn${isSelected ? " is-active" : ""}`}
              >
                <div className="catalogue-category-thumb">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={thumbnailImg}
                    alt={item.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                    }}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = "/api/media/website/catalogue/products/default/image.webp";
                    }}
                  />
                </div>
                <p className="catalogue-category-name">
                  {item.name}
                </p>
                <ChevronRight
                  size={15}
                  strokeWidth={isSelected ? 2.5 : 2}
                  className="catalogue-category-chevron"
                  color={isSelected ? "#00AEEF" : "#94A3B8"}
                />
              </button>
            );
          })}
        </div>
      </aside>

      {/* ── 2. Right Column: Subcategories Showcase ── */}
      <div className="catalogue-subcategories-col">
        {/* Header Bar: Category Title & Explore Button */}
        <div className="catalogue-subcategories-header">
          <div style={{ minWidth: 0, flex: 1 }}>
            <div className="catalogue-subcategories-subtitle">
              <span>Subcategories</span>
              <span>•</span>
              <span>{activeSubcategories.length} Collections</span>
            </div>
            <h2 className="catalogue-subcategories-title">
              {activeCategory?.name ?? "Catalogue Collection"}
            </h2>
          </div>

          {activeCategory && (
            <button
              type="button"
              onClick={() => handleNavigate(`/faucets/${activeCategory.slug || activeCategory.id}`)}
              className="catalogue-view-range-btn"
            >
              <span>View Full Range</span>
              <ChevronRight size={15} />
            </button>
          )}
        </div>

        {/* Dynamic Cards Grid */}
        <div className="catalogue-subcategories-grid">
          {loading && categories.length === 0 ? (
            [1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="animate-pulse"
                style={{
                  minHeight: "145px",
                  borderRadius: "12px",
                  background: "rgba(226, 234, 242, 0.8)",
                  border: "1px solid rgba(148, 163, 184, 0.2)",
                }}
              />
            ))
          ) : activeSubcategories.length > 0 ? (
            activeSubcategories.map((sub, idx) => {
              const cardImg = getCardImage(sub.image || sub.banner || activeCategory?.image, idx);
              const targetSlug = sub.slug || sub.id;

              return (
                <article
                  key={sub.id || idx}
                  className="subcategory-card group catalogue-subcat-card"
                  onClick={() => handleNavigate(`/faucets/${targetSlug}`)}
                >
                  <div className="catalogue-card-img-panel">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={cardImg}
                      alt={sub.name}
                      className="catalogue-card-img"
                    />
                  </div>

                  <div className="catalogue-card-info-panel">
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px", minWidth: 0 }}>
                      <h3 className="catalogue-card-title">
                        {sub.name}
                      </h3>
                      <p className="catalogue-card-desc">
                        {sub.description || "Precision engineered collection for modern luxury."}
                      </p>
                    </div>

                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                      <span className="catalogue-card-arrow-circle">
                        <ChevronRight size={14} strokeWidth={2.2} />
                      </span>
                    </div>
                  </div>
                </article>
              );
            })
          ) : (
            /* Fallback single collection exploration card if no subcategories exist */
            <article
              className="subcategory-card group catalogue-subcat-fallback-card"
              onClick={() => activeCategory && handleNavigate(`/faucets/${activeCategory.slug || activeCategory.id}`)}
            >
              <div className="catalogue-card-img-panel">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getCardImage(activeCategory?.image, 0)}
                  alt={activeCategory?.name || "Range"}
                  className="catalogue-card-img"
                />
              </div>
              <div className="catalogue-card-info-panel" style={{ padding: "20px 18px", gap: "12px" }}>
                <div>
                  <h3 className="catalogue-card-title" style={{ fontSize: "18px", marginBottom: "6px" }}>
                    {activeCategory?.name}
                  </h3>
                  <p className="catalogue-card-desc" style={{ fontSize: "13px", WebkitLineClamp: 3 }}>
                    {activeCategory?.description ||
                      "Browse the complete catalogue range, technical specifications, and available finishes."}
                  </p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#0077B6", fontWeight: 700, fontSize: "13.5px" }}>
                  <span>Explore Range Products</span>
                  <ChevronRight size={16} />
                </div>
              </div>
            </article>
          )}
        </div>
      </div>
    </div>
  );
}

const DEFAULT_LOGO = "/rn-header-logo.svg";

interface HeaderProps {
  data?: {
    logo?: string;
    menuLinks?: Array<{ label: string; href: string }>;
  };
}

export default function Header({ data }: HeaderProps) {
  const [logoSrc, setLogoSrc] = useState<string>(data?.logo || DEFAULT_LOGO);

  useEffect(() => {
    if (data?.logo) {
      setLogoSrc(data.logo);
    } else {
      fetch("/api/home-setting")
        .then((res) => res.json())
        .then((json) => {
          if (json?.header?.logo) {
            setLogoSrc(json.header.logo);
          }
        })
        .catch(() => {});
    }
  }, [data?.logo]);

  const router = useRouter();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [activeUserMenuLink, setActiveUserMenuLink] = useState<string | null>(null);
  const [isDarkBg, setIsDarkBg] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [sessionUser, setSessionUser] = useState<CustomerSession | null>(null);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateAuthStatus = () => {
      const sess = getCustomerSession();
      const admin = getAdminAuth();
      setSessionUser(sess);
      const cleanPhone = (val?: string) => String(val || "").replace(/\D/g, "").slice(-10);
      setIsAdminUser(
        !!admin ||
        cleanPhone(sess?.mobile) === "8737029643" ||
        sess?.userType === "Admin" ||
        sess?.role === "Super Admin"
      );
    };

    updateAuthStatus();
    preloadCatalogueData();
    window.addEventListener("customer-auth-changed", updateAuthStatus);
    window.addEventListener("rn-admin-data-changed", updateAuthStatus);

    return () => {
      window.removeEventListener("customer-auth-changed", updateAuthStatus);
      window.removeEventListener("rn-admin-data-changed", updateAuthStatus);
    };
  }, []);

  useEffect(() => {
    const updateCount = () => {
      const items = getCartItems();
      const count = items.reduce((acc, item) => acc + item.quantity, 0);
      setCartCount(count);
    };
    updateCount();
    window.addEventListener("cart-updated", updateCount);
    return () => window.removeEventListener("cart-updated", updateCount);
  }, []);

  useEffect(() => {
    if (userMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [userMenuOpen]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setUserMenuOpen(false);
        setUserDropdownOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!userDropdownOpen) return;

    const onPointerDown = (event: MouseEvent) => {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target as Node)
      ) {
        setUserDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [userDropdownOpen]);

  // overflow now handled by the combined effect above

  /* ── Dynamic scroll theme detection for light vs dark sections ── */
  useEffect(() => {
    const handleScroll = () => {
      // Header stays 100% transparent for Section 1, 2, 3, & 4 (Best Seller Categories)
      const isPastSection4 = window.scrollY >= (window.innerHeight * 4 - 90);
      setIsScrolled(isPastSection4);

      const sections = Array.from(document.querySelectorAll("section, [data-header-theme]"));
      const headerPoint = 45; // top mid-header height px

      let darkBg = true;

      for (const sec of sections) {
        const rect = sec.getBoundingClientRect();
        if (rect.top <= headerPoint && rect.bottom >= headerPoint) {
          const themeAttr = sec.getAttribute("data-header-theme");
          if (themeAttr === "light") {
            darkBg = false;
          } else if (themeAttr === "dark") {
            darkBg = true;
          } else {
            // Computed background color check fallback
            const bg = window.getComputedStyle(sec).backgroundColor;
            if (
              bg &&
              (bg.includes("255, 255, 255") ||
                bg.includes("250, 250, 250") ||
                bg.includes("245, 245, 245") ||
                bg.includes("247, 247, 247") ||
                bg === "rgb(255, 255, 255)" ||
                bg === "rgb(247, 247, 247)")
            ) {
              darkBg = false;
            }
          }
          break;
        }
      }

      setIsDarkBg(darkBg);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Header text & icons adapt dynamically to background
  const textColor = isDarkBg ? "#ffffff" : "#111827";
  const textMutedColor = isDarkBg ? "rgba(255, 255, 255, 0.95)" : "rgba(17, 24, 39, 0.9)";
  const iconColor = isDarkBg ? "#ffffff" : "#111827";
  const headerBg = isScrolled
    ? isDarkBg
      ? "rgba(10, 15, 25, 0.96)"
      : "rgba(255, 255, 255, 0.96)"
    : "transparent";
  const backdropFilterStyle = isScrolled ? "blur(12px)" : "none";
  const borderBottomStyle = isScrolled
    ? isDarkBg
      ? "1px solid rgba(255, 255, 255, 0.1)"
      : "1px solid rgba(0, 0, 0, 0.06)"
    : "none";
  const boxShadowStyle = isScrolled
    ? isDarkBg
      ? "0 4px 20px rgba(0, 0, 0, 0.3)"
      : "0 4px 20px rgba(0, 0, 0, 0.05)"
    : "none";

  return (
    <>
      {/* ── Top Floating Navigation Bar ── */}
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100px",
          zIndex: 9999,
          background: headerBg,
          backdropFilter: backdropFilterStyle,
          WebkitBackdropFilter: backdropFilterStyle,
          borderBottom: borderBottomStyle,
          boxShadow: boxShadowStyle,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingLeft: "clamp(28px, 6vw, 110px)",
          paddingRight: "clamp(28px, 6vw, 110px)",
          boxSizing: "border-box",
          pointerEvents: "auto",
          color: textColor,
          transition: "background 0.3s ease, border-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease",
        }}
      >
        {/* Left: Navigation Menu Trigger */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            zIndex: 20,
            pointerEvents: "auto",
          }}
        >
          <button
            type="button"
            onMouseEnter={preloadCatalogueData}
            onClick={() => {
              preloadCatalogueData();
              setActiveUserMenuLink(null);
              setUserMenuOpen(true);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: 0,
              color: textColor,
              outline: "none",
            }}
            className="group transition-opacity duration-300 hover:opacity-70"
            aria-label="Open Navigation Menu"
            aria-expanded={userMenuOpen}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "5px",
                width: "20px",
              }}
            >
              {[0, 1, 2].map((line) => (
                <span
                  key={line}
                  style={{
                    width: "20px",
                    height: "2px",
                    backgroundColor: textColor,
                    display: "block",
                    borderRadius: "1px",
                    transition: "background-color 0.3s ease",
                  }}
                />
              ))}
            </div>
            <span
              style={{
                fontFamily: "'Manrope', system-ui, sans-serif",
                fontSize: "14px",
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: textMutedColor,
                transition: "color 0.3s ease",
                WebkitFontSmoothing: "antialiased",
                MozOsxFontSmoothing: "grayscale",
              }}
            >
              MENU
            </span>
          </button>
        </div>

        {/* Center: Brand Logo (Vertically & Horizontally Centered in Header) */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 20,
            pointerEvents: "auto",
          }}
        >
          <a href="/" aria-label="RN Valves & Faucets Home" className="flex items-center justify-center cursor-pointer">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={logoSrc} 
              alt="RN Valves & Faucets" 
              onError={(e) => {
                const target = e.currentTarget;
                if (!target.src.endsWith(DEFAULT_LOGO)) {
                  target.src = DEFAULT_LOGO;
                }
              }}
              className="h-[62px] sm:h-[76px] md:h-[88px] max-h-[90px] w-auto block object-contain transition-all duration-300 hover:opacity-85 hover:scale-[1.02]" 
            />
          </a>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
              gap: "24px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
            {[
              { Icon: Search, label: "Search" },
              { Icon: Heart, label: "Wishlist" },
              { Icon: ShoppingBag, label: "Shopping Cart" },
            ].map(({ Icon, label }) => (
              <button
                key={label}
                type="button"
                onClick={() => {
                  if (label === "Search") {
                    setSearchOpen(true);
                  } else if (label === "Shopping Cart") {
                    router.push("/cart");
                  }
                }}
                aria-label={label}
                style={{ background: "transparent", border: "none", padding: 0, position: "relative" }}
                className="cursor-pointer transition-opacity duration-300 hover:opacity-70 flex items-center justify-center"
              >
                <Icon size={22} strokeWidth={1.6} color={iconColor} style={{ transition: "color 0.3s ease" }} />
                {label === "Shopping Cart" && cartCount > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: "-6px",
                      right: "-8px",
                      background: "#00AEEF",
                      color: "#FFFFFF",
                      fontSize: "10px",
                      fontWeight: "bold",
                      borderRadius: "50%",
                      width: "16px",
                      height: "16px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      zIndex: 10,
                    }}
                  >
                    {cartCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div style={{ width: "1px", height: "20px", backgroundColor: textColor, opacity: 0.2 }}></div>

          <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
            {/* User Account / Login — dropdown */}
            <div className="relative" ref={userDropdownRef}>
              <button
                type="button"
                aria-label="Account"
                aria-expanded={userDropdownOpen}
                aria-haspopup="menu"
                onClick={() => setUserDropdownOpen((open) => !open)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 40,
                  height: 40,
                  padding: 0,
                  margin: 0,
                  border: userDropdownOpen ? `1px solid ${iconColor}` : "1px solid transparent",
                  borderRadius: 3,
                  background: userDropdownOpen ? (isDarkBg ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)") : "transparent",
                  cursor: "pointer",
                  transition: "border-color 0.25s ease, background 0.25s ease, opacity 0.25s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = "0.85";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = "1";
                }}
              >
                <User size={22} strokeWidth={1.6} color={iconColor} />
              </button>

              <div
                role="menu"
                style={{
                  position: "absolute",
                  right: 0,
                  top: "calc(100% + 12px)",
                  zIndex: 99999,
                  width: 300,
                  maxWidth: "calc(100vw - 32px)",
                  background: "#fff",
                  border: "1px solid #e8e8e8",
                  boxShadow: "0 12px 40px rgba(0,0,0,0.14)",
                  overflow: "hidden",
                  transformOrigin: "top right",
                  opacity: userDropdownOpen ? 1 : 0,
                  transform: userDropdownOpen ? "scale(1)" : "scale(0.97)",
                  pointerEvents: userDropdownOpen ? "auto" : "none",
                  transition:
                    "opacity 0.25s ease, transform 0.25s cubic-bezier(0.22, 0.68, 0, 1.1)",
                }}
              >
                {isAdminUser ? (
                  <>
                    <div style={{ padding: "14px 20px 10px", borderBottom: "1px solid #efefef", background: "#f8fafc" }}>
                      <div style={{ fontSize: "11px", fontWeight: 700, color: "#0077B6", textTransform: "uppercase" }}>
                        Super Admin
                      </div>
                      <div style={{ fontSize: "14px", fontWeight: 800, color: "#0f172a" }}>
                        Aditya (+91 8737029643)
                      </div>
                    </div>

                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        window.location.href = "/admin/dashboard";
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        width: "100%",
                        padding: "14px 20px",
                        border: "none",
                        borderBottom: "1px solid #efefef",
                        background: "#fff",
                        cursor: "pointer",
                        fontSize: 14,
                        fontWeight: 700,
                        color: "#0077B6",
                      }}
                    >
                      <span>Open Admin Dashboard →</span>
                      <ChevronRight size={16} color="#0077B6" />
                    </button>

                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        router.push("/account/orders");
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        width: "100%",
                        padding: "14px 20px",
                        border: "none",
                        borderBottom: "1px solid #efefef",
                        background: "#fff",
                        cursor: "pointer",
                        fontSize: 14,
                        color: "#1f1f1f",
                      }}
                    >
                      <span>My Orders &amp; Account</span>
                      <ChevronRight size={16} color="#9a9a9a" />
                    </button>

                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        logoutAdmin();
                        setSessionUser(null);
                        setIsAdminUser(false);
                        setUserDropdownOpen(false);
                        window.location.href = "/";
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        width: "100%",
                        padding: "14px 20px",
                        border: "none",
                        background: "#fff",
                        cursor: "pointer",
                        fontSize: 14,
                        fontWeight: 600,
                        color: "#dc2626",
                      }}
                    >
                      <span>Logout Account</span>
                      <LogOut size={16} color="#dc2626" />
                    </button>
                  </>
                ) : sessionUser ? (
                  <>
                    <div style={{ padding: "14px 20px 10px", borderBottom: "1px solid #efefef", background: "#f8fafc" }}>
                      <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                        Logged in
                      </div>
                      <div style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a" }}>
                        +91 {sessionUser.mobile}
                      </div>
                    </div>

                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        router.push("/account/orders");
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        width: "100%",
                        padding: "14px 20px",
                        border: "none",
                        borderBottom: "1px solid #efefef",
                        background: "#fff",
                        cursor: "pointer",
                        fontSize: 14,
                        color: "#1f1f1f",
                      }}
                    >
                      <span>My Orders &amp; Profile</span>
                      <ChevronRight size={16} color="#9a9a9a" />
                    </button>

                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        clearCustomerSession();
                        logoutAdmin();
                        setSessionUser(null);
                        setIsAdminUser(false);
                        setUserDropdownOpen(false);
                        window.location.href = "/";
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        width: "100%",
                        padding: "14px 20px",
                        border: "none",
                        background: "#fff",
                        cursor: "pointer",
                        fontSize: 14,
                        fontWeight: 600,
                        color: "#dc2626",
                      }}
                    >
                      <span>Logout</span>
                      <LogOut size={16} color="#dc2626" />
                    </button>
                  </>
                ) : (
                  (
                    [
                      { label: "User Login", action: "login" as const },
                      { label: "Join as Personal User", action: "personal" as const },
                      { label: "Join as Business User", action: "business" as const },
                    ] as const
                  ).map(({ label, action }, index, items) => (
                    <button
                      key={label}
                      type="button"
                      role="menuitem"
                      tabIndex={userDropdownOpen ? 0 : -1}
                      onClick={() => {
                        setUserDropdownOpen(false);
                        if (action === "login") router.push("/login-user");
                        if (action === "personal") router.push("/retail-user-registration");
                        if (action === "business") router.push("/business-user-registration");
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        width: "100%",
                        minHeight: 54,
                        padding: "16px 24px",
                        margin: 0,
                        border: "none",
                        borderBottom:
                          index < items.length - 1 ? "1px solid #efefef" : "none",
                        background: "#fff",
                        cursor: "pointer",
                        textAlign: "left",
                        fontFamily: "'Manrope', system-ui, sans-serif",
                        fontSize: 15,
                        fontWeight: 400,
                        lineHeight: 1.45,
                        color: "#1f1f1f",
                        letterSpacing: "0.01em",
                        transition: "background 0.15s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#f9f9f9";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "#fff";
                      }}
                    >
                      <span style={{ paddingRight: 16 }}>{label}</span>
                      <ChevronRight
                        size={16}
                        strokeWidth={1.5}
                        color="#9a9a9a"
                        style={{ flexShrink: 0 }}
                      />
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </header>



      {/* ── User Account Menu Overlay (Off-canvas luxury navigation) ── */}
      <div
        aria-modal={userMenuOpen}
        role="dialog"
        aria-label="User Account Menu"
        className="user-menu-overlay"
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.36)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          display: "flex",
          zIndex: userMenuOpen ? 10001 : -1,
          opacity: userMenuOpen ? 1 : 0,
          pointerEvents: userMenuOpen ? "auto" : "none",
          transition: "opacity 0.35s ease",
        }}
      >
        <style>{`
          /* ── Mega Menu & Catalogue Dashboard Responsive System ── */
          .user-menu-backdrop {
            flex: 0 0 24vw;
            height: 100%;
            cursor: pointer;
            transition: flex 0.35s cubic-bezier(0.16, 1, 0.3, 1);
          }
          .user-menu-backdrop.is-catalogue-open {
            flex: 0 0 clamp(16px, 2.5vw, 48px);
          }

          .user-menu-slider {
            flex: 1;
            display: flex;
            height: 100%;
            min-width: 0;
            overflow: hidden;
            background: #ffffff;
            box-shadow: -10px 0 40px rgba(0,0,0,0.3);
            transition: transform 0.4s ease;
          }

          .user-menu-panel {
            width: 330px;
            min-width: 330px;
            height: 100vh;
            overflow-y: auto;
            background: linear-gradient(180deg, #020e1f 0%, #010813 100%);
            border-right: 1px solid rgba(0, 174, 239, 0.12);
            padding: 32px 36px;
            display: flex;
            flex-direction: column;
            flex-shrink: 0;
            box-sizing: border-box;
            transition: width 0.3s ease, min-width 0.3s ease, padding 0.3s ease;
          }
          .user-menu-panel.is-catalogue-open {
            width: clamp(220px, 16vw, 270px);
            min-width: clamp(220px, 16vw, 270px);
            padding: 28px 22px;
          }

          .catalogue-canvas {
            flex: 1;
            min-width: 0;
            height: 100vh;
            background: #f8fafc;
            padding: 20px 24px;
            box-sizing: border-box;
            border-left: 1px solid rgba(148, 163, 184, 0.3);
            display: flex;
            gap: 20px;
            overflow: hidden;
          }

          .catalogue-mobile-topbar {
            display: none;
          }

          .catalogue-categories-aside {
            width: clamp(220px, 18vw, 270px);
            min-width: clamp(220px, 18vw, 270px);
            display: flex;
            flex-direction: column;
            gap: 8px;
            height: calc(100vh - 40px);
            overflow-y: auto;
            padding-right: 6px;
            flex-shrink: 0;
            scrollbar-width: thin;
            scrollbar-color: rgba(0, 119, 182, 0.3) transparent;
          }
          .catalogue-categories-aside::-webkit-scrollbar {
            width: 4px;
          }
          .catalogue-categories-aside::-webkit-scrollbar-thumb {
            background: rgba(0, 119, 182, 0.3);
            border-radius: 4px;
          }

          .catalogue-categories-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding-bottom: 10px;
            border-bottom: 1px solid rgba(148, 163, 184, 0.25);
            margin-bottom: 4px;
          }
          .catalogue-categories-header-title {
            font-size: 11px;
            font-weight: 800;
            letter-spacing: 0.12em;
            text-transform: uppercase;
            color: #0077B6;
            font-family: 'Manrope', system-ui, sans-serif;
          }
          .catalogue-categories-header-count {
            font-size: 11px;
            color: #64748B;
            fontWeight: 600;
            font-family: 'Manrope', system-ui, sans-serif;
          }

          .catalogue-categories-list {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }

          .catalogue-category-btn {
            display: grid;
            grid-template-columns: 44px 1fr auto;
            align-items: center;
            gap: 10px;
            padding: 8px 10px;
            border-radius: 12px;
            border: 1px solid rgba(203, 213, 225, 0.75);
            background: rgba(255, 255, 255, 0.75);
            box-shadow: 0 1px 3px rgba(18, 42, 62, 0.04);
            cursor: pointer;
            text-align: left;
            width: 100%;
            color: inherit;
            transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
            outline: none;
            box-sizing: border-box;
          }
          .catalogue-category-btn:hover {
            transform: translateX(3px);
            background: rgba(255, 255, 255, 0.95);
            border-color: #93c5fd;
            box-shadow: 0 4px 12px rgba(18, 42, 62, 0.08);
          }
          .catalogue-category-btn.is-active {
            border: 1.5px solid #00AEEF;
            background: linear-gradient(90deg, #ffffff 0%, #e0f2fe 100%);
            box-shadow: 0 4px 16px rgba(0, 174, 239, 0.18);
          }

          .catalogue-category-thumb {
            width: 44px;
            height: 44px;
            border-radius: 9px;
            background-color: #ffffff;
            border: 1px solid rgba(148, 163, 184, 0.25);
            flex-shrink: 0;
            padding: 3px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.04);
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            box-sizing: border-box;
          }
          .catalogue-category-btn.is-active .catalogue-category-thumb {
            border-color: #00AEEF;
          }

          .catalogue-category-name {
            margin: 0;
            color: #334155;
            font-family: 'Manrope', system-ui, sans-serif;
            font-size: 13px;
            font-weight: 500;
            line-height: 1.35;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
          .catalogue-category-btn.is-active .catalogue-category-name {
            color: #0f172a;
            font-weight: 700;
          }

          .catalogue-subcategories-col {
            flex: 1;
            min-width: 0;
            display: flex;
            flex-direction: column;
            gap: 16px;
            height: calc(100vh - 40px);
            overflow-y: auto;
            padding-right: 6px;
            border-left: 1px solid rgba(148, 163, 184, 0.25);
            padding-left: 20px;
            scrollbar-width: thin;
            scrollbar-color: rgba(0, 119, 182, 0.3) transparent;
          }
          .catalogue-subcategories-col::-webkit-scrollbar {
            width: 4px;
          }
          .catalogue-subcategories-col::-webkit-scrollbar-thumb {
            background: rgba(0, 119, 182, 0.3);
            border-radius: 4px;
          }

          .catalogue-subcategories-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 12px;
            padding-bottom: 12px;
            border-bottom: 1px solid rgba(148, 163, 184, 0.25);
          }
          .catalogue-subcategories-subtitle {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            color: #0077B6;
            margin-bottom: 3px;
            font-family: 'Manrope', system-ui, sans-serif;
          }
          .catalogue-subcategories-title {
            margin: 0;
            color: #0a192f;
            font-family: 'Manrope', system-ui, sans-serif;
            font-size: clamp(20px, 1.8vw, 25px);
            font-weight: 800;
            letter-spacing: -0.02em;
            line-height: 1.25;
          }

          .catalogue-view-range-btn {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 8px 16px;
            border-radius: 10px;
            background: linear-gradient(90deg, #0077B6 0%, #00AEEF 100%);
            color: #FFFFFF;
            font-size: 12.5px;
            font-weight: 700;
            font-family: 'Manrope', system-ui, sans-serif;
            border: none;
            cursor: pointer;
            box-shadow: 0 4px 14px rgba(0, 174, 239, 0.3);
            transition: transform 0.2s ease, box-shadow 0.2s ease;
            white-space: nowrap;
            flex-shrink: 0;
          }
          .catalogue-view-range-btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 6px 18px rgba(0, 174, 239, 0.35);
          }

          .catalogue-subcategories-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(min(100%, 215px), 1fr));
            gap: 12px;
            min-width: 0;
          }

          .catalogue-subcat-card {
            display: grid;
            grid-template-columns: clamp(60px, 32%, 95px) 1fr;
            min-height: clamp(120px, 13vh, 150px);
            overflow: hidden;
            cursor: pointer;
            text-decoration: none;
            transition: transform 0.25s ease, box-shadow 0.25s ease;
          }
          .catalogue-subcat-fallback-card {
            grid-column: 1 / -1;
            display: grid;
            grid-template-columns: clamp(90px, 30%, 140px) 1fr;
            min-height: 160px;
            overflow: hidden;
            cursor: pointer;
          }

          .catalogue-card-img-panel {
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            padding: 6px;
            box-sizing: border-box;
          }
          .catalogue-card-img {
            width: 100%;
            height: 100%;
            max-height: 120px;
            object-fit: contain;
            transform: scale(1.06);
            transition: transform 0.4s ease;
          }
          .catalogue-subcat-card:hover .catalogue-card-img {
            transform: scale(1.15);
          }

          .catalogue-card-info-panel {
            padding: 12px 10px;
            display: flex;
            flex-direction: column;
            justifyContent: space-between;
            gap: 8px;
            box-sizing: border-box;
            min-width: 0;
          }

          .catalogue-card-title {
            margin: 0;
            color: #0a192f;
            font-family: 'Manrope', system-ui, sans-serif;
            font-size: clamp(13px, 1vw, 15px);
            font-weight: 700;
            line-height: 1.3;
            letterSpacing: -0.01em;
          }
          .catalogue-card-desc {
            margin: 0;
            color: #1e3a5f;
            font-family: 'Manrope', system-ui, sans-serif;
            font-size: clamp(11px, 0.85vw, 12px);
            font-weight: 500;
            line-height: 1.4;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }

          .catalogue-card-arrow-circle {
            width: 28px;
            height: 28px;
            border-radius: 999px;
            border: 1px solid rgba(0, 119, 182, 0.25);
            display: inline-flex;
            align-items: center;
            justify-content: center;
            color: #0077B6;
            background-color: #ffffff;
            box-shadow: 0 2px 6px rgba(18, 42, 62, 0.1);
            transition: all 0.2s ease;
            flex-shrink: 0;
          }
          .catalogue-subcat-card:hover .catalogue-card-arrow-circle {
            background-color: #0077B6;
            color: #ffffff;
            border-color: #0077B6;
          }

          /* ── Responsive Viewport Breakpoints ── */

          /* 1. Large Screen Desktops & Laptops (1200px - 1440px) */
          @media (max-width: 1440px) {
            .user-menu-backdrop.is-catalogue-open {
              flex: 0 0 16px !important;
            }
            .catalogue-canvas {
              padding: 16px 18px !important;
              gap: 16px !important;
            }
            .catalogue-subcategories-col {
              padding-left: 16px !important;
            }
            .catalogue-subcategories-grid {
              grid-template-columns: repeat(auto-fill, minmax(min(100%, 200px), 1fr)) !important;
              gap: 10px !important;
            }
          }

          /* 2. Standard Laptops (1024px - 1200px) */
          @media (max-width: 1200px) {
            .user-menu-backdrop.is-catalogue-open {
              flex: 0 0 0px !important;
              width: 0 !important;
            }
            .user-menu-panel.is-catalogue-open {
              width: 200px !important;
              min-width: 200px !important;
              padding: 24px 16px !important;
            }
            .catalogue-categories-aside {
              width: 210px !important;
              min-width: 210px !important;
            }
            .catalogue-subcategories-grid {
              grid-template-columns: repeat(auto-fill, minmax(min(100%, 185px), 1fr)) !important;
            }
          }

          /* 3. Small Screen Desktops & Tablets (max-width: 1023px) */
          @media (max-width: 1023px) {
            .user-menu-backdrop {
              display: none !important;
            }
            .user-menu-slider {
              width: 100vw !important;
              max-width: 100vw !important;
            }
            .user-menu-panel.is-catalogue-open {
              display: none !important;
            }
            .catalogue-mobile-topbar {
              display: flex !important;
              align-items: center;
              justify-content: space-between;
              padding-bottom: 12px;
              border-bottom: 1px solid rgba(148, 163, 184, 0.3);
              margin-bottom: 4px;
            }
            .catalogue-back-btn {
              display: inline-flex;
              align-items: center;
              gap: 4px;
              background: transparent;
              border: none;
              color: #0077B6;
              font-family: 'Manrope', system-ui, sans-serif;
              font-size: 14px;
              font-weight: 700;
              cursor: pointer;
              padding: 0;
            }
            .catalogue-topbar-title {
              font-family: 'Manrope', system-ui, sans-serif;
              font-size: 16px;
              font-weight: 800;
              color: #0f172a;
            }
            .catalogue-mobile-close-btn {
              background: transparent;
              border: none;
              color: #64748B;
              cursor: pointer;
              padding: 0;
              display: flex;
            }
            .catalogue-canvas {
              width: 100vw !important;
              flex-direction: column !important;
              height: 100vh !important;
              padding: 16px !important;
              gap: 12px !important;
              border-left: none !important;
            }
            .catalogue-categories-aside {
              width: 100% !important;
              min-width: 100% !important;
              height: auto !important;
              max-height: 160px !important;
              flex-direction: row !important;
              overflow-x: auto !important;
              overflow-y: hidden !important;
              padding-bottom: 6px !important;
            }
            .catalogue-categories-header {
              display: none !important;
            }
            .catalogue-categories-list {
              flex-direction: row !important;
              gap: 8px !important;
              width: 100% !important;
            }
            .catalogue-category-btn {
              width: 180px !important;
              min-width: 180px !important;
              flex-shrink: 0 !important;
            }
            .catalogue-subcategories-col {
              width: 100% !important;
              border-left: none !important;
              padding-left: 0 !important;
              border-top: 1px solid rgba(148, 163, 184, 0.25) !important;
              padding-top: 12px !important;
              height: calc(100vh - 220px) !important;
            }
            .catalogue-subcategories-grid {
              grid-template-columns: repeat(auto-fill, minmax(min(100%, 160px), 1fr)) !important;
            }
          }
        `}</style>

        {/* ── Left visible background ── */}
        <div
          onClick={() => setUserMenuOpen(false)}
          className={`user-menu-backdrop${activeUserMenuLink === "Our Products" ? " is-catalogue-open" : ""}`}
        />

        {/* ── Sliding container for Menu + Image / Catalogue ── */}
        <div
          className={`user-menu-slider${activeUserMenuLink === "Our Products" ? " is-catalogue-open" : ""}`}
          style={{
            transform: userMenuOpen ? "translateX(0)" : "translateX(30px)",
          }}
        >
          {/* ── Menu Panel ── */}
          <div className={`user-menu-panel${activeUserMenuLink === "Our Products" ? " is-catalogue-open" : ""}`}>
            {/* Close button */}
            <button
              type="button"
              onClick={() => setUserMenuOpen(false)}
              aria-label="Close user menu"
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: "rgba(255,255,255,0.7)",
                padding: 0,
                alignSelf: "flex-start",
                display: "flex",
              }}
            >
              <X size={28} strokeWidth={1.5} />
            </button>
            
            {/* Menu Items */}
            <ul style={{ listStyle: "none", padding: 0, margin: "48px 0 0" }}>
              {USER_MENU_LINKS.map((link) => (
                <li key={link} style={{ marginBottom: "28px", border: "none", boxShadow: "none" }}>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      const route = USER_MENU_ROUTES[link];

                      if (route) {
                        setActiveUserMenuLink(null);
                        setUserMenuOpen(false);
                        router.push(route);
                      } else if (link === "Our Products") {
                        setActiveUserMenuLink(link);
                      } else {
                        setActiveUserMenuLink(null);
                        setUserMenuOpen(false);
                      }
                    }}
                    style={{
                      textDecoration: "none",
                      fontFamily: "'Inter', 'Helvetica Neue', Helvetica, 'Manrope', system-ui, sans-serif",
                      fontSize: "22px",
                      fontWeight: 300,
                      letterSpacing: "-0.01em",
                      color:
                        activeUserMenuLink === link ? "#ffffff" : "rgba(255, 255, 255, 0.7)",
                      lineHeight: 1.4,
                      border: "none",
                      boxShadow: "none",
                      display: "inline-block",
                      transformOrigin: "left center",
                      position: "relative",
                      paddingLeft: activeUserMenuLink === link ? "12px" : "0px",
                      transition: "color 0.3s ease, transform 0.3s cubic-bezier(0.22, 1, 0.36, 1), text-shadow 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.color = "#ffffff";
                      (e.currentTarget as HTMLAnchorElement).style.transform = "scale(1.08) translateX(4px)";
                      (e.currentTarget as HTMLAnchorElement).style.textShadow = "0 0 15px rgba(255,255,255,0.3)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.color =
                        activeUserMenuLink === link ? "#ffffff" : "rgba(255, 255, 255, 0.7)";
                      (e.currentTarget as HTMLAnchorElement).style.transform = "scale(1) translateX(0)";
                      (e.currentTarget as HTMLAnchorElement).style.textShadow = "none";
                    }}
                  >
                    {activeUserMenuLink === link ? (
                      <span
                        style={{
                          position: "absolute",
                          left: "-18px",
                          top: "2px",
                          bottom: "2px",
                          width: "3px",
                          borderRadius: "999px",
                          background: "linear-gradient(180deg, #00AEEF 0%, #0077B6 100%)",
                          boxShadow: "0 0 14px rgba(0, 174, 239, 0.85)",
                        }}
                      />
                    ) : null}
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {activeUserMenuLink === "Our Products" ? (
            <CatalogueDashboard
              onClose={() => setUserMenuOpen(false)}
              onBack={() => setActiveUserMenuLink(null)}
            />
          ) : (
            <div
              style={{
                flex: 1,
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "flex-start",
                overflow: "hidden",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://jalbath.com/wp-content/uploads/2026/07/Faucet.gif"
                alt="Flowing water from a premium faucet"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "right top",
                }}
              />
            </div>
          )}
        </div>
      </div>

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
