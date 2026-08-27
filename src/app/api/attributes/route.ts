import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import AttributeItem from "@/models/Attribute";

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    const filter: Record<string, unknown> = {};
    if (type) filter.type = type;

    const attributes = await AttributeItem.find(filter).sort({ name: 1 }).lean();
    return NextResponse.json(attributes);
  } catch (error) {
    console.error("GET /api/attributes error:", error);
    return NextResponse.json({ error: "Failed to fetch attributes" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const id = body.id || `ATTR-${Date.now()}`;

    const attr = new AttributeItem({
      ...body,
      id,
    });
    await attr.save();
    return NextResponse.json(attr, { status: 201 });
  } catch (error) {
    console.error("POST /api/attributes error:", error);
    return NextResponse.json({ error: "Failed to create attribute" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    await AttributeItem.findOneAndDelete({ id });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/attributes error:", error);
    return NextResponse.json({ error: "Failed to delete attribute" }, { status: 500 });
  }
}
