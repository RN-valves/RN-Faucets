"use client";

import { forwardRef, useEffect, useRef, useState } from "react";
import { Search, Heart, ShoppingBag, User } from "lucide-react";

/* ─── Types ────────────────────────────────────────────── */
interface HeroHeaderProps {
  activeNav?: string;
}

const NAV_ITEMS = ["Home", "Bathroom", "Kitchen", "Collections", "About", "Contact"];

/* ─── Hindware Logo SVG ────────────────────────────────── */
function HindwareLogo() {
  return (
    <svg
      viewBox="0 0 220 42"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Hindware Logo"
      role="img"
      style={{ maxHeight: 42, width: "auto" }}
    >
      {/* H */}
      <text
        x="0"
        y="33"
        fontFamily="Manrope, sans-serif"
        fontWeight="700"
        fontSize="36"
        fill="white"
        letterSpacing="-1"
      >
        HINDWARE
      </text>
      {/* Gold accent underline */}
      <rect x="0" y="38" width="220" height="1.5" fill="#c9a96e" rx="1" />
    </svg>
  );
}

/* ─── Component ────────────────────────────────────────── */
const HeroHeader = forwardRef<HTMLDivElement, HeroHeaderProps>(({ activeNav = "Home" }, ref) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const ticking = useRef(false);

  /* Scroll listener for glass effect */
  useEffect(() => {
    const handleScroll = () => {
      if (!ticking.current) {
        requestAnimationFrame(() => {
          setScrolled(window.scrollY > 20);
          ticking.current = false;
        });
        ticking.current = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* Lock body scroll when mobile drawer is open */
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      <header
        ref={ref}
        className={`header-glass fixed top-0 left-0 right-0 z-30 flex items-center justify-between${
          scrolled ? " scrolled" : ""
        }`}
        style={{ height: "var(--header-height)", padding: "0 56px" }}
        role="banner"
      >
        {/* ── Logo ── */}
        <a
          href="/"
          aria-label="Hindware home"
          className="flex-shrink-0 transition-opacity duration-300 hover:opacity-70"
          style={{ maxHeight: 42 }}
        >
          <HindwareLogo />
        </a>

        {/* ── Desktop Nav ── */}
        <nav
          className="hidden lg:flex items-center"
          style={{ gap: "44px" }}
          aria-label="Primary navigation"
        >
          {NAV_ITEMS.map((item) => (
            <a
              key={item}
              href={item === "Home" ? "/" : `/${item.toLowerCase()}`}
              className={`nav-link text-white transition-opacity duration-300 hover:opacity-70${
                item === activeNav ? " active" : ""
              }`}
              style={{
                fontFamily: "var(--font-manrope)",
                fontWeight: 500,
                fontSize: 14,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                textDecoration: "none",
              }}
              aria-current={item === activeNav ? "page" : undefined}
            >
              {item}
            </a>
          ))}
        </nav>

        {/* ── Right: Icons + CTA ── */}
        <div className="hidden lg:flex items-center" style={{ gap: "22px" }}>
          {/* Icon buttons */}
          {[
            { Icon: Search, label: "Open search" },
            { Icon: Heart, label: "Open wishlist" },
            { Icon: ShoppingBag, label: "Open cart" },
            { Icon: User, label: "Open account" },
          ].map(({ Icon, label }) => (
            <button key={label} className="icon-btn" aria-label={label} type="button">
              <Icon size={20} strokeWidth={1.5} />
            </button>
          ))}

          {/* Shop Now CTA */}
          <button className="cta-btn" type="button" aria-label="Shop luxury bathware collection">
            Shop Now
          </button>
        </div>

        {/* ── Mobile: Icons + Hamburger ── */}
        <div className="flex lg:hidden items-center gap-4">
          <button className="icon-btn" aria-label="Open search" type="button">
            <Search size={20} strokeWidth={1.5} />
          </button>
          <button className="icon-btn" aria-label="Open cart" type="button">
            <ShoppingBag size={20} strokeWidth={1.5} />
          </button>
          {/* Hamburger */}
          <button
            className={`icon-btn flex flex-col gap-[4px]${mobileOpen ? " hamburger-open" : ""}`}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            type="button"
            onClick={() => setMobileOpen((p) => !p)}
            style={{ padding: 4 }}
          >
            <span className="hamburger-line" />
            <span className="hamburger-line" />
            <span className="hamburger-line" />
          </button>
        </div>
      </header>

      {/* ── Mobile Drawer ── */}
      <div
        className={`mobile-drawer${mobileOpen ? " open" : ""}`}
        aria-hidden={!mobileOpen}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation menu"
      >
        <nav className="flex flex-col items-center gap-8" aria-label="Mobile navigation">
          {NAV_ITEMS.map((item, i) => (
            <a
              key={item}
              href={item === "Home" ? "/" : `/${item.toLowerCase()}`}
              onClick={() => setMobileOpen(false)}
              className={`text-white transition-opacity duration-300 hover:opacity-60${
                item === activeNav ? " opacity-100" : " opacity-80"
              }`}
              style={{
                fontFamily: "var(--font-manrope)",
                fontWeight: 500,
                fontSize: 28,
                letterSpacing: "0.05em",
                textDecoration: "none",
                animationDelay: `${i * 0.06}s`,
              }}
            >
              {item}
            </a>
          ))}
        </nav>

        <button
          className="cta-btn mt-8 pointer-events-auto"
          type="button"
          onClick={() => setMobileOpen(false)}
        >
          Shop Now
        </button>

        {/* Gold accent at bottom */}
        <div
          className="absolute bottom-12 flex items-center gap-2 opacity-50"
          style={{ color: "var(--brand-gold)" }}
        >
          <span style={{ fontFamily: "var(--font-manrope)", fontSize: 11, letterSpacing: "0.2em" }}>
            HINDWARE LUXURY
          </span>
        </div>
      </div>
    </>
  );
});

HeroHeader.displayName = "HeroHeader";
export default HeroHeader;
