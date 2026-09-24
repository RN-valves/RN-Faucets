import type { Metadata } from "next";
import "./globals.css";
import FloatingActionButtons from "@/components/FloatingActionButtons";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://rnvalves.com"),
  title: "RN Valves & Faucets | Luxury Bathware",
  description: "RN Valves & Faucets - Premium Bath Fittings, Mixers & Sanitaryware",
  icons: {
    icon: [
      { url: "/favicon.ico?v=3" },
      { url: "/favicon.png?v=3", type: "image/png" },
    ],
    shortcut: "/favicon.ico?v=3",
    apple: "/apple-touch-icon.png?v=3",
  },
  openGraph: {
    title: "RN Valves & Faucets | Luxury Bathware",
    description: "RN Valves & Faucets - Premium Bath Fittings, Mixers & Sanitaryware",
    url: "https://rnvalves.com",
    siteName: "RN Valves & Faucets",
    images: [
      {
        url: "/apple-touch-icon.png?v=3",
        width: 512,
        height: 512,
        alt: "RN Valves & Faucets",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "RN Valves & Faucets | Luxury Bathware",
    description: "RN Valves & Faucets - Premium Bath Fittings, Mixers & Sanitaryware",
    images: ["/apple-touch-icon.png?v=3"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico?v=3" sizes="any" />
        <link rel="icon" href="/favicon.png?v=3" type="image/png" />
        <link rel="shortcut icon" href="/favicon.ico?v=3" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png?v=3" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning>
        {children}
        <FloatingActionButtons />
      </body>
    </html>
  );
}
