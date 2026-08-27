import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import CataloguePdf from "@/models/Catalogue";

export async function GET() {
  try {
    await connectDB();
    const catalogues = await CataloguePdf.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json(catalogues);
  } catch (error) {
    console.error("GET /api/catalogues error:", error);
    return NextResponse.json({ error: "Failed to fetch catalogues" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const id = body.id || `CAT-${Date.now()}`;
    // Simple QR SVG data URI / URL generation helper if qrCode is empty
    const qrCode = body.qrCode || `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(body.pdf || "https://rnvalves.com")}`;

    const catalogue = new CataloguePdf({
      ...body,
      id,
      qrCode,
    });
    await catalogue.save();
    return NextResponse.json(catalogue, { status: 201 });
  } catch (error) {
    console.error("POST /api/catalogues error:", error);
    return NextResponse.json({ error: "Failed to create catalogue" }, { status: 500 });
  }
}
