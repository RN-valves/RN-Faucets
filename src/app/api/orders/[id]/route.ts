import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import { requireAdminAuth, requireAuth } from "@/lib/security";
import { sendOrderStatusEmail } from "@/lib/email";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const order = await Order.findOne({ $or: [{ _id: id }, { id }] }).lean();

    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    const adminSession = await requireAdminAuth(request);
    if (!adminSession) {
      const userSession = await requireAuth(request);
      if (!userSession) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const userPhone = userSession.mobile.replace(/[^\d]/g, "").slice(-10);
      const isOwner =
        order.customerPhone?.includes(userPhone) ||
        order.shippingAddress?.phone?.includes(userPhone);

      if (!isOwner) {
        return NextResponse.json({ error: "Forbidden. You can only view your own orders." }, { status: 403 });
      }
    }

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
    const adminSession = await requireAdminAuth(request);
    if (!adminSession) {
      return NextResponse.json(
        { error: "Unauthorized. Admin privileges required to update orders." },
        { status: 401 }
      );
    }

    await connectDB();
    const { id } = await params;
    const body = await request.json();

    const previousOrder = await Order.findOne({ $or: [{ _id: id }, { id }] }).lean();

    const updated = await Order.findOneAndUpdate(
      { $or: [{ _id: id }, { id }] },
      body,
      { new: true }
    ).lean();

    if (!updated) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    // If status changed or updated, send status update email in background
    if (body.status && (!previousOrder || previousOrder.status !== body.status)) {
      sendOrderStatusEmail(updated, body.status).catch((err) =>
        console.error("Async status update email error:", err)
      );
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("PUT /api/orders/[id] error:", error);
    return NextResponse.json({ error: error.message || "Failed to update order" }, { status: 500 });
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
        { error: "Unauthorized. Admin privileges required to delete orders." },
        { status: 401 }
      );
    }

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
