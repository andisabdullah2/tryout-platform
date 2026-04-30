import { prisma } from "@/lib/prisma";
import { sendRealtimeNotification } from "@/lib/realtime/pusher";
import type { TipeNotifikasi } from "@prisma/client";

export interface CreateNotificationParams {
  userId: string;
  tipe: TipeNotifikasi;
  judul: string;
  pesan: string;
  data?: Record<string, unknown>;
}

/**
 * Buat notifikasi in-app dan kirim real-time via Pusher.
 * Selalu berhasil — error Pusher tidak memblokir pembuatan notifikasi.
 */
export async function createNotification(
  params: CreateNotificationParams
): Promise<void> {
  const notif = await prisma.notification.create({
    data: {
      userId: params.userId,
      tipe: params.tipe,
      judul: params.judul,
      pesan: params.pesan,
      data: params.data,
    },
  });

  // Kirim real-time (fire-and-forget)
  sendRealtimeNotification(params.userId, {
    id: notif.id,
    judul: notif.judul,
    pesan: notif.pesan,
    tipe: notif.tipe,
    createdAt: notif.createdAt.toISOString(),
  }).catch(console.error);
}

/**
 * Kirim notifikasi ke banyak user sekaligus (batch).
 */
export async function createBulkNotifications(
  userIds: string[],
  params: Omit<CreateNotificationParams, "userId">
): Promise<void> {
  if (userIds.length === 0) return;

  // Batch insert
  await prisma.notification.createMany({
    data: userIds.map((userId) => ({
      userId,
      tipe: params.tipe,
      judul: params.judul,
      pesan: params.pesan,
      data: params.data,
    })),
  });

  // Kirim real-time ke setiap user (fire-and-forget)
  const now = new Date().toISOString();
  for (const userId of userIds) {
    sendRealtimeNotification(userId, {
      id: `bulk-${userId}-${Date.now()}`,
      judul: params.judul,
      pesan: params.pesan,
      tipe: params.tipe,
      createdAt: now,
    }).catch(console.error);
  }
}

/**
 * Kirim notifikasi hasil tryout setelah sesi selesai.
 */
export async function notifyTryoutResult(
  userId: string,
  params: {
    paketJudul: string;
    skorTotal: number;
    lulus: boolean;
    sessionId: string;
  }
): Promise<void> {
  await createNotification({
    userId,
    tipe: "TRYOUT_RESULT",
    judul: "Hasil Tryout Tersedia",
    pesan: `Tryout "${params.paketJudul}" selesai. Skor kamu: ${params.skorTotal.toFixed(0)}${params.lulus ? " ✅ Lulus!" : ""}`,
    data: { sessionId: params.sessionId, skor: params.skorTotal, lulus: params.lulus },
  });
}

/**
 * Kirim notifikasi pengingat live class (24 jam sebelum).
 */
export async function notifyLiveClassReminder(
  userIds: string[],
  params: {
    liveClassId: string;
    judulLiveClass: string;
    jadwalMulai: Date;
  }
): Promise<void> {
  const jadwalStr = params.jadwalMulai.toLocaleString("id-ID", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  });

  await createBulkNotifications(userIds, {
    tipe: "LIVE_CLASS_REMINDER",
    judul: "Live Class Akan Dimulai",
    pesan: `"${params.judulLiveClass}" akan dimulai pada ${jadwalStr} WIB`,
    data: { liveClassId: params.liveClassId },
  });
}

/**
 * Kirim notifikasi langganan akan berakhir (7 hari sebelum).
 */
export async function notifySubscriptionExpiring(
  userId: string,
  endDate: Date
): Promise<void> {
  const daysLeft = Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const endDateStr = endDate.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  await createNotification({
    userId,
    tipe: "SUBSCRIPTION_EXPIRING",
    judul: "Langganan Akan Berakhir",
    pesan: `Langganan kamu akan berakhir pada ${endDateStr} (${daysLeft} hari lagi). Perpanjang sekarang!`,
    data: { endDate: endDate.toISOString(), daysLeft },
  });
}

/**
 * Kirim notifikasi konten baru ke semua subscriber kategori.
 */
export async function notifyNewContent(
  kategori: string,
  params: {
    judul: string;
    tipe: "PAKET_TRYOUT" | "KELAS";
    id: string;
  }
): Promise<void> {
  // Ambil semua user yang punya subscription aktif atau pernah mengikuti tryout kategori ini
  const users = await prisma.user.findMany({
    where: {
      isActive: true,
      OR: [
        { subscriptions: { some: { isActive: true, endDate: { gt: new Date() } } } },
        {
          tryoutSessions: {
            some: {
              paket: { kategori: kategori as "CPNS_SKD" | "SEKDIN" | "UTBK_SNBT" },
            },
          },
        },
      ],
    },
    select: { id: true },
    take: 500, // batasi untuk performa
  });

  const userIds = users.map((u) => u.id);
  if (userIds.length === 0) return;

  const tipeLabel = params.tipe === "PAKET_TRYOUT" ? "Paket Tryout" : "Kelas";
  await createBulkNotifications(userIds, {
    tipe: "NEW_CONTENT",
    judul: `${tipeLabel} Baru Tersedia`,
    pesan: `"${params.judul}" kini tersedia untuk kamu!`,
    data: { tipe: params.tipe, id: params.id },
  });
}
