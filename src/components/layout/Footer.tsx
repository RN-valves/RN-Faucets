"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/* ─── SVG Social Icons ─── */
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
    <line x1="12" y1="5" x2="12" y2="19"/>
    <path d="M5 12s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z"/>
  </svg>
);

const NAV_COLUMN_1 = [
  { label: "About Us", href: "/about-us" },
  { label: "Blogs", href: "/blogs" },
  { label: "Catalogues", href: "/catalogues" },
  { label: "Our CSR", href: "/corporate-social-responsibility" },
];
const NAV_COLUMN_2 = [
  { label: "Become our Dealer", href: "/business-user-registration" },
  { label: "Our Certification", href: "/certificates" },
  { label: "Contact Us", href: "/contact-us" },
  { label: "Warranty Policy", href: "/about-us" },
];
const NAV_COLUMN_3 = [
  { label: "Personal Account", href: "/retail-user-registration" },
  { label: "Business Account", href: "/business-user-registration" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Return & Refund Policy", href: "/return-refund-policy" },
  { label: "Terms & Conditions", href: "/terms-conditions" },
];
const SOCIAL_LINKS = [
  { Component: InstagramIcon, label: "Instagram", href: "https://www.instagram.com/rnvalvesandfaucets/" },
  { Component: FacebookIcon, label: "Facebook", href: "https://www.facebook.com/rnvalvesandfaucets/" },
  { Component: YoutubeIcon, label: "Youtube", href: "https://www.youtube.com/channel/UCpUUF6ZFL88S85IuSsHDRSQ/?sub_confirmation=1" },
  { Component: LinkedinIcon, label: "Linkedin", href: "https://www.linkedin.com/company/rn-valves-faucets/" },
  { Component: TwitterXIcon, label: "Twitter (X)", href: "https://twitter.com/RNValves" },
  { Component: PinterestIcon, label: "Pinterest", href: "https://in.pinterest.com/infornvalves/" },
];

export default function Footer() {
  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!footerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        footerRef.current,
        { y: 30, opacity: 0.9 },
        {
          y: 0, opacity: 1, duration: 0.8, ease: "power2.out",
          scrollTrigger: {
            trigger: footerRef.current,
            start: "top 90%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }, footerRef);
    return () => ctx.revert();
  }, []);

  return (
    <footer
      ref={footerRef}
      role="contentinfo"
      aria-label="Site Footer"
      style={{
        backgroundColor: "#022B52",
        backgroundImage:
          "linear-gradient(to bottom, rgba(2,43,82,0.96), rgba(2,43,82,0.98)), url('https://jalbath.com/wp-content/uploads/2026/01/footer-bg-svg.svg')",
        backgroundRepeat: "repeat",
        backgroundSize: "320px",
        backgroundPosition: "center",
        color: "#ffffff",
        fontFamily: "'Manrope','Poppins',sans-serif",
      }}
    >
      {/* ── Scoped styles ── */}
      <style>{`
        .fn-link {
          display: block;
          font-size: 14.5px;
          font-weight: 400;
          color: rgba(255,255,255,0.85);
          line-height: 2.3;
          text-decoration: none;
          letter-spacing: 0.01em;
          transition: color 0.22s, transform 0.22s;
          position: relative;
        }
        .fn-link:hover { color: #E6D6B8; transform: translateX(4px); }
        .fn-link::after {
          content:''; position:absolute; left:0; bottom:3px;
          width:0; height:1px; background:#E6D6B8; transition:width 0.22s;
        }
        .fn-link:hover::after { width:100%; }

        .fn-social {
          width: 36px; height: 36px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          color: rgba(255,255,255,0.8);
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.13);
          transition: all 0.22s ease; text-decoration: none;
        }
        .fn-social:hover {
          color: #E6D6B8; background: rgba(255,255,255,0.14);
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(230,214,184,0.22);
          border-color: rgba(230,214,184,0.35);
        }
      `}</style>

      <div style={{ maxWidth: 1320, margin: "0 auto", padding: "40px 48px 0" }}>

        {/* ── Logo (small, top-left) ── */}
        <div style={{ marginBottom: 32 }}>
          <Link href="/" aria-label="RN Valves & Faucets Home">
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#ffffff",
                borderRadius: 8,
                padding: "8px 16px",
                boxShadow: "0 2px 12px rgba(0,0,0,0.18)",
              }}
            >
              <Image
                src="/logo.svg"
                alt="RN Valves & Faucets"
                width={100}
                height={32}
                style={{ height: 32, width: "auto", display: "block", objectFit: "contain" }}
              />
            </span>
          </Link>
        </div>

        {/* ── 4-Column Grid ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.4fr 1fr 1fr 1.2fr",
            gap: "40px 64px",
            alignItems: "start",
            marginBottom: 40,
          }}
        >
          {/* Col 1 — Get In Touch */}
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 600, color: "#ffffff", marginBottom: 12, marginTop: 0 }}>
              Get In Touch
            </h2>
            <div style={{ height: 1, background: "rgba(255,255,255,0.2)", marginBottom: 20 }} />
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.82)", lineHeight: 1.75, margin: "0 0 6px" }}>
              B-68 SITE-4 SAHIBABAD, Ghaziabad<br />
              Uttar Pradesh 201010, India
            </p>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.82)", margin: "0 0 4px" }}>
              <a href="tel:1800123400400" style={{ color: "rgba(255,255,255,0.82)", textDecoration: "none" }}>
                1800 12340 0400
              </a>
            </p>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.82)", margin: "0 0 4px" }}>
              <a href="mailto:enquiry@rnvalves.com" style={{ color: "rgba(255,255,255,0.82)", textDecoration: "none" }}>
                enquiry@rnvalves.com
              </a>
            </p>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.82)", margin: 0 }}>
              <a href="https://www.rnvalves.com" target="_blank" rel="noopener noreferrer" style={{ color: "rgba(255,255,255,0.82)", textDecoration: "none" }}>
                www.rnvalves.com
              </a>
            </p>

            {/* Social Icons */}
            <div style={{ display: "flex", gap: 10, marginTop: 24, flexWrap: "wrap" }}>
              {SOCIAL_LINKS.map(({ Component, label, href }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="fn-social">
                  <Component />
                </a>
              ))}
            </div>
          </div>

          {/* Col 2 */}
          <nav aria-label="Footer Nav 1">
            {NAV_COLUMN_1.map((l) => (
              <Link key={l.label} href={l.href} className="fn-link">{l.label}</Link>
            ))}
          </nav>

          {/* Col 3 */}
          <nav aria-label="Footer Nav 2">
            {NAV_COLUMN_2.map((l) => (
              <Link key={l.label} href={l.href} className="fn-link">{l.label}</Link>
            ))}
          </nav>

          {/* Col 4 */}
          <nav aria-label="Footer Nav 3">
            {NAV_COLUMN_3.map((l) => (
              <Link key={l.label} href={l.href} className="fn-link">{l.label}</Link>
            ))}
          </nav>
        </div>

        {/* ── Divider ── */}
        <div style={{ height: 1, background: "rgba(255,255,255,0.1)", marginBottom: 20 }} />

        {/* ── Bottom bar ── */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingBottom: 28,
            fontSize: 13,
            color: "rgba(255,255,255,0.6)",
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          <span>© Copyright | RN Valves &amp; Faucets | All Rights Reserved</span>
      
         <span>Website Architecture by Blacklisted</span>
        </div>

      </div>
    </footer>
  );
}
