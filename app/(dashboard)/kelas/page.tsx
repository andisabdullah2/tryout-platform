import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import type { KategoriUjian } from "@prisma/client";

export const metadata = { title: "Katalog Kelas" };

// 16.6: ISR — revalidate setiap 5 menit
export const revalidate = 300;

interface SearchParams { kategori?: string; q?: string; page?: string }

const KATEGORI_INFO = {
  CPNS_SKD:   { label: "CPNS / SKD",         icon: "🏛️", color: "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300" },
  SEKDIN:     { label: "Sekolah Kedinasan",   icon: "🎖️", color: "bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300" },
  UTBK_SNBT:  { label: "UTBK / SNBT",        icon: "📚", color: "bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300" },
};

export default async function KatalogKelasPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await auth();
  const params = await searchParams;
  const kategori = params.kategori as KategoriUjian | undefined;
  const q = params.q;
  const page = parseInt(params.page ?? "1");
  const limit = 12;
  const skip = (page - 1) * limit;

  const where = {
    status: "PUBLISHED" as const,
    ...(kategori && { kategori }),
    ...(q && { judul: { contains: q, mode: "insensitive" as const } }),
  };

  // Kelas yang sudah di-enroll user
  const enrolledKelasIds = session?.user?.id
    ? new Set(
        (await prisma.enrollment.findMany({
          where: { userId: session.user.id },
          select: { kelasId: true },
        })).map((e) => e.kelasId)
      )
    : new Set<string>();

  const [kelasList, total] = await Promise.all([
    prisma.kelas.findMany({
      where,
      select: {
        id: true, slug: true, judul: true, deskripsi: true,
        kategori: true, thumbnailUrl: true, harga: true,
        modelAkses: true,
        _count: { select: { enrollments: true, modul: true } },
      },
      orderBy: [{ modelAkses: "asc" }, { createdAt: "desc" }],
      take: limit, skip,
    }),
    prisma.kelas.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Katalog Kelas</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Belajar bersama instruktur berpengalaman
        </p>
      </div>

      {/* Filter kategori */}
      <div className="flex flex-wrap gap-2">
        <Link href="/kelas"
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            !kategori ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
          }`}>
          Semua
        </Link>
        {Object.entries(KATEGORI_INFO).map(([key, info]) => (
          <Link key={key} href={`/kelas?kategori=${key}`}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              kategori === key ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}>
            {info.icon} {info.label}
          </Link>
        ))}
      </div>

      {/* Search */}
      <form method="GET" className="flex gap-2">
        {kategori && <input type="hidden" name="kategori" value={kategori} />}
        <input type="text" name="q" defaultValue={q}
          placeholder="Cari kelas..."
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
          Cari
        </button>
      </form>

      {/* Grid kelas */}
      {kelasList.length === 0 ? (
        <div className="py-16 text-center text-gray-400">
          <div className="text-4xl mb-3">📭</div>
          <p>Tidak ada kelas ditemukan</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {kelasList.map((kelas) => {
            const info = KATEGORI_INFO[kelas.kategori];
            const isEnrolled = enrolledKelasIds.has(kelas.id);
            return (
              <Link key={kelas.id} href={`/kelas/${kelas.slug}`}
                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden hover:shadow-md transition-shadow group">
                <div className="h-32 bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                  <span className="text-5xl">{info?.icon ?? "📚"}</span>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${info?.color ?? ""}`}>
                      {info?.label ?? kelas.kategori}
                    </span>
                    {kelas.modelAkses === "GRATIS" && (
                      <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full font-medium ml-auto">
                        Gratis
                      </span>
                    )}
                    {isEnrolled && (
                      <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full font-medium ml-auto">
                        ✓ Terdaftar
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                    {kelas.judul}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{kelas.deskripsi}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span>📖 {kelas._count.modul} modul</span>
                    <span>👥 {kelas._count.enrollments.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-gray-100 dark:border-gray-800">
                    {kelas.modelAkses === "GRATIS" ? (
                      <span className="text-sm font-semibold text-green-600 dark:text-green-400">Gratis</span>
                    ) : (
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        Rp {Number(kelas.harga).toLocaleString("id-ID")}
                      </span>
                    )}
                    <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">Lihat Detail →</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {page > 1 && (
            <Link href={`/kelas?page=${page - 1}${kategori ? `&kategori=${kategori}` : ""}`}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800">
              ← Sebelumnya
            </Link>
          )}
          <span className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">{page} / {totalPages}</span>
          {page < totalPages && (
            <Link href={`/kelas?page=${page + 1}${kategori ? `&kategori=${kategori}` : ""}`}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800">
              Berikutnya →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
