import type { Metadata } from "next";
import ContactUsPage from "@/app/contact-us/page";

export const metadata: Metadata = {
  title: "Enquire Now | RN Valves & Faucets",
  description:
    "Send your product, dealership, or bulk order enquiry to RN Valves & Faucets. Call our toll-free customer care at 1800-1234-0400.",
  alternates: {
    canonical: "https://rnvalves.com/enquire-now",
  },
  openGraph: {
    title: "Enquire Now | RN Valves & Faucets",
    description:
      "Send your product, dealership, or bulk order enquiry to RN Valves & Faucets. Call our toll-free customer care at 1800-1234-0400.",
    url: "https://rnvalves.com/enquire-now",
  },
};

export default function UserEnquiryPage() {
  return <ContactUsPage />;
}
