import mongoose from "mongoose";

// Extend the NodeJS global to cache connection across hot-reloads in dev
declare global {
  // eslint-disable-next-line no-var
  var _mongooseCache: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
    currentUri?: string;
  };
}

let cached = global._mongooseCache;

if (!cached) {
  cached = global._mongooseCache = { conn: null, promise: null };
}

export async function connectDB(): Promise<typeof mongoose> {
  const targetUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/rn-valves";

  const isLocalConfigured = targetUri.includes("127.0.0.1") || targetUri.includes("localhost");
  const isCurrentConnLocal =
    cached.conn?.connection?.host?.includes("127.0.0.1") ||
    cached.conn?.connection?.host?.includes("localhost");

  // If environment switched or current connection doesn't match local configuration, reset
  if (cached.conn && isLocalConfigured && !isCurrentConnLocal) {
    console.log("Switching cached Mongoose connection to Local MongoDB:", targetUri);
    try {
      await mongoose.disconnect();
    } catch (e) {
      console.error("Disconnect error:", e);
    }
    cached.conn = null;
    cached.promise = null;
  }

  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(targetUri, {
      bufferCommands: false,
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
  }

  cached.conn = await cached.promise;
  cached.currentUri = targetUri;
  return cached.conn;
}
