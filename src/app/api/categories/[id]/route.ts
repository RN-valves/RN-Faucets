import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Category from "@/models/Category";
import { requireAdminAuth } from "@/lib/security";
import { getOrSetCache } from "@/lib/redis";
import { invalidateCatalogueAndHeaderCache } from "@/lib/catalogueData";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const isAdminQuery =
      searchParams.get("admin") === "true" || searchParams.get("all") === "true";
    const adminSession = isAdminQuery ? await requireAdminAuth(request) : null;

    if (!adminSession) {
      const normalizedKey = decodeURIComponent(id).trim().toLowerCase();
      const { data, cacheStatus } = await getOrSetCache(
        `rn:catalogue:category-single:v2:${normalizedKey}`,
        600,
        async () => {
          await connectDB();
          const category: any = await Category.findOne({
            $or: [{ id }, { slug: id }],
          }).lean();
          if (!category) return { __notFound: true, error: "Category not found" };
          const catStatus = String(category.status || "").toLowerCase();
          if (category.isVisibleWebsite === false || catStatus === "inactive") {
            return { __notFound: true, error: "Category is not available" };
          }
          return category;
        },
        120
      );

      if (!data || (data as any).__notFound) {
        return NextResponse.json(
          { error: (data as any)?.error || "Category not found" },
          { status: 404, headers: { "X-Cache": cacheStatus } }
        );
      }

      return NextResponse.json(data, {
        headers: {
          "X-Cache": cacheStatus,
          "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600",
        },
      });
    }

    await connectDB();
    // Search by ID or slug
    const category: any = await Category.findOne({
      $or: [{ id }, { slug: id }],
    }).lean();

    if (!category) return NextResponse.json({ error: "Category not found" }, { status: 404 });

    return NextResponse.json(category);
  } catch (error: any) {
    console.error("GET /api/categories/[id] error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch category" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminSession = await requireAdminAuth(request);
    if (!adminSession) {
      return NextResponse.json(
        { error: "Unauthorized. Admin privileges required to update categories." },
        { status: 401 }
      );
    }

    await connectDB();
    const { id } = await params;
    const body = await request.json();

    if (body.name && !body.slug) {
      body.slug = body.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");
    }

    delete body._id;

    const updated = await Category.findOneAndUpdate(
      { $or: [{ id }, { slug: id }] },
      { $set: body },
      { new: true, runValidators: false }
    );
    if (!updated) return NextResponse.json({ error: "Category not found" }, { status: 404 });
    await invalidateCatalogueAndHeaderCache();
    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("PUT /api/categories/[id] error:", error);
    return NextResponse.json({ error: error.message || "Failed to update category" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminSession = await requireAdminAuth(request);
    if (!adminSession) {
      return NextResponse.json(
        { error: "Unauthorized. Admin privileges required to delete categories." },
        { status: 401 }
      );
    }

    await connectDB();
    const { id } = await params;
    const deleted = await Category.findOneAndDelete({ $or: [{ id }, { slug: id }] });
    if (!deleted) return NextResponse.json({ error: "Category not found" }, { status: 404 });
    await invalidateCatalogueAndHeaderCache();
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE /api/categories/[id] error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete category" }, { status: 500 });
  }
}
