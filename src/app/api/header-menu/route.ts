import { NextResponse } from "next/server";
import { getHeaderMenuBundleCached, DEFAULT_HEADER_CONFIG } from "@/lib/catalogueData";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { data, cacheStatus } = await getHeaderMenuBundleCached();

    return NextResponse.json(data, {
      status: 200,
      headers: {
        "X-Cache": cacheStatus,
        "Cache-Control": "public, max-age=30, s-maxage=120, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("GET /api/header-menu error:", error);
    return NextResponse.json(
      {
        header: DEFAULT_HEADER_CONFIG,
        categories: [],
        subcategories: [],
        cachedAt: new Date().toISOString(),
      },
      { status: 200 }
    );
  }
}
