import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import BPoint from "@/models/BPoint";
import { requireAdminAuth } from "@/lib/security";

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
    const deleted = await BPoint.findOneAndDelete({ id });
    if (!deleted) return NextResponse.json({ error: "Bullet point not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE /api/bpoints/[id] error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete bullet point" }, { status: 500 });
  }
}
