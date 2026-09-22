import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { escapeRegex } from "@/lib/security";
import mongoose from "mongoose";

export async function GET(request: Request) {
  try {
    await connectDB();
    const db = mongoose.connection.db;
    if (!db) {
      return NextResponse.json({ error: "Database not connected" }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    const filter: Record<string, any> = {};
    if (type) {
      filter.type = { $regex: new RegExp(`^${escapeRegex(type)}$`, "i") };
    }

    const attributes = await db.collection("attributes").find(filter).sort({ name: 1 }).toArray();
    const mapped = attributes.map((a: any) => ({
      ...a,
      id: a.id || a.code || a._id?.toString(),
    }));
    return NextResponse.json(mapped);
  } catch (error: any) {
    console.error("GET /api/attributes error:", error);
    return NextResponse.json({ error: "Failed to fetch attributes" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const db = mongoose.connection.db;
    if (!db) {
      return NextResponse.json({ error: "Database not connected" }, { status: 500 });
    }

    const body = await request.json();
    const id = body.id || `ATTR-${Date.now()}`;
    const doc = {
      ...body,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.collection("attributes").insertOne(doc);
    return NextResponse.json(doc, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/attributes error:", error);
    return NextResponse.json({ error: "Failed to create attribute" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await connectDB();
    const db = mongoose.connection.db;
    if (!db) {
      return NextResponse.json({ error: "Database not connected" }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    await db.collection("attributes").deleteOne({
      $or: [{ id }, { code: id }],
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE /api/attributes error:", error);
    return NextResponse.json({ error: "Failed to delete attribute" }, { status: 500 });
  }
}
