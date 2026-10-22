import { NextResponse } from "next/server";
import { verifyRazorpayPaymentSignature } from "@/lib/razorpay";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import User from "@/models/User";
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

    // Lookup user by phone for email and GST enrichment
    let customerEmail = orderData?.customerEmail;
    let gstNumber = orderData?.gstNumber;
    let businessName = orderData?.businessName;

    if (orderData?.customerPhone) {
      const cleanPhone = String(orderData.customerPhone).replace(/\D/g, "").slice(-10);
      const userDoc: any = await User.findOne({
        $or: [
          { mobile: cleanPhone },
          { mobile: `+91${cleanPhone}` },
          { mobile: `91${cleanPhone}` },
        ],
      });

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

        // Sync back any newly provided email or GST to the user profile
        const userUpdates: any = {};
        if (orderData.customerEmail && !orderData.customerEmail.includes("noreply") && !userDoc.email) {
          userUpdates.email = orderData.customerEmail;
        }
        if (orderData.gstNumber && !userDoc.gstNumber) {
          userUpdates.gstNumber = orderData.gstNumber;
          userUpdates.userType = "Business";
        }
        if (orderData.businessName && !userDoc.businessName) {
          userUpdates.businessName = orderData.businessName;
        }
        if (Object.keys(userUpdates).length > 0) {
          await User.findByIdAndUpdate(userDoc._id, { $set: userUpdates });
        }
      }
    }

    // Fetch full Razorpay payment details so Admin Order Details displays complete payment_data
    let paymentDataJson = "";
    try {
      const rzpKey = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";
      const rzpSecret = process.env.RAZORPAY_KEY_SECRET || "";
      if (rzpKey && rzpSecret) {
        const auth = Buffer.from(`${rzpKey}:${rzpSecret}`).toString("base64");
        const payRes = await fetch(`https://api.razorpay.com/v1/payments/${razorpay_payment_id}`, {
          headers: { Authorization: `Basic ${auth}` },
        });
        if (payRes.ok) {
          const payDetails = await payRes.json();
          paymentDataJson = JSON.stringify(payDetails);
        }
      }
    } catch (payErr) {
      console.error("Failed to fetch Razorpay payment details:", payErr);
    }

    const matchConditions: any[] = [
      { id: orderId },
      { razorpayOrderId: razorpay_order_id },
    ];
    if (orderData?.uuid) {
      matchConditions.push({ uuid: orderData.uuid });
    }

    const savedOrder = await Order.findOneAndUpdate(
      { $or: matchConditions },
      {
        $set: {
          ...orderData,
          id: orderId,
          legacyId: legacyId || undefined,
          customerEmail: customerEmail || orderData?.customerEmail || "",
          gstNumber: gstNumber || orderData?.gstNumber || "",
          businessName: businessName || orderData?.businessName || "",
          paymentStatus: "Paid",
          paymentMethod: "Online Payment",
          payment_term: "Prepaid",
          payment_key: razorpay_payment_id,
          pay_link_id: orderData?.pay_link_id || razorpay_order_id,
          pay_link_url: orderData?.pay_link_url || `https://dashboard.razorpay.com/app/payments/${razorpay_payment_id}`,
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
        },
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
      const lastPayment: any = await Payment.findOne().sort({ id: -1 }).lean();
      const nextPayId = (lastPayment?.id || 581) + 1;
      await Payment.findOneAndUpdate(
        {
          $or: [
            { gatewayPaymentId: razorpay_payment_id },
            { payLinkId: razorpay_order_id },
          ],
        },
        {
          $set: {
            orderId: numericOrderId,
            customerName: orderData?.customerName || orderData?.shippingAddress?.firstName || "Customer",
            payLinkId: orderData?.pay_link_id || razorpay_order_id,
            shortUrl: orderData?.pay_link_url || `https://dashboard.razorpay.com/app/payments/${razorpay_payment_id}`,
            mobile: orderData?.customerPhone || orderData?.shippingAddress?.phone || "",
            email: customerEmail || orderData?.customerEmail || "",
            state: orderData?.shippingAddress?.state || "",
            city: orderData?.shippingAddress?.city || "",
            zipcode: orderData?.shippingAddress?.pinCode || "",
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
            amount: Number(orderData?.totalAmount || 0),
          },
          $setOnInsert: {
            id: nextPayId,
            paymentId: `PAY-${nextPayId}`,
          },
        },
        { upsert: true }
      );
    } catch (paySyncErr) {
      console.error("Payment collection sync warning:", paySyncErr);
    }

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
