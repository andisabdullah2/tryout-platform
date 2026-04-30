import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getRedis } from "@/lib/redis"

// Baca versi dari package.json
import packageJson from "@/package.json"

interface HealthStatus {
  status: "ok" | "degraded" | "error"
  timestamp: string
  version: string
  responseTimeMs: number
  checks: {
    database: CheckResult
    redis: CheckResult
  }
}

interface CheckResult {
  status: "ok" | "error"
  responseTimeMs: number
  error?: string
}

/**
 * Health check endpoint.
 * Memeriksa konektivitas database dan Redis.
 *
 * Response:
 * - 200: Semua layanan sehat
 * - 503: Satu atau lebih layanan tidak sehat
 */
export async function GET() {
  const startTime = Date.now()

  // Jalankan semua checks secara paralel
  const [dbResult, redisResult] = await Promise.all([
    checkDatabase(),
    checkRedis(),
  ])

  const allHealthy = dbResult.status === "ok" && redisResult.status === "ok"
  const anyError = dbResult.status === "error" || redisResult.status === "error"

  const health: HealthStatus = {
    status: allHealthy ? "ok" : anyError ? "error" : "degraded",
    timestamp: new Date().toISOString(),
    version: packageJson.version,
    responseTimeMs: Date.now() - startTime,
    checks: {
      database: dbResult,
      redis: redisResult,
    },
  }

  const httpStatus = allHealthy ? 200 : 503

  return NextResponse.json(health, { status: httpStatus })
}

async function checkDatabase(): Promise<CheckResult> {
  const start = Date.now()
  try {
    // Query sederhana untuk memverifikasi koneksi database
    await prisma.$queryRaw`SELECT 1`
    return {
      status: "ok",
      responseTimeMs: Date.now() - start,
    }
  } catch (error) {
    return {
      status: "error",
      responseTimeMs: Date.now() - start,
      error: error instanceof Error ? error.message : "Database tidak dapat dijangkau",
    }
  }
}

async function checkRedis(): Promise<CheckResult> {
  const start = Date.now()
  try {
    const redis = getRedis()
    const pong = await redis.ping()
    if (pong !== "PONG") {
      throw new Error(`Unexpected ping response: ${pong}`)
    }
    return {
      status: "ok",
      responseTimeMs: Date.now() - start,
    }
  } catch (error) {
    return {
      status: "error",
      responseTimeMs: Date.now() - start,
      error: error instanceof Error ? error.message : "Redis tidak dapat dijangkau",
    }
  }
}
