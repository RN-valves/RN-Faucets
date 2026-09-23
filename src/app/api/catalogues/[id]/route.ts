import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import CataloguePdf from "@/models/Catalogue";
import { requireAdminAuth } from "@/lib/security";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminSession = await requireAdminAuth(request);
    if (!adminSession) {
      return NextResponse.json(
        { error: "Unauthorized. Admin privileges required to delete catalogues." },
        { status: 401 }
      );
    }

    await connectDB();
    const { id } = await params;
    await CataloguePdf.findOneAndDelete({ id });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/catalogues/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete catalogue" }, { status: 500 });
  }
}
