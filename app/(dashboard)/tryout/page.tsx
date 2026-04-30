import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import type { KategoriUjian } from "@prisma/client";

export const metadata = { title: "Katalog Tryout" };

// 16.6: ISR — revalidate setiap 5 menit
export const revalidate = 300;

interface SearchParams { kategori?: string; q?: string; page?: string }

const KATEGORI_INFO = {
  CPNS_SKD: { label: "CPNS / SKD", icon: "🏛️", color: "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300" },
  SEKDIN:   { label: "Sekolah Kedinasan", icon: "🎖️", color: "bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300" },
  UTBK_SNBT:{ label: "UTBK / SNBT", icon: "📚", color: "bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300" },
};

export default async function KatalogTryoutPage({
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

  // Ambil paket tryout yang sudah dibeli/diakses user
  const aksesUser = session?.user?.id
    ? await prisma.transaction.findMany({
        where: { userId: session.user.id, status: "SUCCESS" },
        include: { items: { select: { paketId: true } } },
      })
    : [];
  const paketDibeli = new Set(
    aksesUser.flatMap((t) => t.items.map((i) => i.paketId).filter(Boolean))
  );

  // Cek langganan aktif
  const langgananAktif = session?.user?.id
    ? await prisma.subscription.findFirst({
        where: { userId: session.user.id, isActive: true, endDate: { gt: new Date() } },
      })
    : null;

  const [paketList, total, bundelList] = await Promise.all([
    prisma.paketTryout.findMany({
      where,
      select: {
        id: true, slug: true, judul: true, deskripsi: true,
        kategori: true, subKategori: true, durasi: true,
        totalSoal: true, harga: true, modelAkses: true,
        thumbnailUrl: true, passingGrade: true,
        _count: { select: { sesi: true } },
      },
      orderBy: [{ modelAkses: "asc" }, { createdAt: "desc" }],
      take: limit, skip,
    }),
    prisma.paketTryout.count({ where }),
    prisma.bundelTryout.findMany({
      where: {
        status: "PUBLISHED",
        ...(kategori && { kategori }),
      },
      include: {
        paket: { include: { paket: { select: { judul: true, totalSoal: true, durasi: true } } }, orderBy: { urutan: "asc" } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const totalPages = Math.ceil(total / limit);

  function hasAccess(paket: typeof paketList[0]): boolean {
    if (paket.modelAkses === "GRATIS") return true;
    if (langgananAktif && paket.modelAkses === "LANGGANAN") return true;
    return paketDibeli.has(paket.id);
  }

  // Cek akses bundel
  const bundelDibeli = new Set(
    aksesUser.flatMap((t) => t.items.map((i) => i.bundelId).filter(Boolean))
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Katalog Tryout</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Pilih paket tryout sesuai target ujianmu
        </p>
      </div>

      {/* Filter kategori */}
      <div className="flex flex-wrap gap-2">
        <Link
          href="/tryout"
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            !kategori ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
          }`}
        >
          Semua
        </Link>
        {Object.entries(KATEGORI_INFO).map(([key, info]) => (
          <Link
            key={key}
            href={`/tryout?kategori=${key}`}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              kategori === key ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            {info.icon} {info.label}
          </Link>
        ))}
      </div>

      {/* Search */}
      <form method="GET" className="flex gap-2">
        {kategori && <input type="hidden" name="kategori" value={kategori} />}
        <input
          type="text" name="q" defaultValue={q}
          placeholder="Cari paket tryout..."
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
          Cari
        </button>
      </form>

      {/* Section Bundel Tryout */}
      {bundelList.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">📦 Bundel Tryout</h2>
            <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full font-medium">
              Hemat lebih banyak
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {bundelList.map((bundel) => {
              const sudahBeli = bundelDibeli.has(bundel.id);
              const totalSoal = bundel.paket.reduce((s, bp) => s + bp.paket.totalSoal, 0);
              return (
                <Link
                  key={bundel.id}
                  href={`/bundel/${bundel.slug}`}
                  className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950 border border-purple-200 dark:border-purple-800 rounded-xl p-5 hover:shadow-md transition-shadow group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full font-medium">
                        📦 {bundel.paket.length} Tryout
                      </span>
                    </div>
                    {sudahBeli && (
                      <span className="text-xs text-green-600 dark:text-green-400 font-medium">✓ Dimiliki</span>
                    )}
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors mb-2">
                    {bundel.judul}
                  </h3>
                  <div className="space-y-1 mb-3">
                    {bundel.paket.map((bp, i) => (
                      <p key={bp.id} className="text-xs text-gray-500 dark:text-gray-400">
                        {i + 1}. {bp.paket.judul}
                      </p>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">{totalSoal} soal total</span>
                    <span className="font-bold text-purple-700 dark:text-purple-300">
                      Rp {Number(bundel.harga).toLocaleString("id-ID")}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Grid paket */}
      {paketList.length === 0 ? (
        <div className="py-16 text-center text-gray-400">
          <div className="text-4xl mb-3">📭</div>
          <p>Tidak ada paket tryout ditemukan</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {paketList.map((paket) => {
            const info = KATEGORI_INFO[paket.kategori];
            const akses = hasAccess(paket);
            return (
              <Link
                key={paket.id}
                href={`/tryout/${paket.slug}`}
                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden hover:shadow-md transition-shadow group"
              >
                {/* Thumbnail */}
                <div className="h-32 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  <span className="text-5xl">{info?.icon ?? "📝"}</span>
                </div>

                <div className="p-4 space-y-3">
                  {/* Badge kategori */}
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${info?.color ?? ""}`}>
                      {info?.label ?? paket.kategori}
                    </span>
                    {paket.subKategori && (
                      <span className="text-xs text-gray-400">{paket.subKategori}</span>
                    )}
                    {paket.modelAkses === "GRATIS" && (
                      <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full font-medium ml-auto">
                        Gratis
                      </span>
                    )}
                  </div>

                  <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                    {paket.judul}
                  </h3>

                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                    {paket.deskripsi}
                  </p>

                  {/* Info */}
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span>📝 {paket.totalSoal} soal</span>
                    <span>⏱ {paket.durasi} menit</span>
                    <span>👥 {paket._count.sesi.toLocaleString("id-ID")}</span>
                  </div>

                  {/* Harga / Akses */}
                  <div className="flex items-center justify-between pt-1 border-t border-gray-100 dark:border-gray-800">
                    {akses ? (
                      <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                        ✓ Sudah Diakses
                      </span>
                    ) : paket.modelAkses === "GRATIS" ? (
                      <span className="text-sm font-semibold text-green-600 dark:text-green-400">Gratis</span>
                    ) : (
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        Rp {Number(paket.harga).toLocaleString("id-ID")}
                      </span>
                    )}
                    <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                      Lihat Detail →
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {page > 1 && (
            <Link href={`/tryout?page=${page - 1}${kategori ? `&kategori=${kategori}` : ""}`}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800">
              ← Sebelumnya
            </Link>
          )}
          <span className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
            {page} / {totalPages}
          </span>
          {page < totalPages && (
            <Link href={`/tryout?page=${page + 1}${kategori ? `&kategori=${kategori}` : ""}`}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800">
              Berikutnya →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
