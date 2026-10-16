import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Checkout | RN Valves & Faucets",
  description:
    "Complete your order for genuine RN Valves & Faucets bathroom fittings and accessories.",
  alternates: {
    canonical: "https://rnvalves.com/checkout",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
