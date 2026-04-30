import { getRedis, isRedisConfigured } from "@/lib/redis";
import { NextRequest, NextResponse } from "next/server";

interface RateLimitConfig {
  /** Jumlah maksimum request dalam window */
  limit: number;
  /** Durasi window dalam detik */
  windowSeconds: number;
  /** Pesan error yang dikembalikan */
  message?: string;
}

const DEFAULTS: Record<string, RateLimitConfig> = {
  login: { limit: 10, windowSeconds: 60, message: "Terlalu banyak percobaan login. Coba lagi dalam 1 menit." },
  register: { limit: 5, windowSeconds: 60, message: "Terlalu banyak pendaftaran. Coba lagi dalam 1 menit." },
  payment: { limit: 10, windowSeconds: 60, message: "Terlalu banyak permintaan pembayaran. Coba lagi dalam 1 menit." },
  api: { limit: 60, windowSeconds: 60, message: "Terlalu banyak permintaan. Coba lagi dalam 1 menit." },
};

/**
 * Rate limiter berbasis Redis sliding window.
 * Mengembalikan null jika request diizinkan, atau NextResponse 429 jika melebihi limit.
 */
export async function rateLimit(
  request: NextRequest,
  type: keyof typeof DEFAULTS | RateLimitConfig
): Promise<NextResponse | null> {
  const config = typeof type === "string" ? DEFAULTS[type]! : type;

  // Identifikasi client: IP address
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  const key = `ratelimit:${typeof type === "string" ? type : "custom"}:${ip}`;

  try {
    if (!isRedisConfigured()) return null;
    const redis = getRedis();
    const now = Date.now();
    const windowStart = now - config.windowSeconds * 1000;

    // Sliding window: hapus entri lama, tambah entri baru
    const pipeline = redis.pipeline();
    pipeline.zremrangebyscore(key, 0, windowStart);
    pipeline.zadd(key, { score: now, member: `${now}-${Math.random()}` });
    pipeline.zcard(key);
    pipeline.expire(key, config.windowSeconds);

    const results = await pipeline.exec();
    const count = results[2] as number;

    if (count > config.limit) {
      return NextResponse.json(
        { success: false, error: config.message ?? "Rate limit exceeded" },
        {
          status: 429,
          headers: {
            "Retry-After": String(config.windowSeconds),
            "X-RateLimit-Limit": String(config.limit),
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }

    return null; // Request diizinkan
  } catch (error) {
    // Jika Redis gagal, izinkan request (fail open)
    console.error("Rate limit error:", error);
    return null;
  }
}
