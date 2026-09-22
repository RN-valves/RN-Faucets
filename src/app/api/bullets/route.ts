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
    const q = searchParams.get("q")?.trim() || "";
    const sub = searchParams.get("sub") || "product"; // "product" (527) or "category" (3)
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const skip = (page - 1) * limit;

    const collectionName = sub === "category" ? "b_points" : "product_bullets";
    const collection = db.collection(collectionName);

    const query: Record<string, any> = {};
    if (q) {
      const safeQ = escapeRegex(q);
      query.$or = [
        { name: { $regex: safeQ, $options: "i" } },
      ];
      if (!isNaN(Number(q))) {
        query.$or.push({ id: Number(q) });
      }
    }

    const total = await collection.countDocuments(query);
    const items = await collection
      .find(query)
      .sort({ id: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    return NextResponse.json({
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      sub,
    });
  } catch (error: any) {
    console.error("GET /api/bullets error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch bullets" }, { status: 500 });
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
    const { name, sub = "product", status = "Active", modelType = "Category", modelId = 14 } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const collectionName = sub === "category" ? "b_points" : "product_bullets";
    const collection = db.collection(collectionName);

    // Get max ID
    const lastItem = await collection.find({}).sort({ id: -1 }).limit(1).toArray();
    const nextId = lastItem.length > 0 ? (lastItem[0].id || 0) + 1 : 1;

    const now = new Date();
    const doc: Record<string, any> = {
      id: nextId,
      name: name.trim(),
      status,
      createdAt: now,
      updatedAt: now,
    };

    if (sub === "category") {
      doc.modelType = modelType;
      doc.modelId = parseInt(modelId, 10) || 14;
    } else {
      doc.bulletId = `PB${nextId}`;
      doc.categoryId = 0;
    }

    await collection.insertOne(doc);
    return NextResponse.json(doc, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/bullets error:", error);
    return NextResponse.json({ error: error.message || "Failed to create bullet" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await connectDB();
    const db = mongoose.connection.db;
    if (!db) {
      return NextResponse.json({ error: "Database not connected" }, { status: 500 });
    }

    const body = await request.json();
    const { id, name, status, sub = "product" } = body;

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const collectionName = sub === "category" ? "b_points" : "product_bullets";
    const collection = db.collection(collectionName);

    const updateFields: Record<string, any> = { updatedAt: new Date() };
    if (name) updateFields.name = name.trim();
    if (status) updateFields.status = status;

    const res = await collection.findOneAndUpdate(
      { id: Number(id) },
      { $set: updateFields },
      { returnDocument: "after" }
    );

    return NextResponse.json(res);
  } catch (error: any) {
    console.error("PUT /api/bullets error:", error);
    return NextResponse.json({ error: error.message || "Failed to update bullet" }, { status: 500 });
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
    const sub = searchParams.get("sub") || "product";

    if (!id) {
      return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    }

    const collectionName = sub === "category" ? "b_points" : "product_bullets";
    const collection = db.collection(collectionName);

    await collection.deleteOne({ id: Number(id) });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE /api/bullets error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete bullet" }, { status: 500 });
  }
}
