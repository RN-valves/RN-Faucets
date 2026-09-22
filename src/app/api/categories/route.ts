import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Category from "@/models/Category";
import { sanitizeObject, sanitizeString } from "@/lib/security";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const showAll =
      searchParams.get("all") === "true" ||
      searchParams.get("admin") === "true";

    const filter: Record<string, unknown> = {};

    if (!showAll) {
      filter.status = { $ne: "Inactive" };
      filter.isVisibleWebsite = { $ne: false };
    }

    const categories = await Category.find(filter).sort({ createdAt: -1 }).lean();
    return NextResponse.json(categories);
  } catch (error) {
    return handleApiError(error, "GET /api/categories");
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const rawBody = await request.json().catch(() => ({}));
    const body = sanitizeObject(rawBody);

    const name = sanitizeString(body.name, 100);
    if (!name) {
      return apiError("Category name is required.", { status: 400 });
    }

    const id = body.id ? sanitizeString(body.id, 50) : `cat-${Date.now()}`;
    const slug =
      body.slug ? sanitizeString(body.slug, 80) : name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");

    const category = new Category({
      ...body,
      name,
      id,
      slug,
      status: body.status || "Active",
      isVisibleWebsite: body.isVisibleWebsite !== undefined ? Boolean(body.isVisibleWebsite) : true,
    });
    await category.save();
    return NextResponse.json(category, { status: 201 });
  } catch (error: any) {
    return handleApiError(error, "POST /api/categories");
  }
}
