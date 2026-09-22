import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { escapeRegex } from "@/lib/security";
import mongoose from "mongoose";

export async function GET(request: Request) {
  try {
    await connectDB();
    const db = mongoose.connection.db;
    if (!db) {
      return NextResponse.json({ error: "Database not connected" }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim() || "";
    const status = searchParams.get("status") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const skip = (page - 1) * limit;

    const query: Record<string, any> = {};
    if (status) {
      query.status = status;
    }
    if (q) {
      const safeQ = escapeRegex(q);
      query.$or = [
        { customerName: { $regex: safeQ, $options: "i" } },
        { mobile: { $regex: safeQ, $options: "i" } },
        { email: { $regex: safeQ, $options: "i" } },
        { city: { $regex: safeQ, $options: "i" } },
        { state: { $regex: safeQ, $options: "i" } },
        { payLinkId: { $regex: safeQ, $options: "i" } },
      ];
      if (!isNaN(Number(q))) {
        query.$or.push({ id: Number(q) }, { orderId: Number(q) });
      }
    }

    const collection = db.collection("payments");
    const total = await collection.countDocuments(query);
    const payments = await collection
      .find(query)
      .sort({ id: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    return NextResponse.json({
      payments,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    console.error("GET /api/payments error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch payments" }, { status: 500 });
  }
}
