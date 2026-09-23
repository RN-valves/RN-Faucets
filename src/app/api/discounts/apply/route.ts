import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Discount from "@/models/Discount";

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const { code, cartTotal } = body;

    const subtotal = Number(cartTotal) || 0;
    if (subtotal <= 0) {
      return NextResponse.json({
        valid: false,
        message: "Cart is empty",
        discountAmount: 0,
        finalTotal: 0,
      });
    }

    const now = new Date();

    // 1. If coupon code is explicitly submitted by user
    if (code && typeof code === "string" && code.trim()) {
      const cleanCode = code.trim().toUpperCase();
      const discount = await Discount.findOne({
        $or: [{ code: cleanCode }, { name: cleanCode }],
        status: { $in: ["Active", "active"] as any },
      }).lean();

      if (!discount) {
        return NextResponse.json(
          { valid: false, message: "Invalid or inactive discount code." },
          { status: 400 }
        );
      }

      // Check expiration if present
      if (discount.expiredAt) {
        const exp = new Date(discount.expiredAt);
        if (!isNaN(exp.getTime()) && exp < now) {
          return NextResponse.json(
            { valid: false, message: "This coupon code has expired." },
            { status: 400 }
          );
        }
      }

      // Check cart value limits
      if (discount.startValue && subtotal < discount.startValue) {
        return NextResponse.json(
          {
            valid: false,
            message: `Minimum cart value of ₹${discount.startValue.toLocaleString("en-IN")} required for this coupon.`,
          },
          { status: 400 }
        );
      }

      if (discount.endValue && discount.endValue > discount.startValue && subtotal > discount.endValue) {
        return NextResponse.json(
          {
            valid: false,
            message: `Coupon valid up to ₹${discount.endValue.toLocaleString("en-IN")} cart total.`,
          },
          { status: 400 }
        );
      }

      let discountAmount = 0;
      const isPercent =
        discount.type?.toLowerCase().includes("percent") ||
        discount.type === "Percentage" ||
        discount.type === "%";

      if (isPercent) {
        discountAmount = Math.round((subtotal * discount.value) / 100);
      } else {
        discountAmount = Math.min(subtotal, discount.value);
      }

      const finalTotal = Math.max(0, subtotal - discountAmount);

      return NextResponse.json({
        valid: true,
        message: `Coupon ${cleanCode} applied! You saved ₹${discountAmount.toLocaleString("en-IN")}`,
        appliedCode: cleanCode,
        discountType: isPercent ? "Percentage" : "Amount",
        discountValue: discount.value,
        discountAmount,
        finalTotal,
        slabApplied: false,
      });
    }

    // 2. Automatic Slab Discount Check (if no manual coupon was applied)
    const activeDiscounts = await Discount.find({
      status: { $in: ["Active", "active"] as any },
      startValue: { $lte: subtotal },
    }).lean();

    // Find the highest applicable slab discount
    let bestSlab: any = null;
    let highestDiscountAmt = 0;

    for (const d of activeDiscounts) {
      if (d.startValue && subtotal >= d.startValue) {
        if (!d.endValue || d.endValue <= 0 || subtotal <= d.endValue) {
          const isPercent =
            d.type?.toLowerCase().includes("percent") ||
            d.type === "Percentage" ||
            d.type === "%";
          const amt = isPercent
            ? Math.round((subtotal * d.value) / 100)
            : Math.min(subtotal, d.value);

          if (amt > highestDiscountAmt) {
            highestDiscountAmt = amt;
            bestSlab = d;
          }
        }
      }
    }

    if (bestSlab && highestDiscountAmt > 0) {
      const isPercent =
        bestSlab.type?.toLowerCase().includes("percent") ||
        bestSlab.type === "Percentage" ||
        bestSlab.type === "%";

      return NextResponse.json({
        valid: true,
        message: `Slab discount applied! (Orders over ₹${bestSlab.startValue})`,
        appliedCode: bestSlab.name || bestSlab.code || "SLAB_DISCOUNT",
        discountType: isPercent ? "Percentage" : "Amount",
        discountValue: bestSlab.value,
        discountAmount: highestDiscountAmt,
        finalTotal: Math.max(0, subtotal - highestDiscountAmt),
        slabApplied: true,
      });
    }

    return NextResponse.json({
      valid: false,
      message: "No applicable automatic discount found.",
      discountAmount: 0,
      finalTotal: subtotal,
      slabApplied: false,
    });
  } catch (error: any) {
    console.error("POST /api/discounts/apply error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to calculate discount" },
      { status: 500 }
    );
  }
}
