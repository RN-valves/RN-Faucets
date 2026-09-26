"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronRight, Search, ShoppingBag, User, X, Shield, LogOut } from "lucide-react";
import SearchModal from "./SearchModal";
import JaquarSearchBar from "./JaquarSearchBar";
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
                  size={17}
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
const DEFAULT_MENU_VIDEO = "https://jalbath.com/wp-content/uploads/2026/07/Faucet.gif";

interface HeaderProps {
  data?: {
    logo?: string;
    menuVideo?: string;
    menuLinks?: Array<{ label: string; href: string }>;
  };
}

export default function Header({ data }: HeaderProps) {
  const [logoSrc, setLogoSrc] = useState<string>(data?.logo || DEFAULT_LOGO);
  const [menuVideoSrc, setMenuVideoSrc] = useState<string>(data?.menuVideo || DEFAULT_MENU_VIDEO);

  useEffect(() => {
    if (data?.logo) {
      setLogoSrc(data.logo);
    }
    if (data?.menuVideo) {
      setMenuVideoSrc(data.menuVideo);
    }
    fetch("/api/home-setting")
      .then((res) => res.json())
      .then((json) => {
        if (json?.header?.logo && !data?.logo) {
          setLogoSrc(json.header.logo);
        }
        if (json?.header?.menuVideo && !data?.menuVideo) {
          setMenuVideoSrc(json.header.menuVideo);
        }
      })
      .catch(() => {});
  }, [data?.logo, data?.menuVideo]);

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
          zIndex: 9999,
          background: headerBg,
          backdropFilter: backdropFilterStyle,
          WebkitBackdropFilter: backdropFilterStyle,
          borderBottom: borderBottomStyle,
          boxShadow: boxShadowStyle,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxSizing: "border-box",
          pointerEvents: "auto",
          color: textColor,
          transition: "background 0.3s ease, border-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease",
        }}
        className="rn-header-navbar"
      >
        {/* Left Corner: Brand Logo (Enlarged and Prominent) */}
        <div
          className="rn-header-left-logo"
          style={{
            zIndex: 20,
            pointerEvents: "auto",
          }}
        >
          <a href="/" aria-label="RN Valves & Faucets Home" className="flex items-center justify-start cursor-pointer">
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
              className="rn-header-logo-img h-[72px] sm:h-[90px] md:h-[110px] lg:h-[125px] max-h-[135px] w-auto block object-contain transition-all duration-300 hover:opacity-90 hover:scale-[1.03]" 
            />
          </a>
        </div>

        {/* Right Action Icons + User Account + Mobile Menu Trigger */}
        <div
          className="rn-header-right-group"
          style={{
            display: "flex",
            alignItems: "center",
          }}
        >
          {/* Jaquar Style Embedded Search Bar (Desktop / Tablet) */}
          <div className="hidden md:block mr-3">
            <JaquarSearchBar isDarkBg={isDarkBg} />
          </div>

          <div className="rn-header-action-icons" style={{ display: "flex", alignItems: "center" }}>
            {/* Mobile Only Search Icon */}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
              style={{ background: "transparent", border: "none", padding: 0, position: "relative" }}
              className="md:hidden cursor-pointer transition-opacity duration-300 hover:opacity-70 flex items-center justify-center"
            >
              <Search size={22} strokeWidth={1.6} color={iconColor} style={{ transition: "color 0.3s ease" }} />
            </button>

            {/* Shopping Cart Icon */}
            <button
              type="button"
              onClick={() => router.push("/cart")}
              aria-label="Shopping Cart"
              style={{ background: "transparent", border: "none", padding: 0, position: "relative" }}
              className="cursor-pointer transition-opacity duration-300 hover:opacity-70 flex items-center justify-center"
            >
              <ShoppingBag size={22} strokeWidth={1.6} color={iconColor} style={{ transition: "color 0.3s ease" }} />
              {cartCount > 0 && (
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
          </div>

          <div className="rn-header-divider" style={{ width: "1px", height: "20px", backgroundColor: textColor }}></div>

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

          {/* Navigation Menu Trigger on the Right Corner */}
          <button
            type="button"
            className="rn-header-menu-btn group"
            onMouseEnter={preloadCatalogueData}
            onClick={() => {
              preloadCatalogueData();
              setActiveUserMenuLink(null);
              setUserMenuOpen(true);
            }}
            aria-label="Open Navigation Menu"
            aria-expanded={userMenuOpen}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: "4px 8px",
              color: textColor,
              outline: "none",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "4.5px",
                width: "22px",
              }}
            >
              {[0, 1, 2].map((line) => (
                <span
                  key={line}
                  style={{
                    width: "22px",
                    height: "2.2px",
                    backgroundColor: textColor,
                    display: "block",
                    borderRadius: "1px",
                    transition: "background-color 0.3s ease",
                  }}
                />
              ))}
            </div>
            <span
              className="rn-header-menu-text"
              style={{
                fontFamily: "'Manrope', system-ui, sans-serif",
                fontSize: "13.5px",
                fontWeight: 700,
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
          /* ── Floating Header Navbar Responsive System ── */
          .rn-header-navbar {
            height: 110px;
            padding-left: clamp(24px, 5vw, 90px);
            padding-right: clamp(24px, 5vw, 90px);
            display: flex;
            align-items: center;
            justify-content: space-between;
          }

          .rn-header-left-logo {
            display: flex;
            align-items: center;
            justify-content: flex-start;
          }

          .rn-header-logo-img {
            height: 96px;
            max-height: 115px;
            width: auto;
            display: block;
            object-fit: contain;
            transition: all 0.3s ease;
          }

          .rn-header-right-group {
            display: flex;
            align-items: center;
            gap: 24px;
            margin-left: auto;
          }

          .rn-header-action-icons {
            display: flex;
            align-items: center;
            gap: 18px;
          }

          .rn-header-divider {
            display: block;
          }

          .rn-header-menu-btn {
            display: flex;
            align-items: center;
            gap: 10px;
          }

          .rn-header-menu-text {
            display: inline-block;
          }

          /* Mobile / Tablet Responsive Header (max-width: 768px) */
          @media (max-width: 768px) {
            .rn-header-navbar {
              height: 85px !important;
              padding-left: 14px !important;
              padding-right: 14px !important;
            }

            .rn-header-logo-img {
              height: 72px !important;
              max-height: 78px !important;
            }

            .rn-header-right-group {
              gap: 12px !important;
            }

            .rn-header-action-icons {
              gap: 12px !important;
            }

            .rn-header-divider {
              display: none !important;
            }

            .rn-header-menu-text {
              display: none !important;
            }
          }

          /* ── Mega Menu & Catalogue Dashboard Responsive System ── */
          .user-menu-backdrop {
            flex: 0 0 24vw;
            height: 100%;
            cursor: pointer;
            transition: flex 0.35s cubic-bezier(0.16, 1, 0.3, 1);
          }
          .user-menu-backdrop.is-catalogue-open {
            flex: 0 0 clamp(16px, 2.5vw, 40px);
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
            width: 320px;
            min-width: 320px;
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
            width: clamp(210px, 15vw, 250px);
            min-width: clamp(210px, 15vw, 250px);
            padding: 28px 20px;
          }

          .catalogue-canvas {
            flex: 1;
            min-width: 0;
            height: 100vh;
            background: #eaf0f6;
            background-image:
              radial-gradient(ellipse 95% 80% at 50% 15%, #ffffff 0%, transparent 60%),
              linear-gradient(180deg, #f4f8fb 0%, #eaf0f6 50%, #dfe7ef 100%);
            padding: 22px 26px;
            box-sizing: border-box;
            border-left: 1px solid rgba(148, 163, 184, 0.3);
            display: flex;
            gap: 24px;
            overflow: hidden;
          }

          .catalogue-mobile-topbar {
            display: none;
          }

          /* ── Larger Categories Column (Left/Middle) ── */
          .catalogue-categories-aside {
            width: clamp(340px, 28vw, 440px);
            min-width: clamp(340px, 28vw, 440px);
            display: flex;
            flex-direction: column;
            gap: 12px;
            height: calc(100vh - 44px);
            overflow-y: auto;
            padding-right: 10px;
            flex-shrink: 0;
            scrollbar-width: thin;
            scrollbar-color: rgba(0, 119, 182, 0.35) transparent;
          }
          .catalogue-categories-aside::-webkit-scrollbar {
            width: 4px;
          }
          .catalogue-categories-aside::-webkit-scrollbar-thumb {
            background: rgba(0, 119, 182, 0.35);
            border-radius: 4px;
          }

          .catalogue-categories-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding-bottom: 12px;
            border-bottom: 1px solid rgba(148, 163, 184, 0.25);
            margin-bottom: 4px;
          }
          .catalogue-categories-header-title {
            font-size: 13px;
            font-weight: 800;
            letter-spacing: 0.12em;
            text-transform: uppercase;
            color: #0077B6;
            font-family: 'Manrope', system-ui, sans-serif;
          }
          .catalogue-categories-header-count {
            font-size: 12.5px;
            color: #64748B;
            font-weight: 700;
            font-family: 'Manrope', system-ui, sans-serif;
          }

          .catalogue-categories-list {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }

          .catalogue-category-btn {
            display: grid;
            grid-template-columns: 88px 1fr auto;
            align-items: center;
            gap: 16px;
            padding: 14px 18px;
            border-radius: 18px;
            border: 1px solid rgba(203, 213, 225, 0.9);
            background: rgba(255, 255, 255, 0.92);
            box-shadow: 0 2px 10px rgba(18, 42, 62, 0.07);
            cursor: pointer;
            text-align: left;
            width: 100%;
            min-height: 98px;
            color: inherit;
            transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
            outline: none;
            box-sizing: border-box;
          }
          .catalogue-category-btn:hover {
            transform: translateX(4px);
            background: #ffffff;
            border-color: #93c5fd;
            box-shadow: 0 8px 24px rgba(18, 42, 62, 0.13);
          }
          .catalogue-category-btn.is-active {
            border: 2px solid #00AEEF;
            background: linear-gradient(90deg, #ffffff 0%, #e0f2fe 100%);
            box-shadow: 0 6px 22px rgba(0, 174, 239, 0.28);
          }

          .catalogue-category-thumb {
            width: 88px;
            height: 88px;
            border-radius: 14px;
            background-color: #ffffff;
            border: 1px solid rgba(148, 163, 184, 0.3);
            flex-shrink: 0;
            padding: 6px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            box-sizing: border-box;
          }
          .catalogue-category-btn.is-active .catalogue-category-thumb {
            border-color: #00AEEF;
            box-shadow: 0 2px 12px rgba(0, 174, 239, 0.32);
          }

          .catalogue-category-name {
            margin: 0;
            color: #1e293b;
            font-family: 'Manrope', system-ui, sans-serif;
            font-size: 16.5px;
            font-weight: 700;
            line-height: 1.35;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
          .catalogue-category-btn.is-active .catalogue-category-name {
            color: #0f172a;
            font-weight: 800;
            font-size: 17px;
          }

          /* ── Right Column: Subcategories Showcase with Studio Gradient Fill (Like Before) ── */
          .catalogue-subcategories-col {
            flex: 1;
            min-width: 0;
            display: flex;
            flex-direction: column;
            gap: 18px;
            height: calc(100vh - 44px);
            overflow-y: auto;
            padding-right: 8px;
            border-left: 1px solid rgba(148, 163, 184, 0.25);
            padding-left: 24px;
            scrollbar-width: thin;
            scrollbar-color: rgba(0, 119, 182, 0.35) transparent;
          }
          .catalogue-subcategories-col::-webkit-scrollbar {
            width: 4px;
          }
          .catalogue-subcategories-col::-webkit-scrollbar-thumb {
            background: rgba(0, 119, 182, 0.35);
            border-radius: 4px;
          }

          .catalogue-subcategories-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 12px;
            padding-bottom: 14px;
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
            font-size: clamp(22px, 2vw, 28px);
            font-weight: 800;
            letter-spacing: -0.02em;
            line-height: 1.25;
          }

          .catalogue-view-range-btn {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 9px 18px;
            border-radius: 10px;
            background: linear-gradient(90deg, #0077B6 0%, #00AEEF 100%);
            color: #FFFFFF;
            font-size: 13px;
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

          /* ── SUB-CARDS GRID: Studio Paper Gradient Fill across Entire Card ── */
          .catalogue-subcategories-grid {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 14px;
            min-width: 0;
          }

          .catalogue-subcat-card {
            display: grid;
            grid-template-columns: clamp(120px, 40%, 175px) 1fr;
            min-height: 190px;
            border-radius: 16px;
            overflow: hidden;
            cursor: pointer;
            text-decoration: none;
            isolation: isolate;
            background-color: #9cb1c2;
            background-image:
              radial-gradient(ellipse 95% 80% at 50% 28%, #c6d7e5 0%, transparent 62%),
              radial-gradient(ellipse 70% 50% at 18% 12%, rgba(255, 255, 255, 0.45) 0%, transparent 55%),
              radial-gradient(ellipse 65% 45% at 85% 88%, rgba(98, 122, 145, 0.55) 0%, transparent 55%),
              linear-gradient(180deg, #b4c6d4 0%, #9cb1c2 45%, #7e96aa 100%);
            box-shadow: 0 4px 18px rgba(18, 38, 56, 0.1);
            transition: transform 0.25s ease, box-shadow 0.25s ease;
            box-sizing: border-box;
          }
          .catalogue-subcat-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 12px 32px rgba(18, 42, 62, 0.18);
          }

          .catalogue-subcat-fallback-card {
            grid-column: 1 / -1;
            display: grid;
            grid-template-columns: clamp(120px, 34%, 180px) 1fr;
            min-height: 195px;
            border-radius: 16px;
            overflow: hidden;
            cursor: pointer;
            isolation: isolate;
            background-color: #9cb1c2;
            background-image:
              radial-gradient(ellipse 95% 80% at 50% 28%, #c6d7e5 0%, transparent 62%),
              radial-gradient(ellipse 70% 50% at 18% 12%, rgba(255, 255, 255, 0.45) 0%, transparent 55%),
              radial-gradient(ellipse 65% 45% at 85% 88%, rgba(98, 122, 145, 0.55) 0%, transparent 55%),
              linear-gradient(180deg, #b4c6d4 0%, #9cb1c2 45%, #7e96aa 100%);
            box-shadow: 0 4px 18px rgba(18, 38, 56, 0.1);
          }

          .catalogue-card-img-panel {
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            padding: 8px;
            box-sizing: border-box;
            background: transparent !important;
            box-shadow: none !important;
          }
          .catalogue-card-img {
            width: 100%;
            height: 100%;
            max-height: 165px;
            object-fit: contain;
            transform: scale(1.1);
            filter: drop-shadow(0 16px 26px rgba(12, 24, 38, 0.24));
            transition: transform 0.4s ease, filter 0.4s ease;
          }
          .catalogue-subcat-card:hover .catalogue-card-img {
            transform: scale(1.18);
            filter: drop-shadow(0 20px 32px rgba(12, 24, 38, 0.32));
          }

          .catalogue-card-info-panel {
            padding: 18px 16px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            gap: 8px;
            box-sizing: border-box;
            min-width: 0;
            background: transparent;
          }

          .catalogue-card-title {
            margin: 0;
            color: #0a192f;
            font-family: 'Manrope', system-ui, sans-serif;
            font-size: clamp(15.5px, 1.2vw, 17.5px);
            font-weight: 800;
            line-height: 1.3;
            letter-spacing: -0.01em;
          }
          .catalogue-card-desc {
            margin: 0;
            color: #1e293b;
            font-family: 'Manrope', system-ui, sans-serif;
            font-size: clamp(12px, 0.95vw, 13px);
            font-weight: 600;
            line-height: 1.45;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }

          .catalogue-card-arrow-circle {
            width: 34px;
            height: 34px;
            border-radius: 999px;
            border: 1px solid rgba(255, 255, 255, 0.6);
            display: inline-flex;
            align-items: center;
            justify-content: center;
            color: #0077B6;
            background-color: rgba(255, 255, 255, 0.9);
            box-shadow: 0 2px 8px rgba(18, 42, 62, 0.15);
            transition: all 0.2s ease;
            flex-shrink: 0;
          }
          .catalogue-subcat-card:hover .catalogue-card-arrow-circle {
            background-color: #0077B6;
            color: #ffffff;
            border-color: #0077B6;
          }

          /* ── Responsive Viewport Breakpoints ── */

          /* 1. Smaller Desktop & Laptops (max-width: 1280px) -> Exactly 2 Cards */
          @media (max-width: 1280px) {
            .catalogue-subcategories-grid {
              grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
              gap: 12px !important;
            }
            .catalogue-categories-aside {
              width: 300px !important;
              min-width: 300px !important;
            }
            .user-menu-backdrop.is-catalogue-open {
              flex: 0 0 12px !important;
            }
          }

          /* 2. Standard Laptops (max-width: 1100px) -> 2 Cards */
          @media (max-width: 1100px) {
            .user-menu-backdrop.is-catalogue-open {
              flex: 0 0 0px !important;
              width: 0 !important;
            }
            .user-menu-panel.is-catalogue-open {
              width: 210px !important;
              min-width: 210px !important;
              padding: 24px 16px !important;
            }
            .catalogue-canvas {
              padding: 16px !important;
              gap: 16px !important;
            }
            .catalogue-categories-aside {
              width: 280px !important;
              min-width: 280px !important;
            }
            .catalogue-subcategories-col {
              padding-left: 16px !important;
            }
            .catalogue-subcategories-grid {
              grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
              gap: 10px !important;
            }
          }

          /* 3. Small Screen Desktops & Tablets (max-width: 900px) */
          @media (max-width: 900px) {
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
              max-height: 170px !important;
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
              width: 220px !important;
              min-width: 220px !important;
              flex-shrink: 0 !important;
              min-height: 70px !important;
              grid-template-columns: 56px 1fr auto !important;
              gap: 10px !important;
            }
            .catalogue-category-thumb {
              width: 56px !important;
              height: 56px !important;
            }
            .catalogue-subcategories-col {
              width: 100% !important;
              border-left: none !important;
              padding-left: 0 !important;
              border-top: 1px solid rgba(148, 163, 184, 0.25) !important;
              padding-top: 12px !important;
              height: calc(100vh - 230px) !important;
            }
            .catalogue-subcategories-grid {
              grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
              gap: 10px !important;
            }
          }

          /* 4. Mobile Phones (max-width: 640px) */
          @media (max-width: 640px) {
            .catalogue-subcategories-grid {
              grid-template-columns: 1fr !important;
              gap: 10px !important;
            }
            .catalogue-subcat-card {
              min-height: 155px !important;
              grid-template-columns: clamp(105px, 34%, 130px) 1fr !important;
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
                background: "#020e1f",
              }}
            >
              {menuVideoSrc && menuVideoSrc.match(/\.(mp4|webm|mov|m4v)(\?.*)?$/i) ? (
                <video
                  src={menuVideoSrc}
                  autoPlay
                  loop
                  muted
                  playsInline
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: "right top",
                  }}
                />
              ) : (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={menuVideoSrc || DEFAULT_MENU_VIDEO}
                  alt="Flowing water from a premium faucet"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: "right top",
                  }}
                />
              )}
            </div>
          )}
        </div>
      </div>

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
