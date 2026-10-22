import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import Payment from "@/models/Payment";
import { verifyRazorpayPaymentLinkSignature } from "@/lib/razorpay";
import { sendOrderInvoiceEmail } from "@/lib/email";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const razorpay_payment_id = url.searchParams.get("razorpay_payment_id") || "";
    const razorpay_payment_link_id = url.searchParams.get("razorpay_payment_link_id") || "";
    const razorpay_payment_link_reference_id =
      url.searchParams.get("razorpay_payment_link_reference_id") || "";
    const razorpay_payment_link_status =
      url.searchParams.get("razorpay_payment_link_status") || "";
    const razorpay_signature = url.searchParams.get("razorpay_signature") || "";

    if (!razorpay_payment_id || !razorpay_payment_link_id || !razorpay_signature) {
      return NextResponse.redirect(new URL("/checkout", request.url));
    }

    const isValid = verifyRazorpayPaymentLinkSignature({
      paymentLinkId: razorpay_payment_link_id,
      referenceId: razorpay_payment_link_reference_id,
      status: razorpay_payment_link_status,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
    });

    if (!isValid || razorpay_payment_link_status.toLowerCase() !== "paid") {
      return NextResponse.redirect(new URL("/checkout?error=payment_verification_failed", request.url));
    }

    await connectDB();

    const paymentDataJson = JSON.stringify({
      razorpay_payment_id,
      razorpay_payment_link_id,
      razorpay_payment_link_reference_id,
      razorpay_payment_link_status,
      razorpay_signature,
    });

    const order = await Order.findOneAndUpdate(
      {
        $or: [
          { pay_link_id: razorpay_payment_link_id },
          { uuid: razorpay_payment_link_reference_id },
          { id: razorpay_payment_link_reference_id },
        ],
      },
      {
        $set: {
          paymentStatus: "Paid",
          paymentMethod: "Online Payment",
          payment_term: "Prepaid",
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
          payment_data: paymentDataJson,
          status: "Processing",
        },
      },
      { new: true }
    );

    await Payment.updateMany(
      {
        $or: [
          { payLinkId: razorpay_payment_link_id },
          { gatewayPaymentId: razorpay_payment_link_reference_id },
        ],
      },
      {
        $set: {
          status: "paid",
          paymentData: paymentDataJson,
        },
      }
    );

    if (order) {
      sendOrderInvoiceEmail(order).catch((err) =>
        console.error("Callback invoice email error:", err)
      );
    }

    const successUrl = new URL("/order-success", request.url);
    if (order?.id) successUrl.searchParams.set("orderId", order.id);
    successUrl.searchParams.set("paymentId", razorpay_payment_id);
    return NextResponse.redirect(successUrl);
  } catch (error) {
    console.error("Razorpay Payment Link Callback Error:", error);
    return NextResponse.redirect(new URL("/order-success", request.url));
  }
}
