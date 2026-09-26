import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import Payment from "@/models/Payment";
import Product from "@/models/Product";
import { requireAdminAuth, requireAuth } from "@/lib/security";
import { sendOrderStatusEmail } from "@/lib/email";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const order: any = await Order.findOne({ $or: [{ _id: id }, { id }] }).lean();

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

    // Dynamic Payment Enrichment from Payment collection (matching PHP logic)
    const numericId = parseInt(order.id?.replace(/\D/g, "") || "") || order.legacyId || null;
    const paymentQueries: any[] = [];

    if (order.pay_link_id) paymentQueries.push({ payLinkId: order.pay_link_id });
    if (order.payment_key) {
      paymentQueries.push(
        { paymentKey: order.payment_key },
        { paymentId: order.payment_key },
        { gatewayPaymentId: order.payment_key }
      );
    }
    if (order.razorpayPaymentId) {
      paymentQueries.push(
        { paymentKey: order.razorpayPaymentId },
        { paymentId: order.razorpayPaymentId },
        { gatewayPaymentId: order.razorpayPaymentId }
      );
    }
    if (order.uuid) {
      paymentQueries.push({ paymentKey: order.uuid }, { payLinkId: order.uuid });
    }
    if (numericId) {
      paymentQueries.push({ orderId: numericId });
    }

    if (paymentQueries.length > 0) {
      const paymentRecord = await Payment.findOne({ $or: paymentQueries }).lean();
      if (paymentRecord) {
        if (!order.pay_link_id && paymentRecord.payLinkId) {
          order.pay_link_id = paymentRecord.payLinkId;
        }
        if (!order.pay_link_url && paymentRecord.shortUrl) {
          order.pay_link_url = paymentRecord.shortUrl;
        }
        if (!order.payment_key && (paymentRecord.paymentKey || paymentRecord.paymentId)) {
          order.payment_key = paymentRecord.paymentKey || paymentRecord.paymentId;
        }
        if (!order.payment_data && paymentRecord.paymentData) {
          order.payment_data = paymentRecord.paymentData;
        }
      }
    }

    // Dynamic Product SKU Code Enrichment (matching PHP Product SKU lookup)
    if (Array.isArray(order.items) && order.items.length > 0) {
      const productIds = order.items.map((it: any) => it.id).filter(Boolean);
      if (productIds.length > 0) {
        const products = await Product.find({
          $or: [
            { id: { $in: productIds } },
            { _id: { $in: productIds.filter((pid: any) => typeof pid === "string" && pid.length === 24) } },
          ],
        })
          .select("id code name size onlyProductWtGm")
          .lean();

        const productMap = new Map<string, any>();
        for (const p of products) {
          if (p.id) productMap.set(p.id.toString(), p);
          if (p._id) productMap.set(p._id.toString(), p);
        }

        order.items = order.items.map((item: any) => {
          const matched = item.id ? productMap.get(item.id.toString()) : null;
          return {
            ...item,
            code: matched?.code || item.code || item.id,
            size: item.size || matched?.size || "—",
            lbhWeight: item.lbhWeight || matched?.onlyProductWtGm || 0,
          };
        });
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
