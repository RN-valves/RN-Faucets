import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Blog from "@/models/Blog";
import { escapeRegex, sanitizeString, sanitizeObject } from "@/lib/security";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const q = sanitizeString(searchParams.get("q") || "", 80);

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
    return handleApiError(error, "GET /api/blogs");
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const rawBody = await request.json().catch(() => ({}));
    const body = sanitizeObject(rawBody);

    const title = sanitizeString(body.title, 200);
    if (!title) {
      return apiError("Blog title is required.", { status: 400 });
    }

    const slug =
      body.slug ? sanitizeString(body.slug, 120) : title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    const id = body.id || `blog-${Date.now().toString().slice(-6)}`;
    const publishedAt = body.publishedAt || new Date().toISOString().split("T")[0];

    const newBlog = await Blog.create({
      ...body,
      title,
      id,
      slug,
      publishedAt,
    });

    return NextResponse.json(newBlog, { status: 201 });
  } catch (error: any) {
    return handleApiError(error, "POST /api/blogs");
  }
}
