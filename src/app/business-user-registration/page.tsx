import type { Metadata } from "next";
import Header from "@/components/Header";
import FooterSection from "@/components/FooterSection";
import BusinessUserRegistrationSection from "@/components/BusinessUserRegistrationSection";

export const metadata: Metadata = {
  title: "Dealer & Business Registration | RN Valves & Faucets",
  description:
    "Register as an authorized dealer, distributor, or business partner with RN Valves & Faucets across India.",
  alternates: {
    canonical: "https://rnvalves.com/business-user-registration",
  },
  openGraph: {
    title: "Dealer & Business Registration | RN Valves & Faucets",
    description:
      "Register as an authorized dealer, distributor, or business partner with RN Valves & Faucets across India.",
    url: "https://rnvalves.com/business-user-registration",
  },
};

export default function BusinessUserRegistrationPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        width: "100%",
        background: "#ffffff",
        overflowX: "hidden",
      }}
    >
      <Header />

      <section
        data-header-theme="light"
        style={{
          width: "100%",
          padding: "118px 0 72px",
          boxSizing: "border-box",
          background: "#ffffff",
        }}
      >
        <BusinessUserRegistrationSection />
      </section>

      <FooterSection />
    </main>
  );
}
