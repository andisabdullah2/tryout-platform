import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

export const metadata = { title: "Riwayat & Tryout" };

const STATUS_BADGE: Record<string, string> = {
  PENDING: "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300",
  SUCCESS: "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300",
  FAILED: "bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400",
  EXPIRED: "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400",
  REFUNDED: "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300",
};

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Menunggu", SUCCESS: "Berhasil", FAILED: "Gagal",
  EXPIRED: "Kedaluwarsa", REFUNDED: "Dikembalikan",
};

export default async function RiwayatPage() {
  const session = await auth();
  if (!session?.user?.id) notFound();

  const [transactions, subscription, hasilTryout] = await Promise.all([
    prisma.transaction.findMany({
      where: { userId: session.user.id },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.subscription.findFirst({
      where: { userId: session.user.id, isActive: true, endDate: { gt: new Date() } },
      orderBy: { endDate: "desc" },
    }),
    prisma.hasilTryout.findMany({
      where: { userId: session.user.id },
      include: {
        session: {
          include: {
            paket: {
              select: {
                id: true,
                slug: true,
                judul: true,
                kategori: true,
                passingGrade: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  const KATEGORI_LABEL: Record<string, string> = {
    CPNS_SKD: "CPNS / SKD",
    SEKDIN: "Sekolah Kedinasan",
    UTBK_SNBT: "UTBK / SNBT",
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Riwayat & Langganan</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Kelola pembelian, langganan, dan hasil tryout Anda</p>
      </div>

      {/* Status langganan */}
      {subscription && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Langganan Aktif</p>
              <p className="text-xl font-bold mt-1">
                {subscription.tipe === "TAHUNAN" ? "Paket Tahunan" : "Paket Bulanan"}
              </p>
              <p className="text-blue-100 text-sm mt-1">
                Aktif hingga {new Date(subscription.endDate).toLocaleDateString("id-ID", {
                  day: "numeric", month: "long", year: "numeric",
                })}
              </p>
            </div>
            <div className="text-4xl">⭐</div>
          </div>
        </div>
      )}

      {/* Riwayat Tryout */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="font-semibold text-gray-900 dark:text-white">Riwayat Tryout</h2>
        </div>

        {hasilTryout.length === 0 ? (
          <div className="py-12 text-center text-gray-400">
            <div className="text-4xl mb-3">📝</div>
            <p>Belum ada riwayat tryout</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {hasilTryout.map((hasil) => {
              const paket = hasil.session.paket;
              const skorPerSubtes = hasil.skorPerSubtes as Record<string, number>;
              const passingGrade = paket.passingGrade as Record<string, number> | null;

              return (
                <Link
                  key={hasil.id}
                  href={`/tryout/sesi/${hasil.sessionId}/hasil`}
                  className="block px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-gray-900 dark:text-white truncate">
                          {paket.judul}
                        </h3>
                        <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full flex-shrink-0">
                          {KATEGORI_LABEL[paket.kategori] ?? paket.kategori}
                        </span>
                      </div>

                      {/* Score breakdown mini */}
                      <div className="flex flex-wrap gap-2 mt-2">
                        {Object.entries(skorPerSubtes).map(([subtes, skor]) => {
                          const pg = passingGrade?.[subtes.toLowerCase()];
                          const lulus = pg ? skor >= pg : null;
                          return (
                            <div key={subtes} className="text-xs">
                              <span className="text-gray-500 dark:text-gray-400">{subtes}:</span>{" "}
                              <span className={`font-semibold ${
                                lulus === null ? "text-gray-900 dark:text-white"
                                  : lulus ? "text-green-600 dark:text-green-400"
                                  : "text-red-600 dark:text-red-400"
                              }`}>
                                {typeof skor === "number" ? skor.toFixed(0) : skor}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                        <span>
                          {new Date(hasil.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                        <span>•</span>
                        <span>{hasil.jumlahBenar} benar</span>
                        <span>•</span>
                        <span>{Math.floor(hasil.durasiPengerjaan / 60)} menit</span>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <div className={`text-2xl font-bold mb-1 ${
                        hasil.lulus
                          ? "text-green-600 dark:text-green-400"
                          : "text-gray-900 dark:text-white"
                      }`}>
                        {Number(hasil.skorTotal).toFixed(0)}
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        hasil.lulus
                          ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                      }`}>
                        {hasil.lulus ? "✓ Lulus" : "Belum Lulus"}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Riwayat transaksi */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="font-semibold text-gray-900 dark:text-white">Riwayat Transaksi</h2>
        </div>

        {transactions.length === 0 ? (
          <div className="py-12 text-center text-gray-400">
            <div className="text-4xl mb-3">🧾</div>
            <p>Belum ada transaksi</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {transactions.map((trx) => (
              <div key={trx.id} className="px-5 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-gray-400">{trx.orderId}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[trx.status] ?? ""}`}>
                        {STATUS_LABEL[trx.status] ?? trx.status}
                      </span>
                    </div>
                    <div className="space-y-0.5">
                      {trx.items.map((item) => (
                        <p key={item.id} className="text-sm text-gray-700 dark:text-gray-300">
                          {item.nama}
                        </p>
                      ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(trx.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric", month: "long", year: "numeric",
                        hour: "2-digit", minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-gray-900 dark:text-white">
                      Rp {Number(trx.totalAmount).toLocaleString("id-ID")}
                    </p>
                    {Number(trx.diskon) > 0 && (
                      <p className="text-xs text-green-600 dark:text-green-400">
                        Hemat Rp {Number(trx.diskon).toLocaleString("id-ID")}
                      </p>
                    )}
                    {trx.status === "PENDING" && (
                      <a href={`/checkout/pay/${trx.orderId}`}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-1 inline-block">
                        Bayar Sekarang →
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
