import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

/**
 * Buat PrismaClient dengan dukungan Prisma Accelerate.
 * Jika DATABASE_URL dimulai dengan "prisma://", gunakan withAccelerate() extension.
 * Package @prisma/extension-accelerate di-import secara dinamis agar tidak
 * memecah build jika package belum terinstall.
 */
async function createPrismaClient(): Promise<PrismaClient> {
  const client = new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  })

  // Aktifkan Prisma Accelerate jika DATABASE_URL menggunakan protokol prisma://
  if (process.env.DATABASE_URL?.startsWith("prisma://")) {
    try {
      const { withAccelerate } = await import("@prisma/extension-accelerate")
      return client.$extends(withAccelerate()) as unknown as PrismaClient
    } catch {
      // Package belum terinstall — lanjutkan tanpa Accelerate
      console.warn(
        "⚠️  @prisma/extension-accelerate tidak ditemukan. " +
          "Jalankan: npm install @prisma/extension-accelerate"
      )
    }
  }

  return client
}

// Singleton pattern — gunakan instance yang sudah ada jika tersedia
function getPrismaClient(): PrismaClient {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma
  }

  const client = new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  })

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client
  }

  return client
}

export const prisma = getPrismaClient()

/**
 * Dapatkan PrismaClient dengan Accelerate extension (async).
 * Gunakan ini jika kamu perlu fitur caching Prisma Accelerate.
 *
 * @example
 * const db = await getAcceleratedPrisma()
 * const users = await db.user.findMany({ cacheStrategy: { ttl: 60 } })
 */
export async function getAcceleratedPrisma(): Promise<PrismaClient> {
  return createPrismaClient()
}
