import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import { escapeRegex, sanitizeString, sanitizeObject } from "@/lib/security";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const q = sanitizeString(searchParams.get("q") || "", 100);
    const category = sanitizeString(searchParams.get("category") || "", 100);
    const subcategory = sanitizeString(searchParams.get("subcategory") || "", 100);
    const status = sanitizeString(searchParams.get("status") || "", 30);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(0, Math.min(100, parseInt(searchParams.get("limit") || "0", 10)));

    const filter: Record<string, unknown> = {};

    if (q) {
      const safeQ = escapeRegex(q);
      filter.$or = [
        { name: { $regex: safeQ, $options: "i" } },
        { code: { $regex: safeQ, $options: "i" } },
        { skuCode: { $regex: safeQ, $options: "i" } },
        { article: { $regex: safeQ, $options: "i" } },
        { searchKeywords: { $regex: safeQ, $options: "i" } },
      ];
    }

    if (category && category !== "All") {
      const safeCat = escapeRegex(category);
      const safeNormCat = escapeRegex(category.replace(/-/g, " "));
      filter.$or = [
        { category: { $regex: `^${safeCat}$`, $options: "i" } },
        { category: { $regex: `^${safeNormCat}$`, $options: "i" } },
        { subcategoryName: { $regex: `^${safeCat}$`, $options: "i" } },
        { subcategoryName: { $regex: `^${safeNormCat}$`, $options: "i" } },
        { subcategoryId: category },
      ];
    }

    if (subcategory && subcategory !== "All") {
      const safeSub = escapeRegex(subcategory);
      const safeNormSub = escapeRegex(subcategory.replace(/-/g, " "));
      filter.$or = [
        { subcategoryId: subcategory },
        { subcategoryName: { $regex: safeSub, $options: "i" } },
        { subcategoryName: { $regex: safeNormSub, $options: "i" } },
        { category: { $regex: safeSub, $options: "i" } },
        { category: { $regex: safeNormSub, $options: "i" } },
      ];
    }

    if (status && status !== "All") {
      filter.status = status;
    }

    const query = Product.find(filter).sort({ createdAt: -1 });

    if (limit > 0) {
      const skip = (page - 1) * limit;
      const total = await Product.countDocuments(filter);
      const products = await query.skip(skip).limit(limit).lean();
      return NextResponse.json({
        products,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      });
    }

    const products = await query.lean();
    return NextResponse.json(products);
  } catch (error) {
    return handleApiError(error, "GET /api/products");
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const rawBody = await request.json().catch(() => ({}));
    const body = sanitizeObject(rawBody);

    const code = body.code ? String(body.code).toUpperCase().trim() : `RN-${Date.now()}`;
    const id = body.id ? String(body.id).trim() : code;
    const urlKey =
      body.urlKey ||
      (body.name ? String(body.name).toLowerCase().replace(/[^a-z0-9]+/g, "-") : id.toLowerCase());

    const productData = {
      ...body,
      id,
      code,
      urlKey,
      createdDate: new Date().toISOString().split("T")[0],
      stockPcs: body.stockPcs !== undefined ? Number(body.stockPcs) : Number(body.stock || 0),
      inMrp: Number(body.inMrp || body.originalPrice || body.price || 0),
      inSelling: Number(body.inSelling || body.price || 0),
    };

    const product = new Product(productData);
    await product.save();
    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    return handleApiError(error, "POST /api/products");
  }
}
