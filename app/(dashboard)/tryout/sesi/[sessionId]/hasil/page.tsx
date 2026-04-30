import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

export const metadata = { title: "Hasil Tryout" };

export default async function HasilTryoutPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  const session = await auth();
  if (!session?.user?.id) notFound();

  const hasil = await prisma.hasilTryout.findFirst({
    where: { sessionId, userId: session.user.id },
    include: {
      session: {
        include: {
          paket: {
            select: {
              id: true, slug: true, judul: true, kategori: true,
              passingGrade: true, durasi: true,
            },
          },
        },
      },
    },
  });

  if (!hasil) notFound();

  const paket = hasil.session.paket;
  const skorPerSubtes = hasil.skorPerSubtes as Record<string, number>;
  const passingGrade = paket.passingGrade as Record<string, number> | null;

  const durasiMenit = Math.floor(hasil.durasiPengerjaan / 60);
  const durasiDetik = hasil.durasiPengerjaan % 60;

  const KATEGORI_LABEL: Record<string, string> = {
    CPNS_SKD: "CPNS / SKD", SEKDIN: "Sekolah Kedinasan", UTBK_SNBT: "UTBK / SNBT",
  };

  // Ambil peringkat user di leaderboard
  const leaderboardEntry = await prisma.leaderboardEntry.findUnique({
    where: {
      userId_paketId_periode: {
        userId: session.user.id,
        paketId: paket.id,
        periode: "ALL_TIME",
      },
    },
  });

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="text-5xl">{hasil.lulus ? "🎉" : "📊"}</div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {hasil.lulus ? "Selamat! Kamu Lulus!" : "Hasil Tryout"}
        </h1>
        <p className="text-gray-500 dark:text-gray-400">{paket.judul}</p>
        <span className="inline-block text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
          {KATEGORI_LABEL[paket.kategori] ?? paket.kategori}
        </span>
      </div>

      {/* Skor utama */}
      <div className={`rounded-2xl p-8 text-center ${
        hasil.lulus
          ? "bg-green-50 dark:bg-green-950 border-2 border-green-300 dark:border-green-700"
          : "bg-blue-50 dark:bg-blue-950 border-2 border-blue-200 dark:border-blue-800"
      }`}>
        <div className={`text-6xl font-bold mb-2 ${
          hasil.lulus ? "text-green-600 dark:text-green-400" : "text-blue-600 dark:text-blue-400"
        }`}>
          {Number(hasil.skorTotal).toFixed(0)}
        </div>
        <div className="text-gray-500 dark:text-gray-400 text-sm">Skor Total</div>
        {passingGrade?.["total"] && (
          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Passing Grade: <strong>{passingGrade["total"]}</strong>
          </div>
        )}
        {leaderboardEntry && (
          <div className="mt-3 inline-flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 px-3 py-1 rounded-full text-sm font-medium">
            🏆 Peringkat #{leaderboardEntry.peringkat}
          </div>
        )}
      </div>

      {/* Statistik */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Benar", value: hasil.jumlahBenar, color: "text-green-600 dark:text-green-400", bg: "bg-green-50 dark:bg-green-950" },
          { label: "Salah", value: hasil.jumlahSalah, color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-950" },
          { label: "Kosong", value: hasil.jumlahKosong, color: "text-gray-500 dark:text-gray-400", bg: "bg-gray-50 dark:bg-gray-800" },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} rounded-xl p-4 text-center`}>
            <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Skor per subtes */}
      {Object.keys(skorPerSubtes).length > 0 && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Skor per Subtes</h3>
          <div className="space-y-3">
            {Object.entries(skorPerSubtes).map(([subtes, skor]) => {
              const pg = passingGrade?.[subtes.toLowerCase()];
              const lulus = pg ? skor >= pg : null;
              return (
                <div key={subtes} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{subtes}</span>
                    {lulus !== null && (
                      <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                        lulus ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                              : "bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400"
                      }`}>
                        {lulus ? "✓ Lulus" : "✗ Tidak Lulus"}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {pg && (
                      <span className="text-xs text-gray-400">min. {pg}</span>
                    )}
                    <span className="font-bold text-gray-900 dark:text-white text-lg">
                      {typeof skor === "number" ? skor.toFixed(0) : skor}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Info tambahan */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Informasi Pengerjaan</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-gray-500 dark:text-gray-400">Durasi Pengerjaan</span>
            <p className="font-medium text-gray-900 dark:text-white mt-0.5">
              {durasiMenit} menit {durasiDetik} detik
            </p>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Tanggal</span>
            <p className="font-medium text-gray-900 dark:text-white mt-0.5">
              {new Date(hasil.createdAt).toLocaleDateString("id-ID", {
                day: "numeric", month: "long", year: "numeric",
              })}
            </p>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Akurasi</span>
            <p className="font-medium text-gray-900 dark:text-white mt-0.5">
              {hasil.jumlahBenar + hasil.jumlahSalah > 0
                ? `${Math.round((hasil.jumlahBenar / (hasil.jumlahBenar + hasil.jumlahSalah)) * 100)}%`
                : "0%"}
            </p>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Status</span>
            <p className={`font-medium mt-0.5 ${hasil.lulus ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"}`}>
              {hasil.lulus ? "✓ Lulus Passing Grade" : "✗ Belum Lulus"}
            </p>
          </div>
        </div>
      </div>

      {/* Aksi */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link href={`/tryout/sesi/${sessionId}/pembahasan`}
          className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors text-center">
          Lihat Pembahasan
        </Link>
        <Link href={`/tryout/${paket.slug}`}
          className="flex-1 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-center">
          Ulangi Tryout
        </Link>
        <Link href="/leaderboard"
          className="flex-1 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-center">
          Lihat Leaderboard
        </Link>
      </div>
    </div>
  );
}
