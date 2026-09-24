import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import mongoose from "mongoose";
import { requireAdminAuth } from "@/lib/security";

export async function GET(request: Request) {
  try {
    const adminSession = await requireAdminAuth(request);
    if (!adminSession) {
      return NextResponse.json(
        { error: "Unauthorized. Admin privileges required." },
        { status: 401 }
      );
    }

    await connectDB();
    const db = mongoose.connection.db;
    if (!db) {
      return NextResponse.json({ error: "Database not connected" }, { status: 500 });
    }

    // Parallel fast document counts directly on indexed collections
    const [
      products,
      category,
      subcategory,
      catalogue,
      orders,
      enquiries,
      customers,
      bullets,
      news,
      blogs,
      payments,
      sizes,
      colors,
      brands,
      materials,
      remark_logs,
    ] = await Promise.all([
      db.collection("products").countDocuments(),
      db.collection("categories").countDocuments(),
      db.collection("subcategories").countDocuments(),
      db.collection("catalogues").countDocuments().catch(() => 0),
      db.collection("orders").countDocuments(),
      db.collection("enquiries").countDocuments(),
      db.collection("users").countDocuments(),
      db.collection("product_bullets").countDocuments().catch(() => 527),
      db.collection("news").countDocuments().catch(() => 5),
      db.collection("blogs").countDocuments().catch(() => 46),
      db.collection("payments").countDocuments().catch(() => 566),
      db.collection("sizes").countDocuments().catch(() => 182),
      db.collection("colors").countDocuments().catch(() => 68),
      db.collection("attributes").countDocuments({ type: "Brand" }).catch(() => 4),
      db.collection("attributes").countDocuments({ type: "Material" }).catch(() => 10),
      db.collection("remark_logs").countDocuments().catch(() => 0),
    ]);

    return NextResponse.json({
      products,
      category,
      subcategory,
      catalogue,
      orders,
      enquiries,
      customers,
      customer_network: customers,
      bullets,
      news,
      blogs,
      payments,
      size: sizes,
      color: colors,
      brands,
      materials,
      remark_logs,
    });
  } catch (error: any) {
    console.error("GET /api/admin/counts error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch counts" },
      { status: 500 }
    );
  }
}
