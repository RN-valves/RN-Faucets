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
    const status = searchParams.get("status") || "";

    const query: Record<string, any> = {};
    if (status) query.status = status;
    if (q) {
      const safeQ = escapeRegex(q);
      query.$or = [
        { name: { $regex: safeQ, $options: "i" } },
        { title: { $regex: safeQ, $options: "i" } },
        { shortDescription: { $regex: safeQ, $options: "i" } },
        { createdBy: { $regex: safeQ, $options: "i" } },
      ];
    }

    const collection = db.collection("news");
    const news = await collection.find(query).sort({ id: -1 }).toArray();

    return NextResponse.json({ news, total: news.length });
  } catch (error: any) {
    console.error("GET /api/news error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch news" }, { status: 500 });
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
    const {
      name,
      title,
      urlKey,
      keywords = "",
      description = "",
      shortDescription = "",
      content = "",
      image = "",
      status = "Active",
      publishedAt,
    } = body;

    if (!name || !title) {
      return NextResponse.json({ error: "Name and title are required" }, { status: 400 });
    }

    const collection = db.collection("news");
    const lastItem = await collection.find({}).sort({ id: -1 }).limit(1).toArray();
    const nextId = lastItem.length > 0 ? (lastItem[0].id || 0) + 1 : 1;

    const slug = urlKey || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    const now = new Date();

    const doc = {
      id: nextId,
      newsId: `NW${nextId}`,
      authId: 1,
      createdBy: "Admin",
      name: name.trim(),
      urlKey: slug,
      slug,
      title: title.trim(),
      keywords: keywords.trim(),
      description: description.trim(),
      shortDescription: shortDescription.trim(),
      content: content.trim(),
      image: image.trim(),
      status: status || "Active",
      publishedAt: publishedAt ? new Date(publishedAt) : now,
      createdAt: now,
      updatedAt: now,
    };

    await collection.insertOne(doc);
    return NextResponse.json(doc, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/news error:", error);
    return NextResponse.json({ error: error.message || "Failed to create news" }, { status: 500 });
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
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing news ID" }, { status: 400 });
    }

    const collection = db.collection("news");
    updates.updatedAt = new Date();
    if (updates.publishedAt) {
      updates.publishedAt = new Date(updates.publishedAt);
    }

    const res = await collection.findOneAndUpdate(
      { id: Number(id) },
      { $set: updates },
      { returnDocument: "after" }
    );

    return NextResponse.json(res);
  } catch (error: any) {
    console.error("PUT /api/news error:", error);
    return NextResponse.json({ error: error.message || "Failed to update news" }, { status: 500 });
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

    if (!id) {
      return NextResponse.json({ error: "Missing news ID" }, { status: 400 });
    }

    const collection = db.collection("news");
    await collection.deleteOne({ id: Number(id) });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE /api/news error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete news" }, { status: 500 });
  }
}
