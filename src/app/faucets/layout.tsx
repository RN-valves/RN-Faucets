import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "All Faucets, Showers & Bath Fittings | RN Valves & Faucets",
  description:
    "Browse 7,000+ Brass & PTMT bath fittings, CP faucets, sensor taps, overhead showers, health faucets, valves, and accessories by RN Valves & Faucets.",
  alternates: {
    canonical: "https://rnvalves.com/faucets",
  },
  openGraph: {
    title: "All Faucets, Showers & Bath Fittings | RN Valves & Faucets",
    description:
      "Browse 7,000+ Brass & PTMT bath fittings, CP faucets, sensor taps, overhead showers, health faucets, valves, and accessories by RN Valves & Faucets.",
    url: "https://rnvalves.com/faucets",
  },
};

export default function FaucetsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
