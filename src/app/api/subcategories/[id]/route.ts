import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Subcategory from "@/models/Subcategory";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const subcategory = await Subcategory.findOne({
      $or: [{ id }, { slug: id }],
    }).lean();

    if (!subcategory) return NextResponse.json({ error: "Subcategory not found" }, { status: 404 });
    return NextResponse.json(subcategory);
  } catch (error: any) {
    console.error("GET /api/subcategories/[id] error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch subcategory" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();

    if (body.name && !body.slug) {
      body.slug = body.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");
    }

    const updated = await Subcategory.findOneAndUpdate(
      { $or: [{ id }, { slug: id }] },
      body,
      { new: true }
    );
    if (!updated) return NextResponse.json({ error: "Subcategory not found" }, { status: 404 });
    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("PUT /api/subcategories/[id] error:", error);
    return NextResponse.json({ error: error.message || "Failed to update subcategory" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const deleted = await Subcategory.findOneAndDelete({ $or: [{ id }, { slug: id }] });
    if (!deleted) return NextResponse.json({ error: "Subcategory not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE /api/subcategories/[id] error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete subcategory" }, { status: 500 });
  }
}
