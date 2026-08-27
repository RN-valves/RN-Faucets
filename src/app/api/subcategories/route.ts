import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Subcategory from "@/models/Subcategory";

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");

    const filter: Record<string, unknown> = {};
    if (categoryId) filter.categoryId = categoryId;

    const subcategories = await Subcategory.find(filter).sort({ displayOrder: 1, createdAt: -1 }).lean();
    return NextResponse.json(subcategories);
  } catch (error) {
    console.error("GET /api/subcategories error:", error);
    return NextResponse.json({ error: "Failed to fetch subcategories" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const slug = body.slug || (body.name ? body.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") : `sub-${Date.now()}`);
    const id = body.id || `SUB-${Date.now()}`;

    const subcategory = new Subcategory({
      ...body,
      id,
      slug,
    });
    await subcategory.save();
    return NextResponse.json(subcategory, { status: 201 });
  } catch (error) {
    console.error("POST /api/subcategories error:", error);
    return NextResponse.json({ error: "Failed to create subcategory" }, { status: 500 });
  }
}
