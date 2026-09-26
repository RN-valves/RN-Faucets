import { NextResponse } from "next/server";
import { verifyRazorpayPaymentSignature } from "@/lib/razorpay";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import { sendOrderInvoiceEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderData,
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: "Payment verification parameters missing" },
        { status: 400 }
      );
    }

    const isValid = verifyRazorpayPaymentSignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
    });

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid payment signature" },
        { status: 400 }
      );
    }

    await connectDB();

    let rawId = orderData?.id ? orderData.id.replace(/-/g, "").replace(/ORD/i, "OD") : "";
    let legacyId = orderData?.legacyId;
    const numPart = parseInt(rawId.replace(/\D/g, "") || "0");

    if (!rawId || numPart >= 100000) {
      const highestSequential = await Order.findOne({
        $or: [
          { legacyId: { $gt: 0, $lt: 100000 } },
          { id: { $regex: /^RNOD\d{1,5}$/i } },
        ],
      })
        .sort({ legacyId: -1, createdAt: -1 })
        .lean();

      let maxNum = 829;
      if (highestSequential) {
        const idNum = parseInt(highestSequential.id?.replace(/\D/g, "") || "0");
        const legNum = highestSequential.legacyId || 0;
        const valid = Math.max(idNum < 100000 ? idNum : 0, legNum < 100000 ? legNum : 0);
        if (valid > maxNum) maxNum = valid;
      }
      legacyId = maxNum + 1;
      rawId = `RNOD${legacyId}`;
    }

    const orderId = rawId;

    const savedOrder = await Order.findOneAndUpdate(
      { $or: [{ id: orderId }, { uuid: orderData?.uuid }] },
      {
        ...orderData,
        id: orderId,
        legacyId: legacyId || undefined,
        paymentStatus: "Paid",
        paymentMethod: "Online Payment",
        status: "Processing",
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        orderDate:
          orderData?.orderDate ||
          new Date().toLocaleString("en-IN", {
            dateStyle: "short",
            timeStyle: "short",
          }),
      },
      { upsert: true, new: true }
    );

    // Send confirmation invoice email to customer and admin
    sendOrderInvoiceEmail(savedOrder).catch((err) =>
      console.error("Async invoice email error:", err)
    );

    return NextResponse.json({
      success: true,
      message: "Payment verified and order confirmed successfully",
      order: savedOrder,
    });
  } catch (error: any) {
    console.error("Error in Razorpay payment verification:", error);
    return NextResponse.json(
      { error: error.message || "Payment verification failed" },
      { status: 500 }
    );
  }
}
