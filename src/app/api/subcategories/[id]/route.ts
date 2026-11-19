import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Subcategory from "@/models/Subcategory";
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
        `rn:catalogue:subcategory-single:v2:${normalizedKey}`,
        600,
        async () => {
          await connectDB();
          const subcategory: any = await Subcategory.findOne({
            $or: [{ id }, { slug: id }],
          }).lean();
          if (!subcategory) return { __notFound: true, error: "Subcategory not found" };
          const subStatus = String(subcategory.status || "").toLowerCase();
          if (subcategory.isVisibleWebsite === false || subStatus === "inactive") {
            return { __notFound: true, error: "Subcategory is not available" };
          }
          return subcategory;
        },
        120
      );

      if (!data || (data as any).__notFound) {
        return NextResponse.json(
          { error: (data as any)?.error || "Subcategory not found" },
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
    const subcategory: any = await Subcategory.findOne({
      $or: [{ id }, { slug: id }],
    }).lean();

    if (!subcategory) return NextResponse.json({ error: "Subcategory not found" }, { status: 404 });

    return NextResponse.json(subcategory);
  } catch (error: any) {
    console.error("GET /api/subcategories/[id] error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch subcategory" }, { status: 500 });
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
        { error: "Unauthorized. Admin privileges required to update subcategories." },
        { status: 401 }
      );
    }

    await connectDB();
    const { id } = await params;
    const body = await request.json();

    if (body.name && !body.slug) {
      body.slug = body.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");
    }

    const updated = await Subcategory.findOneAndUpdate(
      { $or: [{ id }, { slug: id }] },
      body,
      { new: true }
    );
    if (!updated) return NextResponse.json({ error: "Subcategory not found" }, { status: 404 });
    await invalidateCatalogueAndHeaderCache();
    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("PUT /api/subcategories/[id] error:", error);
    return NextResponse.json({ error: error.message || "Failed to update subcategory" }, { status: 500 });
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
        { error: "Unauthorized. Admin privileges required to delete subcategories." },
        { status: 401 }
      );
    }

    await connectDB();
    const { id } = await params;
    const deleted = await Subcategory.findOneAndDelete({ $or: [{ id }, { slug: id }] });
    if (!deleted) return NextResponse.json({ error: "Subcategory not found" }, { status: 404 });
    await invalidateCatalogueAndHeaderCache();
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE /api/subcategories/[id] error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete subcategory" }, { status: 500 });
  }
}
