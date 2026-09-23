import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Discount from "@/models/Discount";
import { requireAdminAuth } from "@/lib/security";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const discount = await Discount.findOne({ $or: [{ _id: id }, { id }] }).lean();

    if (!discount) return NextResponse.json({ error: "Discount not found" }, { status: 404 });
    return NextResponse.json(discount);
  } catch (error: any) {
    console.error("GET /api/discounts/[id] error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch discount" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminSession = await requireAdminAuth(request);
    if (!adminSession) {
      return NextResponse.json(
        { error: "Unauthorized. Admin privileges required to update discounts." },
        { status: 401 }
      );
    }

    await connectDB();
    const { id } = await params;
    const body = await request.json();

    if (body.name) {
      body.name = body.name.trim().toUpperCase();
    }

    const updated = await Discount.findOneAndUpdate(
      { $or: [{ _id: id }, { id }] },
      body,
      { new: true }
    ).lean();

    if (!updated) return NextResponse.json({ error: "Discount not found" }, { status: 404 });
    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("PUT /api/discounts/[id] error:", error);
    return NextResponse.json({ error: error.message || "Failed to update discount" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminSession = await requireAdminAuth(request);
    if (!adminSession) {
      return NextResponse.json(
        { error: "Unauthorized. Admin privileges required to delete discounts." },
        { status: 401 }
      );
    }

    await connectDB();
    const { id } = await params;
    const deleted = await Discount.findOneAndDelete({ $or: [{ _id: id }, { id }] });

    if (!deleted) return NextResponse.json({ error: "Discount not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE /api/discounts/[id] error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete discount" }, { status: 500 });
  }
}
