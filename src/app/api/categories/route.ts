import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Category from "@/models/Category";

export async function GET() {
  try {
    await connectDB();
    const categories = await Category.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json(categories);
  } catch (error) {
    console.error("GET /api/categories error:", error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const id = body.id || `cat-${Date.now()}`;
    const slug = body.slug || body.name?.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");

    const category = new Category({
      ...body,
      id,
      slug,
      status: body.status || "Active",
      isVisibleWebsite: body.isVisibleWebsite !== undefined ? body.isVisibleWebsite : true,
    });
    await category.save();
    return NextResponse.json(category, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/categories error:", error);
    return NextResponse.json({ error: error.message || "Failed to create category" }, { status: 500 });
  }
}
