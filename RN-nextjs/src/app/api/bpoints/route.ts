import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import BPoint from "@/models/BPoint";

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const modelId = searchParams.get("modelId");
    const modelType = searchParams.get("modelType") || "Category";

    const filter: Record<string, unknown> = {};
    if (modelId) filter.modelId = modelId;
    if (modelType) filter.modelType = modelType;

    const bpoints = await BPoint.find(filter).sort({ createdAt: 1 }).lean();
    return NextResponse.json(bpoints);
  } catch (error: any) {
    console.error("GET /api/bpoints error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch bullet points" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const { name, modelId, modelType } = body;

    if (!name || !modelId) {
      return NextResponse.json({ error: "Missing required fields: name and modelId" }, { status: 400 });
    }

    const doc = new BPoint({
      id: body.id || `bp-${Date.now()}`,
      modelType: modelType || "Category",
      modelId,
      name: String(name).trim(),
    });
    await doc.save();

    return NextResponse.json(doc, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/bpoints error:", error);
    return NextResponse.json({ error: error.message || "Failed to create bullet point" }, { status: 500 });
  }
}
