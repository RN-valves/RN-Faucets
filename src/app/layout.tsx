import type { Metadata } from "next";
import { Manrope, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import FloatingActionButtons from "@/components/FloatingActionButtons";
import AnalyticsLoader from "@/components/AnalyticsLoader";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://rnvalves.com"),
  alternates: {
    canonical: "https://rnvalves.com",
  },
  title: "RN Valves & Faucets | Trusted Bath Fittings Since 2000",
  description:
    "26 years, 5,000+ dealers, one promise: Built for Long Life. PTMT & CP faucets, showers, health faucets, valves and accessories under one roof.",
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
      "26 years, 5,000+ dealers, one promise: Built for Long Life. PTMT & CP faucets, showers, health faucets, valves and accessories under one roof.",
    url: "https://rnvalves.com",
    siteName: "RN Valves & Faucets",
    images: [
      {
        url: "/apple-touch-icon.png?v=4",
        width: 1200,
        height: 630,
        alt: "RN Valves & Faucets",
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
      "26 years, 5,000+ dealers, one promise: Built for Long Life. PTMT & CP faucets, showers, health faucets, valves and accessories under one roof.",
    images: ["/apple-touch-icon.png?v=4"],
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
      logo: "https://rnvalves.com/logo.png",
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
          telephone: "+91-1800-12340-0400",
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
        target: "https://rnvalves.com/search?q={search_term_string}",
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "WebPage",
      "@id": "https://rnvalves.com/#webpage",
      url: "https://rnvalves.com",
      name: "PTMT & CP Tap Manufacturer | Bathroom Fittings | RN Valves & Faucets",
      description:
        "RN Valves & Faucets – India's leading manufacturer of PTMT taps, CP taps, showers, valves, sensor faucets, and bathroom accessories.",
      isPartOf: { "@id": "https://rnvalves.com/#website" },
      about: { "@id": "https://rnvalves.com/#organization" },
      breadcrumb: {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://rnvalves.com",
          },
        ],
      },
    },
    {
      "@type": "LocalBusiness",
      "@id": "https://rnvalves.com/#localbusiness",
      name: "RN Valves & Faucets",
      image: "https://rnvalves.com/logo.png",
      url: "https://rnvalves.com",
      telephone: "+91-1800-12340-0400",
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
      paymentAccepted: "Cash, Credit Card, Bank Transfer",
      areaServed: {
        "@type": "Country",
        name: "India",
      },
    },
    {
      "@type": "Manufacturer",
      "@id": "https://rnvalves.com/#manufacturer",
      name: "RN Valves & Faucets",
      brand: {
        "@type": "Brand",
        name: "RN Valves & Faucets",
        logo: "https://rnvalves.com/logo.png",
        url: "https://rnvalves.com",
      },
      makesOffer: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Product",
            name: "PTMT Taps",
            description:
              "High Grade Engineering Polymer taps that are rust-resistant, corrosion-resistant with superior performance and smooth water flow.",
            category: "Bathroom Fittings",
            material: "PTMT (Poly Tetra Methylene Terephthalate)",
            brand: { "@type": "Brand", name: "RN Valves & Faucets" },
            url: "https://rnvalves.com",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Product",
            name: "CP Taps & Faucets",
            description:
              "Chrome Plated taps and faucets with luxury finish, corrosion-resistant nickel coating.",
            category: "Bathroom Fittings",
            material: "Chrome Plated Brass",
            brand: { "@type": "Brand", name: "RN Valves & Faucets" },
            url: "https://rnvalves.com",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Product",
            name: "Sensor Faucets",
            description:
              "RN Automatic Touchless Sensor Faucets for hygienic, hands-free water flow.",
            category: "Smart Bathroom Fittings",
            brand: { "@type": "Brand", name: "RN Valves & Faucets" },
            url: "https://rnvalves.com",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Product",
            name: "Showers & Overhead Showers",
            description:
              "Wide range of showers including overhead showers with adjustable water pressure settings.",
            category: "Bathroom Fittings",
            brand: { "@type": "Brand", name: "RN Valves & Faucets" },
            url: "https://rnvalves.com",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Product",
            name: "CP Bathroom Accessories",
            description:
              "Complete range of bathroom accessories including soap baskets, towel shelves, towel rings, paper holders across collections: Black Beauty, Stone Series, Rose Series, Gold Ceramic, and more.",
            category: "Bathroom Accessories",
            brand: { "@type": "Brand", name: "RN Valves & Faucets" },
            url: "https://rnvalves.com/cp-accessories",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Product",
            name: "Valves",
            description:
              "Durable plumbing valves for residential and commercial applications.",
            category: "Plumbing Hardware",
            brand: { "@type": "Brand", name: "RN Valves & Faucets" },
            url: "https://rnvalves.com",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Product",
            name: "Allied Products",
            description:
              "Teflon tape, tap cleaner and other allied plumbing products.",
            category: "Plumbing Accessories",
            brand: { "@type": "Brand", name: "RN Valves & Faucets" },
            url: "https://rnvalves.com/allied-product",
          },
        },
      ],
    },
    {
      "@type": "FAQPage",
      url: "https://rnvalves.com",
      mainEntity: [
        {
          "@type": "Question",
          name: "What products does RN Valves & Faucets manufacture?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "RN Valves & Faucets manufactures Brass & PTMT bath fittings including PTMT taps, CP taps, sensor faucets, showers, overhead showers, valves, bathroom accessories, and allied products. They offer 7000+ products.",
          },
        },
        {
          "@type": "Question",
          name: "Where is RN Valves & Faucets located?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "RN Valves & Faucets is located at B-68, Site-4, Sahibabad Industrial Area, Ghaziabad, Uttar Pradesh – 201010, India.",
          },
        },
        {
          "@type": "Question",
          name: "How can I become a dealer for RN Valves & Faucets?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "You can become an RN Valves & Faucets dealer by visiting https://rnvalves.com/contact-us or calling their toll-free number 1800 12340 0400. They have 4800+ distributors and dealers across India.",
          },
        },
        {
          "@type": "Question",
          name: "Are RN Valves & Faucets products ISO certified?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes, RN Valves & Faucets follows the ISO 9001 Quality Management System across design, research, development, and manufacturing.",
          },
        },
      ],
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://rnvalves.com/#breadcrumbs",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://rnvalves.com" },
        { "@type": "ListItem", position: 2, name: "About Us", item: "https://rnvalves.com/about-us" },
        { "@type": "ListItem", position: 3, name: "CP Accessories", item: "https://rnvalves.com/cp-accessories" },
        { "@type": "ListItem", position: 4, name: "Allied Products", item: "https://rnvalves.com/allied-product" },
        { "@type": "ListItem", position: 5, name: "Health & Hygiene", item: "https://rnvalves.com/health-hygiene" },
        { "@type": "ListItem", position: 6, name: "Catalogue", item: "https://rnvalves.com/catalogue" },
        { "@type": "ListItem", position: 7, name: "Contact Us", item: "https://rnvalves.com/contact-us" },
      ],
    },
  ],
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0f172a",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${plusJakartaSans.variable}`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        <meta charSet="utf-8" />
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

        {/* Structured Data (Schema.org JSON-LD) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchemaJsonLd) }}
        />
      </head>
      <body className={`${manrope.className} antialiased`} suppressHydrationWarning>
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
        <AnalyticsLoader />
      </body>
    </html>
  );
}
