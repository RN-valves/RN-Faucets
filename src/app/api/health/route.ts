import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { getRedisStatus } from "@/lib/redis";

export const dynamic = "force-dynamic";

export async function GET() {
  const startedAt = Date.now();
  let dbState = "disconnected";
  let dbOk = false;

  try {
    await connectDB();
    dbOk = mongoose.connection.readyState === 1;
    dbState = dbOk ? "connected" : `state_${mongoose.connection.readyState}`;
  } catch {
    dbState = "error";
    dbOk = false;
  }

  const redis = getRedisStatus();
  const status = dbOk ? 200 : 503;

  return NextResponse.json(
    {
      status: dbOk ? "ok" : "degraded",
      uptimeSeconds: Math.floor(process.uptime()),
      latencyMs: Date.now() - startedAt,
      services: {
        database: dbState,
        cache: {
          configured: redis.configured,
          connected: redis.connected,
          mode: redis.status,
          l1Keys: redis.l1CachedKeys,
        },
      },
      timestamp: new Date().toISOString(),
    },
    {
      status,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}
