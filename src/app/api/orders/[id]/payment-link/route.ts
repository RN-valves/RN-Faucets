import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import Payment from "@/models/Payment";
import { createRazorpayPaymentLink } from "@/lib/razorpay";
import { requireAdminAuth } from "@/lib/security";
import { getOrderSearchQuery } from "@/lib/orderUtils";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminSession = await requireAdminAuth(request);
    if (!adminSession) {
      return NextResponse.json({ error: "Admin authentication required." }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;
    const order = await Order.findOne(getOrderSearchQuery(id));

    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    if (order.paymentStatus === "Paid") {
      return NextResponse.json(
        { error: "This order is already marked as Paid." },
        { status: 400 }
      );
    }

    const paymentLink = await createRazorpayPaymentLink({
      amount: order.totalAmount,
      referenceId: `${order.uuid || order.id}-${Date.now().toString().slice(-4)}`,
      description: `RN Valves Order #${order.id}`,
      customer: {
        name: order.customerName || order.shippingAddress?.firstName || "Customer",
        contact: order.customerPhone || order.shippingAddress?.phone || "9999999999",
        email: order.customerEmail || order.shippingAddress?.email || "ecommerce@rnvalves.com",
      },
    });

    order.pay_link_id = paymentLink.id;
    order.pay_link_url = paymentLink.short_url;
    order.payment_data = JSON.stringify(paymentLink);
    await order.save();

    // Also record / update in Payment collection
    try {
      const numericOrderId = parseInt(String(order.id || "").replace(/\D/g, ""), 10) || order.legacyId || null;
      const lastPayment: any = await Payment.findOne().sort({ id: -1 }).lean();
      const nextPayId = (lastPayment?.id || 581) + 1;
      await Payment.findOneAndUpdate(
        { payLinkId: paymentLink.id },
        {
          $set: {
            orderId: numericOrderId,
            customerName: order.customerName || order.shippingAddress?.firstName || "Customer",
            payLinkId: paymentLink.id,
            shortUrl: paymentLink.short_url,
            mobile: order.customerPhone || order.shippingAddress?.phone || "",
            email: order.customerEmail || order.shippingAddress?.email || "",
            state: order.shippingAddress?.state || "",
            city: order.shippingAddress?.city || "",
            zipcode: order.shippingAddress?.pinCode || "",
            paymentGateway: "Razorpay",
            status: "Pending",
            paymentData: JSON.stringify(paymentLink),
            amount: order.totalAmount,
          },
          $setOnInsert: {
            id: nextPayId,
            paymentId: `PAY-${nextPayId}`,
          },
        },
        { upsert: true }
      );
    } catch (payRecordErr) {
      console.error("Payment record sync warning:", payRecordErr);
    }

    return NextResponse.json({
      success: true,
      pay_link_id: paymentLink.id,
      pay_link_url: paymentLink.short_url,
      order,
    });
  } catch (error: any) {
    console.error("Generate Payment Link Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate payment link." }, { status: 500 });
  }
}

