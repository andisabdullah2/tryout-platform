import { prisma } from "@/lib/prisma";
import { checkAndAwardBadgesAfterTryout } from "@/lib/tryout/badges";
import { cacheInvalidatePattern } from "@/lib/redis";

/**
 * Update leaderboard setelah sesi tryout selesai.
 * Dipanggil secara async (fire-and-forget) dari route selesai.
 *
 * Logika:
 * - Simpan skor tertinggi per (userId, paketId, periode)
 * - Hitung ulang peringkat untuk semua periode yang diperbarui
 * - Berikan badge jika peserta masuk peringkat 1/2/3 atau lulus passing grade
 */
export async function updateLeaderboard(
  userId: string,
  paketId: string,
  sessionId: string,
  skor: number,
  lulus = false
): Promise<void> {
  const periodes = ["ALL_TIME", "MINGGUAN", "BULANAN"] as const;
  const updatedPeriodes: (typeof periodes)[number][] = [];

  for (const periode of periodes) {
    const existing = await prisma.leaderboardEntry.findUnique({
      where: { userId_paketId_periode: { userId, paketId, periode } },
    });

    if (!existing || skor > Number(existing.skor)) {
      await prisma.leaderboardEntry.upsert({
        where: { userId_paketId_periode: { userId, paketId, periode } },
        create: {
          userId,
          paketId,
          periode,
          skor,
          peringkat: 0, // akan dihitung ulang
          sessionId,
        },
        update: {
          skor,
          sessionId,
          updatedAt: new Date(),
        },
      });
      updatedPeriodes.push(periode);
    }
  }

  // Hitung ulang peringkat untuk semua periode yang diperbarui
  await Promise.all(updatedPeriodes.map((p) => recalculateRankings(paketId, p)));

  // Invalidate leaderboard cache setelah update
  await cacheInvalidatePattern(`leaderboard:${paketId}:*`);

  // Berikan badge berdasarkan pencapaian
  await checkAndAwardBadgesAfterTryout(userId, paketId, lulus);
}

/**
 * Hitung ulang peringkat leaderboard untuk paket dan periode tertentu.
 * Urutan: skor tertinggi → waktu update terlama (lebih dulu = lebih baik).
 */
async function recalculateRankings(
  paketId: string,
  periode: "ALL_TIME" | "MINGGUAN" | "BULANAN"
): Promise<void> {
  const entries = await prisma.leaderboardEntry.findMany({
    where: { paketId, periode },
    orderBy: [{ skor: "desc" }, { updatedAt: "asc" }],
    select: { id: true },
  });

  // Batch update peringkat
  await Promise.all(
    entries.map((entry, index) =>
      prisma.leaderboardEntry.update({
        where: { id: entry.id },
        data: { peringkat: index + 1 },
      })
    )
  );
}

/**
 * Ambil leaderboard untuk paket tertentu.
 * Mengembalikan top-N entries dan posisi user yang sedang login.
 */
export async function getLeaderboard(
  paketId: string,
  periode: "ALL_TIME" | "MINGGUAN" | "BULANAN",
  limit = 10,
  userId?: string
) {
  const entries = await prisma.leaderboardEntry.findMany({
    where: { paketId, periode },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
          useAlias: true,
          alias: true,
        },
      },
    },
    orderBy: { peringkat: "asc" },
    take: limit,
  });

  // Ambil posisi user yang sedang login jika tidak ada di top N
  let userEntry = null;
  if (userId) {
    const userInTop = entries.find((e) => e.userId === userId);
    if (!userInTop) {
      userEntry = await prisma.leaderboardEntry.findUnique({
        where: { userId_paketId_periode: { userId, paketId, periode } },
        include: {
          user: {
            select: { id: true, name: true, image: true, useAlias: true, alias: true },
          },
        },
      });
    }
  }

  // Sembunyikan nama asli jika useAlias aktif
  const sanitizedEntries = entries.map((e) => ({
    peringkat: e.peringkat,
    skor: Number(e.skor),
    nama: e.user.useAlias && e.user.alias ? e.user.alias : e.user.name,
    image: e.user.useAlias ? null : e.user.image,
    isCurrentUser: e.userId === userId,
    sessionId: e.sessionId,
  }));

  const sanitizedUserEntry = userEntry
    ? {
        peringkat: userEntry.peringkat,
        skor: Number(userEntry.skor),
        nama:
          userEntry.user.useAlias && userEntry.user.alias
            ? userEntry.user.alias
            : userEntry.user.name,
        image: userEntry.user.useAlias ? null : userEntry.user.image,
        isCurrentUser: true,
      }
    : null;

  return { entries: sanitizedEntries, userEntry: sanitizedUserEntry };
}

/**
 * Ambil statistik personal peserta untuk semua paket yang pernah diikuti.
 */
export async function getStatistikPeserta(userId: string) {
  const hasilList = await prisma.hasilTryout.findMany({
    where: { userId },
    include: {
      session: {
        select: { paketId: true, completedAt: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  if (hasilList.length === 0) {
    return {
      totalTryout: 0,
      skorTertinggi: 0,
      skorRataRata: 0,
      totalLulus: 0,
      trendSkor: [],
    };
  }

  const skorList = hasilList.map((h) => Number(h.skorTotal));
  const skorTertinggi = Math.max(...skorList);
  const skorRataRata = Math.round(skorList.reduce((a, b) => a + b, 0) / skorList.length);
  const totalLulus = hasilList.filter((h) => h.lulus).length;

  // Tren skor: 10 tryout terakhir
  const trendSkor = hasilList.slice(-10).map((h) => ({
    tanggal: h.createdAt.toISOString().slice(0, 10),
    skor: Number(h.skorTotal),
    lulus: h.lulus,
  }));

  return {
    totalTryout: hasilList.length,
    skorTertinggi,
    skorRataRata,
    totalLulus,
    trendSkor,
  };
}
