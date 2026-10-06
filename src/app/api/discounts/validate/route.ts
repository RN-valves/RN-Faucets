import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Discount from "@/models/Discount";

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const { code, cartTotal } = body;

    const numericCartTotal = Number(cartTotal) || 0;

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { valid: false, message: "Please provide a valid coupon code." },
        { status: 400 }
      );
    }

    const cleanCode = code.trim().toUpperCase();

    // Query active discount by code
    const discount = await Discount.findOne({
      name: { $regex: new RegExp(`^${cleanCode}$`, "i") },
      status: "Active",
    }).lean();

    if (!discount) {
      return NextResponse.json({
        valid: false,
        message: "Invalid or inactive coupon code.",
      });
    }

    // Check expiration date if present
    if (discount.expiredAt) {
      const expiry = new Date(discount.expiredAt);
      if (!isNaN(expiry.getTime()) && expiry.getTime() < Date.now()) {
        return NextResponse.json({
          valid: false,
          message: "This coupon code has expired.",
        });
      }
    }

    const minAmount = Number(discount.startValue) || 0;
    const maxAmount = Number(discount.endValue) || 999999999;

    // Check boundary condition: startValue <= cartTotal <= endValue
    if (numericCartTotal < minAmount) {
      return NextResponse.json({
        valid: false,
        message: `Coupon ${cleanCode} requires a minimum cart value of ₹${minAmount.toLocaleString("en-IN")}. Add ₹${(minAmount - numericCartTotal).toLocaleString("en-IN")} more to apply.`,
        minAmount,
        neededAmount: Math.max(0, minAmount - numericCartTotal),
      });
    }

    if (maxAmount > minAmount && numericCartTotal > maxAmount) {
      return NextResponse.json({
        valid: false,
        message: `Coupon ${cleanCode} is valid for orders up to ₹${maxAmount.toLocaleString("en-IN")}.`,
        maxAmount,
      });
    }

    // Calculate discount deduction
    let discountAmount = 0;
    const discountType = (discount.type || "").toLowerCase();

    if (discountType === "amount" || discountType === "flat" || discountType === "fixed") {
      discountAmount = Number(discount.value) || 0;
    } else {
      // Percentage calculation
      const percent = Number(discount.value) || 0;
      discountAmount = Math.round((numericCartTotal * percent) / 100);
    }

    // Discount cannot exceed the cart total
    discountAmount = Math.min(discountAmount, numericCartTotal);
    const finalTotal = Math.max(0, numericCartTotal - discountAmount);

    return NextResponse.json({
      valid: true,
      code: discount.name,
      type: discount.type,
      value: discount.value,
      discountAmount,
      finalTotal,
      message: `Coupon ${discount.name} applied successfully! You saved ₹${discountAmount.toLocaleString("en-IN")}.`,
    });
  } catch (error: any) {
    console.error("POST /api/discounts/validate error:", error);
    return NextResponse.json(
      { valid: false, message: error.message || "Failed to validate coupon." },
      { status: 500 }
    );
  }
}
