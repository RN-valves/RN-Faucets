import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us | Brass & PTMT Bath Fittings Manufacturer | RN Valves & Faucets",
  description:
    "Founded in 2000 by Rajeev Jain, RN Valves & Faucets is India's fastest growing modern bathroom solutions manufacturer with 7000+ products and 4800+ dealers.",
  alternates: {
    canonical: "https://rnvalves.com/about-us",
  },
  openGraph: {
    title: "About Us | RN Valves & Faucets",
    description:
      "Founded in 2000 by Rajeev Jain, RN Valves & Faucets is India's fastest growing modern bathroom solutions manufacturer with 7000+ products and 4800+ dealers.",
    url: "https://rnvalves.com/about-us",
  },
};

export default function AboutUsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
