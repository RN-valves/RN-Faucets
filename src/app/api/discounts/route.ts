import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Discount from "@/models/Discount";
import { requireAdminAuth, escapeRegex } from "@/lib/security";

const DEFAULT_MOCK_DISCOUNTS = [
  {
    id: "disc-rn05off",
    name: "RN05OFF",
    type: "Percent",
    value: 5,
    startValue: 1500,
    endValue: 1000,
    expiredAt: "2026-12-31",
    status: "Active",
  },
  {
    id: "disc-welcome200",
    name: "WELCOME200",
    type: "Amount",
    value: 200,
    startValue: 2500,
    endValue: 200,
    expiredAt: "2026-11-30",
    status: "Active",
  },
  {
    id: "disc-festive10",
    name: "FESTIVE10",
    type: "Percent",
    value: 10,
    startValue: 5000,
    endValue: 2500,
    expiredAt: "2026-10-31",
    status: "Active",
  },
  {
    id: "disc-b2bbulk15",
    name: "B2BBULK15",
    type: "Percent",
    value: 15,
    startValue: 15000,
    endValue: 10000,
    expiredAt: "2026-12-31",
    status: "Active",
  },
];

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    const status = searchParams.get("status") || "All";

    const count = await Discount.countDocuments();
    if (count === 0) {
      await Discount.insertMany(DEFAULT_MOCK_DISCOUNTS);
    }

    const query: any = {};
    if (q) {
      query.name = { $regex: escapeRegex(q), $options: "i" };
    }
    if (status !== "All") {
      query.status = status;
    }

    const discounts = await Discount.find(query).sort({ createdAt: -1 }).lean();

    return NextResponse.json({
      discounts,
      total: discounts.length,
    });
  } catch (error: any) {
    console.error("GET /api/discounts error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch discounts" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const adminSession = await requireAdminAuth(request);
    if (!adminSession) {
      return NextResponse.json(
        { error: "Unauthorized. Admin privileges required to create discounts." },
        { status: 401 }
      );
    }

    await connectDB();
    const body = await request.json();

    if (!body.name || body.value === undefined) {
      return NextResponse.json({ error: "Promo code name and discount value are required." }, { status: 400 });
    }

    const codeName = body.name.trim().toUpperCase();
    const id = body.id || `disc-${codeName.toLowerCase()}-${Date.now().toString().slice(-4)}`;

    const newDiscount = await Discount.create({
      ...body,
      id,
      name: codeName,
      type: body.type || "Percent",
      value: Number(body.value),
      startValue: Number(body.startValue || 0),
      endValue: Number(body.endValue || 999999),
      expiredAt: body.expiredAt || "2026-12-31",
      status: body.status || "Active",
    });

    return NextResponse.json(newDiscount, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/discounts error:", error);
    return NextResponse.json({ error: error.message || "Failed to create discount promo code" }, { status: 500 });
  }
}
