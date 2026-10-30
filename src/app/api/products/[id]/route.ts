import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import { requireAdminAuth, escapeRegex } from "@/lib/security";
import { invalidateCatalogueAndHeaderCache } from "@/lib/catalogueData";

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

    // Safeguard: Ensure inSelling/inMrp/price are synchronized if any positive price exists
    if ((!body.inSelling || body.inSelling <= 0) && ((body.price && body.price > 0) || (body.inMrp && body.inMrp > 0))) {
      body.inSelling = (body.price && body.price > 0) ? body.price : body.inMrp;
    }
    if ((!body.inMrp || body.inMrp <= 0) && ((body.price && body.price > 0) || (body.inSelling && body.inSelling > 0))) {
      body.inMrp = (body.price && body.price > 0) ? body.price : body.inSelling;
    }
    if ((!body.price || body.price <= 0) && ((body.inSelling && body.inSelling > 0) || (body.inMrp && body.inMrp > 0))) {
      body.price = (body.inSelling && body.inSelling > 0) ? body.inSelling : body.inMrp;
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
    const currentProd = await Product.findOne(filter).select("_id code skuCode gallery").lean();
    if (!currentProd) {
      return NextResponse.json({ error: `Product not found with identifier: ${id}` }, { status: 404 });
    }

    // Normalize code / skuCode (strip any spaces) and reject duplicates
    if (body.code !== undefined || body.skuCode !== undefined) {
      const cleanCode = String(body.code || body.skuCode || "")
        .replace(/\s+/g, "")
        .toUpperCase();
      if (cleanCode) {
        body.code = cleanCode;
        body.skuCode = body.skuCode
          ? String(body.skuCode).replace(/\s+/g, "").toUpperCase()
          : cleanCode;

        const dupRegex = new RegExp(`^\\s*${escapeRegex(cleanCode)}\\s*$`, "i");
        const conflict = await Product.findOne({
          _id: { $ne: (currentProd as any)._id },
          $or: [{ code: dupRegex }, { skuCode: dupRegex }],
        })
          .select("_id id code name")
          .lean();

        if (conflict) {
          return NextResponse.json(
            {
              error: `SKU / Code "${cleanCode}" is already used by product "${(conflict as any).name}" (ID: ${(conflict as any).id}). Duplicate SKU codes are not allowed.`,
            },
            { status: 409 }
          );
        }
      }
    }

    // If admin updates main image without passing a custom gallery array, sync gallery[0] with the new main image
    if (body.image && typeof body.image === "string" && !Array.isArray(body.gallery)) {
      if (Array.isArray((currentProd as any).gallery) && (currentProd as any).gallery.length > 0) {
        const rest = (currentProd as any).gallery.slice(1).filter((g: string) => g && g !== body.image);
        body.gallery = [body.image, ...rest];
      } else {
        body.gallery = [body.image];
      }
    }

    const updated = await Product.findOneAndUpdate(
      { _id: (currentProd as any)._id },
      { $set: body },
      { new: true, returnDocument: "after" }
    );

    if (!updated) {
      return NextResponse.json({ error: `Product not found with identifier: ${id}` }, { status: 404 });
    }
    await invalidateCatalogueAndHeaderCache();
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
    await invalidateCatalogueAndHeaderCache();
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE /api/products/[id] error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete product" }, { status: 500 });
  }
}
