import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    const category = searchParams.get("category") || "";
    const subcategory = searchParams.get("subcategory") || "";
    const status = searchParams.get("status") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "0", 10);

    const filter: Record<string, unknown> = {};

    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { code: { $regex: q, $options: "i" } },
        { skuCode: { $regex: q, $options: "i" } },
        { article: { $regex: q, $options: "i" } },
        { searchKeywords: { $regex: q, $options: "i" } },
      ];
    }

    if (category && category !== "All") {
      const normCat = category.replace(/-/g, " ");
      filter.$or = [
        { category: { $regex: `^${category}$`, $options: "i" } },
        { category: { $regex: `^${normCat}$`, $options: "i" } },
        { subcategoryName: { $regex: `^${category}$`, $options: "i" } },
        { subcategoryName: { $regex: `^${normCat}$`, $options: "i" } },
        { subcategoryId: category },
      ];
    }

    if (subcategory && subcategory !== "All") {
      const normSub = subcategory.replace(/-/g, " ");
      filter.$or = [
        { subcategoryId: subcategory },
        { subcategoryName: { $regex: subcategory, $options: "i" } },
        { subcategoryName: { $regex: normSub, $options: "i" } },
        { category: { $regex: subcategory, $options: "i" } },
        { category: { $regex: normSub, $options: "i" } },
      ];
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
    console.error("GET /api/products error:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const code = body.code ? body.code.toUpperCase() : `RN-${Date.now()}`;
    const id = body.id || code;
    const urlKey = body.urlKey || (body.name ? body.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") : id.toLowerCase());

    const productData = {
      ...body,
      id,
      code,
      urlKey,
      createdDate: new Date().toISOString().split("T")[0],
      stockPcs: body.stockPcs !== undefined ? body.stockPcs : body.stock || 0,
      inMrp: body.inMrp || body.originalPrice || body.price || 0,
      inSelling: body.inSelling || body.price || 0,
    };

    const product = new Product(productData);
    await product.save();
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("POST /api/products error:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
