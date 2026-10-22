import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import Payment from "@/models/Payment";
import { getOrderSearchQuery } from "@/lib/orderUtils";
import { fetchRazorpayPaymentLink } from "@/lib/razorpay";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const order: any = await Order.findOne(getOrderSearchQuery(id)).lean();

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Dynamic Payment Enrichment from Payment collection
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
        if (!order.pay_link_id && paymentRecord.payLinkId) order.pay_link_id = paymentRecord.payLinkId;
        if (!order.pay_link_url && paymentRecord.shortUrl) order.pay_link_url = paymentRecord.shortUrl;
        if (!order.payment_key && (paymentRecord.paymentKey || paymentRecord.paymentId)) {
          order.payment_key = paymentRecord.paymentKey || paymentRecord.paymentId;
        }
        if (!order.payment_data && paymentRecord.paymentData) order.payment_data = paymentRecord.paymentData;
      }
    }

    // Live Razorpay Payment Link check if unpaid plink_ exists
    if (order.pay_link_id && order.pay_link_id.startsWith("plink_") && order.paymentStatus !== "Paid") {
      try {
        const liveLink = await fetchRazorpayPaymentLink(order.pay_link_id);
        if (liveLink) {
          const linkStatus = String(liveLink.status || "").toLowerCase();
          const linkPayments = Array.isArray(liveLink.payments) ? liveLink.payments : [];
          const capturedPayment =
            linkPayments.find((p: any) => p.status === "captured" || p.status === "paid") ||
            linkPayments[0];

          if (linkStatus === "paid" || (liveLink.amount_paid && liveLink.amount_paid >= liveLink.amount)) {
            const rzpPayId = capturedPayment?.payment_id || order.razorpayPaymentId || "";
            const updatedFields: Record<string, any> = {
              paymentStatus: "Paid",
              pay_link_url: liveLink.short_url || order.pay_link_url || "",
              payment_data: JSON.stringify(liveLink),
            };
            if (rzpPayId) {
              updatedFields.razorpayPaymentId = rzpPayId;
              updatedFields.payment_key = rzpPayId;
            }
            await Order.updateOne({ _id: order._id }, { $set: updatedFields });
            Object.assign(order, updatedFields);
          } else {
            order.pay_link_url = liveLink.short_url || order.pay_link_url || "";
            order.payment_data = JSON.stringify(liveLink);
          }
        }
      } catch {}
    }

    return NextResponse.json({
      id: order.id,
      uuid: order.uuid,
      customerName: order.customerName || order.shippingAddress?.firstName || "Customer",
      totalAmount: order.totalAmount,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      pay_link_id: order.pay_link_id || order.razorpayOrderId || "",
      pay_link_url: order.pay_link_url || "",
      razorpayOrderId: order.razorpayOrderId || "",
      razorpayPaymentId: order.razorpayPaymentId || "",
      payment_key: order.payment_key || "",
      payment_data: order.payment_data || "",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to load payment status" }, { status: 500 });
  }
}
