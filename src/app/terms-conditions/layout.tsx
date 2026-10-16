import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions | RN Valves & Faucets",
  description:
    "Read the official terms and conditions governing the use of the RN Valves & Faucets website, dealer portal, and product purchases.",
  alternates: {
    canonical: "https://rnvalves.com/terms-conditions",
  },
  openGraph: {
    title: "Terms & Conditions | RN Valves & Faucets",
    description:
      "Read the official terms and conditions governing the use of the RN Valves & Faucets website, dealer portal, and product purchases.",
    url: "https://rnvalves.com/terms-conditions",
  },
};

export default function TermsConditionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
