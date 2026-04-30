import { Redis } from "@upstash/redis";

/**
 * Redis client untuk caching (Upstash).
 * Digunakan untuk:
 * - Leaderboard (TTL 60 detik)
 * - Katalog tryout/kelas (TTL 5 menit)
 * - Sesi tryout aktif (TTL sesuai durasi tryout)
 */

let redis: Redis | null = null;

function isRedisConfigured(): boolean {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? "";
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? "";
  return (
    url.startsWith("https://") &&
    !url.includes("your-redis-url") &&
    token.length > 10 &&
    !token.includes("your-upstash")
  );
}

export function getRedis(): Redis {
  if (!redis) {
    if (!isRedisConfigured()) {
      throw new Error("Redis tidak dikonfigurasi");
    }
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  }
  return redis;
}

/**
 * Cache helper dengan TTL.
 * Jika data ada di cache, return dari cache.
 * Jika tidak, jalankan fetcher dan simpan ke cache.
 */
export async function cacheGet<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number
): Promise<T> {
  try {
    const redis = getRedis();
    const cached = await redis.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const data = await fetcher();
    await redis.setex(key, ttlSeconds, data);
    return data;
  } catch (error) {
    // Jika Redis gagal, fallback ke fetcher langsung
    console.error("Redis error:", error);
    return fetcher();
  }
}

/**
 * Invalidate cache key.
 */
export async function cacheInvalidate(key: string): Promise<void> {
  try {
    const redis = getRedis();
    await redis.del(key);
  } catch (error) {
    console.error("Redis invalidate error:", error);
  }
}

/**
 * Invalidate multiple cache keys dengan pattern.
 */
export async function cacheInvalidatePattern(pattern: string): Promise<void> {
  try {
    const redis = getRedis();
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    console.error("Redis invalidate pattern error:", error);
  }
}
