"use client";

import Link from "next/link";
import { MapPin, Phone, Mail, Globe, ChevronRight } from "lucide-react";

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
  { label: "Blogs & News", href: "/blogs" },
  { label: "Product Catalogues", href: "/catalogues" },
  { label: "Our CSR Initiatives", href: "/corporate-social-responsibility" },
  { label: "Store Locator", href: "/store-locator" },
];
const NAV_COL_2 = [
  { label: "Become our Dealer", href: "/business-user-registration" },
  { label: "Our Certifications", href: "/certificates" },
  { label: "Contact Us", href: "/contact-us" },
  { label: "Enquire Now", href: "/enquire-now" },
];
const NAV_COL_3 = [
  { label: "Personal Account", href: "/retail-user-registration" },
  { label: "Business Account", href: "/business-user-registration" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Return & Refund Policy", href: "/return-refund-policy" },
  { label: "Terms & Conditions", href: "/terms-conditions" },
];
const SOCIALS = [
  { Icon: InstagramIcon, label: "Instagram", href: "https://www.instagram.com/rnvalvesandfaucets/" },
  { Icon: FacebookIcon, label: "Facebook", href: "https://www.facebook.com/rnvalvesandfaucets/" },
  { Icon: YoutubeIcon, label: "Youtube", href: "https://www.youtube.com/channel/UCpUUF6ZFL88S85IuSsHDRSQ/?sub_confirmation=1" },
  { Icon: LinkedinIcon, label: "Linkedin", href: "https://www.linkedin.com/company/rn-valves-faucets/" },
  { Icon: TwitterXIcon, label: "Twitter X", href: "https://twitter.com/RNValves" },
  { Icon: PinterestIcon, label: "Pinterest", href: "https://in.pinterest.com/infornvalves/" },
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
  const footerLogo = data?.logo || "/rn-header-logo.svg";
  const addressText = data?.address || "B-68 SITE-4 SAHIBABAD, Ghaziabad\nUttar Pradesh 201010, India";
  const phoneText = data?.phone || "1800 12340 0400";
  const email1Text = data?.email1 || "enquiry@rnvalves.com";
  const copyright = data?.copyrightText || `© ${new Date().getFullYear()} RN Valves & Faucets. All Rights Reserved.`;

  return (
    <footer className="w-full overflow-hidden bg-gradient-to-b from-[#021f3f] via-[#022B52] to-[#01182e] relative text-white font-['Manrope','Poppins',sans-serif] border-t border-sky-900/40">
      {/* ── Subtle background pattern overlay ── */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="https://jalbath.com/wp-content/uploads/2026/01/footer-bg-svg.svg"
        alt=""
        aria-hidden="true"
        className="absolute top-0 left-0 w-full h-full object-cover pointer-events-none select-none opacity-30 mix-blend-screen"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#011427]/85 via-transparent to-transparent pointer-events-none" />

      {/* ── Content container with full balanced width ── */}
      <div className="relative z-10 max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12 pt-14 sm:pt-16 lg:pt-18 pb-10 sm:pb-14">

        {/* 5-Column Centered & Evenly-Distributed Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-6 xl:gap-8 items-start">

          {/* Col 1 — Brand Info & Socials */}
          <div className="space-y-4 sm:col-span-2 md:col-span-1 lg:col-span-1">
            <Link href="/" aria-label="RN Valves & Faucets Home" className="inline-block">
              <div className="bg-white/95 rounded-xl px-4 py-2 inline-flex items-center shadow-md backdrop-blur-sm border border-white/20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={footerLogo}
                  alt="RN Valves & Faucets"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (!target.src.endsWith("/rn-header-logo.svg")) {
                      target.src = "/rn-header-logo.svg";
                    }
                  }}
                  className="h-11 sm:h-12 w-auto block object-contain"
                />
              </div>
            </Link>

            <p className="text-[13.5px] leading-relaxed text-white/80 pr-2">
              Engineered for excellence and crafted for life. Luxury bath fittings & precision valves across India.
            </p>

            <div className="pt-2">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-sky-300 mb-2.5">
                Follow RN Valves
              </span>
              <div className="flex flex-wrap gap-2">
                {SOCIALS.map(({ Icon, label, href }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white/90 bg-white/10 border border-white/15 hover:bg-sky-500 hover:text-white hover:border-sky-400 hover:scale-105 transition-all duration-200 shadow-sm no-underline"
                  >
                    <Icon />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Col 2 — Quick Links */}
          <div className="space-y-3.5">
            <h3 className="text-[14px] font-bold text-white tracking-wider uppercase relative inline-block">
              Quick Links
              <span className="block w-7 h-[2px] bg-sky-400 mt-1.5 rounded-full" />
            </h3>
            <ul className="space-y-2.5 pt-1 list-none p-0 m-0">
              {(data?.col1Links && data.col1Links.length > 0 ? data.col1Links : NAV_COL_1).map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="inline-flex items-center text-[13.5px] text-white/75 hover:text-sky-300 hover:translate-x-1 transition-all duration-200 group no-underline leading-relaxed"
                  >
                    <ChevronRight className="w-3.5 h-3.5 opacity-0 -ml-3.5 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200 text-sky-400 mr-1 shrink-0" />
                    <span>{l.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 — Partner with Us */}
          <div className="space-y-3.5">
            <h3 className="text-[14px] font-bold text-white tracking-wider uppercase relative inline-block">
              Partner with Us
              <span className="block w-7 h-[2px] bg-sky-400 mt-1.5 rounded-full" />
            </h3>
            <ul className="space-y-2.5 pt-1 list-none p-0 m-0">
              {(data?.col2Links && data.col2Links.length > 0 ? data.col2Links : NAV_COL_2)
                .filter((l) => !l.label?.toLowerCase().includes("warranty"))
                .map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="inline-flex items-center text-[13.5px] text-white/75 hover:text-sky-300 hover:translate-x-1 transition-all duration-200 group no-underline leading-relaxed"
                    >
                      <ChevronRight className="w-3.5 h-3.5 opacity-0 -ml-3.5 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200 text-sky-400 mr-1 shrink-0" />
                      <span>{l.label}</span>
                    </Link>
                  </li>
                ))}
            </ul>
          </div>

          {/* Col 4 — Customer Care */}
          <div className="space-y-3.5">
            <h3 className="text-[14px] font-bold text-white tracking-wider uppercase relative inline-block">
              Customer Care
              <span className="block w-7 h-[2px] bg-sky-400 mt-1.5 rounded-full" />
            </h3>
            <ul className="space-y-2.5 pt-1 list-none p-0 m-0">
              {(data?.col3Links && data.col3Links.length > 0 ? data.col3Links : NAV_COL_3).map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="inline-flex items-center text-[13.5px] text-white/75 hover:text-sky-300 hover:translate-x-1 transition-all duration-200 group no-underline leading-relaxed"
                  >
                    <ChevronRight className="w-3.5 h-3.5 opacity-0 -ml-3.5 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200 text-sky-400 mr-1 shrink-0" />
                    <span>{l.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 5 — Get In Touch */}
          <div className="space-y-3.5">
            <h3 className="text-[14px] font-bold text-white tracking-wider uppercase relative inline-block">
              Get In Touch
              <span className="block w-7 h-[2px] bg-sky-400 mt-1.5 rounded-full" />
            </h3>

            <div className="space-y-2.5 pt-1">
              <div className="flex items-start gap-2.5 text-[13.5px] text-white/80">
                <MapPin className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <span className="leading-snug whitespace-pre-line">{addressText}</span>
              </div>

              <div className="flex items-center gap-2.5 text-[13.5px] text-white/80">
                <Phone className="w-4 h-4 text-sky-400 shrink-0" />
                <a
                  href={`tel:${phoneText.replace(/\s+/g, "")}`}
                  className="hover:text-sky-300 transition-colors duration-150 no-underline font-medium"
                >
                  {phoneText}
                </a>
              </div>

              <div className="flex items-center gap-2.5 text-[13.5px] text-white/80">
                <Mail className="w-4 h-4 text-sky-400 shrink-0" />
                <a
                  href={`mailto:${email1Text}`}
                  className="hover:text-sky-300 transition-colors duration-150 no-underline break-all"
                >
                  {email1Text}
                </a>
              </div>

              <div className="flex items-center gap-2.5 text-[13.5px] text-white/80">
                <Globe className="w-4 h-4 text-sky-400 shrink-0" />
                <a
                  href="https://www.rnvalves.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-sky-300 transition-colors duration-150 no-underline"
                >
                  www.rnvalves.com
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Divider */}
        <div className="h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent my-8 sm:my-10" />

        {/* Bottom Bar with Safe Padding */}
        <div className="flex flex-col sm:flex-row justify-between items-center text-center sm:text-left gap-3 text-xs text-white/65">
          <span>{copyright}</span>
          <span className="text-sky-300/80 font-medium">
            Engineered for Precision • Crafted with Pride in India
          </span>
        </div>

      </div>
    </footer>
  );
}
