import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const order = await Order.findOne({ $or: [{ _id: id }, { id }] }).lean();

    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    return NextResponse.json(order);
  } catch (error: any) {
    console.error("GET /api/orders/[id] error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch order" }, { status: 500 });
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

    const updated = await Order.findOneAndUpdate(
      { $or: [{ _id: id }, { id }] },
      body,
      { new: true }
    ).lean();

    if (!updated) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("PUT /api/orders/[id] error:", error);
    return NextResponse.json({ error: error.message || "Failed to update order" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const deleted = await Order.findOneAndDelete({ $or: [{ _id: id }, { id }] });

    if (!deleted) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE /api/orders/[id] error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete order" }, { status: 500 });
  }
}
