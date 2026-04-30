import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createNotification } from "@/lib/notification/service"

/**
 * Cron job: Periksa dan nonaktifkan langganan yang sudah kedaluwarsa.
 * Dijadwalkan setiap hari pukul 01:00 UTC via Vercel Crons.
 *
 * Autentikasi: Bearer token dari CRON_SECRET environment variable.
 */
export async function GET(request: NextRequest) {
  // Validasi Authorization header
  const authHeader = request.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret) {
    console.error("CRON_SECRET tidak dikonfigurasi")
    return NextResponse.json(
      { error: "Konfigurasi server tidak lengkap" },
      { status: 500 }
    )
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Tidak diizinkan" }, { status: 401 })
  }

  const startTime = Date.now()

  try {
    const now = new Date()

    // Cari semua langganan yang sudah kedaluwarsa dan masih aktif
    const expiredSubscriptions = await prisma.subscription.findMany({
      where: {
        endDate: { lt: now },
        isActive: true,
      },
      include: {
        user: {
          select: { id: true, email: true, name: true },
        },
      },
    })

    if (expiredSubscriptions.length === 0) {
      return NextResponse.json({
        status: "ok",
        message: "Tidak ada langganan yang kedaluwarsa",
        deactivated: 0,
        durationMs: Date.now() - startTime,
      })
    }

    // Nonaktifkan semua langganan yang kedaluwarsa
    const subscriptionIds = expiredSubscriptions.map((s) => s.id)

    await prisma.subscription.updateMany({
      where: { id: { in: subscriptionIds } },
      data: { isActive: false },
    })

    // Kirim notifikasi ke setiap user yang langganannya berakhir
    const notificationPromises = expiredSubscriptions.map((subscription) =>
      createNotification({
        userId: subscription.userId,
        tipe: "SUBSCRIPTION_EXPIRING",
        judul: "Langganan Telah Berakhir",
        pesan: `Langganan ${subscription.tipe === "BULANAN" ? "bulanan" : "tahunan"} kamu telah berakhir. Perpanjang sekarang untuk tetap mengakses semua konten premium.`,
        data: {
          subscriptionId: subscription.id,
          endDate: subscription.endDate.toISOString(),
          tipe: subscription.tipe,
        },
      }).catch((err) => {
        // Jangan gagalkan cron job karena error notifikasi
        console.error(
          `Gagal mengirim notifikasi ke user ${subscription.userId}:`,
          err
        )
      })
    )

    await Promise.allSettled(notificationPromises)

    const duration = Date.now() - startTime

    console.log(
      `[Cron] subscription-check: ${expiredSubscriptions.length} langganan dinonaktifkan dalam ${duration}ms`
    )

    return NextResponse.json({
      status: "ok",
      message: `${expiredSubscriptions.length} langganan berhasil dinonaktifkan`,
      deactivated: expiredSubscriptions.length,
      subscriptionIds,
      durationMs: duration,
    })
  } catch (error) {
    console.error("[Cron] subscription-check error:", error)

    return NextResponse.json(
      {
        status: "error",
        error: "Terjadi kesalahan saat memproses langganan",
        durationMs: Date.now() - startTime,
      },
      { status: 500 }
    )
  }
}
