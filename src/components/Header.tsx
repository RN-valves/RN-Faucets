"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronRight, Heart, Search, ShoppingBag, User, X, Shield, LogOut } from "lucide-react";
import { getCartItems } from "@/utils/cart";
import { getCustomerSession, clearCustomerSession, CustomerSession } from "@/utils/customerAuth";
import { getAdminAuth, logoutAdmin } from "@/utils/adminStore";

const USER_MENU_LINKS = [
  "About Us",
  "Catalogues",
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

function CatalogueDashboard({ onClose }: { onClose?: () => void }) {
  const router = useRouter();
  const [categories, setCategories] = useState<DynamicCategory[]>([]);
  const [subcategories, setSubcategories] = useState<DynamicSubcategory[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
          setCategories(cats);
          setActiveCategoryId(cats[0].id || (cats[0] as any)._id || cats[0].slug);
        }
        if (Array.isArray(subs) && subs.length > 0) {
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
    if (imgSrc && imgSrc.trim() && !imgSrc.includes("coresg-normal.trae.ai")) {
      return imgSrc;
    }
    return "/api/media/website/catalogue/products/default/image.webp";
  };

  const handleNavigate = (path: string) => {
    if (onClose) onClose();
    router.push(path);
  };

  return (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        height: "100vh",
        padding: "28px 28px 28px 32px",
        boxSizing: "border-box",
        background:
          "radial-gradient(circle at top right, rgba(25,87,156,0.22), transparent 30%), linear-gradient(180deg, #03101f 0%, #020913 100%)",
        display: "flex",
        gap: "28px",
      }}
    >
      {/* ── Left / Center Content ── */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          gap: "18px",
          height: "calc(100vh - 56px)",
          overflowY: "auto",
          paddingRight: "8px",
        }}
      >
        {/* Active Category Title Pill */}
        <div
          onClick={() => activeCategory && handleNavigate(`/faucets/${activeCategory.slug || activeCategory.id}`)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            alignSelf: "flex-start",
            padding: "10px 20px",
            borderRadius: "14px",
            background: "linear-gradient(90deg, rgba(17,42,73,0.95) 0%, rgba(17,171,118,0.96) 100%)",
            color: "#f5fbff",
            fontFamily: "'Inter', 'Helvetica Neue', Helvetica, 'Manrope', sans-serif",
            fontSize: "14.5px",
            fontWeight: 600,
            letterSpacing: "-0.01em",
            boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
            cursor: "pointer",
            transition: "transform 0.2s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          <span>{activeCategory?.name ?? "Catalogue Collection"}</span>
          <ChevronRight size={16} style={{ marginLeft: "6px", opacity: 0.9 }} />
        </div>

        {/* Dynamic Cards Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: "14px",
            minWidth: 0,
          }}
        >
          {activeSubcategories.length > 0 ? (
            activeSubcategories.map((sub, idx) => {
              const cardImg = getCardImage(sub.image || sub.banner || activeCategory?.image, idx);
              const targetSlug = sub.slug || sub.id;

              return (
                <article
                  key={sub.id || idx}
                  onClick={() => handleNavigate(`/faucets/${targetSlug}`)}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "44% 1fr",
                    minHeight: "174px",
                    overflow: "hidden",
                    borderRadius: "18px",
                    border: "1px solid rgba(157, 200, 255, 0.18)",
                    background:
                      "linear-gradient(180deg, rgba(17,39,65,0.96) 0%, rgba(5,13,25,0.97) 100%)",
                    boxShadow: "0 14px 34px rgba(0,0,0,0.24)",
                    cursor: "pointer",
                    transition: "transform 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-3px)";
                    e.currentTarget.style.borderColor = "rgba(100, 180, 255, 0.6)";
                    e.currentTarget.style.boxShadow = "0 18px 40px rgba(0, 100, 220, 0.25)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.borderColor = "rgba(157, 200, 255, 0.18)";
                    e.currentTarget.style.boxShadow = "0 14px 34px rgba(0,0,0,0.24)";
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      backgroundColor: "#0d1f35",
                      backgroundImage: `url(${cardImg})`,
                      backgroundSize: "contain",
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "center",
                      padding: "8px",
                    }}
                  />

                  <div
                    style={{
                      padding: "22px 20px 18px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      gap: "14px",
                    }}
                  >
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <h3
                        style={{
                          margin: 0,
                          color: "#f8fbff",
                          fontFamily: "'Inter', 'Helvetica Neue', Helvetica, 'Manrope', sans-serif",
                          fontSize: "17.5px",
                          fontWeight: 600,
                          lineHeight: 1.3,
                          letterSpacing: "-0.01em",
                        }}
                      >
                        {sub.name}
                      </h3>
                      <p
                        style={{
                          margin: 0,
                          color: "rgba(220, 233, 245, 0.8)",
                          fontFamily: "'Inter', 'Helvetica Neue', Helvetica, 'Manrope', sans-serif",
                          fontSize: "13px",
                          fontWeight: 400,
                          lineHeight: 1.5,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {sub.description || "Precision engineered collection for modern luxury."}
                      </p>
                    </div>

                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                      <span
                        style={{
                          width: "38px",
                          height: "38px",
                          borderRadius: "999px",
                          border: "1px solid rgba(197, 220, 245, 0.4)",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#f8fbff",
                          backgroundColor: "rgba(255, 255, 255, 0.05)",
                          transition: "background 0.2s ease, transform 0.2s ease",
                        }}
                      >
                        <ChevronRight size={17} strokeWidth={1.8} />
                      </span>
                    </div>
                  </div>
                </article>
              );
            })
          ) : (
            /* Fallback single collection exploration card if no subcategories exist */
            <article
              onClick={() => activeCategory && handleNavigate(`/faucets/${activeCategory.slug || activeCategory.id}`)}
              style={{
                gridColumn: "1 / -1",
                display: "grid",
                gridTemplateColumns: "36% 1fr",
                minHeight: "220px",
                overflow: "hidden",
                borderRadius: "18px",
                border: "1px solid rgba(157, 200, 255, 0.25)",
                background:
                  "linear-gradient(180deg, rgba(17,39,65,0.96) 0%, rgba(5,13,25,0.97) 100%)",
                boxShadow: "0 14px 34px rgba(0,0,0,0.24)",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  height: "100%",
                  backgroundColor: "#0d1f35",
                  backgroundImage: `url(${getCardImage(activeCategory?.image, 0)})`,
                  backgroundSize: "contain",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "center",
                  padding: "12px",
                }}
              />
              <div
                style={{
                  padding: "28px 24px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: "16px",
                }}
              >
                <div>
                  <h3
                    style={{
                      margin: "0 0 10px 0",
                      color: "#f8fbff",
                      fontSize: "20px",
                      fontWeight: 700,
                    }}
                  >
                    {activeCategory?.name}
                  </h3>
                  <p
                    style={{
                      margin: 0,
                      color: "rgba(220, 233, 245, 0.85)",
                      fontSize: "14px",
                      lineHeight: 1.6,
                    }}
                  >
                    {activeCategory?.description ||
                      "Browse the complete catalogue range, technical specifications, and available finishes."}
                  </p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#38bdf8", fontWeight: 700, fontSize: "14px" }}>
                  <span>Explore Range Products</span>
                  <ChevronRight size={18} />
                </div>
              </div>
            </article>
          )}
        </div>
      </div>

      {/* ── Right Categories Column ── */}
      <aside
        style={{
          width: "240px",
          minWidth: "240px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          height: "calc(100vh - 56px)",
          overflowY: "auto",
          paddingRight: "4px",
        }}
      >
        {categories.map((item, idx) => {
          const isSelected =
            activeCategoryId === item.id ||
            activeCategoryId === (item as any)._id ||
            activeCategoryId === item.slug;
          const thumbnailImg = getCardImage(item.icon || item.image, idx);

          return (
            <button
              key={item.id || idx}
              type="button"
              onClick={() => setActiveCategoryId(item.id || (item as any)._id || item.slug)}
              style={{
                display: "grid",
                gridTemplateColumns: "56px 1fr auto",
                alignItems: "center",
                gap: "12px",
                padding: "10px 12px",
                borderRadius: "16px",
                border: isSelected
                  ? "1px solid rgba(92, 174, 255, 0.78)"
                  : "1px solid rgba(157, 200, 255, 0.18)",
                background: isSelected
                  ? "linear-gradient(180deg, rgba(16,42,75,0.98) 0%, rgba(5,18,33,0.98) 100%)"
                  : "linear-gradient(180deg, rgba(12,28,48,0.96) 0%, rgba(4,12,24,0.98) 100%)",
                boxShadow: isSelected
                  ? "0 12px 28px rgba(28, 109, 196, 0.24)"
                  : "0 10px 26px rgba(0,0,0,0.2)",
                cursor: "pointer",
                textAlign: "left",
                width: "100%",
                color: "inherit",
                transition: "border-color 0.24s ease, background 0.24s ease, box-shadow 0.24s ease, transform 0.24s ease",
              }}
              onMouseEnter={(event) => {
                event.currentTarget.style.transform = "translateX(-2px)";
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.transform = "translateX(0)";
              }}
            >
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "12px",
                  backgroundColor: "#081322",
                  backgroundImage: `url(${thumbnailImg})`,
                  backgroundSize: "contain",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "center",
                  flexShrink: 0,
                  padding: "4px",
                }}
              />
              <p
                style={{
                  margin: 0,
                  color: isSelected ? "#ffffff" : "#f4f8fc",
                  fontFamily: "'Inter', 'Helvetica Neue', Helvetica, 'Manrope', sans-serif",
                  fontSize: "12.5px",
                  fontWeight: 600,
                  lineHeight: 1.4,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {item.name}
              </p>
              <ChevronRight
                size={16}
                strokeWidth={1.8}
                color={isSelected ? "#ffffff" : "rgba(248, 251, 255, 0.85)"}
                style={{ flexShrink: 0 }}
              />
            </button>
          );
        })}
      </aside>
    </div>
  );
}

interface HeaderProps {
  data?: {
    logo?: string;
    menuLinks?: Array<{ label: string; href: string }>;
  };
}

export default function Header({ data }: HeaderProps) {
  const logoUrl = data?.logo || "https://www.rnvalves.com/uploads/logo/rn-logosvgrhp9isxc7mdnyofdf3iumzuy2s8zld.svg";

  const router = useRouter();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
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
          height: "90px",
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
        <div
          style={{
            color: textColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            pointerEvents: "auto",
            transition: "color 0.3s ease",
          }}
        >
          <a href="#" aria-label="Home" className="block cursor-pointer">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={logoUrl} 
              alt="Logo" 
              className="h-[70px] md:h-[85px] w-auto block transition-opacity duration-300 hover:opacity-85" 
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
                  if (label === "Shopping Cart") {
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

            {/* Menu Button */}
            <button
              type="button"
              onClick={() => {
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
              <span
                style={{
                  fontFamily: "'Manrope', system-ui, sans-serif",
                  fontSize: "14px",
                  fontWeight: 500,
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
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "5px",
                  width: "18px",
                }}
              >
                {[0, 1, 2].map((line) => (
                  <span
                    key={line}
                    style={{
                      width: "18px",
                      height: "1.5px",
                      backgroundColor: textColor,
                      display: "block",
                      borderRadius: "1px",
                      transition: "background-color 0.3s ease",
                    }}
                  />
                ))}
              </div>
            </button>
          </div>
        </div>
      </header>



      {/* ── User Account Menu Overlay (Off-canvas luxury navigation) ── */}
      <div
        aria-modal={userMenuOpen}
        role="dialog"
        aria-label="User Account Menu"
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.28)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          display: "flex",
          zIndex: userMenuOpen ? 10001 : -1,
          opacity: userMenuOpen ? 1 : 0,
          pointerEvents: userMenuOpen ? "auto" : "none",
          transition: "opacity 0.35s ease",
        }}
      >
        {/* ── Left visible background (24vw) ── */}
        <div
          onClick={() => setUserMenuOpen(false)}
          style={{
            flex: "0 0 24vw",
            height: "100%",
            cursor: "pointer",
          }}
        />

        {/* ── Sliding container for Menu + Image ── */}
        <div
          style={{
            flex: 1,
            display: "flex",
            height: "100%",
            transform: userMenuOpen ? "translateX(0)" : "translateX(30px)",
            transition: "transform 0.4s ease",
          }}
        >
          {/* ── Menu Panel ── */}
          <div
            style={{
              width: "350px",
              minWidth: "350px",
              height: "100vh",
              overflow: "hidden",
              border: "none",
              background: "linear-gradient(180deg, #010816 0%, #021328 100%)",
              padding: "32px 40px",
              display: "flex",
              flexDirection: "column",
            }}
          >
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
                      } else if (link === "Catalogues") {
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
                          background: "linear-gradient(180deg, #2a8cff 0%, #0d56ff 100%)",
                          boxShadow: "0 0 18px rgba(45, 128, 255, 0.85)",
                        }}
                      />
                    ) : null}
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {activeUserMenuLink === "Catalogues" ? (
            <CatalogueDashboard onClose={() => setUserMenuOpen(false)} />
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
    </>
  );
}
