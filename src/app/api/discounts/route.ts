import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Discount from "@/models/Discount";
import { requireAdminAuth, escapeRegex } from "@/lib/security";

const DEFAULT_MOCK_DISCOUNTS = [
  {
    id: "disc-1",
    legacyId: 1,
    name: "RN05OFF",
    type: "Percent",
    value: 5,
    startValue: 500,
    endValue: 1499,
    expiredAt: "2027-06-25",
    status: "Active",
  },
  {
    id: "disc-2",
    legacyId: 2,
    name: "RN10OFF",
    type: "Percent",
    value: 10,
    startValue: 1500,
    endValue: 4999,
    expiredAt: "2027-05-28",
    status: "Active",
  },
  {
    id: "disc-3",
    legacyId: 3,
    name: "RN15OFF",
    type: "Percent",
    value: 15,
    startValue: 5000,
    endValue: 1000000,
    expiredAt: "2027-01-29",
    status: "Active",
  },
  {
    id: "disc-4",
    legacyId: 4,
    name: "RN20OFF",
    type: "Percent",
    value: 20,
    startValue: 20000,
    endValue: 29999,
    expiredAt: "2027-01-29",
    status: "Inactive",
  },
  {
    id: "disc-5",
    legacyId: 5,
    name: "RN25OFF",
    type: "Percent",
    value: 25,
    startValue: 30000,
    endValue: 39999,
    expiredAt: "2027-11-27",
    status: "Inactive",
  },
  {
    id: "disc-6",
    legacyId: 6,
    name: "RN30OFF",
    type: "Percent",
    value: 30,
    startValue: 40000,
    endValue: 49999,
    expiredAt: "2026-05-11",
    status: "Inactive",
  },
  {
    id: "disc-7",
    legacyId: 7,
    name: "RN35OFF",
    type: "Percent",
    value: 35,
    startValue: 50000,
    endValue: 59999,
    expiredAt: "2026-05-11",
    status: "Inactive",
  },
  {
    id: "disc-8",
    legacyId: 8,
    name: "RN40OFF",
    type: "Percent",
    value: 40,
    startValue: 60000,
    endValue: 69999,
    expiredAt: "2026-05-11",
    status: "Inactive",
  },
  {
    id: "disc-9",
    legacyId: 9,
    name: "RN45OFF",
    type: "Percent",
    value: 45,
    startValue: 70000,
    endValue: 999999,
    expiredAt: "2026-05-11",
    status: "Inactive",
  },
  {
    id: "disc-10",
    legacyId: 10,
    name: "RN07OFF",
    type: "Percent",
    value: 7,
    startValue: 200,
    endValue: 100000,
    expiredAt: "2027-01-02",
    status: "Inactive",
  },
];

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    const status = searchParams.get("status") || "All";
    const activeOnly = searchParams.get("activeOnly") === "true";

    const count = await Discount.countDocuments();
    if (count === 0) {
      await Discount.insertMany(DEFAULT_MOCK_DISCOUNTS);
    }

    const query: any = {};
    if (q) {
      query.name = { $regex: escapeRegex(q), $options: "i" };
    }
    if (activeOnly) {
      const now = new Date();
      const dateStr = now.toISOString().split("T")[0];
      query.status = "Active";
      query.$or = [
        { expiredAt: { $exists: false } },
        { expiredAt: null },
        { expiredAt: "" },
        { expiredAt: { $gte: now } },
        { expiredAt: { $gte: dateStr } },
      ];
    } else if (status !== "All") {
      query.status = status;
    }

    const discounts = await Discount.find(query)
      .sort(activeOnly ? { startValue: 1 } : { createdAt: -1 })
      .lean();

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
