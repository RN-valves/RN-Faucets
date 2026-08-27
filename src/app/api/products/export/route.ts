import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";

export async function GET() {
  try {
    await connectDB();
    const products = await Product.find({}).lean();
    return NextResponse.json(products, {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="rn_products_export_${new Date().toISOString().split("T")[0]}.json"`,
      },
    });
  } catch (error) {
    console.error("GET /api/products/export error:", error);
    return NextResponse.json({ error: "Failed to export products" }, { status: 500 });
  }
}
