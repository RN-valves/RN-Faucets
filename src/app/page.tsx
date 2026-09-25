import type { Metadata } from "next";
import { connectDB } from "@/lib/mongodb";
import HomeSetting from "@/models/HomeSetting";
import Category from "@/models/Category";
import Product from "@/models/Product";
import Blog from "@/models/Blog";
import HomeClient from "@/components/home/HomeClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "RN Valves & Faucets | Trusted Bath Fittings Since 2000",
  description:
    "26 years, 5,000+ dealers, one promise: Built for Long Life. PTMT & CP faucets, showers, health faucets, valves and accessories under one roof",
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
        url: "/apple-touch-icon.png?v=3",
        width: 512,
        height: 512,
        alt: "RN Valves & Faucets",
      },
      {
        url: "https://rnvalves.media/Catalogue/Banner/5.jpg",
        width: 1200,
        height: 630,
        alt: "RN Valves & Faucets Luxury Bath Collection",
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

export default async function Home() {
  await connectDB();

  let initialHomeSetting: any = null;
  let initialCategories: any[] = [];
  let initialProducts: any[] = [];
  let initialBlogs: any[] = [];

  try {
    const settingDoc = await HomeSetting.findOne().lean();
    if (settingDoc) {
      initialHomeSetting = JSON.parse(JSON.stringify(settingDoc));
    }
  } catch (err) {
    console.error("Failed to fetch HomeSetting in SSR:", err);
  }

  try {
    const catDocs = await Category.find({
      status: { $ne: "Inactive" },
      isVisibleWebsite: { $ne: false },
      isVisible: { $ne: false },
    }).lean();
    if (catDocs && catDocs.length > 0) {
      initialCategories = JSON.parse(JSON.stringify(catDocs));
    }
  } catch (err) {
    console.error("Failed to fetch Categories in SSR:", err);
  }

  try {
    const prodDocs = await Product.find({
      status: { $ne: "Inactive" },
      isVisibleWebsite: { $ne: false },
      isVisible: { $ne: false },
    }).limit(60).lean();
    if (prodDocs && prodDocs.length > 0) {
      initialProducts = JSON.parse(JSON.stringify(prodDocs));
    }
  } catch (err) {
    console.error("Failed to fetch Products in SSR:", err);
  }

  try {
    const blogDocs = await Blog.find({ status: "Published" })
      .sort({ publishedAt: -1, createdAt: -1 })
      .limit(6)
      .lean();
    if (blogDocs && blogDocs.length > 0) {
      initialBlogs = JSON.parse(JSON.stringify(blogDocs));
    }
  } catch (err) {
    console.error("Failed to fetch Blogs in SSR:", err);
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
