import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Enquiry from "@/models/Enquiry";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();

    const updated = await Enquiry.findOneAndUpdate(
      { $or: [{ _id: id }, { id }] },
      body,
      { new: true }
    ).lean();

    if (!updated) return NextResponse.json({ error: "Enquiry not found" }, { status: 404 });
    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("PUT /api/enquiries/[id] error:", error);
    return NextResponse.json({ error: error.message || "Failed to update enquiry lead" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const deleted = await Enquiry.findOneAndDelete({ $or: [{ _id: id }, { id }] });

    if (!deleted) return NextResponse.json({ error: "Enquiry not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE /api/enquiries/[id] error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete enquiry lead" }, { status: 500 });
  }
}
