import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import { createRazorpayPaymentLink } from "@/lib/razorpay";
import { requireAdminAuth } from "@/lib/security";

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
    const order = await Order.findOne({ $or: [{ _id: id }, { id }] });

    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    const paymentLink = await createRazorpayPaymentLink({
      amount: order.totalAmount,
      referenceId: order.uuid || order.id,
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
