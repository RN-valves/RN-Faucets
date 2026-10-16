import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | RN Valves & Faucets",
  description:
    "Read the RN Valves & Faucets privacy policy detailing how we collect, protect, and use your personal and business information.",
  alternates: {
    canonical: "https://rnvalves.com/privacy-policy",
  },
  openGraph: {
    title: "Privacy Policy | RN Valves & Faucets",
    description:
      "Read the RN Valves & Faucets privacy policy detailing how we collect, protect, and use your personal and business information.",
    url: "https://rnvalves.com/privacy-policy",
  },
};

export default function PrivacyPolicyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
