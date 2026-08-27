import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import Order from "@/models/Order";

const DEFAULT_MOCK_REMARK_LOGS = [
  {
    id: "log-1001",
    productSku: "RNGLA06C01",
    productName: "Glamour Single Lever Basin Mixer",
    field: "inSelling (Price)",
    oldValue: "₹4,250",
    newValue: "₹3,890",
    updatedBy: "Rajesh (Admin)",
    remarks: "Festive Season Discount Price Reduction",
    timestamp: "2026-08-24 11:30:15",
  },
  {
    id: "log-1002",
    productSku: "RNGLA06C02",
    productName: "Glamour Pillar Cock Foam Flow",
    field: "stockQuantity",
    oldValue: "12 units",
    newValue: "150 units",
    updatedBy: "Anil (Inventory Manager)",
    remarks: "New Stock Arrival Shipment #RN-4589",
    timestamp: "2026-08-23 16:45:00",
  },
  {
    id: "log-1003",
    productSku: "RNGLA06C03",
    productName: "Glamour Concealed Diverter Body",
    field: "status",
    oldValue: "InActive",
    newValue: "Active",
    updatedBy: "Super Admin",
    remarks: "Product Testing Approved for Storefront",
    timestamp: "2026-08-22 09:12:40",
  },
];

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";

    const totalProducts = await Product.countDocuments();
    const activeProducts = await Product.countDocuments({ status: "Active" });
    const totalOrders = await Order.countDocuments();

    let logs = DEFAULT_MOCK_REMARK_LOGS;

    if (q) {
      const lower = q.toLowerCase();
      logs = logs.filter(
        (l) =>
          l.productSku.toLowerCase().includes(lower) ||
          l.productName.toLowerCase().includes(lower) ||
          l.updatedBy.toLowerCase().includes(lower) ||
          l.remarks.toLowerCase().includes(lower)
      );
    }

    return NextResponse.json({
      logs,
      summary: {
        totalProducts,
        activeProducts,
        totalOrders,
        totalLogs: logs.length,
      },
    });
  } catch (error: any) {
    console.error("GET /api/reports error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch reports" }, { status: 500 });
  }
}
