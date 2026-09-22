import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import { escapeRegex, sanitizeString, sanitizeObject, validateAdminAuth } from "@/lib/security";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const q = sanitizeString(searchParams.get("q") || "", 80);
    const phone = sanitizeString(searchParams.get("phone") || "", 30);
    const email = sanitizeString(searchParams.get("email") || "", 100);
    const status = sanitizeString(searchParams.get("status") || "All", 30);

    const query: any = {};

    if (phone) {
      const cleanPhone = phone.replace(/[^\d]/g, "").slice(-10);
      const safePhone = escapeRegex(cleanPhone);
      query.$or = [
        { customerPhone: { $regex: safePhone, $options: "i" } },
        { "shippingAddress.phone": { $regex: safePhone, $options: "i" } },
      ];
    } else if (email) {
      const safeEmail = escapeRegex(email);
      query.$or = [
        { customerEmail: { $regex: safeEmail, $options: "i" } },
        { "shippingAddress.email": { $regex: safeEmail, $options: "i" } },
      ];
    } else if (q) {
      const safeQ = escapeRegex(q);
      query.$or = [
        { id: { $regex: safeQ, $options: "i" } },
        { customerName: { $regex: safeQ, $options: "i" } },
        { customerPhone: { $regex: safeQ, $options: "i" } },
        { customerEmail: { $regex: safeQ, $options: "i" } },
        { courierPartner: { $regex: safeQ, $options: "i" } },
        { trackingNumber: { $regex: safeQ, $options: "i" } },
        { lrNumber: { $regex: safeQ, $options: "i" } },
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
    return handleApiError(error, "GET /api/orders");
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const rawBody = await request.json().catch(() => ({}));
    const body = sanitizeObject(rawBody);

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
    return handleApiError(error, "POST /api/orders");
  }
}
