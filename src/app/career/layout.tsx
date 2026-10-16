import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Careers at RN Valves & Faucets | Join Our Team",
  description:
    "Explore career opportunities in manufacturing, sales, engineering, and design at RN Valves & Faucets in Ghaziabad and across India.",
  alternates: {
    canonical: "https://rnvalves.com/career",
  },
  openGraph: {
    title: "Careers at RN Valves & Faucets | Join Our Team",
    description:
      "Explore career opportunities in manufacturing, sales, engineering, and design at RN Valves & Faucets in Ghaziabad and across India.",
    url: "https://rnvalves.com/career",
  },
};

export default function CareerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
