import Header from "@/components/Header";
import FooterSection from "@/components/FooterSection";
import BusinessUserRegistrationSection from "@/components/BusinessUserRegistrationSection";

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
