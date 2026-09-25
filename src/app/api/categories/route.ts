import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Category from "@/models/Category";
import Product from "@/models/Product";
import { requireAdminAuth } from "@/lib/security";

export const dynamic = "force-dynamic";
export const revalidate = 0;

let cachedCategoriesResponse: any = null;
let lastCategoriesFetch = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const showAll =
      searchParams.get("all") === "true" ||
      searchParams.get("admin") === "true";

    if (!showAll && cachedCategoriesResponse && Date.now() - lastCategoriesFetch < 60000) {
      return NextResponse.json(cachedCategoriesResponse);
    }

    await connectDB();

    const filter: Record<string, unknown> = {};

    if (!showAll) {
      filter.status = { $ne: "Inactive" };
      filter.isVisibleWebsite = { $ne: false };
    }

    const rawCategories = await Category.find(filter).sort({ createdAt: -1 }).lean();

    // Sort categories: items with displayOrder > 0 come first in ascending order (1st, 2nd, 3rd...), then items without displayOrder
    const categories = rawCategories.sort((a: any, b: any) => {
      const orderA = a.displayOrder && a.displayOrder > 0 ? a.displayOrder : 999999;
      const orderB = b.displayOrder && b.displayOrder > 0 ? b.displayOrder : 999999;
      if (orderA !== orderB) return orderA - orderB;
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });

    const counts = await Product.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);
    const countMap = new Map<string, number>();
    counts.forEach((c) => {
      if (c._id) countMap.set(c._id.toString().toLowerCase().trim(), c.count);
    });

    const categoriesWithCount = categories.map((cat: any) => {
      const nameKey = (cat.name || "").toLowerCase().trim();
      const slugKey = (cat.slug || "").toLowerCase().trim();
      const count = countMap.get(nameKey) || countMap.get(slugKey) || 0;
      return {
        ...cat,
        productCount: count,
      };
    });

    if (!showAll) {
      cachedCategoriesResponse = categoriesWithCount;
      lastCategoriesFetch = Date.now();
    }

    return NextResponse.json(categoriesWithCount);
  } catch (error) {
    console.error("GET /api/categories error:", error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    cachedCategoriesResponse = null;
    const adminSession = await requireAdminAuth(request);
    if (!adminSession) {
      return NextResponse.json(
        { error: "Unauthorized. Admin privileges required to create categories." },
        { status: 401 }
      );
    }

    await connectDB();
    const body = await request.json();
    const id = body.id || `cat-${Date.now()}`;
    const slug = body.slug || body.name?.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");

    const category = new Category({
      ...body,
      id,
      slug,
      status: body.status || "Active",
      isVisibleWebsite: body.isVisibleWebsite !== undefined ? body.isVisibleWebsite : true,
    });
    await category.save();
    return NextResponse.json(category, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/categories error:", error);
    return NextResponse.json({ error: error.message || "Failed to create category" }, { status: 500 });
  }
}
