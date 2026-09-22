import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { escapeRegex } from "@/lib/security";
import Product from "@/models/Product";

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const filter: Record<string, any> = {};

    if (q) {
      const safeQ = escapeRegex(q);
      filter.$or = [
        { code: { $regex: safeQ, $options: "i" } },
        { skuCode: { $regex: safeQ, $options: "i" } },
        { article: { $regex: safeQ, $options: "i" } },
        { name: { $regex: safeQ, $options: "i" } },
      ];
    }

    // Retrieve products that have gallery images or primary image
    const products = await Product.find({
      ...filter,
      $or: [
        { image: { $exists: true, $ne: "" } },
        { gallery: { $exists: true, $not: { $size: 0 } } },
      ],
    })
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Product.countDocuments({
      ...filter,
      $or: [
        { image: { $exists: true, $ne: "" } },
        { gallery: { $exists: true, $not: { $size: 0 } } },
      ],
    });

    // Flatten image entries matching ProductImage format
    const images: any[] = [];
    products.forEach((p) => {
      const galleryList = Array.isArray(p.gallery) && p.gallery.length > 0 ? p.gallery : p.image ? [p.image] : [];
      galleryList.forEach((imgUrl: string, idx: number) => {
        if (imgUrl) {
          images.push({
            id: `${p.id}_img_${idx}`,
            productId: p.id,
            skuCode: p.skuCode || p.code || p.id,
            article: p.article || "",
            name: p.name,
            image: imgUrl,
            isPrimary: imgUrl === p.image,
            createdAt: p.createdDate || "",
          });
        }
      });
    });

    return NextResponse.json({
      images,
      total: images.length,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    });
  } catch (error: any) {
    console.error("GET /api/product-images error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch product images" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const { sku_code, skuCode, image, article } = body;

    const targetCode = (sku_code || skuCode || article || "").toString().trim();
    const imageUrl = (image || "").toString().trim();

    if (!targetCode) {
      return NextResponse.json({ error: "Product SKU code or article is required." }, { status: 400 });
    }

    if (!imageUrl) {
      return NextResponse.json({ error: "Image URL is required." }, { status: 400 });
    }

    const product = await Product.findOne({
      $or: [{ skuCode: targetCode }, { code: targetCode }, { article: targetCode }, { id: targetCode }],
    });

    if (!product) {
      return NextResponse.json({ error: `Product with SKU Code "${targetCode}" not found!` }, { status: 404 });
    }

    const currentGallery = Array.isArray(product.gallery) ? product.gallery : product.image ? [product.image] : [];

    if (currentGallery.includes(imageUrl)) {
      return NextResponse.json({ success: true, message: "Product image already exists in gallery — skipped duplicate." });
    }

    const updatedGallery = [...currentGallery, imageUrl];
    const updatePayload: any = { gallery: updatedGallery };
    if (!product.image) {
      updatePayload.image = imageUrl;
    }

    await Product.findByIdAndUpdate(product._id, { $set: updatePayload });

    return NextResponse.json({
      success: true,
      message: `Product image linked successfully to SKU ${product.skuCode || product.code}.`,
    });
  } catch (error: any) {
    console.error("POST /api/product-images error:", error);
    return NextResponse.json({ error: error.message || "Failed to add product image" }, { status: 500 });
  }
}
