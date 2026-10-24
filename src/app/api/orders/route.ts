import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import User from "@/models/User";
import Product from "@/models/Product";
import Discount from "@/models/Discount";
import { getNextAtomicOrderIdentity, getNextAtomicPaymentIdentity } from "@/models/Counter";
import { requireAdminAuth, requireAuth, escapeRegex, checkRateLimit, getClientIp, sanitizeObject } from "@/lib/security";
import { sendOrderInvoiceEmail } from "@/lib/email";

function resolveAuthoritativeProductPrice(rawProduct: any, fallbackPrice: number): number {
  if (!rawProduct) return Math.max(1, Number(fallbackPrice) || 1018);
  const price = Number(
    rawProduct.inSelling && Number(rawProduct.inSelling) > 0
      ? rawProduct.inSelling
      : rawProduct.in_selling && Number(rawProduct.in_selling) > 0
      ? rawProduct.in_selling
      : rawProduct.price && Number(rawProduct.price) > 0
      ? rawProduct.price
      : rawProduct.inMrp && Number(rawProduct.inMrp) > 0
      ? rawProduct.inMrp
      : rawProduct.inV1Mrp || rawProduct.in_v1_mrp || rawProduct.v1_mrp
      ? Number(rawProduct.inV1Mrp || rawProduct.in_v1_mrp || rawProduct.v1_mrp) * 0.5
      : fallbackPrice || 1018
  );
  return Math.max(1, Math.round(price));
}

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    const phone = searchParams.get("phone") || "";
    const email = searchParams.get("email") || "";
    const status = searchParams.get("status") || "All";
    const limitParam = parseInt(searchParams.get("limit") || "500", 10);
    const pageParam = parseInt(searchParams.get("page") || "1", 10);
    const safeLimit = Math.min(1000, Math.max(1, isNaN(limitParam) ? 500 : limitParam));
    const safePage = Math.max(1, isNaN(pageParam) ? 1 : pageParam);

    const adminSession = await requireAdminAuth(request);
    const userSession = !adminSession ? await requireAuth(request) : null;

    // If not admin, restrict visibility strictly to the authenticated user's own orders
    if (!adminSession) {
      if (!userSession) {
        return NextResponse.json(
          { error: "Authentication required to view orders." },
          { status: 401 }
        );
      }

      // Customer view: only their own phone
      const userPhone = escapeRegex(userSession.mobile.replace(/[^\d]/g, "").slice(-10));
      const orders = await Order.find({
        $or: [
          { customerPhone: userPhone },
          { "shippingAddress.phone": userPhone },
          { customerPhone: { $regex: userPhone } },
        ],
      })
        .sort({ legacyId: -1, createdAt: -1 })
        .limit(200)
        .lean();

      return NextResponse.json({
        orders,
        counts: {
          total: orders.length,
          pending: orders.filter((o) => o.status === "Pending").length,
          processing: orders.filter((o) => o.status === "Processing").length,
          shipped: orders.filter((o) => o.status === "Shipped").length,
          delivered: orders.filter((o) => o.status === "Delivered").length,
          cancelled: orders.filter((o) => o.status === "Cancelled").length,
        },
      });
    }

    // Admin view: full access with filters
    const query: any = {};

    if (phone) {
      const cleanPhone = escapeRegex(phone.replace(/[^\d]/g, "").slice(-10));
      query.$or = [
        { customerPhone: { $regex: cleanPhone, $options: "i" } },
        { "shippingAddress.phone": { $regex: cleanPhone, $options: "i" } },
      ];
    } else if (email) {
      const cleanEmail = escapeRegex(email);
      query.$or = [
        { customerEmail: { $regex: cleanEmail, $options: "i" } },
        { "shippingAddress.email": { $regex: cleanEmail, $options: "i" } },
      ];
    } else if (q) {
      const safeQ = escapeRegex(q);
      query.$or = [
        { id: { $regex: safeQ, $options: "i" } },
        { customerName: { $regex: safeQ, $options: "i" } },
        { customerPhone: { $regex: safeQ, $options: "i" } },
        { customerEmail: { $regex: safeQ, $options: "i" } },
        { courierPartner: { $regex: safeQ, $options: "i" } },
        { trackingNumber: { $regex: safeQ, $options: "i" } },
        { lrNumber: { $regex: safeQ, $options: "i" } },
      ];
    }

    if (status !== "All") {
      query.status = status;
    }

    const [orders, statusCountsAgg] = await Promise.all([
      Order.find(query)
        .sort({ legacyId: -1, createdAt: -1 })
        .skip((safePage - 1) * safeLimit)
        .limit(safeLimit)
        .lean(),
      Order.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
    ]);

    const statusMap: Record<string, number> = {};
    let totalOrdersCount = 0;
    for (const row of statusCountsAgg) {
      if (row && row._id) {
        statusMap[String(row._id)] = Number(row.count) || 0;
      }
      totalOrdersCount += Number(row?.count) || 0;
    }

    const counts = {
      total: totalOrdersCount,
      pending: statusMap["Pending"] || 0,
      processing: statusMap["Processing"] || 0,
      shipped: statusMap["Shipped"] || 0,
      delivered: statusMap["Delivered"] || 0,
      cancelled: statusMap["Cancelled"] || 0,
    };

    return NextResponse.json({ orders, counts });
  } catch (error: any) {
    console.error("GET /api/orders error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rateCheck = checkRateLimit(`create-order:${ip}`, 15, 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Too many orders placed from this connection. Please wait a moment." },
        { status: 429 }
      );
    }

    await connectDB();
    const adminSession = await requireAdminAuth(request);
    const rawBody = await request.json();
    const body = sanitizeObject(rawBody);

    if (!Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ error: "Order must contain at least one item." }, { status: 400 });
    }

    // ── 1. Authoritative Server-Side Product Price & Stock Validation ──
    const verifiedItems: any[] = [];
    let serverSubtotal = 0;

    for (const rawItem of body.items) {
      const qty = Math.max(1, Math.min(1000, Math.floor(Number(rawItem.quantity) || 1)));
      const itemIdOrCode = String(rawItem.code || rawItem.id || "").trim();

      let dbProd: any = null;
      if (itemIdOrCode && !itemIdOrCode.startsWith("bestseller-")) {
        dbProd = await Product.findOne({
          $or: [
            { id: itemIdOrCode },
            { code: itemIdOrCode },
            { skuCode: itemIdOrCode },
          ],
        }).lean();
      }

      if (dbProd) {
        const prodStatus = String(dbProd.status || "In Stock");
        if (
          prodStatus === "Out of Stock" ||
          prodStatus === "Inactive" ||
          prodStatus === "InActive" ||
          prodStatus === "Discontinued"
        ) {
          return NextResponse.json(
            { error: `Item "${dbProd.name || rawItem.name}" is currently out of stock.` },
            { status: 400 }
          );
        }
      }

      const unitPrice = dbProd
        ? resolveAuthoritativeProductPrice(dbProd, Number(rawItem.price))
        : Math.max(500, Math.round(Number(rawItem.price) || 1018));

      serverSubtotal += unitPrice * qty;
      verifiedItems.push({
        id: dbProd?.id || rawItem.id || itemIdOrCode,
        name: dbProd?.name || rawItem.name || "RN Bathware Product",
        code: dbProd?.code || dbProd?.skuCode || rawItem.code || itemIdOrCode,
        color: rawItem.color || dbProd?.colorName || "Standard",
        size: rawItem.size || dbProd?.size || undefined,
        price: unitPrice,
        quantity: qty,
        image: rawItem.image || dbProd?.image || "",
      });
    }

    // ── 2. Authoritative Server-Side Coupon / Slab Discount Validation ──
    let serverDiscountAmount = 0;
    let verifiedDiscountCode: string | undefined = undefined;
    const requestedCoupon = String(body.discountCode || body.couponCode || "").trim();

    if (requestedCoupon) {
      const safeCouponRegex = new RegExp(`^${escapeRegex(requestedCoupon)}$`, "i");
      const discountDoc: any = await Discount.findOne({
        name: { $regex: safeCouponRegex },
        status: "Active",
      }).lean();

      if (discountDoc) {
        const isExpired =
          discountDoc.expiredAt &&
          !isNaN(new Date(discountDoc.expiredAt).getTime()) &&
          new Date(discountDoc.expiredAt).getTime() < Date.now();
        const minAmt = Number(discountDoc.startValue) || 0;
        const maxAmt = Number(discountDoc.endValue) || 999999999;

        if (!isExpired && serverSubtotal >= minAmt && (maxAmt <= minAmt || serverSubtotal <= maxAmt)) {
          const dType = String(discountDoc.type || "").toLowerCase();
          if (dType === "amount" || dType === "flat" || dType === "fixed") {
            serverDiscountAmount = Math.round(Number(discountDoc.value) || 0);
          } else {
            const pct = Number(discountDoc.value) || 0;
            serverDiscountAmount = Math.round((serverSubtotal * pct) / 100);
          }
          serverDiscountAmount = Math.min(serverDiscountAmount, serverSubtotal);
          verifiedDiscountCode = discountDoc.name;
        }
      }
    }

    const serverTotalAmount = Math.max(1, serverSubtotal - serverDiscountAmount);

    // ── 3. Atomic Sequential Order ID Generation ──
    const rawId = body.id ? String(body.id).replace(/-/g, "").replace(/ORD/i, "OD") : "";
    const numPart = parseInt(rawId.replace(/\D/g, "") || "0", 10);

    let orderId = rawId;
    let legacyId = body.legacyId;

    if (!orderId || numPart >= 100000 || !adminSession) {
      const seq = await getNextAtomicOrderIdentity();
      orderId = seq.id;
      legacyId = seq.legacyId;
    }

    // ── 4. Lookup user by phone for email and GST enrichment (Read-Only for unauthenticated) ──
    let customerEmail = body.customerEmail;
    let gstNumber = body.gstNumber;
    let businessName = body.businessName;

    if (body.customerPhone) {
      const cleanPhone = String(body.customerPhone).replace(/\D/g, "").slice(-10);
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

    // Only an authenticated Admin can directly create a "Paid" order; customer orders start as "Pending"
    const finalPaymentStatus = adminSession && body.paymentStatus === "Paid" ? "Paid" : "Pending";
    const finalOrderStatus = adminSession && body.status ? body.status : "Pending";

    const crypto = await import("crypto");
    const orderUuid = body.uuid || crypto.randomUUID();
    const requestOrigin = new URL(request.url).origin;
    const callbackUrl = `${requestOrigin}/api/payment/razorpay/callback`;

    let payLinkId = body.pay_link_id || "";
    let payLinkUrl = body.pay_link_url || "";
    const paymentDataStr = body.payment_data || "";
    const rzpKeyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_live_suYcAnCphr9CQ8";

    // Automatically generate an ORIGINAL Razorpay Payment Link for Online Payment orders
    if (
      finalPaymentStatus !== "Paid" &&
      body.paymentMethod !== "Cash on Delivery" &&
      !payLinkId &&
      serverTotalAmount > 0
    ) {
      try {
        const { createRazorpayPaymentLink } = await import("@/lib/razorpay");
        const Payment = (await import("@/models/Payment")).default;
        const paymentLink = await createRazorpayPaymentLink({
          amount: serverTotalAmount,
          referenceId: orderUuid,
          description: `RN Valves Order #${orderId}`,
          customer: {
            name: body.customerName || body.shippingAddress?.firstName || "Customer",
            contact: body.customerPhone || body.shippingAddress?.phone || "9999999999",
            email: customerEmail || body.customerEmail || body.shippingAddress?.email || "ecommerce@rnvalves.com",
          },
          callbackUrl,
        });
        payLinkId = paymentLink.id || "";
        payLinkUrl = paymentLink.short_url || "";

        const numericOrderId = legacyId || numPart || parseInt(orderId.replace(/\D/g, ""), 10) || null;
        const paySeq = await getNextAtomicPaymentIdentity();
        await Payment.create({
          id: paySeq.id,
          paymentId: paySeq.paymentId,
          orderId: numericOrderId,
          customerName: body.customerName || body.shippingAddress?.firstName || "Customer",
          payLinkId,
          shortUrl: payLinkUrl,
          mobile: body.customerPhone || body.shippingAddress?.phone || "",
          email: customerEmail || body.customerEmail || "",
          state: body.shippingAddress?.state || "",
          city: body.shippingAddress?.city || "",
          zipcode: body.shippingAddress?.pinCode || "",
          paymentGateway: "Razorpay",
          paymentKey: rzpKeyId,
          gatewayPaymentId: orderUuid,
          status: "Created",
          paymentData: "",
          amount: serverTotalAmount,
        });
      } catch (plinkErr) {
        console.error("Auto Razorpay payment link creation warning:", plinkErr);
      }
    }

    const orderDocPayload = {
      ...body,
      id: orderId,
      uuid: orderUuid,
      legacyId: legacyId || numPart || undefined,
      items: verifiedItems,
      discountCode: verifiedDiscountCode,
      discountAmount: serverDiscountAmount,
      totalAmount: serverTotalAmount,
      customerEmail: customerEmail || body.customerEmail || "",
      gstNumber: gstNumber || body.gstNumber || "",
      businessName: businessName || body.businessName || "",
      status: finalOrderStatus,
      paymentStatus: finalPaymentStatus,
      payment_key: body.payment_key || rzpKeyId,
      ...(payLinkId ? { pay_link_id: payLinkId } : {}),
      ...(payLinkUrl ? { pay_link_url: payLinkUrl } : {}),
      ...(paymentDataStr ? { payment_data: paymentDataStr } : {}),
      orderDate: new Date().toLocaleString("en-IN", {
        dateStyle: "short",
        timeStyle: "short",
      }),
    };

    let order: any;
    try {
      order = await Order.create(orderDocPayload);
    } catch (createErr: any) {
      // Retry once with a fresh atomic order ID if a duplicate key race ever occurs
      if (createErr?.code === 11000) {
        const retrySeq = await getNextAtomicOrderIdentity();
        order = await Order.create({
          ...orderDocPayload,
          id: retrySeq.id,
          legacyId: retrySeq.legacyId,
        });
      } else {
        throw createErr;
      }
    }

    // Only send invoice email immediately if already Paid or COD; for Online Payment link redirects, callback sends it upon payment
    if (finalPaymentStatus === "Paid" || body.paymentMethod === "Cash on Delivery") {
      sendOrderInvoiceEmail(order).catch((err) =>
        console.error("Async invoice email error:", err)
      );
    }

    return NextResponse.json(order, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/orders error:", error);
    return NextResponse.json({ error: error.message || "Failed to create order" }, { status: 500 });
  }
}


