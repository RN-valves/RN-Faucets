import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us | Customer Care & Dealer Enquiries | RN Valves & Faucets",
  description:
    "Contact RN Valves & Faucets at B-68, Site-4, Sahibabad Industrial Area, Ghaziabad. Call Toll-Free Customer Care 1800 12340 0400 or Complaint No +91 9891201208.",
  alternates: {
    canonical: "https://rnvalves.com/contact-us",
  },
  openGraph: {
    title: "Contact Us | RN Valves & Faucets",
    description:
      "Contact RN Valves & Faucets at B-68, Site-4, Sahibabad Industrial Area, Ghaziabad. Call Toll-Free Customer Care 1800 12340 0400 or Complaint No +91 9891201208.",
    url: "https://rnvalves.com/contact-us",
  },
};

export default function ContactUsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
