import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Blog from "@/models/Blog";
import { escapeRegex, requireAdminAuth, sanitizeObject } from "@/lib/security";
import { getOrSetCache, invalidateCache } from "@/lib/redis";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";

    if (!q) {
      const { data, cacheStatus } = await getOrSetCache(
        "rn:blogs:list:v1",
        600,
        async () => {
          await connectDB();
          const blogs = await Blog.find({}).sort({ createdAt: -1 }).lean();
          return { blogs, total: blogs.length };
        },
        300
      );
      return NextResponse.json(data, {
        headers: {
          "X-Cache": cacheStatus,
          "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600",
        },
      });
    }

    await connectDB();
    const query: any = {};
    if (q) {
      const safeQ = escapeRegex(q);
      query.$or = [
        { title: { $regex: safeQ, $options: "i" } },
        { category: { $regex: safeQ, $options: "i" } },
        { summary: { $regex: safeQ, $options: "i" } },
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
    const admin = await requireAdminAuth(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 401 });
    }

    await connectDB();
    const rawBody = await request.json();
    const body = sanitizeObject(rawBody);

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

    await invalidateCache(["rn:blogs:", "rn:home:"]);
    return NextResponse.json(newBlog, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/blogs error:", error);
    return NextResponse.json({ error: error.message || "Failed to create blog post" }, { status: 500 });
  }
}
