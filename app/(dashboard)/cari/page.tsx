import { prisma } from "@/lib/prisma";
import Link from "next/link";
import type { KategoriUjian, ModelAkses } from "@prisma/client";

export const metadata = { title: "Pencarian" };

interface SearchParams {
  q?: string;
  tipe?: string;
  kategori?: string;
  harga?: string; // "gratis" | "berbayar"
  page?: string;
}

const KATEGORI_INFO: Record<string, { label: string; icon: string }> = {
  CPNS_SKD: { label: "CPNS / SKD", icon: "🏛️" },
  SEKDIN: { label: "Sekolah Kedinasan", icon: "🎖️" },
  UTBK_SNBT: { label: "UTBK / SNBT", icon: "📚" },
};

export default async function CariPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const q = params.q ?? "";
  const tipe = params.tipe ?? "all"; // "all" | "tryout" | "kelas"
  const kategori = params.kategori as KategoriUjian | undefined;
  const harga = params.harga; // "gratis" | "berbayar"
  const page = parseInt(params.page ?? "1");
  const limit = 12;
  const skip = (page - 1) * limit;

  const searchFilter = q
    ? { contains: q, mode: "insensitive" as const }
    : undefined;

  const modelAksesFilter: ModelAkses[] | undefined =
    harga === "gratis"
      ? ["GRATIS"]
      : harga === "berbayar"
        ? ["BERBAYAR", "LANGGANAN"]
        : undefined;

  // Fetch tryout results
  const tryoutResults =
    tipe === "all" || tipe === "tryout"
      ? await prisma.paketTryout.findMany({
          where: {
            status: "PUBLISHED",
            ...(kategori && { kategori }),
            ...(modelAksesFilter && { modelAkses: { in: modelAksesFilter } }),
            ...(searchFilter && {
              OR: [{ judul: searchFilter }, { deskripsi: searchFilter }],
            }),
          },
          select: {
            id: true,
            slug: true,
            judul: true,
            deskripsi: true,
            kategori: true,
            harga: true,
            modelAkses: true,
            totalSoal: true,
            durasi: true,
            _count: { select: { sesi: true } },
          },
          orderBy: { createdAt: "desc" },
          take: tipe === "all" ? limit / 2 : limit,
          skip: tipe === "all" ? 0 : skip,
        })
      : [];

  // Fetch kelas results
  const kelasResults =
    tipe === "all" || tipe === "kelas"
      ? await prisma.kelas.findMany({
          where: {
            status: "PUBLISHED",
            ...(kategori && { kategori }),
            ...(modelAksesFilter && { modelAkses: { in: modelAksesFilter } }),
            ...(searchFilter && {
              OR: [{ judul: searchFilter }, { deskripsi: searchFilter }],
            }),
          },
          select: {
            id: true,
            slug: true,
            judul: true,
            deskripsi: true,
            kategori: true,
            harga: true,
            modelAkses: true,
            _count: { select: { enrollments: true, modul: true } },
          },
          orderBy: { createdAt: "desc" },
          take: tipe === "all" ? limit / 2 : limit,
          skip: tipe === "all" ? 0 : skip,
        })
      : [];

  const totalResults = tryoutResults.length + kelasResults.length;

  const buildUrl = (overrides: Partial<SearchParams>) => {
    const sp = new URLSearchParams();
    const merged = { q, tipe, kategori, harga, page: String(page), ...overrides };
    Object.entries(merged).forEach(([k, v]) => {
      if (v) sp.set(k, String(v));
    });
    return `/cari?${sp.toString()}`;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {q ? `Hasil pencarian: "${q}"` : "Katalog Konten"}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          {totalResults} hasil ditemukan
        </p>
      </div>

      {/* Filter bar */}
      <form method="GET" action="/cari" className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
        <div className="flex flex-wrap gap-3">
          {/* Search input */}
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Cari konten..."
            className="flex-1 min-w-48 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Tipe */}
          <select
            name="tipe"
            defaultValue={tipe}
            className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Semua Tipe</option>
            <option value="tryout">Tryout</option>
            <option value="kelas">Kelas</option>
          </select>

          {/* Kategori */}
          <select
            name="kategori"
            defaultValue={kategori ?? ""}
            className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Semua Kategori</option>
            <option value="CPNS_SKD">CPNS / SKD</option>
            <option value="SEKDIN">Sekolah Kedinasan</option>
            <option value="UTBK_SNBT">UTBK / SNBT</option>
          </select>

          {/* Harga */}
          <select
            name="harga"
            defaultValue={harga ?? ""}
            className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Semua Harga</option>
            <option value="gratis">Gratis</option>
            <option value="berbayar">Berbayar</option>
          </select>

          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Cari
          </button>

          {(q || tipe !== "all" || kategori || harga) && (
            <Link
              href="/cari"
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Reset
            </Link>
          )}
        </div>
      </form>

      {totalResults === 0 ? (
        <div className="py-16 text-center text-gray-400">
          <div className="text-4xl mb-3">🔍</div>
          <p className="text-lg">Tidak ada hasil ditemukan</p>
          {q && (
            <p className="text-sm mt-1">
              Coba kata kunci lain atau hapus filter
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {/* Tryout results */}
          {tryoutResults.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  📝 Paket Tryout
                </h2>
                {tipe === "all" && (
                  <Link
                    href={buildUrl({ tipe: "tryout", page: "1" })}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Lihat semua →
                  </Link>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {tryoutResults.map((paket) => {
                  const info = KATEGORI_INFO[paket.kategori];
                  return (
                    <Link
                      key={paket.id}
                      href={`/tryout/${paket.slug}`}
                      className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 hover:shadow-md transition-shadow group"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl flex-shrink-0">{info?.icon ?? "📝"}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 text-sm">
                            {paket.judul}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-400">
                              {info?.label ?? paket.kategori}
                            </span>
                            <span className="text-xs text-gray-300 dark:text-gray-600">·</span>
                            <span className="text-xs text-gray-400">
                              {paket.totalSoal} soal
                            </span>
                          </div>
                          <div className="mt-2">
                            {paket.modelAkses === "GRATIS" ? (
                              <span className="text-xs font-semibold text-green-600 dark:text-green-400">
                                Gratis
                              </span>
                            ) : (
                              <span className="text-xs font-semibold text-gray-900 dark:text-white">
                                Rp {Number(paket.harga).toLocaleString("id-ID")}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {/* Kelas results */}
          {kelasResults.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  📚 Kelas
                </h2>
                {tipe === "all" && (
                  <Link
                    href={buildUrl({ tipe: "kelas", page: "1" })}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Lihat semua →
                  </Link>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {kelasResults.map((kelas) => {
                  const info = KATEGORI_INFO[kelas.kategori];
                  return (
                    <Link
                      key={kelas.id}
                      href={`/kelas/${kelas.slug}`}
                      className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 hover:shadow-md transition-shadow group"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl flex-shrink-0">{info?.icon ?? "📚"}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 text-sm">
                            {kelas.judul}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-400">
                              {info?.label ?? kelas.kategori}
                            </span>
                            <span className="text-xs text-gray-300 dark:text-gray-600">·</span>
                            <span className="text-xs text-gray-400">
                              {kelas._count.modul} modul
                            </span>
                          </div>
                          <div className="mt-2">
                            {kelas.modelAkses === "GRATIS" ? (
                              <span className="text-xs font-semibold text-green-600 dark:text-green-400">
                                Gratis
                              </span>
                            ) : (
                              <span className="text-xs font-semibold text-gray-900 dark:text-white">
                                Rp {Number(kelas.harga).toLocaleString("id-ID")}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      )}

      {/* Pagination (only for single-type view) */}
      {tipe !== "all" && (
        <div className="flex justify-center gap-2">
          {page > 1 && (
            <Link
              href={buildUrl({ page: String(page - 1) })}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              ← Sebelumnya
            </Link>
          )}
          {totalResults === limit && (
            <Link
              href={buildUrl({ page: String(page + 1) })}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Berikutnya →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
