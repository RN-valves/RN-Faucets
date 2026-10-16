import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Corporate Social Responsibility (CSR) | RN Valves & Faucets",
  description:
    "Learn about RN Valves & Faucets' commitment to water conservation, sustainable manufacturing, and community welfare initiatives across India.",
  alternates: {
    canonical: "https://rnvalves.com/corporate-social-responsibility",
  },
  openGraph: {
    title: "Corporate Social Responsibility (CSR) | RN Valves & Faucets",
    description:
      "Learn about RN Valves & Faucets' commitment to water conservation, sustainable manufacturing, and community welfare initiatives across India.",
    url: "https://rnvalves.com/corporate-social-responsibility",
  },
};

export default function CsrLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
