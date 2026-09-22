import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    const phone = searchParams.get("phone") || "";
    const email = searchParams.get("email") || "";
    const status = searchParams.get("status") || "All";

    const query: any = {};

    if (phone) {
      const cleanPhone = phone.replace(/[^\d]/g, "").slice(-10);
      query.$or = [
        { customerPhone: { $regex: cleanPhone, $options: "i" } },
        { "shippingAddress.phone": { $regex: cleanPhone, $options: "i" } },
      ];
    } else if (email) {
      query.$or = [
        { customerEmail: { $regex: email, $options: "i" } },
        { "shippingAddress.email": { $regex: email, $options: "i" } },
      ];
    } else if (q) {
      query.$or = [
        { id: { $regex: q, $options: "i" } },
        { customerName: { $regex: q, $options: "i" } },
        { customerPhone: { $regex: q, $options: "i" } },
        { customerEmail: { $regex: q, $options: "i" } },
        { courierPartner: { $regex: q, $options: "i" } },
        { trackingNumber: { $regex: q, $options: "i" } },
        { lrNumber: { $regex: q, $options: "i" } },
      ];
    }

    if (status !== "All") {
      query.status = status;
    }

    const orders = await Order.find(query).sort({ createdAt: -1 }).lean();

    const counts = {
      total: await Order.countDocuments(),
      pending: await Order.countDocuments({ status: "Pending" }),
      processing: await Order.countDocuments({ status: "Processing" }),
      shipped: await Order.countDocuments({ status: "Shipped" }),
      delivered: await Order.countDocuments({ status: "Delivered" }),
      cancelled: await Order.countDocuments({ status: "Cancelled" }),
    };

    return NextResponse.json({ orders, counts });
  } catch (error: any) {
    console.error("GET /api/orders error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const orderId = body.id || `RN-ORD-${Math.floor(10000 + Math.random() * 90000)}`;

    const order = await Order.create({
      ...body,
      id: orderId,
      status: body.status || "Pending",
      paymentStatus: body.paymentStatus || (body.paymentMethod === "Online Payment" ? "Paid" : "Pending"),
      orderDate: new Date().toLocaleString("en-IN", {
        dateStyle: "short",
        timeStyle: "short",
      }),
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/orders error:", error);
    return NextResponse.json({ error: error.message || "Failed to create order" }, { status: 500 });
  }
}
