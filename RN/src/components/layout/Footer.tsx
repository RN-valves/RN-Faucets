"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { MapPin, Phone, Mail } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

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

const TwitterIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const PinterestIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const NAV_COLUMN_1 = [
  { label: "About Us", href: "/about-us" },
  { label: "Blogs", href: "#" },
  { label: "Tutorials Videos", href: "#" },
  { label: "Projects", href: "#" },
];

const NAV_COLUMN_2 = [
  { label: "Career", href: "#" },
  { label: "Events", href: "#" },
  { label: "Warranty", href: "#" },
  { label: "Catalogues", href: "#" },
];

const NAV_COLUMN_3 = [
  { label: "Become a Channel Partner", href: "#" },
  { label: "Contact Us", href: "#" },
  { label: "Privacy Policy", href: "#" },
  { label: "Terms & Conditions", href: "#" },
];

const SOCIAL_LINKS = [
  { Component: InstagramIcon, label: "Instagram", href: "https://instagram.com" },
  { Component: FacebookIcon, label: "Facebook", href: "https://facebook.com" },
  { Component: YoutubeIcon, label: "Youtube", href: "https://youtube.com" },
  { Component: LinkedinIcon, label: "Linkedin", href: "https://linkedin.com" },
  { Component: TwitterIcon, label: "Twitter (X)", href: "https://twitter.com" },
  { Component: PinterestIcon, label: "Pinterest", href: "https://pinterest.com" },
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
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power2.out",
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
      className="relative overflow-hidden pt-16 md:pt-20 pb-8 text-white select-none"
      style={{
        backgroundColor: "#022B52",
        backgroundImage:
          "linear-gradient(to bottom, rgba(2, 43, 82, 0.96), rgba(2, 43, 82, 0.98)), url('https://jalbath.com/wp-content/uploads/2026/01/footer-bg-svg.svg')",
        backgroundRepeat: "repeat",
        backgroundSize: "320px",
        backgroundPosition: "center",
      }}
    >
      <style>{`
        .footer-nav-link {
          display: inline-block;
          font-size: 15px;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.88);
          line-height: 2.2;
          text-decoration: none;
          position: relative;
          transition: color 0.3s ease, transform 0.3s ease;
        }
        .footer-nav-link:hover {
          color: #E6D6B8;
          transform: translateX(4px);
        }
        .footer-nav-link::after {
          content: '';
          position: absolute;
          left: 0;
          bottom: 2px;
          width: 0;
          height: 1px;
          background-color: #E6D6B8;
          transition: width 0.3s ease;
        }
        .footer-nav-link:hover::after {
          width: 100%;
        }
        .social-icon-btn {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(255, 255, 255, 0.85);
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.3s ease;
        }
        .social-icon-btn:hover {
          color: #E6D6B8;
          background: rgba(255, 255, 255, 0.12);
          transform: translateY(-2px);
          box-shadow: 0 0 18px rgba(230, 214, 184, 0.35);
          border-color: rgba(230, 214, 184, 0.4);
        }
      `}</style>

      {/* Inner Container */}
      <div className="mx-auto max-w-[1320px] px-6 md:px-10">
        
        {/* Main 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.35fr_1fr_1fr_1fr] gap-10 lg:gap-16 items-start mb-12">
          
          {/* Column 1: Logo & Get In Touch Contact Info */}
          <div className="flex flex-col items-center text-center md:items-start md:text-left">
            {/* Website Logo in a clean white badge */}
            <Link href="/" aria-label="Home Page" className="block mb-6">
              <div className="bg-white/95 px-5 py-3 rounded-lg inline-block shadow-md border border-white/20 transition-transform duration-300 hover:scale-[1.02]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://www.rnvalves.com/uploads/logo/rn-logosvgrhp9isxc7mdnyofdf3iumzuy2s8zld.svg"
                  alt="RN Valves & Faucets Logo"
                  className="h-[60px] md:h-[70px] w-auto block object-contain"
                />
              </div>
            </Link>

            {/* Section Heading */}
            <h2
              className="text-[28px] md:text-[34px] font-semibold tracking-tight"
              style={{ color: "#E9DCC0", fontFamily: "'Manrope', 'Poppins', sans-serif" }}
            >
              Get In Touch
            </h2>

            {/* Thin Divider Line */}
            <div className="mt-3 mb-5 h-[1px] w-full max-w-[360px] bg-white/20 mx-auto md:mx-0" />

            {/* Address & Contact Info */}
            <div className="flex flex-col gap-2.5 text-[14.5px] leading-7 text-white/90 font-sans max-w-[380px] items-center md:items-start text-center md:text-left">
              <p className="flex items-start justify-center md:justify-start gap-2.5">
                <MapPin size={16} className="mt-1 flex-shrink-0 text-[#E6D6B8]" />
                <span>B-68 SITE-4 SAHIBABAD Ghaziabad Uttar Pradesh 201010, India</span>
              </p>
              <p className="flex items-center justify-center md:justify-start gap-2.5">
                <Phone size={16} className="flex-shrink-0 text-[#E6D6B8]" />
                <a href="tel:18002120192" className="hover:text-[#E6D6B8] transition-colors">
                  1800 212 0192
                </a>
              </p>
              <p className="flex items-center justify-center md:justify-start gap-2.5">
                <Mail size={16} className="flex-shrink-0 text-[#E6D6B8]" />
                <a href="mailto:info@rnvalves.com" className="hover:text-[#E6D6B8] transition-colors">
                  info@rnvalves.com
                </a>
              </p>
              <p className="flex items-center justify-center md:justify-start gap-2.5">
                <Mail size={16} className="flex-shrink-0 text-[#E6D6B8]" />
                <a href="mailto:support@rnvalves.com" className="hover:text-[#E6D6B8] transition-colors">
                  support@rnvalves.com
                </a>
              </p>
            </div>

            {/* Social Icons Row */}
            <div className="flex items-center justify-center md:justify-start gap-3 mt-6">
              {SOCIAL_LINKS.map(({ Component, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="social-icon-btn"
                >
                  <Component />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Navigation 1 */}
          <nav aria-label="Footer Nav Column 1" className="flex flex-col items-center md:items-start text-center md:text-left pt-2 md:pt-4">
            <ul className="flex flex-col space-y-1 p-0 m-0 list-none items-center md:items-start">
              {NAV_COLUMN_1.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="footer-nav-link">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Column 3: Navigation 2 */}
          <nav aria-label="Footer Nav Column 2" className="flex flex-col items-center md:items-start text-center md:text-left pt-2 md:pt-4">
            <ul className="flex flex-col space-y-1 p-0 m-0 list-none items-center md:items-start">
              {NAV_COLUMN_2.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="footer-nav-link">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Column 4: Navigation 3 */}
          <nav aria-label="Footer Nav Column 3" className="flex flex-col items-center md:items-start text-center md:text-left pt-2 md:pt-4">
            <ul className="flex flex-col space-y-1 p-0 m-0 list-none items-center md:items-start">
              {NAV_COLUMN_3.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="footer-nav-link">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

        </div>

        {/* Full-width Divider Line */}
        <div className="w-full h-[1px] bg-white/10 mb-6" />

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-[13.5px] text-white/70 font-medium text-center md:text-left">
          <div>
            © Copyright | RN Valves & Faucets | All Rights Reserved
          </div>
          <div>
            Website Architecture by Blacklisted
          </div>
        </div>

      </div>
    </footer>
  );
}
