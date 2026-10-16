import type { Metadata } from "next";
import { connectDB } from "@/lib/mongodb";
import HomeSetting from "@/models/HomeSetting";
import Category from "@/models/Category";
import Product from "@/models/Product";
import Blog from "@/models/Blog";
import HomeClient from "@/components/home/HomeClient";

export const revalidate = 300; // ISR: Revalidate in background every 5 minutes

export const metadata: Metadata = {
  title: "RN Valves & Faucets | Trusted Bath Fittings Since 2000",
  description:
    "26 years, 5,000+ dealers, one promise: Built for Long Life. PTMT & CP faucets, showers, health faucets, valves and accessories under one roof",
  alternates: {
    canonical: "https://rnvalves.com",
  },
  keywords: [
    "PTMT Taps Manufacturer",
    "CP Faucets",
    "Bathroom Fittings India",
    "Overhead Showers",
    "Health Faucets",
    "Sensor Faucets",
    "Plumbing Valves",
    "RN Valves & Faucets",
  ],
  openGraph: {
    title: "RN Valves & Faucets | Trusted Bath Fittings Since 2000",
    description:
      "26 years, 5,000+ dealers, one promise: Built for Long Life. PTMT & CP faucets, showers, health faucets, valves and accessories under one roof",
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
      "26 years, 5,000+ dealers, one promise: Built for Long Life. PTMT & CP faucets, showers, health faucets, valves and accessories under one roof",
    images: ["/apple-touch-icon.png?v=4"],
  },
};

export default async function Home() {
  let initialHomeSetting: any = null;
  let initialCategories: any[] = [];
  let initialProducts: any[] = [];
  let initialBlogs: any[] = [];

  try {
    await connectDB();

    const [settingRes, catRes, prodRes, blogRes] = await Promise.allSettled([
      HomeSetting.findOne().lean(),
      Category.find({
        status: { $ne: "Inactive" },
        isVisibleWebsite: { $ne: false },
        isVisible: { $ne: false },
      }).lean(),
      Product.find({
        status: { $ne: "Inactive" },
        isVisibleWebsite: { $ne: false },
        isVisible: { $ne: false },
      })
        .limit(60)
        .lean(),
      Blog.find({ status: "Published" })
        .select("-content")
        .sort({ publishedAt: -1, createdAt: -1 })
        .limit(6)
        .lean(),
    ]);

    if (settingRes.status === "fulfilled" && settingRes.value) {
      initialHomeSetting = JSON.parse(JSON.stringify(settingRes.value));
    }
    if (catRes.status === "fulfilled" && catRes.value?.length) {
      initialCategories = JSON.parse(JSON.stringify(catRes.value));
    }
    if (prodRes.status === "fulfilled" && prodRes.value?.length) {
      initialProducts = JSON.parse(JSON.stringify(prodRes.value));
    }
    if (blogRes.status === "fulfilled" && blogRes.value?.length) {
      initialBlogs = JSON.parse(JSON.stringify(blogRes.value));
    }
  } catch (err) {
    console.error("Database connection error in Home page:", err);
  }

  return (
    <HomeClient
      initialHomeSetting={initialHomeSetting}
      initialCategories={initialCategories}
      initialProducts={initialProducts}
      initialBlogs={initialBlogs}
    />
  );
}
