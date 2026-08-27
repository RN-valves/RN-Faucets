import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const items = Array.isArray(body) ? body : body.products;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Invalid array provided for import" }, { status: 400 });
    }

    let successCount = 0;
    let errorCount = 0;

    for (const item of items) {
      try {
        const skuCodeVal = item.sku_code ?? item.skuCode ?? item.code ?? item.id ?? item.article;
        if (!skuCodeVal) {
          errorCount++;
          continue;
        }

        const code = skuCodeVal.toString().trim();
        const id = (item.id || code).toString().trim();
        const article = item.article ? item.article.toString().trim() : "";

        // Find existing product to preserve non-provided fields
        const existing = await Product.findOne({
          $or: [{ id }, { code }, { skuCode: code }, ...(article ? [{ article }] : [])],
        });

        const updateData: Record<string, any> = {};

        // Helper to check if a key exists in item
        const hasKey = (key: string) => item[key] !== undefined && item[key] !== null && item[key] !== "";

        if (hasKey("name")) updateData.name = item.name;
        if (code) {
          updateData.code = code;
          updateData.skuCode = item.sku_code ?? item.skuCode ?? code;
        }
        if (article) updateData.article = article;

        if (hasKey("category")) updateData.category = item.category;
        if (hasKey("subcategory") || hasKey("subcategory_name") || hasKey("subcategoryName")) {
          updateData.subcategoryName = item.subcategory ?? item.subcategory_name ?? item.subcategoryName;
        }
        if (hasKey("subcategoryId") || hasKey("subcategory_id")) {
          updateData.subcategoryId = item.subcategoryId ?? item.subcategory_id;
        }
        if (hasKey("content_id") || hasKey("contentId")) {
          updateData.content_id = item.content_id ?? item.contentId;
        }

        if (hasKey("brand")) updateData.brand = item.brand;
        if (hasKey("material")) updateData.material = item.material;
        if (hasKey("color_name") || hasKey("colorName")) {
          updateData.colorName = item.color_name ?? item.colorName;
        }
        if (hasKey("size")) updateData.size = item.size;
        if (hasKey("hsn")) updateData.hsn = item.hsn;
        if (hasKey("sale_type") || hasKey("saleType")) {
          updateData.saleType = item.sale_type ?? item.saleType;
        }

        // Pricing
        if (hasKey("in_mrp") || hasKey("inMrp") || hasKey("originalPrice")) {
          const val = Number(item.in_mrp ?? item.inMrp ?? item.originalPrice);
          updateData.inMrp = val;
          updateData.originalPrice = val;
        }
        if (hasKey("in_selling") || hasKey("inSelling") || hasKey("price")) {
          const val = Number(item.in_selling ?? item.inSelling ?? item.price);
          updateData.inSelling = val;
          updateData.price = val;
        }
        if (hasKey("in_v1_mrp") || hasKey("inV1Mrp")) updateData.inV1Mrp = Number(item.in_v1_mrp ?? item.inV1Mrp);
        if (hasKey("oth_mrp") || hasKey("othMrp")) updateData.othMrp = Number(item.oth_mrp ?? item.othMrp);
        if (hasKey("oth_selling") || hasKey("othSelling")) updateData.othSelling = Number(item.oth_selling ?? item.othSelling);
        if (hasKey("oth_v1_mrp") || hasKey("othV1Mrp")) updateData.othV1Mrp = Number(item.oth_v1_mrp ?? item.othV1Mrp);

        // Grouping IDs
        if (hasKey("color_group_id") || hasKey("colorGroupId")) updateData.colorGroupId = item.color_group_id ?? item.colorGroupId;
        if (hasKey("product_combo_id") || hasKey("productComboId")) updateData.productComboId = item.product_combo_id ?? item.productComboId;
        if (hasKey("product_size_id") || hasKey("productSizeId")) updateData.productSizeId = item.product_size_id ?? item.productSizeId;

        // Quantities & Stock Specs
        if (hasKey("ctn_pcs") || hasKey("ctnPcs")) updateData.ctnPcs = Number(item.ctn_pcs ?? item.ctnPcs);
        if (hasKey("mid_ctn_pcs") || hasKey("midCtnPcs")) updateData.midCtnPcs = Number(item.mid_ctn_pcs ?? item.midCtnPcs);
        if (hasKey("inner_pcs") || hasKey("innerPcs")) updateData.innerPcs = Number(item.inner_pcs ?? item.innerPcs);
        if (hasKey("stock_pcs") || hasKey("stockPcs") || hasKey("stock")) {
          const sVal = Number(item.stock_pcs ?? item.stockPcs ?? item.stock);
          updateData.stockPcs = sVal;
          updateData.stock = sVal;
        }

        // Dimensions & Weights
        if (hasKey("only_product_wt_gm") || hasKey("onlyProductWtGm")) updateData.onlyProductWtGm = Number(item.only_product_wt_gm ?? item.onlyProductWtGm);
        if (hasKey("product_length") || hasKey("productLength")) updateData.productLength = Number(item.product_length ?? item.productLength);
        if (hasKey("product_breadth") || hasKey("productBreadth")) updateData.productBreadth = Number(item.product_breadth ?? item.productBreadth);
        if (hasKey("product_height") || hasKey("productHeight")) updateData.productHeight = Number(item.product_height ?? item.productHeight);
        if (hasKey("product_lbh_weight_gm") || hasKey("productLbhWeightGm")) updateData.productLbhWeightGm = Number(item.product_lbh_weight_gm ?? item.productLbhWeightGm);
        if (hasKey("mid_ctn_lbh_weight_kg") || hasKey("midCtnLbhWeightKg")) updateData.midCtnLbhWeightKg = Number(item.mid_ctn_lbh_weight_kg ?? item.midCtnLbhWeightKg);
        if (hasKey("master_ctn_lbh_weight_kg") || hasKey("masterCtnLbhWeightKg")) updateData.masterCtnLbhWeightKg = Number(item.master_ctn_lbh_weight_kg ?? item.masterCtnLbhWeightKg);

        // Warranties
        if (hasKey("residential_warranty") || hasKey("residentialWarranty")) updateData.residentialWarranty = Number(item.residential_warranty ?? item.residentialWarranty);
        if (hasKey("commercial_warranty") || hasKey("commercialWarranty")) updateData.commercialWarranty = Number(item.commercial_warranty ?? item.commercialWarranty);

        // Media & External Links
        if (hasKey("image")) {
          updateData.image = item.image;
          updateData.gallery = [item.image];
        }
        if (hasKey("amazon_link") || hasKey("amazonLink")) updateData.amazonLink = item.amazon_link ?? item.amazonLink;
        if (hasKey("flipkart_link") || hasKey("flipkartLink")) updateData.flipkartLink = item.flipkart_link ?? item.flipkartLink;
        if (hasKey("short_description") || hasKey("shortDescription")) updateData.shortDescription = item.short_description ?? item.shortDescription;
        if (hasKey("video_url") || hasKey("videoUrl")) updateData.videoUrl = item.video_url ?? item.videoUrl;

        // Status & Visibilities Flags
        if (hasKey("status")) updateData.status = item.status;
        if (hasKey("is_visible_website") || hasKey("isVisibleWebsite")) {
          const v = item.is_visible_website ?? item.isVisibleWebsite;
          updateData.isVisibleWebsite = v === "1" || v === 1 || v === "true" || v === true;
        }
        if (hasKey("is_visible_api") || hasKey("isVisibleApi")) {
          const v = item.is_visible_api ?? item.isVisibleApi;
          updateData.isVisibleApi = v === "1" || v === 1 || v === "true" || v === true;
        }
        if (hasKey("new_arrival") || hasKey("newArrival")) {
          const v = item.new_arrival ?? item.newArrival;
          updateData.newArrival = v === "1" || v === 1 || v === "true" || v === true;
        }
        if (hasKey("is_featured") || hasKey("isFeatured")) {
          const v = item.is_featured ?? item.isFeatured;
          updateData.isFeatured = v === "1" || v === 1 || v === "true" || v === true;
        }
        if (hasKey("is_full_turn") || hasKey("isFullTurn")) {
          const v = item.is_full_turn ?? item.isFullTurn;
          updateData.isFullTurn = v === "1" || v === 1 || v === "true" || v === true;
        }
        if (hasKey("full_turn_code") || hasKey("fullTurnCode")) updateData.fullTurnCode = item.full_turn_code ?? item.fullTurnCode;

        // SEO Info
        if (hasKey("title")) updateData.title = item.title;
        if (hasKey("keywords")) updateData.keywords = item.keywords;
        if (hasKey("description")) updateData.description = item.description;
        if (hasKey("search_keywords") || hasKey("searchKeywords")) {
          updateData.searchKeywords = item.search_keywords ?? item.searchKeywords;
        }

        if (!existing) {
          // Defaults for brand new product creation
          updateData.id = id;
          updateData.name = updateData.name || "New Bathware Product";
          updateData.price = updateData.price || 0;
          updateData.category = updateData.category || "Faucets";
          updateData.status = updateData.status || "In Stock";
          updateData.createdDate = new Date().toISOString().split("T")[0];
        }

        await Product.findOneAndUpdate(
          { $or: [{ id }, { code }, { skuCode: code }, ...(article ? [{ article }] : [])] },
          { $set: updateData },
          { upsert: true, new: true }
        );

        successCount++;
      } catch (err) {
        console.error("Error importing item:", err);
        errorCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Bulk updated/imported ${successCount} products successfully. ${errorCount > 0 ? `${errorCount} failed.` : ""}`,
      imported: successCount,
      failed: errorCount,
    });
  } catch (error: any) {
    console.error("POST /api/products/import error:", error);
    return NextResponse.json({ error: error.message || "Failed to process bulk import" }, { status: 500 });
  }
}


