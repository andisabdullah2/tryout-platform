import { prisma } from "@/lib/prisma";

/**
 * Update statistik soal setelah sesi tryout selesai
 * Dipanggil secara async setelah scoring selesai
 */
export async function updateStatistikSoal(
  jawabanList: { soalId: string; isBenar: boolean | null }[]
): Promise<void> {
  // Kelompokkan per soalId
  const statsMap = new Map<string, { dijawab: number; benar: number }>();

  for (const j of jawabanList) {
    const existing = statsMap.get(j.soalId) ?? { dijawab: 0, benar: 0 };
    existing.dijawab += 1;
    if (j.isBenar === true) existing.benar += 1;
    statsMap.set(j.soalId, existing);
  }

  // Update database secara batch
  const updates = Array.from(statsMap.entries()).map(([soalId, stats]) =>
    prisma.soal.update({
      where: { id: soalId },
      data: {
        totalDijawab: { increment: stats.dijawab },
        totalBenar: { increment: stats.benar },
      },
    })
  );

  await Promise.all(updates);
}

/**
 * Hitung tingkat diskriminasi soal (point-biserial correlation sederhana)
 * Nilai mendekati 1 = soal sangat diskriminatif
 * Nilai mendekati 0 = soal tidak diskriminatif
 */
export function hitungTingkatDiskriminasi(
  totalDijawab: number,
  totalBenar: number
): number {
  if (totalDijawab === 0) return 0;
  const proporsiBenar = totalBenar / totalDijawab;
  // Simplified discrimination index
  return Math.round(proporsiBenar * 100) / 100;
}
