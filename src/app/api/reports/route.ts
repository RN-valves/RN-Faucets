import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import mongoose from "mongoose";
import Order from "@/models/Order";
import Product from "@/models/Product";
import RemarkLog from "@/models/RemarkLog";
import Category from "@/models/Category";
import Subcategory from "@/models/Subcategory";
import { escapeRegex } from "@/lib/security";

function parseDateBoundary(dateStr: string | null, isEnd: boolean = false): Date | null {
  if (!dateStr || typeof dateStr !== "string") return null;
  const trimmed = dateStr.trim();
  if (!trimmed) return null;

  let d: Date | null = null;
  if (trimmed.includes("/")) {
    // dd/mm/yyyy or dd/mm/yy
    const parts = trimmed.split("/");
    if (parts.length === 3) {
      const day = parts[0].padStart(2, "0");
      const month = parts[1].padStart(2, "0");
      let year = parts[2];
      if (year.length === 2) year = `20${year}`;
      d = new Date(`${year}-${month}-${day}T00:00:00.000Z`);
    }
  } else {
    d = new Date(trimmed.includes("T") ? trimmed : `${trimmed}T00:00:00.000Z`);
  }

  if (!d || isNaN(d.getTime())) return null;

  if (isEnd) {
    d.setUTCHours(23, 59, 59, 999);
  } else {
    d.setUTCHours(0, 0, 0, 0);
  }
  return d;
}

export async function GET(request: Request) {
  try {
    await connectDB();
    const db = mongoose.connection.db;
    if (!db) {
      return NextResponse.json({ error: "Database not connected" }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const type = (searchParams.get("type") || searchParams.get("tab") || "orders").toLowerCase();
    const isExport = searchParams.get("export") === "true";
    const q = (searchParams.get("q") || "").trim();
    const pageNum = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limitNum = isExport ? 10000 : Math.min(200, Math.max(10, parseInt(searchParams.get("limit") || "50", 10)));
    const skip = (pageNum - 1) * limitNum;

    // Fast global metrics
    const [totalOrders, totalProducts, totalRemarks, totalRevenueAgg] = await Promise.all([
      db.collection("orders").countDocuments(),
      db.collection("products").countDocuments(),
      db.collection("remark_logs").countDocuments(),
      db.collection("orders").aggregate([
        { $match: { totalAmount: { $type: "number", $lt: 10000000 } } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]).toArray(),
    ]);

    const globalSummary = {
      totalOrders,
      totalProducts,
      totalRemarks,
      totalRevenue: totalRevenueAgg[0]?.total || 0,
    };

    // ─────────────────────────────────────────────────────────────
    // 1. ORDER SALES REPORT (Matching Laravel: orderReports & OrderReportExport)
    // ─────────────────────────────────────────────────────────────
    if (type === "orders" || type === "sales") {
      const orderQuery: any = {};
      const statusParam = searchParams.get("status") || "All";
      const paymentStatusParam = searchParams.get("paymentStatus") || "All";
      const paymentMethodParam = searchParams.get("paymentMethod") || "All";
      const fromDateStr = searchParams.get("fromDate") || searchParams.get("from_date");
      const toDateStr = searchParams.get("toDate") || searchParams.get("to_date");

      // Date Range Filter
      const fromDate = parseDateBoundary(fromDateStr, false);
      const toDate = parseDateBoundary(toDateStr, true);

      if (fromDate && toDate) {
        orderQuery.createdAt = { $gte: fromDate, $lte: toDate };
      } else if (fromDate) {
        orderQuery.createdAt = { $gte: fromDate };
      } else if (toDate) {
        orderQuery.createdAt = { $lte: toDate };
      }

      // Order Status Filter (Single or comma-separated multiple)
      if (statusParam && statusParam !== "All") {
        if (statusParam.includes(",")) {
          const statuses = statusParam.split(",").map((s) => s.trim()).filter(Boolean);
          orderQuery.status = { $in: statuses };
        } else {
          orderQuery.status = { $regex: new RegExp(`^${escapeRegex(statusParam)}$`, "i") };
        }
      }

      // Payment Status Filter
      if (paymentStatusParam && paymentStatusParam !== "All") {
        orderQuery.paymentStatus = { $regex: new RegExp(`^${escapeRegex(paymentStatusParam)}$`, "i") };
      }

      // Payment Method Filter
      if (paymentMethodParam && paymentMethodParam !== "All") {
        orderQuery.paymentMethod = { $regex: new RegExp(escapeRegex(paymentMethodParam), "i") };
      }

      // Search Query
      if (q) {
        const cleanQ = escapeRegex(q);
        const orConditions: any[] = [
          { id: { $regex: cleanQ, $options: "i" } },
          { customerName: { $regex: cleanQ, $options: "i" } },
          { customerPhone: { $regex: cleanQ, $options: "i" } },
          { customerEmail: { $regex: cleanQ, $options: "i" } },
          { "shippingAddress.city": { $regex: cleanQ, $options: "i" } },
          { "shippingAddress.state": { $regex: cleanQ, $options: "i" } },
          { "shippingAddress.pinCode": { $regex: cleanQ, $options: "i" } },
          { courierPartner: { $regex: cleanQ, $options: "i" } },
          { trackingNumber: { $regex: cleanQ, $options: "i" } },
        ];
        const numQ = Number(q.replace(/\D/g, ""));
        if (!isNaN(numQ) && numQ > 0) {
          orConditions.push({ legacyId: numQ });
        }
        orderQuery.$or = orConditions;
      }

      // Aggregated summary of the filtered result
      const [filteredCount, summaryAgg, distinctStatuses, distinctPaymentStatuses, orders] = await Promise.all([
        db.collection("orders").countDocuments(orderQuery),
        db.collection("orders").aggregate([
          { $match: orderQuery },
          {
            $group: {
              _id: null,
              totalAmount: { $sum: "$totalAmount" },
              discountAmount: { $sum: "$discountAmount" },
              shippingAmount: { $sum: "$shippingAmount" },
              paidAmount: {
                $sum: {
                  $cond: [{ $eq: ["$paymentStatus", "Paid"] }, "$totalAmount", 0],
                },
              },
              paidCount: {
                $sum: {
                  $cond: [{ $eq: ["$paymentStatus", "Paid"] }, 1, 0],
                },
              },
            },
          },
        ]).toArray(),
        db.collection("orders").distinct("status"),
        db.collection("orders").distinct("paymentStatus"),
        db.collection("orders")
          .find(orderQuery)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limitNum)
          .toArray(),
      ]);

      const sumData = summaryAgg[0] || {
        totalAmount: 0,
        discountAmount: 0,
        shippingAmount: 0,
        paidAmount: 0,
        paidCount: 0,
      };

      return NextResponse.json({
        type: "orders",
        orders,
        pagination: {
          page: pageNum,
          limit: limitNum,
          totalCount: filteredCount,
          totalPages: Math.ceil(filteredCount / limitNum),
        },
        summary: {
          totalFilteredOrders: filteredCount,
          totalFilteredAmount: sumData.totalAmount || 0,
          discountAmount: sumData.discountAmount || 0,
          shippingAmount: sumData.shippingAmount || 0,
          paidCount: sumData.paidCount || 0,
          paidAmount: sumData.paidAmount || 0,
        },
        filterOptions: {
          statuses: distinctStatuses.filter(Boolean),
          paymentStatuses: distinctPaymentStatuses.filter(Boolean),
        },
        globalSummary,
      });
    }

    // ─────────────────────────────────────────────────────────────
    // 2. PRODUCT CATALOG REPORT (Matching Laravel: productReport & ProductExport)
    // ─────────────────────────────────────────────────────────────
    if (type === "products" || type === "inventory") {
      const productQuery: any = {};
      const categoryIdParam = searchParams.get("categoryId") || searchParams.get("category_id") || "all";
      const subcategoryIdParam = searchParams.get("subcategoryId") || searchParams.get("subcategory_id") || "all";
      const statusParam = searchParams.get("status") || "All";
      const stockParam = searchParams.get("stock") || "all";

      // Category Filter (support id, name, or slug)
      if (categoryIdParam && categoryIdParam.toLowerCase() !== "all") {
        const catDoc = await db.collection("categories").findOne({
          $or: [
            { id: categoryIdParam },
            { slug: categoryIdParam },
            { name: categoryIdParam },
          ],
        });
        if (catDoc) {
          productQuery.$or = [
            { category: catDoc.name },
            { category: catDoc.id },
            { category: catDoc.slug },
            { categoryId: catDoc.id },
          ];
        } else {
          productQuery.category = { $regex: new RegExp(escapeRegex(categoryIdParam), "i") };
        }
      }

      // Subcategory Filter
      if (subcategoryIdParam && subcategoryIdParam.toLowerCase() !== "all") {
        const subDoc = await db.collection("subcategories").findOne({
          $or: [
            { id: subcategoryIdParam },
            { slug: subcategoryIdParam },
            { name: subcategoryIdParam },
          ],
        });
        if (subDoc) {
          productQuery.$and = [
            ...(productQuery.$and || []),
            {
              $or: [
                { subcategoryId: subDoc.id },
                { subcategoryName: subDoc.name },
                { subcategory: subDoc.name },
              ],
            },
          ];
        } else {
          productQuery.subcategoryName = { $regex: new RegExp(escapeRegex(subcategoryIdParam), "i") };
        }
      }

      // Status Filter
      if (statusParam && statusParam !== "All") {
        productQuery.status = { $regex: new RegExp(`^${escapeRegex(statusParam)}$`, "i") };
      }

      // Stock Filter
      if (stockParam === "in_stock") {
        productQuery.$or = [
          { stock: { $gt: 0 } },
          { stockPcs: { $gt: 0 } },
          { status: "In Stock" },
        ];
      } else if (stockParam === "out_of_stock") {
        productQuery.$or = [
          { stock: { $lte: 0 } },
          { stockPcs: { $lte: 0 } },
          { status: "Out of Stock" },
        ];
      } else if (stockParam === "low_stock") {
        productQuery.$or = [
          { stock: { $gt: 0, $lte: 10 } },
          { stockPcs: { $gt: 0, $lte: 10 } },
        ];
      }

      // Search Query
      if (q) {
        const cleanQ = escapeRegex(q);
        productQuery.$or = [
          { name: { $regex: cleanQ, $options: "i" } },
          { article: { $regex: cleanQ, $options: "i" } },
          { skuCode: { $regex: cleanQ, $options: "i" } },
          { code: { $regex: cleanQ, $options: "i" } },
          { brand: { $regex: cleanQ, $options: "i" } },
          { material: { $regex: cleanQ, $options: "i" } },
          { colorName: { $regex: cleanQ, $options: "i" } },
        ];
      }

      // Load categories & subcategories for filter selection
      const [categories, subcategories, filteredCount, products] = await Promise.all([
        db.collection("categories")
          .find({ status: "Active" }, { projection: { id: 1, name: 1, slug: 1 } })
          .sort({ name: 1 })
          .toArray(),
        db.collection("subcategories")
          .find(
            categoryIdParam && categoryIdParam.toLowerCase() !== "all"
              ? { categoryId: categoryIdParam }
              : {},
            { projection: { id: 1, categoryId: 1, categoryName: 1, name: 1, slug: 1 } }
          )
          .sort({ name: 1 })
          .toArray(),
        db.collection("products").countDocuments(productQuery),
        db.collection("products")
          .find(productQuery)
          .sort({ createdAt: -1, id: 1 })
          .skip(skip)
          .limit(limitNum)
          .toArray(),
      ]);

      return NextResponse.json({
        type: "products",
        products,
        pagination: {
          page: pageNum,
          limit: limitNum,
          totalCount: filteredCount,
          totalPages: Math.ceil(filteredCount / limitNum),
        },
        categories,
        subcategories,
        globalSummary,
      });
    }

    // ─────────────────────────────────────────────────────────────
    // 3. REMARK LOGS REPORT (Matching Laravel: remarkLogs.index & RemarkLogTable)
    // ─────────────────────────────────────────────────────────────
    const remarkQuery: any = {};
    const remarkParam = searchParams.get("remark") || "All";
    const adminUserParam = searchParams.get("adminUser") || searchParams.get("user_id") || "All";
    const fromDateStr = searchParams.get("fromDate") || searchParams.get("from_date");
    const toDateStr = searchParams.get("toDate") || searchParams.get("to_date");

    const fromDate = parseDateBoundary(fromDateStr, false);
    const toDate = parseDateBoundary(toDateStr, true);

    if (fromDate && toDate) {
      remarkQuery.createdAt = { $gte: fromDate, $lte: toDate };
    } else if (fromDate) {
      remarkQuery.createdAt = { $gte: fromDate };
    } else if (toDate) {
      remarkQuery.createdAt = { $lte: toDate };
    }

    if (remarkParam && remarkParam !== "All") {
      remarkQuery.remark = { $regex: new RegExp(`^${escapeRegex(remarkParam)}$`, "i") };
    }

    if (adminUserParam && adminUserParam !== "All") {
      const numUserId = Number(adminUserParam);
      if (!isNaN(numUserId) && numUserId > 0) {
        remarkQuery.$or = [
          { adminUserId: numUserId },
          { adminUserName: { $regex: new RegExp(escapeRegex(adminUserParam), "i") } },
        ];
      } else {
        remarkQuery.adminUserName = { $regex: new RegExp(`^${escapeRegex(adminUserParam)}$`, "i") };
      }
    }

    if (q) {
      const cleanQ = escapeRegex(q);
      remarkQuery.$or = [
        { customerName: { $regex: cleanQ, $options: "i" } },
        { customerMobile: { $regex: cleanQ, $options: "i" } },
        { adminUserName: { $regex: cleanQ, $options: "i" } },
        { message: { $regex: cleanQ, $options: "i" } },
        { remark: { $regex: cleanQ, $options: "i" } },
      ];
    }

    const [filteredCount, distinctRemarks, distinctAdmins, logs] = await Promise.all([
      db.collection("remark_logs").countDocuments(remarkQuery),
      db.collection("remark_logs").distinct("remark"),
      db.collection("remark_logs").distinct("adminUserName"),
      db.collection("remark_logs")
        .find(remarkQuery)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .toArray(),
    ]);

    return NextResponse.json({
      type: "remarks",
      logs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalCount: filteredCount,
        totalPages: Math.ceil(filteredCount / limitNum),
      },
      filterOptions: {
        remarks: distinctRemarks.filter(Boolean),
        admins: distinctAdmins.filter(Boolean),
      },
      globalSummary,
    });
  } catch (error: any) {
    console.error("GET /api/reports error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch reports" }, { status: 500 });
  }
}
