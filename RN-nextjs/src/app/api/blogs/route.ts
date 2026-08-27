import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Blog from "@/models/Blog";

const DEFAULT_MOCK_BLOGS = [
  {
    id: "blog-101",
    title: "10 Tips for Choosing the Perfect Faucet for Modern Bathrooms",
    slug: "tips-choosing-perfect-faucet",
    author: "RN Architectural Team",
    category: "Bathroom Design Guide",
    image: "https://hindware.com/_next/image?url=https%3A%2F%2Fhindwarestg.blob.core.windows.net%2Fcontainer1%2Fproducts%2FBathroom-1756100455419-1756463985636.webp&w=3840&q=75",
    summary: "Discover essential factors like water pressure, cartridge durability, and finish selection when upgrading bath fittings.",
    content: "When selecting faucets for modern homes, cartridge quality and brass composition play a pivotal role...",
    status: "Published",
    publishedAt: "2026-08-20",
  },
  {
    id: "blog-102",
    title: "How Glossy Chrome vs Matte Black Finishes Transform Space Aesthetics",
    slug: "chrome-vs-matte-black-finishes",
    author: "Design Studio",
    category: "Finish Trends",
    image: "https://hindware.com/_next/image?url=https%3A%2F%2Fhindwarestg.blob.core.windows.net%2Fcontainer1%2Fproducts%2FF410011GRT_thumbnail.png&w=2048&q=75",
    summary: "Compare classic reflective chrome with bold contemporary matte black finishes for luxury vanity counters.",
    content: "Matte black finishes create dramatic contrast, while high-lustre chrome brings timeless illumination...",
    status: "Published",
    publishedAt: "2026-08-15",
  },
];

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";

    const count = await Blog.countDocuments();
    if (count === 0) {
      await Blog.insertMany(DEFAULT_MOCK_BLOGS);
    }

    const query: any = {};
    if (q) {
      query.$or = [
        { title: { $regex: q, $options: "i" } },
        { category: { $regex: q, $options: "i" } },
        { summary: { $regex: q, $options: "i" } },
      ];
    }

    const blogs = await Blog.find(query).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ blogs, total: blogs.length });
  } catch (error: any) {
    console.error("GET /api/blogs error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch blogs" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();

    if (!body.title) {
      return NextResponse.json({ error: "Blog title is required." }, { status: 400 });
    }

    const slug = body.slug || body.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    const id = body.id || `blog-${Date.now().toString().slice(-6)}`;
    const publishedAt = body.publishedAt || new Date().toISOString().split("T")[0];

    const newBlog = await Blog.create({
      ...body,
      id,
      slug,
      publishedAt,
    });

    return NextResponse.json(newBlog, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/blogs error:", error);
    return NextResponse.json({ error: error.message || "Failed to create blog post" }, { status: 500 });
  }
}
