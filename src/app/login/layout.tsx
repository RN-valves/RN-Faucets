import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login | RN Valves & Faucets",
  description:
    "Sign in to your RN Valves & Faucets account.",
  alternates: {
    canonical: "https://rnvalves.com/login",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
