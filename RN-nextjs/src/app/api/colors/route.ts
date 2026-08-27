import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Color from "@/models/Color";

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
      filter.$or = [
        { name: { $regex: search.trim(), $options: "i" } },
        { code: { $regex: search.trim(), $options: "i" } },
      ];
    }

    if (isExport) {
      const allItems = await Color.find(filter)
        .sort({ [sortField]: sortOrder })
        .lean();
      return NextResponse.json({ colors: allItems, total: allItems.length });
    }

    const total = await Color.countDocuments(filter);
    const skip = (page - 1) * limit;

    const colors = await Color.find(filter)
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(limit)
      .lean();

    return NextResponse.json({
      colors,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("GET /api/colors error:", error);
    return NextResponse.json({ error: "Failed to fetch colors" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const name = (body.name || "").trim();
    const icon = (body.icon || "").trim();
    const hexCode = (body.hexCode || "").trim();

    if (!name) {
      return NextResponse.json({ error: "Color name is required" }, { status: 400 });
    }

    // Check if name already exists
    const existing = await Color.findOne({ name });
    if (existing) {
      return NextResponse.json({ error: "Color with this name already exists" }, { status: 400 });
    }

    // Find highest idNumeric
    const lastColor = await Color.findOne().sort({ idNumeric: -1 }).lean();
    const nextIdNumeric = (lastColor?.idNumeric || 0) + 1;
    const code = `CL${nextIdNumeric}`;

    const newColor = new Color({
      idNumeric: nextIdNumeric,
      code,
      name,
      icon,
      hexCode,
      status: "Active",
    });

    await newColor.save();
    return NextResponse.json(newColor, { status: 201 });
  } catch (error) {
    console.error("POST /api/colors error:", error);
    return NextResponse.json({ error: "Failed to create color" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const { id, name, icon, hexCode, status } = body;

    if (!id || !name?.trim()) {
      return NextResponse.json({ error: "ID and name are required" }, { status: 400 });
    }

    const updated = await Color.findByIdAndUpdate(
      id,
      {
        name: name.trim(),
        ...(icon !== undefined ? { icon: icon.trim() } : {}),
        ...(hexCode !== undefined ? { hexCode: hexCode.trim() } : {}),
        ...(status ? { status } : {}),
      },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ error: "Color not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT /api/colors error:", error);
    return NextResponse.json({ error: "Failed to update color" }, { status: 500 });
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

    await Color.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/colors error:", error);
    return NextResponse.json({ error: "Failed to delete color" }, { status: 500 });
  }
}
