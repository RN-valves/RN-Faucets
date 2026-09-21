import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Blog from "@/models/Blog";

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";

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
