import { NextResponse } from "next/server";
import { verifyRazorpayPaymentSignature } from "@/lib/razorpay";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import User from "@/models/User";
import { getNextAtomicOrderIdentity, getNextAtomicPaymentIdentity } from "@/models/Counter";
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

    let rawId = orderData?.id ? String(orderData.id).replace(/-/g, "").replace(/ORD/i, "OD") : "";
    let legacyId = orderData?.legacyId;
    const numPart = parseInt(rawId.replace(/\D/g, "") || "0", 10);

    const matchConditions: any[] = [{ razorpayOrderId: razorpay_order_id }];
    if (rawId && numPart < 100000) {
      matchConditions.unshift({ id: rawId });
    }
    if (orderData?.uuid) {
      matchConditions.push({ uuid: orderData.uuid });
    }

    const existingOrder: any = await Order.findOne({ $or: matchConditions }).lean();

    if (existingOrder) {
      rawId = existingOrder.id;
      legacyId = existingOrder.legacyId;
    } else if (!rawId || numPart >= 100000) {
      const seq = await getNextAtomicOrderIdentity();
      rawId = seq.id;
      legacyId = seq.legacyId;
    }

    const orderId = rawId;
    const wasAlreadyPaid = existingOrder?.paymentStatus === "Paid";

    // Lookup user by phone for email and GST enrichment (read-only)
    let customerEmail = existingOrder?.customerEmail || orderData?.customerEmail;
    let gstNumber = existingOrder?.gstNumber || orderData?.gstNumber;
    let businessName = existingOrder?.businessName || orderData?.businessName;

    const lookupPhone = existingOrder?.customerPhone || orderData?.customerPhone;
    if (lookupPhone) {
      const cleanPhone = String(lookupPhone).replace(/\D/g, "").slice(-10);
      const userDoc: any = await User.findOne({
        $or: [
          { mobile: cleanPhone },
          { mobile: `+91${cleanPhone}` },
          { mobile: `91${cleanPhone}` },
        ],
      }).lean();

      if (userDoc) {
        if ((!customerEmail || customerEmail.includes("noreply")) && userDoc.email) {
          customerEmail = userDoc.email;
        }
        if (!gstNumber && userDoc.gstNumber) {
          gstNumber = userDoc.gstNumber;
        }
        if (!businessName && userDoc.businessName) {
          businessName = userDoc.businessName;
        }
      }
    }

    // Fetch full Razorpay payment details and verify paid amount matches authoritative order total
    let paymentDataJson = "";
    let rzpPaidAmountRupees: number | null = null;
    try {
      const rzpKey = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";
      const rzpSecret = process.env.RAZORPAY_KEY_SECRET || "";
      if (rzpKey && rzpSecret) {
        const auth = Buffer.from(`${rzpKey}:${rzpSecret}`).toString("base64");
        const payRes = await fetch(`https://api.razorpay.com/v1/payments/${encodeURIComponent(razorpay_payment_id)}`, {
          headers: { Authorization: `Basic ${auth}` },
        });
        if (payRes.ok) {
          const payDetails = await payRes.json();
          paymentDataJson = JSON.stringify(payDetails);
          if (payDetails.order_id && payDetails.order_id !== razorpay_order_id) {
            return NextResponse.json(
              { error: "Razorpay payment order_id mismatch" },
              { status: 400 }
            );
          }
          if (typeof payDetails.amount === "number") {
            rzpPaidAmountRupees = Math.round(payDetails.amount / 100);
          }
        }
      }
    } catch (payErr) {
      console.error("Failed to fetch Razorpay payment details:", payErr);
    }

    const expectedTotal = Number(existingOrder?.totalAmount || orderData?.totalAmount || 0);
    if (
      rzpPaidAmountRupees !== null &&
      expectedTotal > 0 &&
      Math.abs(rzpPaidAmountRupees - Math.round(expectedTotal)) > 1
    ) {
      return NextResponse.json(
        { error: `Paid amount (₹${rzpPaidAmountRupees}) does not match order total (₹${expectedTotal}).` },
        { status: 400 }
      );
    }

    const updateSet: Record<string, any> = existingOrder
      ? {
          customerEmail: customerEmail || existingOrder.customerEmail || "",
          gstNumber: gstNumber || existingOrder.gstNumber || "",
          businessName: businessName || existingOrder.businessName || "",
          paymentStatus: "Paid",
          paymentMethod: "Online Payment",
          payment_term: "Prepaid",
          payment_key: razorpay_payment_id,
          pay_link_id: existingOrder.pay_link_id || orderData?.pay_link_id || razorpay_order_id,
          pay_link_url:
            existingOrder.pay_link_url ||
            orderData?.pay_link_url ||
            `https://dashboard.razorpay.com/app/payments/${razorpay_payment_id}`,
          ...(paymentDataJson ? { payment_data: paymentDataJson } : {}),
          status: existingOrder.status === "Pending" ? "Processing" : existingOrder.status || "Processing",
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
        }
      : {
          ...orderData,
          id: orderId,
          legacyId: legacyId || undefined,
          totalAmount: rzpPaidAmountRupees ?? expectedTotal,
          customerEmail: customerEmail || orderData?.customerEmail || "",
          gstNumber: gstNumber || orderData?.gstNumber || "",
          businessName: businessName || orderData?.businessName || "",
          paymentStatus: "Paid",
          paymentMethod: "Online Payment",
          payment_term: "Prepaid",
          payment_key: razorpay_payment_id,
          pay_link_id: orderData?.pay_link_id || razorpay_order_id,
          pay_link_url:
            orderData?.pay_link_url ||
            `https://dashboard.razorpay.com/app/payments/${razorpay_payment_id}`,
          ...(paymentDataJson ? { payment_data: paymentDataJson } : {}),
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
        };

    const savedOrder = await Order.findOneAndUpdate(
      existingOrder ? { _id: existingOrder._id } : { $or: [{ id: orderId }, { razorpayOrderId: razorpay_order_id }] },
      {
        $set: updateSet,
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Sync to Payment collection so Admin Payments tab & Order Details stay in sync
    try {
      const Payment = (await import("@/models/Payment")).default;
      const numericOrderId = legacyId || numPart || parseInt(orderId.replace(/\D/g, ""), 10) || null;
      const existingPay = await Payment.findOne({
        $or: [
          { gatewayPaymentId: razorpay_payment_id },
          { payLinkId: razorpay_order_id },
          ...(numericOrderId ? [{ orderId: numericOrderId }] : []),
        ],
      }).lean();

      const paySeq = existingPay
        ? { id: existingPay.id, paymentId: existingPay.paymentId }
        : await getNextAtomicPaymentIdentity();

      await Payment.findOneAndUpdate(
        existingPay
          ? { _id: existingPay._id }
          : {
              $or: [
                { gatewayPaymentId: razorpay_payment_id },
                { payLinkId: razorpay_order_id },
              ],
            },
        {
          $set: {
            orderId: numericOrderId,
            customerName:
              savedOrder?.customerName ||
              orderData?.customerName ||
              orderData?.shippingAddress?.firstName ||
              "Customer",
            payLinkId: savedOrder?.pay_link_id || orderData?.pay_link_id || razorpay_order_id,
            shortUrl:
              savedOrder?.pay_link_url ||
              orderData?.pay_link_url ||
              `https://dashboard.razorpay.com/app/payments/${razorpay_payment_id}`,
            mobile: savedOrder?.customerPhone || orderData?.customerPhone || orderData?.shippingAddress?.phone || "",
            email: customerEmail || orderData?.customerEmail || "",
            state: savedOrder?.shippingAddress?.state || orderData?.shippingAddress?.state || "",
            city: savedOrder?.shippingAddress?.city || orderData?.shippingAddress?.city || "",
            zipcode: savedOrder?.shippingAddress?.pinCode || orderData?.shippingAddress?.pinCode || "",
            paymentGateway: "Razorpay",
            paymentKey: razorpay_payment_id,
            gatewayPaymentId: razorpay_payment_id,
            status: "paid",
            paymentData:
              paymentDataJson ||
              JSON.stringify({
                razorpay_payment_id,
                razorpay_order_id,
                razorpay_signature,
                status: "paid",
              }),
            amount: Number(savedOrder?.totalAmount || expectedTotal || 0),
          },
          $setOnInsert: {
            id: paySeq.id,
            paymentId: paySeq.paymentId,
          },
        },
        { upsert: true }
      );
    } catch (paySyncErr) {
      console.error("Payment collection sync warning:", paySyncErr);
    }

    // Send confirmation invoice email only once per paid transition
    if (!wasAlreadyPaid && savedOrder) {
      sendOrderInvoiceEmail(savedOrder).catch((err) =>
        console.error("Async invoice email error:", err)
      );
    }

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
