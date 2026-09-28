import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import { requireAdminAuth } from "@/lib/security";

export async function POST(request: Request) {
  try {
    const adminSession = await requireAdminAuth(request);
    if (!adminSession) {
      return NextResponse.json(
        { error: "Unauthorized. Admin privileges required for bulk product operations." },
        { status: 401 }
      );
    }

    await connectDB();
    const body = await request.json();
    const { action, ids, status, stock, category, subcategoryId, subcategoryName, brand, isVisibleWebsite, priceType, priceValue, isPercentage } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "No product IDs provided" }, { status: 400 });
    }

    const objectIds = ids
      .filter((id) => typeof id === "string" && mongoose.isValidObjectId(id))
      .map((id) => new mongoose.Types.ObjectId(id));

    const filterConditions: any[] = [
      { id: { $in: ids } },
      { code: { $in: ids } },
      { skuCode: { $in: ids } },
    ];
    if (objectIds.length > 0) {
      filterConditions.push({ _id: { $in: objectIds } });
    }

    const filter = { $or: filterConditions };

    if (action === "delete") {
      await Product.deleteMany(filter);
      return NextResponse.json({ success: true, count: ids.length });
    }

    if (action === "status" && status) {
      if (status === "In Stock") {
        await Product.updateMany(filter, {
          $set: { status: "In Stock" },
        });
        // Ensure products set to In Stock do not stay at 0 stock
        await Product.updateMany(
          { ...filter, $or: [{ stock: { $lte: 0 } }, { stock: { $exists: false } }] },
          { $set: { stock: 50, stockPcs: 50 } }
        );
      } else {
        await Product.updateMany(filter, { $set: { status } });
      }
      return NextResponse.json({ success: true, count: ids.length });
    }

    if (action === "stock" && typeof stock === "number") {
      const stockStatus = stock > 10 ? "In Stock" : stock > 0 ? "Low Stock" : "Out of Stock";
      await Product.updateMany(
        filter,
        { $set: { stock, stockPcs: stock, status: stockStatus } }
      );
      return NextResponse.json({ success: true, count: ids.length });
    }

    if (action === "category" && category) {
      const updatePayload: any = { category };
      if (subcategoryId !== undefined) updatePayload.subcategoryId = subcategoryId;
      if (subcategoryName !== undefined) updatePayload.subcategoryName = subcategoryName;
      await Product.updateMany(filter, { $set: updatePayload });
      return NextResponse.json({ success: true, count: ids.length });
    }

    if (action === "brand" && brand) {
      await Product.updateMany(filter, { $set: { brand } });
      return NextResponse.json({ success: true, count: ids.length });
    }

    if (action === "visibility" && typeof isVisibleWebsite === "boolean") {
      await Product.updateMany(filter, { $set: { isVisibleWebsite } });
      return NextResponse.json({ success: true, count: ids.length });
    }

    if (action === "price" && typeof priceValue === "number") {
      const fieldToUpdate = priceType === "mrp" ? "inMrp" : "inSelling";

      if (isPercentage) {
        // Apply percentage increase/decrease
        const factor = 1 + priceValue / 100;
        const productsToUpdate = await Product.find(filter);
        for (const prod of productsToUpdate) {
          const currentVal = (prod as any)[fieldToUpdate] || prod.price || 0;
          const newVal = Math.max(0, Math.round(currentVal * factor));
          const updates: any = { [fieldToUpdate]: newVal };
          if (fieldToUpdate === "inSelling") updates.price = newVal;
          if (fieldToUpdate === "inMrp") updates.originalPrice = newVal;
          await Product.updateOne({ id: prod.id }, { $set: updates });
        }
      } else {
        // Set exact flat value
        const updates: any = { [fieldToUpdate]: priceValue };
        if (fieldToUpdate === "inSelling") updates.price = priceValue;
        if (fieldToUpdate === "inMrp") updates.originalPrice = priceValue;
        await Product.updateMany(filter, { $set: updates });
      }

      return NextResponse.json({ success: true, count: ids.length });
    }

    return NextResponse.json({ error: "Invalid bulk action or parameters" }, { status: 400 });
  } catch (error: any) {
    console.error("POST /api/products/bulk error:", error);
    return NextResponse.json({ error: error.message || "Failed to perform bulk operation" }, { status: 500 });
  }
}
