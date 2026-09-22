"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldCheck,
  RotateCcw,
  FileText,
  Award,
  HeartHandshake,
  Briefcase,
  ChevronRight,
  Headphones,
  Mail,
} from "lucide-react";

interface PolicyItem {
  name: string;
  href: string;
  subtitle: string;
  icon: any;
}

const POLICY_LINKS: PolicyItem[] = [
  {
    name: "Privacy Policy",
    href: "/privacy-policy",
    subtitle: "Data protection & privacy notice",
    icon: ShieldCheck,
  },
  {
    name: "Return & Refund Policy",
    href: "/return-refund-policy",
    subtitle: "Goods return guidelines & process",
    icon: RotateCcw,
  },
  {
    name: "Terms & Conditions",
    href: "/terms-conditions",
    subtitle: "Orders & delivery guidelines",
    icon: FileText,
  },
  {
    name: "Our Certification",
    href: "/certificates",
    subtitle: "ISO, BIS, CE & quality badges",
    icon: Award,
  },
  {
    name: "Our CSR",
    href: "/corporate-social-responsibility",
    subtitle: "Social impact & successful exhibitions",
    icon: HeartHandshake,
  },
  {
    name: "Become our Dealer",
    href: "/business-user-registration",
    subtitle: "Register as an authorized partner",
    icon: Briefcase,
  },
];

export default function PolicySidebar() {
  const pathname = usePathname();

  return (
    <aside style={{ width: "100%" }}>
      {/* Policy items list */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        {POLICY_LINKS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px 20px",
                borderRadius: "12px",
                textDecoration: "none",
                transition: "all 0.2s ease",
                background: isActive
                  ? "linear-gradient(135deg, #022B52 0%, #034177 100%)"
                  : "#F8FAFC",
                border: isActive
                  ? "1px solid #00AEEF"
                  : "1px solid #E2E8F0",
                color: isActive ? "#FFFFFF" : "#1E293B",
                boxShadow: isActive
                  ? "0 8px 20px -4px rgba(0, 174, 239, 0.25)"
                  : "0 1px 3px rgba(0,0,0,0.03)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: isActive ? "rgba(0, 174, 239, 0.2)" : "#FFFFFF",
                    color: isActive ? "#00AEEF" : "#0284C7",
                    border: isActive
                      ? "1px solid rgba(0, 174, 239, 0.4)"
                      : "1px solid #E2E8F0",
                    flexShrink: 0,
                  }}
                >
                  <Icon size={20} />
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "14.5px",
                      fontWeight: 600,
                      color: isActive ? "#FFFFFF" : "#0F172A",
                      lineHeight: 1.3,
                    }}
                  >
                    {item.name}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: isActive ? "rgba(255,255,255,0.7)" : "#64748B",
                      marginTop: "2px",
                    }}
                  >
                    {item.subtitle}
                  </div>
                </div>
              </div>
              <ChevronRight
                size={16}
                style={{
                  color: isActive ? "#00AEEF" : "#94A3B8",
                  flexShrink: 0,
                }}
              />
            </Link>
          );
        })}
      </div>

      {/* Support Contact Box */}
      <div
        style={{
          marginTop: "24px",
          background: "#F8FAFC",
          border: "1px solid #E2E8F0",
          borderRadius: "14px",
          padding: "20px",
        }}
      >
        <h4
          style={{
            fontSize: "13.5px",
            fontWeight: 700,
            color: "#0F172A",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            margin: "0 0 12px 0",
          }}
        >
          Need Legal or Trade Help?
        </h4>
        <p
          style={{
            fontSize: "13px",
            color: "#64748B",
            lineHeight: 1.5,
            margin: "0 0 14px 0",
          }}
        >
          Our customer and dealer relations desk is here to clarify policies and assist your order.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <a
            href="tel:18002120192"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              fontSize: "13px",
              fontWeight: 600,
              color: "#0284C7",
              textDecoration: "none",
            }}
          >
            <Headphones size={15} /> 1800 212 0192
          </a>
          <a
            href="mailto:enquiry@rnvalves.com"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              fontSize: "13px",
              fontWeight: 500,
              color: "#475569",
              textDecoration: "none",
            }}
          >
            <Mail size={15} /> enquiry@rnvalves.com
          </a>
        </div>
      </div>
    </aside>
  );
}
