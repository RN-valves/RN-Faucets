import { NextResponse } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import Payment from "@/models/Payment";
import { sendOrderInvoiceEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-razorpay-signature") || "";
    const webhookSecret =
      process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET || "";

    if (!signature || !webhookSecret) {
      return NextResponse.json({ error: "Missing webhook signature or secret" }, { status: 400 });
    }

    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expectedSignature);
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
    }

    const event = JSON.parse(rawBody);
    const eventType = String(event?.event || "");

    if (
      eventType !== "payment_link.paid" &&
      eventType !== "payment.captured" &&
      eventType !== "order.paid"
    ) {
      return NextResponse.json({ received: true, ignored: eventType });
    }

    await connectDB();

    const paymentEntity = event?.payload?.payment?.entity || {};
    const paymentLinkEntity = event?.payload?.payment_link?.entity || {};
    const orderEntity = event?.payload?.order?.entity || {};

    const paymentId = paymentEntity.id || "";
    const paymentLinkId = paymentLinkEntity.id || "";
    const referenceId =
      paymentLinkEntity.reference_id ||
      orderEntity.receipt ||
      paymentEntity.notes?.order_id ||
      "";
    const rzpOrderId = paymentEntity.order_id || orderEntity.id || "";

    const matchClauses: any[] = [];
    if (paymentLinkId) matchClauses.push({ pay_link_id: paymentLinkId });
    if (referenceId) {
      matchClauses.push({ uuid: referenceId }, { id: referenceId });
    }
    if (rzpOrderId) matchClauses.push({ razorpayOrderId: rzpOrderId });

    if (matchClauses.length === 0) {
      return NextResponse.json({ received: true, matched: false });
    }

    const existingOrder: any = await Order.findOne({ $or: matchClauses }).lean();
    if (!existingOrder) {
      return NextResponse.json({ received: true, matched: false });
    }

    const wasAlreadyPaid = existingOrder.paymentStatus === "Paid";

    const updatedOrder = await Order.findByIdAndUpdate(
      existingOrder._id,
      {
        $set: {
          paymentStatus: "Paid",
          paymentMethod: "Online Payment",
          payment_term: "Prepaid",
          ...(paymentId ? { razorpayPaymentId: paymentId, payment_key: paymentId } : {}),
          status:
            existingOrder.status && existingOrder.status !== "Pending"
              ? existingOrder.status
              : "Processing",
        },
      },
      { new: true }
    );

    await Payment.updateMany(
      {
        $or: [
          ...(paymentLinkId ? [{ payLinkId: paymentLinkId }] : []),
          ...(referenceId ? [{ gatewayPaymentId: referenceId }] : []),
          ...(rzpOrderId ? [{ payLinkId: rzpOrderId }] : []),
        ],
      },
      {
        $set: {
          status: "paid",
          ...(paymentId ? { paymentKey: paymentId } : {}),
        },
      }
    );

    if (updatedOrder && !wasAlreadyPaid) {
      sendOrderInvoiceEmail(updatedOrder).catch((err) =>
        console.error("Webhook invoice email error:", err)
      );
    }

    return NextResponse.json({ received: true, orderId: updatedOrder?.id });
  } catch (err: any) {
    console.error("POST /api/payment/razorpay/webhook error:", err);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
