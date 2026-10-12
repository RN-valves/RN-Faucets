import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import { requireAdminAuth, escapeRegex } from "@/lib/security";

function buildProductFilter(rawId: string) {
  const id = decodeURIComponent(rawId).trim();
  const filterList: any[] = [
    { id },
    { code: id },
    { skuCode: id },
    { urlKey: id },
    { code: new RegExp(`^${escapeRegex(id)}$`, "i") },
    { skuCode: new RegExp(`^${escapeRegex(id)}$`, "i") },
  ];
  if (!isNaN(Number(id))) {
    filterList.push({ id: Number(id) });
  }
  if (mongoose.isValidObjectId(id) && id.length === 24) {
    filterList.push({ _id: new mongoose.Types.ObjectId(id) });
  }
  return { $or: filterList };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const filter = buildProductFilter(id);
    const product = await Product.findOne(filter).lean();

    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
    return NextResponse.json(product);
  } catch (error: any) {
    console.error("GET /api/products/[id] error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch product" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminSession = await requireAdminAuth(request);
    if (!adminSession) {
      return NextResponse.json(
        { error: "Unauthorized. Admin privileges required to update products." },
        { status: 401 }
      );
    }

    await connectDB();
    const { id } = await params;
    const body = await request.json();

    // Prevent modifying immutable fields
    delete (body as any)._id;
    delete (body as any).__v;
    delete (body as any).createdAt;
    delete (body as any).updatedAt;

    // Sanitize numeric fields to prevent MongoDB CastError on NaN
    const numFields = [
      "price",
      "originalPrice",
      "inMrp",
      "inSelling",
      "inV1Mrp",
      "othMrp",
      "othSelling",
      "othV1Mrp",
      "stock",
      "stockPcs",
      "moq",
      "ctnPcs",
      "midCtnPcs",
      "innerPcs",
      "productLength",
      "productBreadth",
      "productHeight",
      "onlyProductWtGm",
      "residentialWarranty",
      "commercialWarranty",
    ];
    for (const f of numFields) {
      if (body[f] !== undefined) {
        const val = Number(body[f]);
        body[f] = isNaN(val) ? 0 : val;
      }
    }

    // Synchronize stock and stockPcs fields
    if (typeof body.stock === "number") {
      body.stockPcs = body.stock;
    } else if (typeof body.stockPcs === "number") {
      body.stock = body.stockPcs;
    }

    // Synchronize status with stock values if not explicitly provided
    if (body.status === "Out of Stock") {
      body.status = "Out of Stock";
    } else if (body.status === "In Stock") {
      body.status = "In Stock";
      if (typeof body.stock === "number" && body.stock <= 0) {
        body.stock = 50;
        body.stockPcs = 50;
      }
    } else if (body.stock !== undefined && !body.status) {
      body.status = body.stock > 0 ? "In Stock" : "Out of Stock";
    }

    const filter = buildProductFilter(id);
    const updated = await Product.findOneAndUpdate(
      filter,
      { $set: body },
      { new: true, returnDocument: "after" }
    );

    if (!updated) {
      return NextResponse.json({ error: `Product not found with identifier: ${id}` }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("PUT /api/products/[id] error:", error);
    return NextResponse.json({ error: error.message || "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminSession = await requireAdminAuth(request);
    if (!adminSession) {
      return NextResponse.json(
        { error: "Unauthorized. Admin privileges required to delete products." },
        { status: 401 }
      );
    }

    await connectDB();
    const { id } = await params;
    const filter = buildProductFilter(id);
    const deleted = await Product.findOneAndDelete(filter);
    if (!deleted) return NextResponse.json({ error: "Product not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE /api/products/[id] error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete product" }, { status: 500 });
  }
}
