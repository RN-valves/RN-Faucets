"use client";

import Link from "next/link";

/* ── Social Icons ── */
const InstagramIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
);
const FacebookIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);
const YoutubeIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/>
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/>
  </svg>
);
const LinkedinIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
    <rect x="2" y="9" width="4" height="12"/>
    <circle cx="4" cy="4" r="2"/>
  </svg>
);
const TwitterXIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);
const PinterestIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.236 2.636 7.855 6.356 9.312-.088-.791-.167-2.005.035-2.868.181-.78 1.172-4.97 1.172-4.97s-.299-.598-.299-1.482c0-1.388.806-2.428 1.808-2.428.852 0 1.265.64 1.265 1.408 0 .858-.546 2.141-.828 3.33-.236.995.499 1.806 1.476 1.806 1.772 0 3.137-1.868 3.137-4.563 0-2.386-1.715-4.054-4.161-4.054-2.833 0-4.498 2.124-4.498 4.322 0 .856.33 1.772.741 2.273a.3.3 0 0 1 .069.286c-.076.315-.243.995-.276 1.134-.044.181-.146.219-.337.132-1.249-.581-2.03-2.407-2.03-3.874 0-3.154 2.292-6.052 6.608-6.052 3.469 0 6.165 2.473 6.165 5.776 0 3.447-2.173 6.22-5.19 6.22-1.013 0-1.966-.527-2.292-1.148l-.623 2.378c-.226.869-.835 1.958-1.244 2.621.937.29 1.931.446 2.962.446 5.523 0 10-4.477 10-10S17.523 2 12 2z"/>
  </svg>
);

const NAV_COL_1 = [
  { label: "About Us", href: "/about-us" },
  { label: "Blogs", href: "/blogs" },
  { label: "Catalogues", href: "/catalogues" },
  { label: "Our CSR", href: "/corporate-social-responsibility" },
];
const NAV_COL_2 = [
  { label: "Become our Dealer", href: "/business-user-registration" },
  { label: "Our Certification", href: "/certificates" },
  { label: "Contact Us", href: "/contact-us" },
  { label: "Warranty Policy", href: "/about-us" },
];
const NAV_COL_3 = [
  { label: "Personal Account", href: "/retail-user-registration" },
  { label: "Business Account", href: "/business-user-registration" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Return & Refund Policy", href: "/return-refund-policy" },
  { label: "Terms & Conditions", href: "/terms-conditions" },
];
const SOCIALS = [
  { Icon: InstagramIcon, label: "Instagram", href: "https://instagram.com" },
  { Icon: FacebookIcon, label: "Facebook", href: "https://facebook.com" },
  { Icon: YoutubeIcon, label: "Youtube", href: "https://youtube.com" },
  { Icon: LinkedinIcon, label: "Linkedin", href: "https://linkedin.com" },
  { Icon: TwitterXIcon, label: "Twitter X", href: "https://twitter.com" },
  { Icon: PinterestIcon, label: "Pinterest", href: "https://pinterest.com" },
];

interface FooterSectionProps {
  data?: {
    logo?: string;
    address?: string;
    phone?: string;
    email1?: string;
    email2?: string;
    copyrightText?: string;
    col1Links?: Array<{ label: string; href: string }>;
    col2Links?: Array<{ label: string; href: string }>;
    col3Links?: Array<{ label: string; href: string }>;
  };
}

export default function FooterSection({ data }: FooterSectionProps) {
  const footerLogo = data?.logo || "https://www.rnvalves.com/uploads/logo/rn-logosvgrhp9isxc7mdnyofdf3iumzuy2s8zld.svg";
  const addressText = data?.address || "B-68 SITE-4 SAHIBABAD, Ghaziabad\nUttar Pradesh 201010, India";
  const phoneText = data?.phone || "1800 212 0192";
  const email1Text = data?.email1 || "info@rnvalves.com";
  const email2Text = data?.email2 || "support@rnvalves.com";
  const copyright = data?.copyrightText || "© Copyright | RN Valves & Faucets | All Rights Reserved";
  return (
    <footer
      style={{
        width: "100%",
        overflow: "hidden",
        backgroundColor: "#022B52",
        position: "relative",   /* needed so content sits on top of img */
        color: "#ffffff",
        fontFamily: "'Manrope','Poppins',sans-serif",
      }}
    >
      {/* ── ORIGINAL background image — untouched ── */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="https://jalbath.com/wp-content/uploads/2026/01/footer-bg-svg.svg"
        alt=""
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
          pointerEvents: "none",
          userSelect: "none",
        }}
      />

      {/* ── All content sits on top via z-index ── */}
      <div style={{ position: "relative", zIndex: 1, maxWidth: 1320, margin: "0 auto", padding: "40px 48px 0 48px" }}>

        {/* Logo — top-left */}
        <div style={{ marginBottom: 32 }}>
          <Link href="/" aria-label="RN Valves & Faucets Home">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={footerLogo}
              alt="RN Valves & Faucets"
              style={{ height: 85, width: "auto", display: "block" }}
            />
          </Link>
        </div>

        {/* 4-column grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1.5fr 1fr 1fr 1.3fr",
          gap: "0 56px",
          alignItems: "start",
          marginBottom: 36,
        }}>

          {/* Col 1 — Get In Touch */}
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 600, color: "#ffffff", margin: "0 0 12px 0", letterSpacing: "-0.01em" }}>
              Get In Touch
            </h2>
            <div style={{ height: 1, background: "rgba(255,255,255,0.25)", marginBottom: 18 }} />
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.85)", lineHeight: 1.75, margin: "0 0 8px 0" }}>
              B-68 SITE-4 SAHIBABAD, Ghaziabad<br />Uttar Pradesh 201010, India
            </p>
            <p style={{ fontSize: 14, margin: "0 0 5px 0" }}>
              <a href="tel:18002120192" style={{ color: "rgba(255,255,255,0.85)", textDecoration: "none" }}>1800 212 0192</a>
            </p>
            <p style={{ fontSize: 14, margin: "0 0 5px 0" }}>
              <a href="mailto:info@rnvalves.com" style={{ color: "rgba(255,255,255,0.85)", textDecoration: "none" }}>info@rnvalves.com</a>
            </p>
            <p style={{ fontSize: 14, margin: 0 }}>
              <a href="mailto:support@rnvalves.com" style={{ color: "rgba(255,255,255,0.85)", textDecoration: "none" }}>support@rnvalves.com</a>
            </p>
            {/* Social icons */}
            <div style={{ display: "flex", gap: 10, marginTop: 24, flexWrap: "wrap" }}>
              {SOCIALS.map(({ Icon, label, href }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                  style={{
                    width: 36, height: 36, borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "rgba(255,255,255,0.85)",
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    textDecoration: "none", flexShrink: 0,
                  }}>
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          {/* Col 2 */}
          <nav aria-label="Footer links 1" style={{ paddingTop: 4 }}>
            {NAV_COL_1.map((l) => (
              <Link key={l.label} href={l.href} style={{
                display: "block", fontSize: 14.5, fontWeight: 400,
                color: "rgba(255,255,255,0.85)", lineHeight: "2.35",
                textDecoration: "none", letterSpacing: "0.01em",
              }}>{l.label}</Link>
            ))}
          </nav>

          {/* Col 3 */}
          <nav aria-label="Footer links 2" style={{ paddingTop: 4 }}>
            {NAV_COL_2.map((l) => (
              <Link key={l.label} href={l.href} style={{
                display: "block", fontSize: 14.5, fontWeight: 400,
                color: "rgba(255,255,255,0.85)", lineHeight: "2.35",
                textDecoration: "none", letterSpacing: "0.01em",
              }}>{l.label}</Link>
            ))}
          </nav>

          {/* Col 4 */}
          <nav aria-label="Footer links 3" style={{ paddingTop: 4 }}>
            {NAV_COL_3.map((l) => (
              <Link key={l.label} href={l.href} style={{
                display: "block", fontSize: 14.5, fontWeight: 400,
                color: "rgba(255,255,255,0.85)", lineHeight: "2.35",
                textDecoration: "none", letterSpacing: "0.01em",
              }}>{l.label}</Link>
            ))}
          </nav>

        </div>

        {/* Divider */}
        <div style={{ height: 1, background: "rgba(255,255,255,0.12)", marginBottom: 18 }} />

        {/* Bottom bar */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          paddingBottom: 28, fontSize: 13, color: "rgba(255,255,255,0.6)",
          flexWrap: "wrap", gap: 8,
        }}>
          <span>© Copyright | RN Valves &amp; Faucets | All Rights Reserved</span>
    
        </div>

      </div>
    </footer>
  );
}
