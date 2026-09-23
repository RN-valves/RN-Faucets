import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Subcategory from "@/models/Subcategory";
import Product from "@/models/Product";
import { requireAdminAuth } from "@/lib/security";

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");
    const showAll =
      searchParams.get("all") === "true" ||
      searchParams.get("admin") === "true";

    const filter: Record<string, unknown> = {};
    if (categoryId) filter.categoryId = categoryId;

    if (!showAll) {
      filter.status = { $ne: "Inactive" };
      filter.isVisibleWebsite = { $ne: false };
    }

    const subcategories = await Subcategory.find(filter).sort({ displayOrder: 1, createdAt: -1 }).lean();

    const counts = await Product.aggregate([
      { $group: { _id: "$subcategoryName", count: { $sum: 1 } } },
    ]);
    const countMap = new Map<string, number>();
    counts.forEach((c) => {
      if (c._id) countMap.set(c._id.toString().toLowerCase().trim(), c.count);
    });

    const subcategoriesWithCount = subcategories.map((sub: any) => {
      const nameKey = (sub.name || "").toLowerCase().trim();
      const count = countMap.get(nameKey) || 0;
      return {
        ...sub,
        productCount: count,
      };
    });

    return NextResponse.json(subcategoriesWithCount);
  } catch (error) {
    console.error("GET /api/subcategories error:", error);
    return NextResponse.json({ error: "Failed to fetch subcategories" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const adminSession = await requireAdminAuth(request);
    if (!adminSession) {
      return NextResponse.json(
        { error: "Unauthorized. Admin privileges required to create subcategories." },
        { status: 401 }
      );
    }

    await connectDB();
    const body = await request.json();
    const slug = body.slug || (body.name ? body.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") : `sub-${Date.now()}`);
    const id = body.id || `SUB-${Date.now()}`;

    const subcategory = new Subcategory({
      ...body,
      id,
      slug,
    });
    await subcategory.save();
    return NextResponse.json(subcategory, { status: 201 });
  } catch (error) {
    console.error("POST /api/subcategories error:", error);
    return NextResponse.json({ error: "Failed to create subcategory" }, { status: 500 });
  }
}
