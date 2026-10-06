import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import { requireAdminAuth, escapeRegex } from "@/lib/security";

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const subcategory = searchParams.get("subcategory") || "";
    const status = searchParams.get("status") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "0", 10);
    const countOnly = searchParams.get("countOnly") === "true" || searchParams.get("count") === "true";

    const conditions: Record<string, unknown>[] = [];

    // 1. Comprehensive multi-field text search (SKU, Article, Name, Category, Color, Keywords)
    if (q) {
      const cleanQ = q.trim();
      const safeQ = escapeRegex(cleanQ);
      const words = cleanQ.split(/\s+/).map((w) => escapeRegex(w)).filter((w) => w.length > 0);

      const getFieldOrConditions = (term: string) => [
        { name: { $regex: term, $options: "i" } },
        { code: { $regex: term, $options: "i" } },
        { skuCode: { $regex: term, $options: "i" } },
        { article: { $regex: term, $options: "i" } },
        { category: { $regex: term, $options: "i" } },
        { subcategoryName: { $regex: term, $options: "i" } },
        { subcategoryId: { $regex: term, $options: "i" } },
        { colorName: { $regex: term, $options: "i" } },
        { size: { $regex: term, $options: "i" } },
        { brand: { $regex: term, $options: "i" } },
        { material: { $regex: term, $options: "i" } },
        { searchKeywords: { $regex: term, $options: "i" } },
        { title: { $regex: term, $options: "i" } },
        { description: { $regex: term, $options: "i" } },
      ];

      if (words.length <= 1) {
        conditions.push({ $or: getFieldOrConditions(safeQ) });
      } else {
        // Multi-word: Match full phrase in ANY field OR match ALL words across fields (AND logic)
        const fullPhraseCondition = { $or: getFieldOrConditions(safeQ) };
        const allWordsCondition = {
          $and: words.map((w) => ({
            $or: getFieldOrConditions(w),
          })),
        };
        conditions.push({ $or: [fullPhraseCondition, allWordsCondition] });
      }
    }

    // 2. Category Filter
    if (category && category !== "All" && category !== "all") {
      const safeCategory = escapeRegex(category);
      const normCat = escapeRegex(category.replace(/-/g, " "));
      conditions.push({
        $or: [
          { category: { $regex: `^${safeCategory}$`, $options: "i" } },
          { category: { $regex: `^${normCat}$`, $options: "i" } },
          { subcategoryName: { $regex: `^${safeCategory}$`, $options: "i" } },
          { subcategoryName: { $regex: `^${normCat}$`, $options: "i" } },
          { subcategoryId: category },
        ],
      });
    }

    // 3. Subcategory Filter
    if (subcategory && subcategory !== "All" && subcategory !== "all") {
      const safeSub = escapeRegex(subcategory);
      const normSub = escapeRegex(subcategory.replace(/-/g, " "));
      conditions.push({
        $or: [
          { subcategoryId: subcategory },
          { subcategoryName: { $regex: safeSub, $options: "i" } },
          { subcategoryName: { $regex: normSub, $options: "i" } },
          { category: { $regex: safeSub, $options: "i" } },
          { category: { $regex: normSub, $options: "i" } },
        ],
      });
    }

    // 4. Color / Finish Filter
    const color = searchParams.get("color");
    if (color && color !== "All" && color !== "all") {
      const colors = color.split(",").map((c) => escapeRegex(c.trim())).filter(Boolean);
      if (colors.length > 0) {
        conditions.push({
          $or: colors.map((c) => ({ colorName: { $regex: c, $options: "i" } })),
        });
      }
    }

    // 5. Size Filter
    const size = searchParams.get("size");
    if (size && size !== "All" && size !== "all") {
      const sizes = size.split(",").map((s) => escapeRegex(s.trim())).filter(Boolean);
      if (sizes.length > 0) {
        conditions.push({
          $or: sizes.map((s) => ({ size: { $regex: s, $options: "i" } })),
        });
      }
    }

    // 6. Price Range Filters (inSelling or price)
    const minPrice = parseFloat(searchParams.get("minPrice") || "");
    const maxPrice = parseFloat(searchParams.get("maxPrice") || "");
    if (!isNaN(minPrice) && !isNaN(maxPrice)) {
      conditions.push({
        $or: [
          { inSelling: { $gte: minPrice, $lte: maxPrice } },
          { price: { $gte: minPrice, $lte: maxPrice } },
        ],
      });
    } else if (!isNaN(minPrice)) {
      conditions.push({
        $or: [
          { inSelling: { $gte: minPrice } },
          { price: { $gte: minPrice } },
        ],
      });
    } else if (!isNaN(maxPrice)) {
      conditions.push({
        $or: [
          { inSelling: { $lte: maxPrice } },
          { price: { $lte: maxPrice } },
        ],
      });
    }

    // 7. Status Filter
    if (status && status !== "All") {
      conditions.push({ status });
    }

    // 8. Website Visibility Filter (Matches Laravel: is_visible_website == 1)
    const isAll = searchParams.get("all") === "true" || searchParams.get("admin") === "true";
    if (!isAll) {
      conditions.push({ isVisibleWebsite: { $ne: false } });
    }

    // 9. New Arrival & Featured Filters
    const newArrival = searchParams.get("newArrival") || searchParams.get("new_arrival");
    if (newArrival === "true" || newArrival === "1") {
      conditions.push({ newArrival: true });
    }

    const isFeatured = searchParams.get("featured") || searchParams.get("isFeatured");
    if (isFeatured === "true" || isFeatured === "1") {
      conditions.push({ isFeatured: true });
    }

    const filter = conditions.length === 0 ? {} : conditions.length === 1 ? conditions[0] : { $and: conditions };

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
        hasMore: skip + products.length < total,
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
    const code = body.code ? body.code.toUpperCase().trim() : `RN-${Date.now()}`;
    
    // Auto-increment numeric ID (find highest numeric id < 1000000)
    let assignedId = body.id ? String(body.id).trim() : "";
    if (!assignedId || assignedId.startsWith("PROD-") || isNaN(parseInt(assignedId, 10)) || parseInt(assignedId, 10) > 1000000) {
      const allProductIds = await Product.find({}, { id: 1 }).lean();
      let maxNum = 0;
      for (const p of allProductIds) {
        const n = parseInt(p.id, 10);
        if (!isNaN(n) && n < 1000000 && n > maxNum) {
          maxNum = n;
        }
      }
      assignedId = String(maxNum > 0 ? maxNum + 1 : 9915);
    }

    const urlKey = body.urlKey || (body.name ? body.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") : assignedId.toLowerCase());

    const productData = {
      ...body,
      id: assignedId,
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
