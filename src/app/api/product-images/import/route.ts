import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const items = Array.isArray(body) ? body : body.images || body.products;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Invalid array provided for product images import" }, { status: 400 });
    }

    let successCount = 0;
    let errorCount = 0;

    for (const item of items) {
      try {
        const skuCodeVal = item.sku_code ?? item.skuCode ?? item.article ?? item.code ?? item.id;
        const imgUrl = (item.image ?? item.image_url ?? item.url ?? "").toString().trim();

        if (!skuCodeVal || !imgUrl) {
          errorCount++;
          continue;
        }

        const targetCode = skuCodeVal.toString().trim();

        const product = await Product.findOne({
          $or: [{ skuCode: targetCode }, { code: targetCode }, { article: targetCode }, { id: targetCode }],
        });

        if (!product) {
          errorCount++;
          continue;
        }

        const currentGallery = Array.isArray(product.gallery) ? product.gallery : product.image ? [product.image] : [];

        if (!currentGallery.includes(imgUrl)) {
          const updatedGallery = [...currentGallery, imgUrl];
          const updatePayload: any = { gallery: updatedGallery };
          if (!product.image) {
            updatePayload.image = imgUrl;
          }
          await Product.findByIdAndUpdate(product._id, { $set: updatePayload });
        }

        successCount++;
      } catch (err) {
        console.error("Error importing product image item:", err);
        errorCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully processed ${successCount} product images. ${errorCount > 0 ? `${errorCount} skipped/failed.` : ""}`,
      imported: successCount,
      failed: errorCount,
    });
  } catch (error: any) {
    console.error("POST /api/product-images/import error:", error);
    return NextResponse.json({ error: error.message || "Failed to process product images import" }, { status: 500 });
  }
}
