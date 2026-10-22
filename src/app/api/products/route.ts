import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import Subcategory from "@/models/Subcategory";
import Category from "@/models/Category";
import { requireAdminAuth, escapeRegex } from "@/lib/security";
import { getOrSetCache } from "@/lib/redis";
import { invalidateCatalogueAndHeaderCache } from "@/lib/catalogueData";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const isAll = searchParams.get("all") === "true" || searchParams.get("admin") === "true";
    const q = searchParams.get("q") || searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const subcategory = searchParams.get("subcategory") || "";
    const status = searchParams.get("status") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "0", 10);
    const countOnly = searchParams.get("countOnly") === "true" || searchParams.get("count") === "true";

    // Cache public search and category product queries in Redis (5 min TTL)
    if (!isAll && (limit > 0 || countOnly || category || subcategory || q)) {
      const cacheKey = `rn:catalogue:products:v2:q:${searchParams.toString().toLowerCase()}`;
      const { data, cacheStatus } = await getOrSetCache(
        cacheKey,
        300,
        async () => {
          return executeProductQuery(searchParams, {
            isAll,
            q,
            category,
            subcategory,
            status,
            page,
            limit,
            countOnly,
          });
        },
        60
      );
      return NextResponse.json(data, {
        headers: { "X-Cache": cacheStatus },
      });
    }

    const result = await executeProductQuery(searchParams, {
      isAll,
      q,
      category,
      subcategory,
      status,
      page,
      limit,
      countOnly,
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/products error:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

async function executeProductQuery(
  searchParams: URLSearchParams,
  params: {
    isAll: boolean;
    q: string;
    category: string;
    subcategory: string;
    status: string;
    page: number;
    limit: number;
    countOnly: boolean;
  }
) {
  await connectDB();
  const { isAll, q, category, subcategory, status, page, limit, countOnly } = params;
  const conditions: Record<string, unknown>[] = [];

    let keywordConditionRef: Record<string, unknown> | null = null;

    // 1. Comprehensive multi-field & natural-language text search (SKU, Article, Name, Category, Color, Price Range)
    if (q) {
      let cleanQ = q.trim();
      let minPrice: number | null = null;
      let maxPrice: number | null = null;

      // Parse natural-language price ranges (e.g. "ranging from 1000 to 15000 rupees", "below 5000 rupees", "under 2000")
      const rangeMatch = cleanQ.match(
        /(?:ranging\s+)?(?:from|between)\s+(\d+)\s+(?:to|and|-)\s+(\d+)(?:\s*(?:rupees|rupee|rs\.?|inr))?/i
      );
      if (rangeMatch) {
        minPrice = Number(rangeMatch[1]);
        maxPrice = Number(rangeMatch[2]);
        cleanQ = cleanQ.replace(rangeMatch[0], " ");
      }

      const belowMatch = cleanQ.match(
        /(?:below|under|less\s+than)\s+(\d+)(?:\s*(?:rupees|rupee|rs\.?|inr))?/i
      );
      if (belowMatch) {
        maxPrice = Number(belowMatch[1]);
        cleanQ = cleanQ.replace(belowMatch[0], " ");
      }

      const aboveMatch = cleanQ.match(
        /(?:above|over|more\s+than)\s+(\d+)(?:\s*(?:rupees|rupee|rs\.?|inr))?/i
      );
      if (aboveMatch) {
        minPrice = Number(aboveMatch[1]);
        cleanQ = cleanQ.replace(aboveMatch[0], " ");
      }

      if (minPrice !== null || maxPrice !== null) {
        const priceRangeCond: Record<string, number> = {};
        if (minPrice !== null) priceRangeCond.$gte = minPrice;
        if (maxPrice !== null) priceRangeCond.$lte = maxPrice;
        conditions.push({
          $or: [
            { inSelling: priceRangeCond },
            { price: priceRangeCond },
            { inMrp: priceRangeCond },
          ],
        });
      }

      const stopWords = new Set([
        "suggest",
        "show",
        "me",
        "find",
        "search",
        "for",
        "in",
        "on",
        "at",
        "with",
        "without",
        "ranging",
        "from",
        "to",
        "between",
        "and",
        "or",
        "below",
        "under",
        "above",
        "over",
        "rupees",
        "rupee",
        "rs",
        "inr",
        "price",
        "range",
        "shape",
        "type",
        "style",
        "finish",
        "the",
        "a",
        "an",
        "of",
        "best",
        "good",
        "luxury",
        "modern",
        "bathroom",
        "washroom",
        "sanitaryware",
      ]);

      const rawWords = cleanQ
        .split(/\s+/)
        .map((w) => w.replace(/[^a-zA-Z0-9-]/g, "").trim())
        .filter((w) => w.length > 0);

      const filteredWords = rawWords
        .filter((w) => !stopWords.has(w.toLowerCase()))
        .map((w) => {
          const lower = w.toLowerCase();
          if (
            /^(showers|faucets|mixers|diverters|valves|taps|panels|cocks|spouts|cisterns)$/i.test(
              lower
            )
          ) {
            return escapeRegex(w.slice(0, -1));
          }
          return escapeRegex(w);
        });

      const safeQ = escapeRegex(cleanQ.trim());
      const words =
        filteredWords.length > 0
          ? filteredWords
          : rawWords
              .filter((w) => !stopWords.has(w.toLowerCase()))
              .map((w) => escapeRegex(w));

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

      if (words.length === 1) {
        keywordConditionRef = { $or: getFieldOrConditions(words[0]) };
        conditions.push(keywordConditionRef);
      } else if (words.length > 1) {
        // Multi-word: Match full phrase in ANY field OR match ALL extracted keywords across fields (AND logic)
        const fullPhraseCondition = { $or: getFieldOrConditions(safeQ) };
        const allWordsCondition = {
          $and: words.map((w) => ({
            $or: getFieldOrConditions(w),
          })),
        };
        keywordConditionRef = { $or: [fullPhraseCondition, allWordsCondition] };
        conditions.push(keywordConditionRef);
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
      return { total, count: total };
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
      let products = await query.skip(skip).limit(limit).lean();

      // Smart Multi-Word Fallback if strict AND returned 0 results
      if (products.length === 0 && q) {
        const nonKeywordConds = conditions.filter((c) => c !== keywordConditionRef);
        const fallbackList = await runMultiWordFallbackQuery(q, nonKeywordConds, limit);
        return {
          products: fallbackList,
          total: fallbackList.length,
          page: 1,
          totalPages: 1,
          hasMore: false,
        };
      }

      return {
        products,
        total,
        page,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + products.length < total,
      };
    }

    if (!isAll && !subcategory && !category && !q) {
      query.limit(600);
    }

    let products = await query.lean();

    // Smart Multi-Word Fallback if strict AND returned 0 results (e.g. "Concealed shower diverter for bathroom")
    if (products.length === 0 && q) {
      const nonKeywordConds = conditions.filter((c) => c !== keywordConditionRef);
      products = await runMultiWordFallbackQuery(q, nonKeywordConds, 600);
    }

    return products;
}

async function runMultiWordFallbackQuery(
  rawQ: string,
  nonTextConditions: Record<string, unknown>[],
  maxResults = 600
) {
  const stopWords = new Set([
    "suggest", "show", "me", "find", "search", "for", "in", "on", "at", "with", "without",
    "ranging", "from", "to", "between", "and", "or", "below", "under", "above", "over",
    "rupees", "rupee", "rs", "inr", "price", "range", "shape", "type", "style", "finish",
    "the", "a", "an", "of", "best", "good", "luxury", "modern", "bathroom", "washroom", "sanitaryware",
  ]);

  const cleaned = rawQ
    .replace(/(?:ranging\s+)?(?:from|between)\s+\d+\s+(?:to|and|-)\s+\d+/gi, " ")
    .replace(/(?:below|under|above|over|less\s+than|more\s+than)\s+\d+/gi, " ");

  const words = cleaned
    .split(/\s+/)
    .map((w) => w.replace(/[^a-zA-Z0-9-]/g, "").trim().toLowerCase())
    .filter((w) => w.length >= 2 && !stopWords.has(w) && !/^\d+$/.test(w))
    .map((w) =>
      /^(showers|faucets|mixers|diverters|valves|taps|panels|cocks|spouts|cisterns)$/i.test(w)
        ? w.slice(0, -1)
        : w
    );

  if (words.length === 0) return [];

  const getFieldOrConditions = (term: string) => {
    const safe = escapeRegex(term);
    return [
      { name: { $regex: safe, $options: "i" } },
      { code: { $regex: safe, $options: "i" } },
      { skuCode: { $regex: safe, $options: "i" } },
      { article: { $regex: safe, $options: "i" } },
      { category: { $regex: safe, $options: "i" } },
      { subcategoryName: { $regex: safe, $options: "i" } },
      { colorName: { $regex: safe, $options: "i" } },
      { size: { $regex: safe, $options: "i" } },
    ];
  };

  const broadKeywordOr = {
    $or: words.flatMap((w) => getFieldOrConditions(w)),
  };
  const fallbackFilter =
    nonTextConditions.length > 0
      ? { $and: [broadKeywordOr, ...nonTextConditions] }
      : broadKeywordOr;

  const candidates: any[] = await Product.find(fallbackFilter)
    .select("-bullets -description -keywords -searchKeywords -gallery")
    .limit(1200)
    .lean();

  if (candidates.length === 0) return [];

  // Score each candidate by how many query words it matches (weighted higher for name & subcategoryName matches)
  const scored = candidates.map((p) => {
    const primaryHaystack = `${p.name || ""} ${p.subcategoryName || ""}`.toLowerCase();
    const fullHaystack = `${primaryHaystack} ${p.category || ""} ${p.colorName || ""} ${p.code || ""} ${p.size || ""}`.toLowerCase();
    let matchedCount = 0;
    let score = 0;
    for (const w of words) {
      if (fullHaystack.includes(w)) {
        matchedCount += 1;
        score += primaryHaystack.includes(w) ? 15 : 8;
      }
    }
    return { product: p, matchedCount, score };
  });

  const maxMatched = Math.max(...scored.map((s) => s.matchedCount));
  const minRequired = maxMatched >= 2 ? maxMatched : 1;

  return scored
    .filter((s) => s.matchedCount >= minRequired)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults)
    .map((s) => s.product);
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

    let subcategoryId = body.subcategoryId || "";
    let subcategoryName = body.subcategoryName || body.subcategory || "";
    let categoryName = body.category || "";

    if ((!subcategoryId || subcategoryId === "") && subcategoryName) {
      const matchedSub = await Subcategory.findOne({
        $or: [
          { name: { $regex: new RegExp(`^${escapeRegex(subcategoryName.trim())}$`, "i") } },
          { slug: subcategoryName.trim().toLowerCase() },
        ],
      }).lean();
      if (matchedSub) {
        subcategoryId = String(matchedSub.id || matchedSub._id);
        subcategoryName = matchedSub.name;
        if (!categoryName && matchedSub.categoryName) {
          categoryName = matchedSub.categoryName;
        }
      }
    }

    const productData = {
      ...body,
      id: assignedId,
      code,
      urlKey,
      subcategoryId,
      subcategoryName,
      category: categoryName || "Faucets",
      createdDate: new Date().toISOString().split("T")[0],
      stockPcs: body.stockPcs !== undefined ? body.stockPcs : body.stock || 0,
      inMrp: body.inMrp || body.originalPrice || body.price || 0,
      inSelling: body.inSelling || body.price || 0,
    };

    const product = new Product(productData);
    await product.save();
    await invalidateCatalogueAndHeaderCache();
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("POST /api/products error:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
