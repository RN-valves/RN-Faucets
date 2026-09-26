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

    const orderId =
      orderData?.id || `RN-ORD-${Math.floor(100000 + Math.random() * 900000)}`;

    const savedOrder = await Order.findOneAndUpdate(
      { id: orderId },
      {
        ...orderData,
        id: orderId,
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
