import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Retail Customer Registration | RN Valves & Faucets",
  description:
    "Create your retail customer account with RN Valves & Faucets to explore bath fittings, place orders, and track shipments.",
  alternates: {
    canonical: "https://rnvalves.com/retail-user-registration",
  },
  openGraph: {
    title: "Retail Customer Registration | RN Valves & Faucets",
    description:
      "Create your retail customer account with RN Valves & Faucets to explore bath fittings, place orders, and track shipments.",
    url: "https://rnvalves.com/retail-user-registration",
  },
};

export default function RetailUserRegistrationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
