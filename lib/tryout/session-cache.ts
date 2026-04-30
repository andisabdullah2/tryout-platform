import { getRedis } from "@/lib/redis";

const SESSION_PREFIX = "tryout:session:";

/**
 * Simpan snapshot sesi tryout aktif ke Redis.
 * TTL disesuaikan dengan waktu kedaluwarsa sesi.
 */
export async function cacheSession(
  sessionId: string,
  data: Record<string, unknown>,
  expiresAt: Date
): Promise<void> {
  try {
    const redis = getRedis();
    const ttl = Math.max(
      1,
      Math.floor((expiresAt.getTime() - Date.now()) / 1000)
    );
    await redis.setex(`${SESSION_PREFIX}${sessionId}`, ttl, data);
  } catch (error) {
    console.error("Session cache set error:", error);
  }
}

/**
 * Ambil snapshot sesi tryout dari Redis.
 * Return null jika tidak ada atau sudah expired.
 */
export async function getCachedSession(
  sessionId: string
): Promise<Record<string, unknown> | null> {
  try {
    const redis = getRedis();
    return await redis.get<Record<string, unknown>>(
      `${SESSION_PREFIX}${sessionId}`
    );
  } catch (error) {
    console.error("Session cache get error:", error);
    return null;
  }
}

/**
 * Hapus sesi dari cache (saat sesi selesai atau expired).
 */
export async function invalidateSessionCache(sessionId: string): Promise<void> {
  try {
    const redis = getRedis();
    await redis.del(`${SESSION_PREFIX}${sessionId}`);
  } catch (error) {
    console.error("Session cache invalidate error:", error);
  }
}

/**
 * Update snapshot jawaban di cache.
 */
export async function updateSessionAnswers(
  sessionId: string,
  answers: Record<string, string | null>,
  expiresAt: Date
): Promise<void> {
  try {
    const redis = getRedis();
    const existing = await redis.get<Record<string, unknown>>(
      `${SESSION_PREFIX}${sessionId}`
    );
    if (existing) {
      const updated = { ...existing, snapshotJawaban: answers };
      const ttl = Math.max(
        1,
        Math.floor((expiresAt.getTime() - Date.now()) / 1000)
      );
      await redis.setex(`${SESSION_PREFIX}${sessionId}`, ttl, updated);
    }
  } catch (error) {
    console.error("Session cache update error:", error);
  }
}
