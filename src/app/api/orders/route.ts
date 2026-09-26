import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import { requireAdminAuth, requireAuth, escapeRegex, checkRateLimit, getClientIp, sanitizeObject } from "@/lib/security";
import { sendOrderInvoiceEmail } from "@/lib/email";

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    const phone = searchParams.get("phone") || "";
    const email = searchParams.get("email") || "";
    const status = searchParams.get("status") || "All";

    const adminSession = await requireAdminAuth(request);
    const userSession = !adminSession ? await requireAuth(request) : null;

    // If not admin, restrict visibility strictly to the authenticated user's own orders
    if (!adminSession) {
      if (!userSession) {
        return NextResponse.json(
          { error: "Authentication required to view orders." },
          { status: 401 }
        );
      }

      // Customer view: only their own phone
      const userPhone = userSession.mobile.replace(/[^\d]/g, "").slice(-10);
      const orders = await Order.find({
        $or: [
          { customerPhone: userPhone },
          { "shippingAddress.phone": userPhone },
          { customerPhone: { $regex: userPhone } },
        ],
      })
        .sort({ createdAt: -1 })
        .lean();

      return NextResponse.json({
        orders,
        counts: {
          total: orders.length,
          pending: orders.filter((o) => o.status === "Pending").length,
          processing: orders.filter((o) => o.status === "Processing").length,
          shipped: orders.filter((o) => o.status === "Shipped").length,
          delivered: orders.filter((o) => o.status === "Delivered").length,
          cancelled: orders.filter((o) => o.status === "Cancelled").length,
        },
      });
    }

    // Admin view: full access with filters
    const query: any = {};

    if (phone) {
      const cleanPhone = escapeRegex(phone.replace(/[^\d]/g, "").slice(-10));
      query.$or = [
        { customerPhone: { $regex: cleanPhone, $options: "i" } },
        { "shippingAddress.phone": { $regex: cleanPhone, $options: "i" } },
      ];
    } else if (email) {
      const cleanEmail = escapeRegex(email);
      query.$or = [
        { customerEmail: { $regex: cleanEmail, $options: "i" } },
        { "shippingAddress.email": { $regex: cleanEmail, $options: "i" } },
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
    console.error("GET /api/orders error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rateCheck = checkRateLimit(`create-order:${ip}`, 15, 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Too many orders placed from this connection. Please wait a moment." },
        { status: 429 }
      );
    }

    await connectDB();
    const rawBody = await request.json();
    const body = sanitizeObject(rawBody);

    const orderId = body.id ? body.id.replace(/-/g, "").replace(/ORD/i, "OD") : `RNOD${Math.floor(10000 + Math.random() * 90000)}`;

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

    // Send confirmation & invoice email in background
    sendOrderInvoiceEmail(order).catch((err) =>
      console.error("Async invoice email error:", err)
    );

    return NextResponse.json(order, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/orders error:", error);
    return NextResponse.json({ error: error.message || "Failed to create order" }, { status: 500 });
  }
}
