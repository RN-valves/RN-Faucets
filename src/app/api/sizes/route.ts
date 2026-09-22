import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { escapeRegex } from "@/lib/security";
import Size from "@/models/Size";

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const isExport = searchParams.get("export") === "true";
    const sortField = searchParams.get("sortField") || "idNumeric";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? 1 : -1;

    const filter: Record<string, unknown> = {};
    if (search.trim()) {
      const safeSearch = escapeRegex(search.trim());
      filter.$or = [
        { name: { $regex: safeSearch, $options: "i" } },
        { code: { $regex: safeSearch, $options: "i" } },
      ];
    }

    if (isExport) {
      const allItems = await Size.find(filter)
        .sort({ [sortField]: sortOrder })
        .lean();
      return NextResponse.json({ sizes: allItems, total: allItems.length });
    }

    const total = await Size.countDocuments(filter);
    const skip = (page - 1) * limit;

    const sizes = await Size.find(filter)
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(limit)
      .lean();

    return NextResponse.json({
      sizes,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("GET /api/sizes error:", error);
    return NextResponse.json({ error: "Failed to fetch sizes" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const name = (body.name || "").trim();

    if (!name) {
      return NextResponse.json({ error: "Size name is required" }, { status: 400 });
    }

    // Check if name already exists
    const existing = await Size.findOne({ name });
    if (existing) {
      return NextResponse.json({ error: "Size with this name already exists" }, { status: 400 });
    }

    // Find highest idNumeric
    const lastSize = await Size.findOne().sort({ idNumeric: -1 }).lean();
    const nextIdNumeric = (lastSize?.idNumeric || 0) + 1;
    const code = `SZ${nextIdNumeric}`;

    const newSize = new Size({
      idNumeric: nextIdNumeric,
      code,
      name,
      status: "Active",
    });

    await newSize.save();
    return NextResponse.json(newSize, { status: 201 });
  } catch (error) {
    console.error("POST /api/sizes error:", error);
    return NextResponse.json({ error: "Failed to create size" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const { id, name, status } = body;

    if (!id || !name?.trim()) {
      return NextResponse.json({ error: "ID and name are required" }, { status: 400 });
    }

    const updated = await Size.findByIdAndUpdate(
      id,
      {
        name: name.trim(),
        ...(status ? { status } : {}),
      },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ error: "Size not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT /api/sizes error:", error);
    return NextResponse.json({ error: "Failed to update size" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    }

    await Size.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/sizes error:", error);
    return NextResponse.json({ error: "Failed to delete size" }, { status: 500 });
  }
}
