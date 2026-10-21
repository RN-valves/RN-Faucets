import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { getRedisStatus } from "@/lib/redis";

export const dynamic = "force-dynamic";

export async function GET() {
  const start = Date.now();
  try {
    await connectDB();
    const dbState = mongoose.connection.readyState; // 1 = connected
    const mem = process.memoryUsage();
    const redisStatus = getRedisStatus();

    return NextResponse.json(
      {
        status: dbState === 1 ? "ok" : "degraded",
        db: dbState === 1 ? "connected" : "disconnected",
        redis: redisStatus,
        uptimeSeconds: Math.floor(process.uptime()),
        responseTimeMs: Date.now() - start,
        memoryMB: {
          rss: Math.round(mem.rss / 1024 / 1024),
          heapUsed: Math.round(mem.heapUsed / 1024 / 1024),
          heapTotal: Math.round(mem.heapTotal / 1024 / 1024),
        },
        timestamp: new Date().toISOString(),
      },
      {
        status: dbState === 1 ? 200 : 503,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        db: "error",
        message: error?.message || "Health check failed",
        timestamp: new Date().toISOString(),
      },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  }
}
