import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ISO Certifications & Quality Standards | RN Valves & Faucets",
  description:
    "Discover the ISO 9001 quality management certifications, awards, and rigorous testing standards behind RN Valves & Faucets products.",
  alternates: {
    canonical: "https://rnvalves.com/certificates",
  },
  openGraph: {
    title: "ISO Certifications & Quality Standards | RN Valves & Faucets",
    description:
      "Discover the ISO 9001 quality management certifications, awards, and rigorous testing standards behind RN Valves & Faucets products.",
    url: "https://rnvalves.com/certificates",
  },
};

export default function CertificatesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
