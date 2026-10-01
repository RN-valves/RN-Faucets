"use client";

import Link from "next/link";

/* ── Minimalist Social Icons (Matching Reference) ── */
const InstagramIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
);
const FacebookIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);
const YoutubeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/>
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="currentColor"/>
  </svg>
);
const LinkedinIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
    <rect x="2" y="9" width="4" height="12"/>
    <circle cx="4" cy="4" r="2"/>
  </svg>
);
const TwitterXIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);
const PinterestIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.236 2.636 7.855 6.356 9.312-.088-.791-.167-2.005.035-2.868.181-.78 1.172-4.97 1.172-4.97s-.299-.598-.299-1.482c0-1.388.806-2.428 1.808-2.428.852 0 1.265.64 1.265 1.408 0 .858-.546 2.141-.828 3.33-.236.995.499 1.806 1.476 1.806 1.772 0 3.137-1.868 3.137-4.563 0-2.386-1.715-4.054-4.161-4.054-2.833 0-4.498 2.124-4.498 4.322 0 .856.33 1.772.741 2.273a.3.3 0 0 1 .069.286c-.076.315-.243.995-.276 1.134-.044.181-.146.219-.337.132-1.249-.581-2.03-2.407-2.03-3.874 0-3.154 2.292-6.052 6.608-6.052 3.469 0 6.165 2.473 6.165 5.776 0 3.447-2.173 6.22-5.19 6.22-1.013 0-1.966-.527-2.292-1.148l-.623 2.378c-.226.869-.835 1.958-1.244 2.621.937.29 1.931.446 2.962.446 5.523 0 10-4.477 10-10S17.523 2 12 2z"/>
  </svg>
);

const NAV_COL_1 = [
  { label: "About Us", href: "/about-us" },
  { label: "Blogs", href: "/blogs" },
  { label: "Tutorials Videos", href: "/blogs" },
  { label: "Projects", href: "/faucets" },
];
const NAV_COL_2 = [
  { label: "Career", href: "/contact-us" },
  { label: "Events", href: "/blogs" },
  { label: "Warranty", href: "/terms-conditions" },
  { label: "Catalogues", href: "/catalogues" },
];
const NAV_COL_3 = [
  { label: "Become a Channel Partner", href: "/business-user-registration" },
  { label: "Contact Us", href: "/contact-us" },
  { label: "Privacy Policy", href: "/privacy-policy" },
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
  const addressText = data?.address || "D-192, Industrial Area, Phase 8-B, Sahibabad, Ghaziabad-201010 Uttar Pradesh, India";
  const phoneText = data?.phone || "1800 12340 0400";
  const email1Text = data?.email1 || "info@rnvalves.com";
  const email2Text = data?.email2 || "enquiry@rnvalves.com";
  const copyright = data?.copyrightText || "© Copyright | RN Valves & Faucets | All Rights Reserved";

  return (
    <footer className="w-full overflow-hidden bg-[#012340] relative text-white font-['Manrope','Poppins',sans-serif]">
      {/* ── Seamless SVG background pattern matching reference ── */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="https://jalbath.com/wp-content/uploads/2026/01/footer-bg-svg.svg"
        alt=""
        aria-hidden="true"
        className="absolute top-0 left-0 w-full h-full object-cover pointer-events-none select-none opacity-40 mix-blend-overlay"
      />

      {/* ── Main Container matching reference layout ── */}
      <div className="relative z-10 max-w-[1360px] mx-auto px-6 sm:px-10 lg:px-14 pt-16 sm:pt-20 pb-10">

        {/* ── Logo Top-Left ── */}
        <div className="mb-10 sm:mb-12">
          <Link href="/" aria-label="RN Valves & Faucets Home" className="inline-block">
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
              className="h-14 sm:h-16 w-auto block object-contain brightness-0 invert opacity-95"
            />
          </Link>
        </div>

        {/* ── Main Content Grid: Left (Get In Touch) + Right (3 Link Columns) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">

          {/* Left Block — Get In Touch (Span 5 cols) */}
          <div className="lg:col-span-5 max-w-[460px]">
            <h2 className="text-[20px] sm:text-[22px] font-normal text-white mb-2.5 tracking-[-0.01em]">
              Get In Touch
            </h2>

            {/* Thin underline matching reference */}
            <div className="h-[1px] bg-white/20 w-full max-w-[360px] mb-5" />

            {/* Address */}
            <p className="text-[13.5px] leading-relaxed text-white/85 mb-2.5">
              {addressText}
            </p>

            {/* Phone */}
            <p className="text-[13.5px] text-white/85 mb-2">
              <a
                href={`tel:${phoneText.replace(/\s+/g, "")}`}
                className="hover:text-white transition-colors duration-150 no-underline"
              >
                {phoneText}
              </a>
            </p>

            {/* Emails */}
            <p className="text-[13.5px] text-white/85 mb-1">
              <a
                href={`mailto:${email1Text}`}
                className="hover:text-white transition-colors duration-150 no-underline"
              >
                {email1Text}
              </a>
            </p>
            {email2Text && (
              <p className="text-[13.5px] text-white/85 mb-5">
                <a
                  href={`mailto:${email2Text}`}
                  className="hover:text-white transition-colors duration-150 no-underline"
                >
                  {email2Text}
                </a>
              </p>
            )}

            {/* Social Icons — pure minimal borderless icons matching reference */}
            <div className="flex items-center gap-5 mt-6">
              {SOCIALS.map(({ Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="text-white/85 hover:text-white hover:scale-110 transition-all duration-150 no-underline"
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          {/* Right Block — 3 Columns of Links (Span 7 cols) */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-6 lg:gap-8 pt-2">

            {/* Col 1 */}
            <ul className="space-y-4 list-none p-0 m-0">
              {(data?.col1Links && data.col1Links.length > 0 ? data.col1Links : NAV_COL_1).map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-[14px] text-white/85 hover:text-white transition-colors duration-150 no-underline block leading-snug"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Col 2 */}
            <ul className="space-y-4 list-none p-0 m-0">
              {(data?.col2Links && data.col2Links.length > 0 ? data.col2Links : NAV_COL_2).map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-[14px] text-white/85 hover:text-white transition-colors duration-150 no-underline block leading-snug"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Col 3 */}
            <ul className="space-y-4 list-none p-0 m-0">
              {(data?.col3Links && data.col3Links.length > 0 ? data.col3Links : NAV_COL_3).map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-[14px] text-white/85 hover:text-white transition-colors duration-150 no-underline block leading-snug"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>

          </div>

        </div>

        {/* ── Thin Divider ── */}
        <div className="h-[1px] bg-white/15 mt-16 sm:mt-20 mb-6" />

        {/* ── Bottom Bar ── */}
        <div className="flex flex-col sm:flex-row justify-between items-center text-center sm:text-left gap-3 text-xs text-white/70">
          <span>{copyright}</span>
          <span>Website Architecture by Blacklisted</span>
        </div>

      </div>
    </footer>
  );
}
