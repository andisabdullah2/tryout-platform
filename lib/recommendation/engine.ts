import { prisma } from "@/lib/prisma";

export interface RecommendedItem {
  id: string;
  tipe: "tryout" | "kelas";
  judul: string;
  deskripsi: string;
  kategori: string;
  harga: number;
  modelAkses: string;
  slug: string;
  alasan: string; // mengapa direkomendasikan
}

/**
 * Hasilkan rekomendasi konten berdasarkan riwayat tryout dan kelas peserta.
 *
 * Strategi:
 * 1. Identifikasi kategori ujian yang paling sering diikuti
 * 2. Rekomendasikan paket tryout yang belum pernah diikuti di kategori tersebut
 * 3. Rekomendasikan kelas yang belum di-enroll di kategori tersebut
 * 4. Fallback: konten gratis terpopuler jika tidak ada riwayat
 */
export async function getRecommendations(
  userId: string,
  limit = 6
): Promise<RecommendedItem[]> {
  const recommendations: RecommendedItem[] = [];

  // Ambil riwayat tryout user
  const riwayatTryout = await prisma.tryoutSession.findMany({
    where: { userId, status: "COMPLETED" },
    include: { paket: { select: { kategori: true, id: true } } },
    orderBy: { completedAt: "desc" },
    take: 20,
  });

  // Ambil enrollment kelas user
  const enrollments = await prisma.enrollment.findMany({
    where: { userId },
    include: { kelas: { select: { kategori: true, id: true } } },
  });

  // Hitung frekuensi kategori
  const kategoriCount: Record<string, number> = {};
  for (const sesi of riwayatTryout) {
    const k = sesi.paket.kategori;
    kategoriCount[k] = (kategoriCount[k] ?? 0) + 1;
  }
  for (const enroll of enrollments) {
    const k = enroll.kelas.kategori;
    kategoriCount[k] = (kategoriCount[k] ?? 0) + 0.5; // bobot lebih rendah
  }

  // Urutkan kategori berdasarkan frekuensi
  const topKategori = Object.entries(kategoriCount)
    .sort(([, a], [, b]) => b - a)
    .map(([k]) => k) as ("CPNS_SKD" | "SEKDIN" | "UTBK_SNBT")[];

  // ID konten yang sudah diakses
  const paketDiikuti = new Set(riwayatTryout.map((s) => s.paket.id));
  const kelasDiikuti = new Set(enrollments.map((e) => e.kelas.id));

  // Cek langganan aktif
  const langgananAktif = await prisma.subscription.findFirst({
    where: { userId, isActive: true, endDate: { gt: new Date() } },
  });

  const perKategori = Math.ceil(limit / Math.max(topKategori.length, 1));

  if (topKategori.length > 0) {
    // Rekomendasikan berdasarkan kategori favorit
    for (const kategori of topKategori.slice(0, 3)) {
      // Tryout yang belum diikuti
      const tryoutRek = await prisma.paketTryout.findMany({
        where: {
          status: "PUBLISHED",
          kategori,
          id: { notIn: Array.from(paketDiikuti) },
          OR: [
            { modelAkses: "GRATIS" },
            ...(langgananAktif ? [{ modelAkses: "LANGGANAN" as const }] : []),
          ],
        },
        select: {
          id: true, slug: true, judul: true, deskripsi: true,
          kategori: true, harga: true, modelAkses: true,
          _count: { select: { sesi: true } },
        },
        orderBy: { sesi: { _count: "desc" } },
        take: Math.ceil(perKategori / 2),
      });

      for (const p of tryoutRek) {
        if (recommendations.length >= limit) break;
        recommendations.push({
          id: p.id,
          tipe: "tryout",
          judul: p.judul,
          deskripsi: p.deskripsi.slice(0, 100),
          kategori: p.kategori,
          harga: Number(p.harga),
          modelAkses: p.modelAkses,
          slug: p.slug,
          alasan: `Berdasarkan riwayat ${kategori.replace("_", " ")} kamu`,
        });
      }

      // Kelas yang belum di-enroll
      const kelasRek = await prisma.kelas.findMany({
        where: {
          status: "PUBLISHED",
          kategori,
          id: { notIn: Array.from(kelasDiikuti) },
          OR: [
            { modelAkses: "GRATIS" },
            ...(langgananAktif ? [{ modelAkses: "LANGGANAN" as const }] : []),
          ],
        },
        select: {
          id: true, slug: true, judul: true, deskripsi: true,
          kategori: true, harga: true, modelAkses: true,
        },
        orderBy: { enrollments: { _count: "desc" } },
        take: Math.ceil(perKategori / 2),
      });

      for (const k of kelasRek) {
        if (recommendations.length >= limit) break;
        recommendations.push({
          id: k.id,
          tipe: "kelas",
          judul: k.judul,
          deskripsi: k.deskripsi.slice(0, 100),
          kategori: k.kategori,
          harga: Number(k.harga),
          modelAkses: k.modelAkses,
          slug: k.slug,
          alasan: `Kelas populer untuk ${kategori.replace("_", " ")}`,
        });
      }

      if (recommendations.length >= limit) break;
    }
  }

  // Fallback: konten gratis terpopuler jika rekomendasi kurang
  if (recommendations.length < limit) {
    const existingIds = new Set(recommendations.map((r) => r.id));

    const fallbackTryout = await prisma.paketTryout.findMany({
      where: {
        status: "PUBLISHED",
        modelAkses: "GRATIS",
        id: { notIn: [...Array.from(paketDiikuti), ...Array.from(existingIds)] },
      },
      select: {
        id: true, slug: true, judul: true, deskripsi: true,
        kategori: true, harga: true, modelAkses: true,
      },
      orderBy: { sesi: { _count: "desc" } },
      take: limit - recommendations.length,
    });

    for (const p of fallbackTryout) {
      recommendations.push({
        id: p.id,
        tipe: "tryout",
        judul: p.judul,
        deskripsi: p.deskripsi.slice(0, 100),
        kategori: p.kategori,
        harga: 0,
        modelAkses: "GRATIS",
        slug: p.slug,
        alasan: "Tryout gratis terpopuler",
      });
    }
  }

  return recommendations.slice(0, limit);
}
