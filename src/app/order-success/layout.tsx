import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Order Confirmed | RN Valves & Faucets",
  description:
    "Thank you for your order with RN Valves & Faucets.",
  alternates: {
    canonical: "https://rnvalves.com/order-success",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function OrderSuccessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
