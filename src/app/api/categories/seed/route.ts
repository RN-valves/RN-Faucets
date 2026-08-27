import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Category from "@/models/Category";

export const DUMMY_CATEGORIES = [
  {
    id: "cat-cp-faucets",
    uuid: "8f7a6b5c-4d3e-2f1a-0b9c-8d7e6f5a4b3c",
    name: "CP Faucets",
    slug: "cp-faucets",
    title: "Premium CP Faucets & Bathroom Mixers | RN Valves",
    keywords: "cp faucets, brass faucets, luxury taps, basin mixers, pillar taps",
    description: "Discover RN's range of high-grade Chrome Plated brass faucets engineered for precision, durability, and elegance.",
    productCount: 42,
    image: "/api/media/website/catalogue/categories/cat-cp-faucets/image.webp",
    banner: "/api/media/website/catalogue/categories/cat-cp-faucets/banner.webp",
    icon: "/api/media/website/catalogue/categories/cat-cp-faucets/icon.webp",
    content_id: "content-faucets",
    contentName: "Brass Bathware Systems",
    status: "Active",
    isVisibleWebsite: true,
    discount: 15,
    tax: 18,
    pdfCatalogue: "https://rnvalves.com/catalogues/cp-faucets-2025.pdf",
  },
  {
    id: "cat-showers",
    uuid: "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
    name: "Showers",
    slug: "showers",
    title: "Overhead, Hand & Body Jet Rain Showers | RN Bathware",
    keywords: "rain shower, hand shower, body jets, bathroom shower, overhead shower",
    description: "Experience soothing water flow with RN's advanced anti-clog overhead and hand showers.",
    productCount: 28,
    image: "/api/media/website/catalogue/categories/cat-showers/image.webp",
    banner: "/api/media/website/catalogue/categories/cat-showers/banner.webp",
    icon: "/api/media/website/catalogue/categories/cat-showers/icon.webp",
    content_id: "content-showers",
    contentName: "Shower & Wellness Systems",
    status: "Active",
    isVisibleWebsite: true,
    discount: 10,
    tax: 18,
    pdfCatalogue: "https://rnvalves.com/catalogues/showers-2025.pdf",
  },
  {
    id: "cat-ptmt-accessories",
    uuid: "9e8d7c6b-5a4f-3e2d-1c0b-9a8b7c6d5e4f",
    name: "PTMT Accessories",
    slug: "ptmt-accessories",
    title: "Heavy-Duty PTMT Polymer Faucets & Taps | RN Valves",
    keywords: "ptmt taps, polymer faucets, durable taps, corrosion free taps, ptmt fittings",
    description: "Unbreakable, rust-free PTMT polymer bath fittings designed for extreme water conditions and long life.",
    productCount: 35,
    image: "/api/media/website/catalogue/categories/cat-ptmt-accessories/image.webp",
    banner: "/api/media/website/catalogue/categories/cat-ptmt-accessories/banner.webp",
    icon: "/api/media/website/catalogue/categories/cat-ptmt-accessories/icon.webp",
    content_id: "content-ptmt",
    contentName: "PTMT Polymer Fittings",
    status: "Active",
    isVisibleWebsite: true,
    discount: 20,
    tax: 18,
    pdfCatalogue: "https://rnvalves.com/catalogues/ptmt-2025.pdf",
  },
  {
    id: "cat-bathroom-accessories",
    uuid: "3f2e1d0c-9b8a-7f6e-5d4c-3b2a1f0e9d8c",
    name: "Bathroom Accessories",
    slug: "bathroom-accessories",
    title: "Designer Stainless Steel & Brass Bathroom Accessories | RN",
    keywords: "towel rod, soap dish, robe hook, paper holder, bath accessories, shelf",
    description: "Complete your bathroom ensemble with premium stainless steel towel racks, soap dispensers, and glass shelves.",
    productCount: 19,
    image: "/api/media/website/catalogue/categories/cat-bathroom-accessories/image.webp",
    banner: "/api/media/website/catalogue/categories/cat-bathroom-accessories/banner.webp",
    icon: "/api/media/website/catalogue/categories/cat-bathroom-accessories/icon.webp",
    content_id: "content-accessories",
    contentName: "Bath & Sanitary Hardware",
    status: "Active",
    isVisibleWebsite: true,
    discount: 12,
    tax: 18,
    pdfCatalogue: "https://rnvalves.com/catalogues/accessories-2025.pdf",
  },
];

export async function GET() {
  try {
    await connectDB();
    for (const catData of DUMMY_CATEGORIES) {
      await Category.findOneAndUpdate({ id: catData.id }, catData, { upsert: true, new: true });
    }
    const categories = await Category.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, count: categories.length, categories });
  } catch (error: any) {
    console.error("GET /api/categories/seed error:", error);
    return NextResponse.json({ error: error.message || "Failed to seed categories" }, { status: 500 });
  }
}
