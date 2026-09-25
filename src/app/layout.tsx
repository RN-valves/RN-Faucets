import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import FloatingActionButtons from "@/components/FloatingActionButtons";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://rnvalves.com"),
  title: "RN Valves & Faucets | Trusted Bath Fittings Since 2000",
  description:
    "26 years, 5,000+ dealers, one promise: Built for Long Life. PTMT & CP faucets, showers, health faucets, valves and accessories under one roof",
  keywords: [
    "RN Valves & Faucets",
    "PTMT Taps",
    "CP Faucets",
    "Bathroom Fittings",
    "Overhead Showers",
    "Health Faucets",
    "Sensor Faucets",
    "Plumbing Valves",
    "Sanitaryware India",
    "Luxury Bathroom Accessories",
  ],
  authors: [{ name: "RN Valves & Faucets", url: "https://rnvalves.com" }],
  creator: "RN Valves & Faucets",
  publisher: "RN Valves & Faucets",
  verification: {
    google: "tPKmwkwZ-WkpT3KzqghZpgpUY7o6ZBKumLQ6m3zEqyI",
  },
  icons: {
    icon: [
      { url: "/favicon.ico?v=3" },
      { url: "/favicon.png?v=3", type: "image/png" },
    ],
    shortcut: "/favicon.ico?v=3",
    apple: "/apple-touch-icon.png?v=3",
  },
  openGraph: {
    title: "RN Valves & Faucets | Trusted Bath Fittings Since 2000",
    description:
      "26 years, 5,000+ dealers, one promise: Built for Long Life. PTMT & CP faucets, showers, health faucets, valves and accessories under one roof",
    url: "https://rnvalves.com",
    siteName: "RN Valves & Faucets",
    images: [
      {
        url: "/apple-touch-icon.png?v=3",
        width: 512,
        height: 512,
        alt: "RN Valves & Faucets",
      },
      {
        url: "https://rnvalves.media/Catalogue/Banner/5.jpg",
        width: 1200,
        height: 630,
        alt: "RN Valves & Faucets Luxury Collection",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@RNValves",
    creator: "@RNValves",
    title: "RN Valves & Faucets | Trusted Bath Fittings Since 2000",
    description:
      "26 years, 5,000+ dealers, one promise: Built for Long Life. PTMT & CP faucets, showers, health faucets, valves and accessories under one roof",
    images: ["https://rnvalves.media/Catalogue/Banner/5.jpg"],
  },
};

const organizationSchemaJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://rnvalves.com/#organization",
      name: "RN Valves & Faucets",
      url: "https://rnvalves.com",
      logo: "https://rnvalves.com/apple-touch-icon.png?v=3",
      description:
        "India's fastest growing modern bathroom solutions company, specializing in Brass & PTMT bath fittings manufacturing with 7000+ products across India.",
      foundingDate: "2000",
      founder: {
        "@type": "Person",
        name: "Rajeev Jain",
        jobTitle: "Managing Director",
      },
      address: {
        "@type": "PostalAddress",
        streetAddress: "B-68, Site-4, Sahibabad Industrial Area",
        addressLocality: "Ghaziabad",
        addressRegion: "Uttar Pradesh",
        postalCode: "201010",
        addressCountry: "IN",
      },
      contactPoint: [
        {
          "@type": "ContactPoint",
          telephone: "+91-1800-1234-0400",
          contactType: "customer service",
          areaServed: "IN",
          availableLanguage: ["Hindi", "English"],
        },
        {
          "@type": "ContactPoint",
          telephone: "+91-98111-03377",
          contactType: "sales",
          areaServed: "IN",
        },
        {
          "@type": "ContactPoint",
          email: "enquiry@rnvalves.com",
          contactType: "general enquiry",
        },
      ],
      sameAs: [
        "https://www.facebook.com/rnvalvesandfaucets/",
        "https://www.instagram.com/rnvalvesandfaucets/",
        "https://www.linkedin.com/company/rn-valves-faucets/",
        "https://x.com/RNValves",
        "https://www.youtube.com/channel/UCpUUF6ZFL88S85IuSsHDRSQ/?sub_confirmation=1",
      ],
      numberOfEmployees: {
        "@type": "QuantitativeValue",
        value: 200,
      },
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "RN Valves & Faucets Product Catalogue",
        url: "https://rnvalves.com/catalogue",
      },
    },
    {
      "@type": "WebSite",
      "@id": "https://rnvalves.com/#website",
      url: "https://rnvalves.com",
      name: "RN Valves & Faucets",
      publisher: {
        "@id": "https://rnvalves.com/#organization",
      },
      potentialAction: {
        "@type": "SearchAction",
        target: "https://rnvalves.com/catalogue?q={search_term_string}",
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "LocalBusiness",
      "@id": "https://rnvalves.com/#localbusiness",
      name: "RN Valves & Faucets",
      image: "https://rnvalves.com/apple-touch-icon.png?v=3",
      url: "https://rnvalves.com",
      telephone: "+91-1800-1234-0400",
      email: "enquiry@rnvalves.com",
      address: {
        "@type": "PostalAddress",
        streetAddress: "B-68, Site-4, Sahibabad Industrial Area",
        addressLocality: "Ghaziabad",
        addressRegion: "Uttar Pradesh",
        postalCode: "201010",
        addressCountry: "IN",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: 28.6685,
        longitude: 77.4029,
      },
      openingHoursSpecification: {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        opens: "09:00",
        closes: "18:00",
      },
      priceRange: "₹₹",
      currenciesAccepted: "INR",
      paymentAccepted: "Cash, Credit Card, Bank Transfer, UPI",
      areaServed: {
        "@type": "Country",
        name: "India",
      },
    },
  ],
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

        {/* DNS Preconnects for high-speed tracking & asset delivery */}
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://connect.facebook.net" />
        <link rel="dns-prefetch" href="https://connect.facebook.net" />
        <link rel="preconnect" href="https://rnvalves.media" />
        <link rel="dns-prefetch" href="https://rnvalves.media" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />

        {/* Structured Data (Schema.org JSON-LD) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchemaJsonLd) }}
        />
      </head>
      <body suppressHydrationWarning>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-PQBC3DT"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>

        {/* Meta Pixel (noscript) */}
        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=7247974241981487&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>

        {children}
        <FloatingActionButtons />

        {/* Google Tag Manager (GTM) */}
        <Script
          id="gtm-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-PQBC3DT');`,
          }}
        />

        {/* Google Analytics 4 (GA4) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-WHNJBR6EKF"
          strategy="afterInteractive"
        />
        <Script
          id="ga4-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-WHNJBR6EKF');
`,
          }}
        />

        {/* Meta / Facebook Pixel */}
        <Script
          id="meta-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '7247974241981487');
fbq('track', 'PageView');
`,
          }}
        />
      </body>
    </html>
  );
}
