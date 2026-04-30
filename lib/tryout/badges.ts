import { prisma } from "@/lib/prisma";
import type { TipeBadge } from "@prisma/client";

/**
 * Berikan badge kepada peserta.
 * Idempotent — tidak akan duplikat jika badge sudah dimiliki.
 */
export async function awardBadge(
  userId: string,
  tipe: TipeBadge,
  paketId?: string
): Promise<boolean> {
  const badge = await prisma.badge.findUnique({ where: { tipe } });
  if (!badge) return false;

  try {
    await prisma.userBadge.upsert({
      where: {
        userId_badgeId_paketId: {
          userId,
          badgeId: badge.id,
          paketId: paketId ?? "",
        },
      },
      create: { userId, badgeId: badge.id, paketId },
      update: {},
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Cek dan berikan semua badge yang relevan setelah tryout selesai.
 *
 * Badge yang diperiksa:
 * - TRYOUT_PERTAMA: tryout pertama yang diselesaikan
 * - LULUS_PASSING_GRADE: berhasil lulus passing grade
 * - PERINGKAT_1/2/3: masuk peringkat 1/2/3 di leaderboard ALL_TIME
 */
export async function checkAndAwardBadgesAfterTryout(
  userId: string,
  paketId: string,
  lulus: boolean
): Promise<string[]> {
  const awarded: string[] = [];

  // Badge tryout pertama
  const totalSesi = await prisma.hasilTryout.count({ where: { userId } });
  if (totalSesi === 1) {
    const ok = await awardBadge(userId, "TRYOUT_PERTAMA");
    if (ok) awarded.push("TRYOUT_PERTAMA");
  }

  // Badge lulus passing grade
  if (lulus) {
    const ok = await awardBadge(userId, "LULUS_PASSING_GRADE", paketId);
    if (ok) awarded.push("LULUS_PASSING_GRADE");
  }

  // Badge peringkat 1/2/3 (cek setelah leaderboard diperbarui)
  const myEntry = await prisma.leaderboardEntry.findUnique({
    where: { userId_paketId_periode: { userId, paketId, periode: "ALL_TIME" } },
    select: { peringkat: true },
  });

  if (myEntry) {
    const rankBadgeMap: Record<number, TipeBadge> = {
      1: "PERINGKAT_1",
      2: "PERINGKAT_2",
      3: "PERINGKAT_3",
    };
    const rankBadge = rankBadgeMap[myEntry.peringkat];
    if (rankBadge) {
      const ok = await awardBadge(userId, rankBadge, paketId);
      if (ok) awarded.push(rankBadge);
    }
  }

  return awarded;
}

/**
 * Ambil semua badge yang dimiliki peserta.
 */
export async function getUserBadges(userId: string) {
  return prisma.userBadge.findMany({
    where: { userId },
    include: { badge: true },
    orderBy: { earnedAt: "desc" },
  });
}
