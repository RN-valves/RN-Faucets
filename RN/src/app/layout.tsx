import type { Metadata } from "next";
import "./globals.css";
import FloatingActionButtons from "@/components/FloatingActionButtons";

export const metadata: Metadata = {
  title: "Hindware",
  description: "Luxury Bathware",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <FloatingActionButtons />
      </body>
    </html>
  );
}
