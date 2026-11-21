import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import Blog from "@/models/Blog";
import { requireAdminAuth, sanitizeObject } from "@/lib/security";
import { getOrSetCache, invalidateCache } from "@/lib/redis";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const decodedId = decodeURIComponent(id).trim();

    const { data, cacheStatus } = await getOrSetCache(
      `rn:blogs:item:v1:${decodedId.toLowerCase()}`,
      600,
      async () => {
        await connectDB();
        const orConditions: any[] = [{ slug: decodedId }, { id: decodedId }];
        if (mongoose.Types.ObjectId.isValid(decodedId)) {
          orConditions.push({ _id: decodedId });
        }
        const blog = await Blog.findOne({ $or: orConditions }).lean();
        return blog || null;
      },
      300
    );

    if (!data) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    return NextResponse.json(data, {
      headers: {
        "X-Cache": cacheStatus,
        "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600",
      },
    });
  } catch (error: any) {
    console.error("GET /api/blogs/[id] error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch blog" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdminAuth(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;
    const rawBody = await request.json();
    const body = sanitizeObject(rawBody);

    const orConditions: any[] = [{ id }, { slug: id }];
    if (mongoose.Types.ObjectId.isValid(id)) {
      orConditions.unshift({ _id: id });
    }

    const updated = await Blog.findOneAndUpdate(
      { $or: orConditions },
      body,
      { new: true }
    ).lean();

    if (!updated) return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    await invalidateCache(["rn:blogs:", "rn:home:"]);
    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("PUT /api/blogs/[id] error:", error);
    return NextResponse.json({ error: error.message || "Failed to update blog" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdminAuth(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;
    const orConditions: any[] = [{ id }, { slug: id }];
    if (mongoose.Types.ObjectId.isValid(id)) {
      orConditions.unshift({ _id: id });
    }
    const deleted = await Blog.findOneAndDelete({ $or: orConditions });

    if (!deleted) return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    await invalidateCache(["rn:blogs:", "rn:home:"]);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE /api/blogs/[id] error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete blog" }, { status: 500 });
  }
}
