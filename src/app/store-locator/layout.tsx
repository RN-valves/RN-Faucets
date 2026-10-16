import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Store & Dealer Locator | Find Nearest Outlet | RN Valves & Faucets",
  description:
    "Locate the nearest authorized RN Valves & Faucets dealer, distributor, or showroom across India from our network of 4,800+ partners.",
  alternates: {
    canonical: "https://rnvalves.com/store-locator",
  },
  openGraph: {
    title: "Store & Dealer Locator | RN Valves & Faucets",
    description:
      "Locate the nearest authorized RN Valves & Faucets dealer, distributor, or showroom across India from our network of 4,800+ partners.",
    url: "https://rnvalves.com/store-locator",
  },
};

export default function StoreLocatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
