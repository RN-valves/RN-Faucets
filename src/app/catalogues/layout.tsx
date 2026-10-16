import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Product Catalogues | Download PDF Brochures | RN Valves & Faucets",
  description:
    "View and download the latest RN Valves & Faucets product catalogues covering PTMT taps, CP faucets, showers, valves, and bathroom accessories.",
  alternates: {
    canonical: "https://rnvalves.com/catalogues",
  },
  openGraph: {
    title: "Product Catalogues | RN Valves & Faucets",
    description:
      "View and download the latest RN Valves & Faucets product catalogues covering PTMT taps, CP faucets, showers, valves, and bathroom accessories.",
    url: "https://rnvalves.com/catalogues",
  },
};

export default function CataloguesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
