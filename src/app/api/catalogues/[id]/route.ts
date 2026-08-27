import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import CataloguePdf from "@/models/Catalogue";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    await CataloguePdf.findOneAndDelete({ id });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/catalogues/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete catalogue" }, { status: 500 });
  }
}
