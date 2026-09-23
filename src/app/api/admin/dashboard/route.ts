import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import mongoose from "mongoose";
import Order from "@/models/Order";
import Product from "@/models/Product";
import Enquiry from "@/models/Enquiry";
import { requireAdminAuth } from "@/lib/security";

export async function GET(request: Request) {
  try {
    const adminSession = await requireAdminAuth(request);
    if (!adminSession) {
      return NextResponse.json(
        { error: "Unauthorized. Admin privileges required to view dashboard." },
        { status: 401 }
      );
    }

    await connectDB();
    const db = mongoose.connection.db;
    if (!db) {
      return NextResponse.json({ error: "Database not connected" }, { status: 500 });
    }

    // Parallel fast execution of dashboard analytics & recent orders
    const [
      revenueAgg,
      statusCountsAgg,
      totalOrders,
      totalProducts,
      totalEnquiries,
      newEnquiriesCount,
      recentOrders,
    ] = await Promise.all([
      // 1. Order revenue aggregations (excluding spam test overflow numbers)
      db.collection("orders").aggregate([
        {
          $match: {
            totalAmount: { $type: "number", $lt: 10000000 },
            customerPhone: { $ne: "9350285800" },
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: {
              $sum: {
                $cond: [
                  { $in: ["$status", ["Cancelled", "CANCELED"]] },
                  0,
                  "$totalAmount",
                ],
              },
            },
            verifiedRevenue: {
              $sum: {
                $cond: [
                  { $in: ["$status", ["Cancelled", "CANCELED", "Pending"]] },
                  0,
                  "$totalAmount",
                ],
              },
            },
          },
        },
      ]).toArray(),

      // 2. Order status groupings
      db.collection("orders").aggregate([
        {
          $match: {
            totalAmount: { $type: "number", $lt: 10000000 },
            customerPhone: { $ne: "9350285800" },
          },
        },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]).toArray(),

      // 3. Fast document counts
      Order.countDocuments({
        totalAmount: { $lt: 10000000 },
        customerPhone: { $ne: "9350285800" },
      } as any),
      Product.countDocuments(),
      Enquiry.countDocuments(),
      Enquiry.countDocuments({ status: "New" }),

      // 4. Top 5 recent orders for dashboard table
      Order.find({
        totalAmount: { $lt: 10000000 },
        customerPhone: { $ne: "9350285800" },
      } as any)
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

    // Parse status counts
    const statusMap: Record<string, number> = {};
    for (const item of statusCountsAgg) {
      if (item._id) statusMap[item._id] = item.count;
    }

    const pendingOrdersCount = statusMap["Pending"] || 0;
    const processingOrdersCount = (statusMap["Processing"] || 0) + (statusMap["In-Progress"] || 0);
    const shippedOrdersCount =
      (statusMap["Shipped"] || 0) +
      (statusMap["Out for Pickup"] || 0) +
      (statusMap["IN TRANSIT"] || 0);
    const deliveredOrdersCount =
      (statusMap["Delivered"] || 0) +
      (statusMap["DELIVERED"] || 0) +
      (statusMap["RTO Delivered"] || 0) +
      (statusMap["RTO DELIVERED"] || 0) +
      (statusMap["Completed"] || 0);
    const cancelledOrdersCount =
      (statusMap["Cancelled"] || 0) + (statusMap["CANCELED"] || 0);

    const rev = revenueAgg[0] || { totalRevenue: 0, verifiedRevenue: 0 };

    return NextResponse.json({
      stats: {
        totalRevenue: Math.round(rev.totalRevenue || 0),
        verifiedRevenue: Math.round(rev.verifiedRevenue || 0),
        totalOrders,
        pendingOrdersCount,
        processingOrdersCount,
        shippedOrdersCount,
        deliveredOrdersCount,
        cancelledOrdersCount,
        totalProducts,
        totalEnquiries,
        newEnquiriesCount,
      },
      recentOrders,
    });
  } catch (error: any) {
    console.error("GET /api/admin/dashboard error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to load admin dashboard" },
      { status: 500 }
    );
  }
}
