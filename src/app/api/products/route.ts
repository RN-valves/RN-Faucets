import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import { requireAdminAuth, escapeRegex } from "@/lib/security";

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
    const countOnly = searchParams.get("countOnly") === "true" || searchParams.get("count") === "true";

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
      const safeCategory = escapeRegex(category);
      const normCat = escapeRegex(category.replace(/-/g, " "));
      filter.$or = [
        { category: { $regex: `^${safeCategory}$`, $options: "i" } },
        { category: { $regex: `^${normCat}$`, $options: "i" } },
        { subcategoryName: { $regex: `^${safeCategory}$`, $options: "i" } },
        { subcategoryName: { $regex: `^${normCat}$`, $options: "i" } },
        { subcategoryId: category },
      ];
    }

    if (subcategory && subcategory !== "All") {
      const safeSub = escapeRegex(subcategory);
      const normSub = escapeRegex(subcategory.replace(/-/g, " "));
      filter.$or = [
        { subcategoryId: subcategory },
        { subcategoryName: { $regex: safeSub, $options: "i" } },
        { subcategoryName: { $regex: normSub, $options: "i" } },
        { category: { $regex: safeSub, $options: "i" } },
        { category: { $regex: normSub, $options: "i" } },
      ];
    }

    if (status && status !== "All") {
      filter.status = status;
    }

    if (countOnly) {
      const total = await Product.countDocuments(filter);
      return NextResponse.json({ total, count: total });
    }

    const sortBy = searchParams.get("sortBy") || searchParams.get("sort") || "";
    let sortOptions: Record<string, 1 | -1> = { name: 1, article: 1, inSelling: 1 };

    if (sortBy === "price_asc" || sortBy === "price_low_high" || sortBy === "price_lowest") {
      sortOptions = { inSelling: 1, price: 1 };
    } else if (sortBy === "price_desc" || sortBy === "price_high_low" || sortBy === "price_highest") {
      sortOptions = { inSelling: -1, price: -1 };
    } else if (sortBy === "newest" || sortBy === "product_new") {
      sortOptions = { createdAt: -1 };
    } else if (sortBy === "name_desc" || sortBy === "name_z_a") {
      sortOptions = { name: -1, article: -1 };
    } else if (sortBy === "name_asc" || sortBy === "name_a_z") {
      sortOptions = { name: 1, article: 1 };
    } else {
      // Default: Logical grouping by name, article & price
      sortOptions = { name: 1, article: 1, inSelling: 1 };
    }

    const query = Product.find(filter)
      .select("-bullets -description -keywords -searchKeywords -gallery")
      .sort(sortOptions);

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
    const adminSession = await requireAdminAuth(request);
    if (!adminSession) {
      return NextResponse.json(
        { error: "Unauthorized. Admin privileges required to create products." },
        { status: 401 }
      );
    }

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
