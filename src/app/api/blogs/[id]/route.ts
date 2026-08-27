import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Blog from "@/models/Blog";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();

    const updated = await Blog.findOneAndUpdate(
      { $or: [{ _id: id }, { id }, { slug: id }] },
      body,
      { new: true }
    ).lean();

    if (!updated) return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("PUT /api/blogs/[id] error:", error);
    return NextResponse.json({ error: error.message || "Failed to update blog" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const deleted = await Blog.findOneAndDelete({ $or: [{ _id: id }, { id }, { slug: id }] });

    if (!deleted) return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE /api/blogs/[id] error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete blog" }, { status: 500 });
  }
}
