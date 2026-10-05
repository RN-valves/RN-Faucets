import mongoose from "mongoose";

// Extend the NodeJS global to cache connection across hot-reloads in dev
declare global {
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
  const targetUri =
    process.env.MONGODB_URI ||
    "mongodb+srv://web_db_user:EoK0ZBimp3zGV9ZY@rncluster.jbtr81i.mongodb.net/rn-valves?retryWrites=true&w=majority&appName=RNcluster";

  // If URI changed, reset cached connection
  if (cached.currentUri && cached.currentUri !== targetUri && cached.conn) {
    try {
      await mongoose.disconnect();
    } catch {}
    cached.conn = null;
    cached.promise = null;
  }

  // If already connected with readyState === 1
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(targetUri, {
        bufferCommands: false,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 10000,
      })
      .then((m) => {
        cached.conn = m;
        cached.currentUri = targetUri;
        return m;
      })
      .catch((err) => {
        cached.promise = null;
        cached.conn = null;
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
    cached.currentUri = targetUri;
    return cached.conn;
  } catch (err) {
    cached.promise = null;
    cached.conn = null;
    throw err;
  }
}
