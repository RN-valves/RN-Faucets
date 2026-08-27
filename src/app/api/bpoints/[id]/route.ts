import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import BPoint from "@/models/BPoint";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const deleted = await BPoint.findOneAndDelete({ id });
    if (!deleted) return NextResponse.json({ error: "Bullet point not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE /api/bpoints/[id] error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete bullet point" }, { status: 500 });
  }
}
