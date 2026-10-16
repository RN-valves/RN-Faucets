import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Return & Refund Policy | RN Valves & Faucets",
  description:
    "Review the return, replacement, warranty, and refund policy for RN Valves & Faucets bathware and plumbing products.",
  alternates: {
    canonical: "https://rnvalves.com/return-refund-policy",
  },
  openGraph: {
    title: "Return & Refund Policy | RN Valves & Faucets",
    description:
      "Review the return, replacement, warranty, and refund policy for RN Valves & Faucets bathware and plumbing products.",
    url: "https://rnvalves.com/return-refund-policy",
  },
};

export default function ReturnRefundPolicyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
