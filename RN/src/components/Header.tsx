"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronRight, Heart, Search, ShoppingBag, User, X } from "lucide-react";
import { getCartItems } from "@/utils/cart";

interface CatalogueFeatureCard {
  categoryId: string;
  title: string;
  subtitle: string;
  imagePrompt: string;
}

interface CatalogueQuickLink {
  id: string;
  title: string;
  imagePrompt: string;
}

const USER_MENU_LINKS = [
  "About Us",
  "Catalogues",
  "Find Dealers",
  "Become A Channel Partner",
  "Customer Portal",
  "Blogs",
  "Events",
  "Our Projects",
  "Contact Us",
  "Career",
  "Newsletter",
  "Digital Gallery",
] as const;

const USER_MENU_ROUTES: Partial<Record<(typeof USER_MENU_LINKS)[number], string>> = {
  "About Us": "/about-us",
};

const CATALOGUE_FEATURE_CARDS: readonly CatalogueFeatureCard[] = [
  {
    categoryId: "ptmt-accessories",
    title: "Virtu Pine Collection",
    subtitle: "Premium design, perfect flow.",
    imagePrompt:
      "premium white polymer faucet on a matte white basin, teal luxury bathroom wall, soft daylight, editorial product photography, clean composition, realistic materials, water design brochure aesthetic",
  },
  {
    categoryId: "ptmt-accessories",
    title: "Lagoon Pine Collection",
    subtitle: "Inspired by nature, built to last.",
    imagePrompt:
      "sleek white polymer faucet beside a large window with calm sea view, premium sink styling, airy luxury bathroom interior, realistic editorial catalogue photography, soft natural light",
  },
  {
    categoryId: "ptmt-accessories",
    title: "Lagoon Regal Collection",
    subtitle: "Regal look, royal experience.",
    imagePrompt:
      "matte black angular faucet on a sculpted basin, moody luxury bathroom, dark stone backdrop, warm reflective lighting, premium editorial catalogue photo, realistic high-end interior styling",
  },
  {
    categoryId: "jet-spray",
    title: "Virtu Regal Collection",
    subtitle: "Elegant design, everyday luxury.",
    imagePrompt:
      "black square-spout faucet on modern sink, charcoal textured wall, subtle greenery, premium bathroom brochure photography, realistic materials, cinematic but clean lighting",
  },
  {
    categoryId: "jet-spray",
    title: "G20 Pine Collection",
    subtitle: "Smooth performance, timeless style.",
    imagePrompt:
      "curved white faucet with flowing water on a minimal basin, beige textured wall, warm soft daylight, sophisticated catalogue photography, realistic faucet finish and bathroom props",
  },
  {
    categoryId: "jet-spray",
    title: "G20 Regal Collection",
    subtitle: "Durable. Reliable. Remarkable.",
    imagePrompt:
      "chrome gooseneck faucet with flowing water, dark premium bathroom setting, polished metal reflections, realistic editorial product image, luxury sanitary brochure aesthetic",
  },
  {
    categoryId: "exposed-shower",
    title: "Aqua Arc Shower Suite",
    subtitle: "Balanced spray, clean architectural form.",
    imagePrompt:
      "premium exposed shower set with diverter panel, polished chrome finish, deep navy luxury bathroom backdrop, realistic editorial sanitaryware photography, refined reflections",
  },
  {
    categoryId: "exposed-shower",
    title: "Hydra Panel Collection",
    subtitle: "Statement hardware with hotel-grade comfort.",
    imagePrompt:
      "sleek shower panel system with hand shower and diverter controls, moody spa bathroom, realistic chrome textures, premium catalogue lighting",
  },
  {
    categoryId: "exposed-shower",
    title: "Rainline Trim Set",
    subtitle: "Immersive flow for modern bath spaces.",
    imagePrompt:
      "luxury rain shower with exposed diverter set, charcoal stone wall, realistic metal reflections, high-end brochure photography",
  },
  {
    categoryId: "single-lever",
    title: "MonoSense Mixer Series",
    subtitle: "Minimal control, precise everyday use.",
    imagePrompt:
      "single lever mixer faucet in premium chrome, modern vanity setup, dark editorial backdrop, realistic product photography, luxury bathroom catalogue",
  },
  {
    categoryId: "single-lever",
    title: "Sensor Flow Collection",
    subtitle: "Touchless convenience with premium styling.",
    imagePrompt:
      "sensor faucet and mixer pair, matte dark background, realistic chrome finish, sophisticated sanitary brochure aesthetic",
  },
  {
    categoryId: "single-lever",
    title: "Studio Lever Range",
    subtitle: "Sharp silhouette, smooth water control.",
    imagePrompt:
      "sleek single lever faucet collection on luxury basin counter, soft spotlighting, realistic reflections, editorial catalogue composition",
  },
  {
    categoryId: "cistern-seat-cover",
    title: "PureSeat Cistern Set",
    subtitle: "Clean lines with dependable comfort.",
    imagePrompt:
      "modern cistern and seat cover in premium white ceramic bathroom, soft daylight, realistic sanitaryware brochure image, elegant showroom look",
  },
  {
    categoryId: "cistern-seat-cover",
    title: "SilentFlush Collection",
    subtitle: "Refined utility for contemporary homes.",
    imagePrompt:
      "white seat cover and cistern set in a minimal luxury bathroom, realistic materials, calm neutral palette, catalogue photography",
  },
  {
    categoryId: "cistern-seat-cover",
    title: "Nova Comfort Series",
    subtitle: "Durable essentials, elevated finish.",
    imagePrompt:
      "premium cistern system and toilet seat cover, clean showroom setup, realistic sanitaryware product photo, soft architectural light",
  },
  {
    categoryId: "bathroom-accessories",
    title: "Aura Accessory Line",
    subtitle: "Refined details that finish the space.",
    imagePrompt:
      "bathroom accessories set with towel ring, robe hook and soap dish, polished chrome, dark luxury backdrop, realistic editorial product shot",
  },
  {
    categoryId: "bathroom-accessories",
    title: "Edge Utility Series",
    subtitle: "Elegant support for daily rituals.",
    imagePrompt:
      "premium bathroom accessory collection mounted on textured wall, realistic chrome reflections, high-end bathroom catalogue aesthetic",
  },
  {
    categoryId: "bathroom-accessories",
    title: "Contour Hardware Set",
    subtitle: "Complete accents with a modern tone.",
    imagePrompt:
      "chrome bathroom accessories lineup in studio lighting, dark navy background, realistic brochure photography, luxury fittings brand style",
  },
] as const;

const CATALOGUE_QUICK_LINKS: readonly CatalogueQuickLink[] = [
  {
    id: "ptmt-accessories",
    title: "PTMT Accessories, Garden Pipes & Waste Pipe",
    imagePrompt:
      "collection of premium plumbing accessories and garden pipes, dark luxury studio backdrop, metallic highlights, realistic product lineup, catalogue photography",
  },
  {
    id: "jet-spray",
    title: "Jet Spray, Health Faucets & Hygiene",
    imagePrompt:
      "premium chrome jet spray and health faucet set, dark gradient background, realistic reflections, elegant brochure product shot",
  },
  {
    id: "exposed-shower",
    title: "Exposed Shower Set & Diverter Panel",
    imagePrompt:
      "luxury shower set with diverter panel, premium chrome finish, dark navy background, realistic editorial product photography",
  },
  {
    id: "single-lever",
    title: "Single Lever Mixer & Sensor Faucets",
    imagePrompt:
      "single lever mixer and sensor faucet collection, dark premium studio lighting, realistic chrome products, high-end catalogue photo",
  },
  {
    id: "cistern-seat-cover",
    title: "Cistern & Seat Cover",
    imagePrompt:
      "modern white cistern and seat cover set, premium showroom lighting, clean minimal background, realistic sanitaryware product photography",
  },
  {
    id: "bathroom-accessories",
    title: "Bathroom Accessories",
    imagePrompt:
      "bathroom accessories set including towel ring and soap holder, chrome finishes, dark luxury backdrop, realistic brochure photography",
  },
] as const;

function createAiImageUrl(prompt: string, imageSize: string) {
  return `https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=${encodeURIComponent(prompt)}&image_size=${imageSize}`;
}

function CatalogueDashboard() {
  const [activeCatalogueCategory, setActiveCatalogueCategory] = useState<string>(
    CATALOGUE_QUICK_LINKS[0]?.id ?? "",
  );

  const activeQuickLink =
    CATALOGUE_QUICK_LINKS.find((item) => item.id === activeCatalogueCategory) ?? CATALOGUE_QUICK_LINKS[0];
  const visibleCards = CATALOGUE_FEATURE_CARDS.filter((card) => card.categoryId === activeCatalogueCategory);

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
      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          gap: "18px",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            alignSelf: "flex-start",
            padding: "10px 18px",
            borderRadius: "14px",
            background: "linear-gradient(90deg, rgba(17,42,73,0.95) 0%, rgba(17,171,118,0.96) 100%)",
            color: "#f5fbff",
            fontFamily: "'Inter', 'Helvetica Neue', Helvetica, sans-serif",
            fontSize: "15px",
            fontWeight: 600,
            letterSpacing: "-0.01em",
            boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
          }}
        >
          {activeQuickLink?.title ?? "Catalogue Collection"}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: "14px",
            minWidth: 0,
          }}
        >
          {visibleCards.map((card) => (
            <article
              key={card.title}
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
              }}
            >
              <div
                style={{
                  height: "100%",
                  backgroundImage: `url(${createAiImageUrl(card.imagePrompt, "landscape_4_3")})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
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
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <h3
                    style={{
                      margin: 0,
                      color: "#f8fbff",
                      fontFamily: "'Inter', 'Helvetica Neue', Helvetica, sans-serif",
                      fontSize: "19px",
                      fontWeight: 500,
                      lineHeight: 1.28,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {card.title}
                  </h3>
                  <p
                    style={{
                      margin: 0,
                      color: "rgba(220, 233, 245, 0.8)",
                      fontFamily: "'Inter', 'Helvetica Neue', Helvetica, sans-serif",
                      fontSize: "14px",
                      fontWeight: 400,
                      lineHeight: 1.55,
                    }}
                  >
                    {card.subtitle}
                  </p>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <span
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "999px",
                      border: "1px solid rgba(197, 220, 245, 0.4)",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#f8fbff",
                    }}
                  >
                    <ChevronRight size={18} strokeWidth={1.6} />
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      <aside
        style={{
          width: "228px",
          minWidth: "228px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        {CATALOGUE_QUICK_LINKS.map((item) => (
          <button
            key={item.title}
            type="button"
            onClick={() => setActiveCatalogueCategory(item.id)}
            style={{
              display: "grid",
              gridTemplateColumns: "64px 1fr auto",
              alignItems: "center",
              gap: "12px",
              padding: "10px",
              borderRadius: "16px",
              border:
                activeCatalogueCategory === item.id
                  ? "1px solid rgba(92, 174, 255, 0.78)"
                  : "1px solid rgba(157, 200, 255, 0.18)",
              background:
                activeCatalogueCategory === item.id
                  ? "linear-gradient(180deg, rgba(16,42,75,0.98) 0%, rgba(5,18,33,0.98) 100%)"
                  : "linear-gradient(180deg, rgba(12,28,48,0.96) 0%, rgba(4,12,24,0.98) 100%)",
              boxShadow:
                activeCatalogueCategory === item.id
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
                width: "64px",
                height: "64px",
                borderRadius: "12px",
                backgroundImage: `url(${createAiImageUrl(item.imagePrompt, "square_hd")})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
            <p
              style={{
                margin: 0,
                color: activeCatalogueCategory === item.id ? "#ffffff" : "#f4f8fc",
                fontFamily: "'Inter', 'Helvetica Neue', Helvetica, sans-serif",
                fontSize: "13px",
                fontWeight: 500,
                lineHeight: 1.45,
              }}
            >
              {item.title}
            </p>
            <ChevronRight
              size={16}
              strokeWidth={1.6}
              color={activeCatalogueCategory === item.id ? "#ffffff" : "rgba(248, 251, 255, 0.85)"}
            />
          </button>
        ))}
      </aside>
    </div>
  );
}

export default function Header() {
  const router = useRouter();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [activeUserMenuLink, setActiveUserMenuLink] = useState<string | null>(null);
  const [isDarkBg, setIsDarkBg] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [cartCount, setCartCount] = useState(0);

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
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // overflow now handled by the combined effect above

  /* ── Dynamic scroll theme detection for light vs dark sections ── */
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);

      const sections = Array.from(document.querySelectorAll("section"));
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
                bg === "rgb(255, 255, 255)")
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

  // Color tokens based on dark vs light section under header
  const textColor = isDarkBg ? "#ffffff" : "#111111";
  const textMutedColor = isDarkBg ? "rgba(255, 255, 255, 0.92)" : "rgba(17, 17, 17, 0.92)";
  const iconColor = isDarkBg ? "#ffffff" : "#111111";
  const headerBg = isScrolled
    ? isDarkBg
      ? "transparent"
      : "rgba(255, 255, 255, 0.4)"
    : "transparent";

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
          backdropFilter: "none",
          WebkitBackdropFilter: "none",
          borderBottom: "none",
          boxShadow: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingLeft: "clamp(28px, 6vw, 110px)",
          paddingRight: "clamp(28px, 6vw, 110px)",
          boxSizing: "border-box",
          pointerEvents: "auto",
          color: textColor,
          transition: "background 0.3s ease, border-color 0.3s ease, color 0.3s ease",
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
              src="https://www.rnvalves.com/uploads/logo/rn-logosvgrhp9isxc7mdnyofdf3iumzuy2s8zld.svg" 
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
            {/* User Account / Login */}
            <button
              type="button"
              aria-label="Login"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "transparent",
                border: "none",
                padding: 0,
                cursor: "pointer",
              }}
              className="group transition-opacity duration-300 hover:opacity-70"
            >
              <User size={22} strokeWidth={1.6} color={iconColor} style={{ transition: "color 0.3s ease" }} />
            </button>

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
            <CatalogueDashboard />
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
