import Redis from "ioredis";

interface MemoryCacheEntry {
  value: string;
  expiresAt: number;
}

declare global {
  // eslint-disable-next-line no-var
  var __rnRedisClient: Redis | null | undefined;
  // eslint-disable-next-line no-var
  var __rnMemoryCache: Map<string, MemoryCacheEntry> | undefined;
  // eslint-disable-next-line no-var
  var __rnInFlightCache: Map<string, Promise<any>> | undefined;
}

const memoryCache: Map<string, MemoryCacheEntry> =
  global.__rnMemoryCache || new Map<string, MemoryCacheEntry>();
if (!global.__rnMemoryCache) {
  global.__rnMemoryCache = memoryCache;
}

const inFlightCache: Map<string, Promise<any>> =
  global.__rnInFlightCache || new Map<string, Promise<any>>();
if (!global.__rnInFlightCache) {
  global.__rnInFlightCache = inFlightCache;
}

const MAX_L1_KEYS = 250;

function resolveRedisUrl(): string | null {
  const url =
    process.env.REDIS_URL ||
    process.env.REDIS_URI ||
    process.env.UPSTASH_REDIS_URL ||
    "";
  if (url && url.trim()) return url.trim();

  if (process.env.REDIS_HOST) {
    const host = process.env.REDIS_HOST.trim();
    const port = process.env.REDIS_PORT || "6379";
    const password = process.env.REDIS_PASSWORD
      ? `:${encodeURIComponent(process.env.REDIS_PASSWORD)}@`
      : "";
    return `redis://${password}${host}:${port}`;
  }

  return null;
}

export function getRedisClient(): Redis | null {
  if (global.__rnRedisClient !== undefined) {
    return global.__rnRedisClient;
  }

  const redisUrl = resolveRedisUrl();
  if (!redisUrl) {
    global.__rnRedisClient = null;
    return null;
  }

  try {
    const client = new Redis(redisUrl, {
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
      connectTimeout: 2500,
      commandTimeout: 2000,
      lazyConnect: false,
      retryStrategy(times) {
        if (times > 5) {
          // Retry every 30s if Redis is temporarily down
          return 30000;
        }
        return Math.min(times * 500, 3000);
      },
    });

    client.on("error", (err) => {
      // Suppress unhandled error events so app stays online using L1 fallback
      if (process.env.NODE_ENV !== "production") {
        console.warn("[Redis] Connection warning (falling back to L1 cache):", err.message);
      }
    });

    global.__rnRedisClient = client;
    return client;
  } catch (err) {
    console.warn("[Redis] Failed to initialize client, using L1 memory cache:", err);
    global.__rnRedisClient = null;
    return null;
  }
}

export function getRedisStatus() {
  const client = getRedisClient();
  const now = Date.now();
  for (const [k, v] of memoryCache.entries()) {
    if (v.expiresAt <= now) memoryCache.delete(k);
  }
  return {
    configured: Boolean(resolveRedisUrl()),
    connected: client?.status === "ready",
    status: client ? client.status : "l1-memory-fallback",
    l1CachedKeys: memoryCache.size,
  };
}

function setL1Cache(key: string, serialized: string, ttlSeconds: number) {
  const now = Date.now();
  if (memoryCache.size >= MAX_L1_KEYS) {
    // Evict expired or oldest key
    let oldestKey: string | null = null;
    let oldestExpiry = Infinity;
    for (const [k, v] of memoryCache.entries()) {
      if (v.expiresAt <= now) {
        memoryCache.delete(k);
      } else if (v.expiresAt < oldestExpiry) {
        oldestExpiry = v.expiresAt;
        oldestKey = k;
      }
    }
    if (memoryCache.size >= MAX_L1_KEYS && oldestKey) {
      memoryCache.delete(oldestKey);
    }
  }
  memoryCache.set(key, {
    value: serialized,
    expiresAt: now + ttlSeconds * 1000,
  });
}

function getL1Cache<T>(key: string): T | null {
  const entry = memoryCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    memoryCache.delete(key);
    return null;
  }
  try {
    return JSON.parse(entry.value) as T;
  } catch {
    memoryCache.delete(key);
    return null;
  }
}

export type CacheStatus = "HIT-REDIS" | "HIT-MEMORY" | "MISS";

/**
 * Multi-tier cache wrapper (L1 In-Memory + L2 Redis + Stampede Protection)
 */
export async function getOrSetCache<T>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>,
  l1TtlSeconds?: number
): Promise<{ data: T; cacheStatus: CacheStatus }> {
  const redis = getRedisClient();
  const isRedisReady = redis && redis.status === "ready";

  // 1. Check L2 Redis first if ready, or L1 memory if Redis is not configured/ready
  if (isRedisReady) {
    // Check ultra-fast short L1 buffer (e.g. 30s) to avoid even local socket serialization overhead under heavy burst
    const l1Hit = getL1Cache<T>(key);
    if (l1Hit !== null) {
      return { data: l1Hit, cacheStatus: "HIT-REDIS" };
    }

    try {
      const cachedRaw = await redis.get(key);
      if (cachedRaw) {
        const parsed = JSON.parse(cachedRaw) as T;
        setL1Cache(key, cachedRaw, l1TtlSeconds ?? Math.min(ttlSeconds, 120));
        return { data: parsed, cacheStatus: "HIT-REDIS" };
      }
    } catch {
      // Fall through to L1 / fetcher if Redis read fails
    }
  } else {
    const l1Hit = getL1Cache<T>(key);
    if (l1Hit !== null) {
      return { data: l1Hit, cacheStatus: "HIT-MEMORY" };
    }
  }

  // 2. Stampede Protection: If another request is already computing this key, await its promise
  const existingPromise = inFlightCache.get(key);
  if (existingPromise) {
    const data = (await existingPromise) as T;
    return {
      data,
      cacheStatus: isRedisReady ? "HIT-REDIS" : "HIT-MEMORY",
    };
  }

  // 3. Cache MISS: Execute fetcher and store in both L2 Redis and L1 Memory
  const fetchPromise = (async () => {
    try {
      const freshData = await fetcher();
      const serialized = JSON.stringify(freshData);

      // Save to L1 Memory
      setL1Cache(
        key,
        serialized,
        isRedisReady ? (l1TtlSeconds ?? Math.min(ttlSeconds, 120)) : ttlSeconds
      );

      // Save to L2 Redis asynchronously
      if (redis && redis.status === "ready") {
        await redis.set(key, serialized, "EX", ttlSeconds).catch(() => {});
      }

      return freshData;
    } finally {
      inFlightCache.delete(key);
    }
  })();

  inFlightCache.set(key, fetchPromise);
  const data = await fetchPromise;
  return { data, cacheStatus: "MISS" };
}

/**
 * Invalidates specific keys or key prefixes across both L1 Memory and L2 Redis
 */
export async function invalidateCache(keysOrPrefixes: string | string[]): Promise<void> {
  const targets = Array.isArray(keysOrPrefixes) ? keysOrPrefixes : [keysOrPrefixes];

  // 1. Clear matching keys from L1 Memory
  for (const k of Array.from(memoryCache.keys())) {
    if (targets.some((prefix) => k === prefix || k.startsWith(prefix))) {
      memoryCache.delete(k);
    }
  }

  // 2. Clear matching keys from L2 Redis using non-blocking cursor SCAN
  const redis = getRedisClient();
  if (redis && redis.status === "ready") {
    try {
      const keysToDelete = new Set<string>();
      for (const target of targets) {
        keysToDelete.add(target);
        let cursor = "0";
        do {
          const [nextCursor, matched] = await redis.scan(
            cursor,
            "MATCH",
            `${target}*`,
            "COUNT",
            100
          );
          cursor = nextCursor;
          matched.forEach((m) => keysToDelete.add(m));
        } while (cursor !== "0");
      }
      if (keysToDelete.size > 0) {
        const batch = Array.from(keysToDelete);
        for (let i = 0; i < batch.length; i += 200) {
          await redis.del(...batch.slice(i, i + 200));
        }
      }
    } catch {
      // Ignore Redis deletion errors
    }
  }
}
