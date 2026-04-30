import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MockBuyButton } from "@/components/payment/mock-buy-button";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const paket = await prisma.paketTryout.findUnique({ where: { slug }, select: { judul: true } });
  return { title: paket?.judul ?? "Detail Tryout" };
}

const KATEGORI_LABEL: Record<string, string> = {
  CPNS_SKD: "CPNS / SKD", SEKDIN: "Sekolah Kedinasan", UTBK_SNBT: "UTBK / SNBT",
};

export default async function DetailTryoutPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await auth();

  const paket = await prisma.paketTryout.findUnique({
    where: { slug, status: "PUBLISHED" },
    include: {
      soal: {
        include: { soal: { select: { subtes: true, tingkatKesulitan: true } } },
        orderBy: { urutan: "asc" },
      },
      _count: { select: { sesi: true } },
    },
  });

  if (!paket) notFound();

  // Cek akses user
  let hasAccess = paket.modelAkses === "GRATIS";
  let lastResult = null;

  if (session?.user?.id && !hasAccess) {
    const [transaksi, langganan] = await Promise.all([
      prisma.transactionItem.findFirst({
        where: { paketId: paket.id, transaction: { userId: session.user.id, status: "SUCCESS" } },
      }),
      prisma.subscription.findFirst({
        where: { userId: session.user.id, isActive: true, endDate: { gt: new Date() } },
      }),
    ]);
    hasAccess = !!(transaksi || (langganan && paket.modelAkses === "LANGGANAN"));
  }

  if (session?.user?.id) {
    lastResult = await prisma.hasilTryout.findFirst({
      where: { userId: session.user.id, paketId: paket.id },
      orderBy: { createdAt: "desc" },
    });
  }

  // Statistik soal per subtes
  const subtesCount: Record<string, number> = {};
  for (const ps of paket.soal) {
    const s = ps.soal.subtes;
    subtesCount[s] = (subtesCount[s] ?? 0) + 1;
  }

  const passingGrade = paket.passingGrade as Record<string, number> | null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <Link href="/tryout" className="hover:text-blue-600 dark:hover:text-blue-400">Tryout</Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-white truncate">{paket.judul}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Info utama */}
        <div className="lg:col-span-2 space-y-5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full font-medium">
                {KATEGORI_LABEL[paket.kategori] ?? paket.kategori}
              </span>
              {paket.subKategori && (
                <span className="text-xs text-gray-400">{paket.subKategori}</span>
              )}
              {paket.modelAkses === "GRATIS" && (
                <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full font-medium">
                  Gratis
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{paket.judul}</h1>
          </div>

          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{paket.deskripsi}</p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Total Soal", value: paket.totalSoal, icon: "📝" },
              { label: "Durasi", value: `${paket.durasi} menit`, icon: "⏱" },
              { label: "Peserta", value: paket._count.sesi.toLocaleString("id-ID"), icon: "👥" },
            ].map((s) => (
              <div key={s.label} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-center">
                <div className="text-2xl mb-1">{s.icon}</div>
                <div className="font-bold text-gray-900 dark:text-white">{s.value}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Distribusi soal per subtes */}
          {Object.keys(subtesCount).length > 0 && (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Distribusi Soal</h3>
              <div className="space-y-2">
                {Object.entries(subtesCount).map(([subtes, count]) => (
                  <div key={subtes} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{subtes.replace(/_/g, " ")}</span>
                    <span className="font-medium text-gray-900 dark:text-white">{count} soal</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Passing Grade */}
          {passingGrade && (
            <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-xl p-5">
              <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-3">⚠️ Passing Grade</h3>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(passingGrade).map(([key, val]) => (
                  <div key={key} className="flex justify-between text-sm">
                    <span className="text-yellow-700 dark:text-yellow-300">{key.toUpperCase()}</span>
                    <span className="font-bold text-yellow-800 dark:text-yellow-200">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hasil terakhir */}
          {lastResult && (
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-xl p-5">
              <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Hasil Terakhirmu</h3>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {Number(lastResult.skorTotal).toFixed(0)}
                  </div>
                  <div className="text-xs text-blue-600 dark:text-blue-400">Skor Total</div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-semibold ${lastResult.lulus ? "text-green-600" : "text-red-500"}`}>
                    {lastResult.lulus ? "✓ Lulus" : "✗ Belum Lulus"}
                  </div>
                  <Link href={`/tryout/sesi/${lastResult.sessionId}/hasil`}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                    Lihat Detail →
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar aksi */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 sticky top-6">
            {paket.modelAkses !== "GRATIS" && (
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {hasAccess ? (
                  <span className="text-green-600 dark:text-green-400 text-xl">✓ Sudah Diakses</span>
                ) : (
                  `Rp ${Number(paket.harga).toLocaleString("id-ID")}`
                )}
              </div>
            )}

            {!session ? (
              <Link href={`/login?callbackUrl=/tryout/${slug}`}
                className="w-full block text-center bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors">
                Login untuk Mulai
              </Link>
            ) : hasAccess ? (
              <Link href={`/tryout/${slug}/mulai`}
                className="w-full block text-center bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors">
                {lastResult ? "Ulangi Tryout" : "Mulai Tryout"}
              </Link>
            ) : (
              <div className="space-y-2">
                <Link href={`/checkout?paket=${paket.id}`}
                  className="w-full block text-center bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors">
                  Beli Sekarang — Rp {Number(paket.harga).toLocaleString("id-ID")}
                </Link>
                {process.env.NODE_ENV !== "production" && (
                  <MockBuyButton paketId={paket.id} slug={slug} />
                )}
              </div>
            )}

            <div className="mt-4 space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <span>✓</span>
                <span>{paket.totalSoal} soal lengkap</span>
              </div>
              <div className="flex items-center gap-2">
                <span>✓</span>
                <span>Pembahasan setiap soal</span>
              </div>
              <div className="flex items-center gap-2">
                <span>✓</span>
                <span>Leaderboard & ranking</span>
              </div>
              {passingGrade && (
                <div className="flex items-center gap-2">
                  <span>✓</span>
                  <span>Passing grade resmi</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
