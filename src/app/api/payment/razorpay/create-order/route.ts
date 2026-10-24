import { NextResponse } from "next/server";
import { createRazorpayOrder } from "@/lib/razorpay";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount, receipt, notes } = body;

    await connectDB();

    let authoritativeAmount = Number(amount);
    let existingOrder: any = null;

    if (receipt && typeof receipt === "string") {
      existingOrder = await Order.findOne({
        $or: [{ id: receipt }, { uuid: receipt }],
      }).lean();

      if (existingOrder && Number(existingOrder.totalAmount) > 0) {
        authoritativeAmount = Number(existingOrder.totalAmount);
      }
    }

    if (!authoritativeAmount || isNaN(authoritativeAmount) || authoritativeAmount <= 0) {
      return NextResponse.json(
        { error: "Valid order amount is required" },
        { status: 400 }
      );
    }

    const razorpayOrder = await createRazorpayOrder({
      amount: authoritativeAmount,
      receipt: existingOrder?.id || receipt || `RN_${Date.now()}`,
      notes: notes || {},
    });

    if (existingOrder?._id) {
      await Order.findByIdAndUpdate(existingOrder._id, {
        $set: { razorpayOrderId: razorpayOrder.id },
      }).catch(() => {});
    }

    return NextResponse.json({
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount, // in paise
      currency: razorpayOrder.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID,
    });
  } catch (error: any) {
    console.error("Error creating Razorpay order:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create Razorpay order" },
      { status: 500 }
    );
  }
}
