import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MockBuyButton } from "@/components/payment/mock-buy-button";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const bundel = await prisma.bundelTryout.findUnique({ where: { slug }, select: { judul: true } });
  return { title: bundel?.judul ?? "Detail Bundel" };
}

const KATEGORI_LABEL: Record<string, string> = {
  CPNS_SKD: "CPNS / SKD", SEKDIN: "Sekolah Kedinasan", UTBK_SNBT: "UTBK / SNBT",
};

export default async function DetailBundelPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await auth();

  const bundel = await prisma.bundelTryout.findUnique({
    where: { slug, status: "PUBLISHED" },
    include: {
      paket: {
        include: {
          paket: {
            select: {
              id: true, slug: true, judul: true, deskripsi: true,
              durasi: true, totalSoal: true, kategori: true,
              passingGrade: true, thumbnailUrl: true,
            },
          },
        },
        orderBy: { urutan: "asc" },
      },
      _count: { select: { transaksiItem: true } },
    },
  });

  if (!bundel) notFound();

  // Cek akses
  let hasAccess = false;
  if (session?.user?.id) {
    const sudahBeli = await prisma.transactionItem.findFirst({
      where: {
        bundelId: bundel.id,
        transaction: { userId: session.user.id, status: "SUCCESS" },
      },
    });
    hasAccess = !!sudahBeli;
  }

  const totalSoal = bundel.paket.reduce((sum, bp) => sum + bp.paket.totalSoal, 0);
  const totalDurasi = bundel.paket.reduce((sum, bp) => sum + bp.paket.durasi, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <Link href="/tryout" className="hover:text-blue-600">Tryout</Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-white truncate">{bundel.judul}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Info utama */}
        <div className="lg:col-span-2 space-y-5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full font-medium">
                {KATEGORI_LABEL[bundel.kategori] ?? bundel.kategori}
              </span>
              <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full font-medium">
                📦 Bundel {bundel.paket.length} Tryout
              </span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{bundel.judul}</h1>
          </div>

          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{bundel.deskripsi}</p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Paket Tryout", value: bundel.paket.length, icon: "📝" },
              { label: "Total Soal", value: totalSoal, icon: "❓" },
              { label: "Total Durasi", value: `${totalDurasi} mnt`, icon: "⏱" },
            ].map((s) => (
              <div key={s.label} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-center">
                <div className="text-2xl mb-1">{s.icon}</div>
                <div className="font-bold text-gray-900 dark:text-white">{s.value}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Daftar paket dalam bundel */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Tryout dalam Bundel ini
              </h3>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {bundel.paket.map((bp, i) => (
                <div key={bp.id} className="px-5 py-4 flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white">{bp.paket.judul}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                      {bp.paket.deskripsi}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                      <span>📝 {bp.paket.totalSoal} soal</span>
                      <span>⏱ {bp.paket.durasi} menit</span>
                    </div>
                  </div>
                  {hasAccess && (
                    <Link
                      href={`/tryout/${bp.paket.slug}`}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium flex-shrink-0"
                    >
                      Kerjakan →
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar aksi */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 sticky top-6 space-y-4">
            <div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                Rp {Number(bundel.harga).toLocaleString("id-ID")}
              </div>
              {hasAccess && (
                <div className="text-sm text-green-600 dark:text-green-400 font-medium mt-1">
                  ✓ Sudah Dimiliki
                </div>
              )}
            </div>

            {!session ? (
              <Link
                href={`/login?callbackUrl=/bundel/${slug}`}
                className="w-full block text-center bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
              >
                Login untuk Beli
              </Link>
            ) : hasAccess ? (
              <div className="space-y-2">
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  Pilih tryout yang ingin dikerjakan:
                </p>
                {bundel.paket.map((bp) => (
                  <Link
                    key={bp.id}
                    href={`/tryout/${bp.paket.slug}/mulai`}
                    className="w-full block text-center border border-blue-600 text-blue-600 dark:text-blue-400 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors"
                  >
                    {bp.paket.judul}
                  </Link>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                <Link
                  href={`/checkout?bundel=${bundel.id}`}
                  className="w-full block text-center bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                >
                  Beli Bundel — Rp {Number(bundel.harga).toLocaleString("id-ID")}
                </Link>
                {process.env.NODE_ENV !== "production" && (
                  <MockBuyButton bundelId={bundel.id} />
                )}
              </div>
            )}

            <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <span>✓</span>
                <span>{bundel.paket.length} paket tryout lengkap</span>
              </div>
              <div className="flex items-center gap-2">
                <span>✓</span>
                <span>{totalSoal} soal dengan pembahasan</span>
              </div>
              <div className="flex items-center gap-2">
                <span>✓</span>
                <span>Akses selamanya</span>
              </div>
              <div className="flex items-center gap-2">
                <span>✓</span>
                <span>Leaderboard & ranking</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
