import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shopping Cart | RN Valves & Faucets",
  description:
    "Review the selected RN Valves & Faucets bathware and plumbing products in your shopping cart.",
  alternates: {
    canonical: "https://rnvalves.com/cart",
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function CartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
