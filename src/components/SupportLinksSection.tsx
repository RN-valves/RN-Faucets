"use client";

import {
  Building2,
  Globe,
  Headset,
  Smartphone,
} from "lucide-react";

const ICON_MAP: Record<string, any> = {
  Building2,
  Globe,
  Headset,
  Smartphone,
};

const DEFAULT_SUPPORT_LINKS = [
  {
    title: "Institutional Business",
    description: "Explore Projects for Institutional & Business Customers",
    cta: "Know More",
    href: "/business-user-registration",
    iconName: "Building2",
    icon: Building2,
  },
  {
    title: "International Business",
    description: "Explore our global presence and reach across regions",
    cta: "Know More",
    href: "/about-us",
    iconName: "Globe",
    icon: Globe,
  },
  {
    title: "Service & Support",
    description: "Connect with us for Installation and Service Requests",
    cta: "Connect Now",
    href: "/contact-us",
    iconName: "Headset",
    icon: Headset,
  },
  {
    title: "Product Catalogues",
    description: "Download official RN Valves & Faucets PDF catalogues",
    cta: "Download Now",
    href: "/catalogues",
    iconName: "Smartphone",
    icon: Smartphone,
  },
];

export default function SupportLinksSection({ data }: { data?: any }) {
  if (data?.visible === false) return null;

  const rawItems = data?.items && Array.isArray(data.items) && data.items.length > 0
    ? data.items
    : DEFAULT_SUPPORT_LINKS;

  const items = rawItems.map((item: any, idx: number) => {
    const fallback = DEFAULT_SUPPORT_LINKS[idx] || DEFAULT_SUPPORT_LINKS[0];
    const IconComp =
      (item.iconName && ICON_MAP[item.iconName]) ||
      item.icon ||
      fallback.icon ||
      Building2;
    const cleanHref =
      item.href && item.href !== "#" && item.href.trim() !== ""
        ? item.href
        : fallback.href;

    return {
      title: item.title || fallback.title,
      description: item.description || fallback.description,
      cta: item.cta ?? fallback.cta,
      href: cleanHref,
      Icon: IconComp,
    };
  });
  return (
    <section
      data-header-theme="light"
      className="support-links-section"
      style={{
        width: "100vw",
        background: "#F3F3F3",
        borderTop: "1px solid #E2E2E2",
        borderBottom: "1px solid #111111",
        padding: "110px 48px 64px",
        boxSizing: "border-box",
      }}
      aria-label="Business and support links"
    >
      <style>{`
        .support-links-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 28px;
        }
        .support-link-card {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 18px;
          color: #111111;
          text-decoration: none;
          padding: 8px 40px 0 44px;
        }
        .support-link-card:hover .support-link-title,
        .support-link-card:hover .support-link-cta,
        .support-link-card:hover .support-link-description {
          opacity: 0.7;
        }
        .support-link-icon {
          width: 92px;
          height: 92px;
          color: #111111;
          stroke-width: 1.5;
          flex-shrink: 0;
        }
        .support-link-title,
        .support-link-description,
        .support-link-cta {
          transition: opacity 0.2s ease;
        }
        @media (max-width: 1100px) {
          .support-links-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            row-gap: 36px;
          }
        }
        @media (max-width: 768px) {
          .support-links-section {
            padding: 28px 16px 32px !important;
          }
          .support-links-grid {
            grid-template-columns: 1fr;
            gap: 28px;
          }
          .support-link-card {
            padding: 0 12px;
          }
        }
      `}</style>

      <div className="support-links-grid">
        {items.map((item: any) => {
          const Icon = item.Icon;

          return (
            <a key={item.title} href={item.href} className="support-link-card">
              <Icon className="support-link-icon" />

              <div style={{ maxWidth: "240px" }}>
                <h2
                  className="support-link-title"
                  style={{
                    margin: "0 0 10px",
                    fontFamily: "'Manrope', Helvetica, Arial, sans-serif",
                    fontSize: "28px",
                    fontWeight: 400,
                    lineHeight: 1.25,
                    letterSpacing: "-0.03em",
                    color: "#111111",
                  }}
                >
                  {item.title}
                </h2>

                <p
                  className="support-link-description"
                  style={{
                    margin: "0 0 16px",
                    fontFamily: "'Manrope', Helvetica, Arial, sans-serif",
                    fontSize: "16px",
                    fontWeight: 400,
                    lineHeight: 1.6,
                    color: "#111111",
                    maxWidth: "220px",
                  }}
                >
                  {item.description}
                </p>

                {item.cta ? (
                  <span
                    className="support-link-cta"
                    style={{
                      display: "inline-block",
                      fontFamily: "'Manrope', Helvetica, Arial, sans-serif",
                      fontSize: "17px",
                      fontWeight: 400,
                      lineHeight: 1.35,
                      color: "#111111",
                    }}
                  >
                    {item.cta}
                  </span>
                ) : null}
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}
