import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const metadata = { title: "Analitik Platform" };

export default async function AnalitikPage() {
  await auth();

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOf7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const startOf30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  // ============================================================
  // 14.5: Pertumbuhan pengguna
  // ============================================================
  const penggunaBaru30Hari = await prisma.user.findMany({
    where: { createdAt: { gte: startOf30Days } },
    select: { createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  // Kelompokkan per hari
  const penggunaPerHari: Record<string, number> = {};
  for (const u of penggunaBaru30Hari) {
    const key = u.createdAt.toISOString().slice(0, 10);
    penggunaPerHari[key] = (penggunaPerHari[key] ?? 0) + 1;
  }

  // ============================================================
  // 14.6: Statistik tryout
  // ============================================================
  const [sesiPerKategori, avgSkorPerPaket, distribusiSkor] = await Promise.all([
    prisma.tryoutSession.groupBy({
      by: ["paketId"],
      where: { status: "COMPLETED" },
      _count: true,
    }),
    prisma.hasilTryout.groupBy({
      by: ["paketId"],
      _avg: { skorTotal: true },
      _count: true,
      orderBy: { _count: { paketId: "desc" } },
      take: 5,
    }),
    // Distribusi skor dalam bucket 50 poin
    prisma.hasilTryout.findMany({
      select: { skorTotal: true },
      take: 1000,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  // Hitung distribusi skor
  const skorBuckets: Record<string, number> = {
    "0-100": 0, "101-200": 0, "201-300": 0, "301-400": 0,
    "401-500": 0, "501+": 0,
  };
  for (const h of distribusiSkor) {
    const skor = Number(h.skorTotal);
    if (skor <= 100) skorBuckets["0-100"]!++;
    else if (skor <= 200) skorBuckets["101-200"]!++;
    else if (skor <= 300) skorBuckets["201-300"]!++;
    else if (skor <= 400) skorBuckets["301-400"]!++;
    else if (skor <= 500) skorBuckets["401-500"]!++;
    else skorBuckets["501+"]!++;
  }

  const totalSesiSelesai = sesiPerKategori.reduce((sum, s) => sum + s._count, 0);

  // Ambil nama paket untuk avg skor
  const paketIds = avgSkorPerPaket.map((p) => p.paketId);
  const paketNames = await prisma.paketTryout.findMany({
    where: { id: { in: paketIds } },
    select: { id: true, judul: true },
  });
  const paketNameMap = Object.fromEntries(paketNames.map((p) => [p.id, p.judul]));

  // ============================================================
  // 14.7: Statistik konten
  // ============================================================
  const [kelasTerpopuler, tingkatPenyelesaian] = await Promise.all([
    prisma.kelas.findMany({
      where: { status: "PUBLISHED" },
      include: { _count: { select: { enrollments: true } } },
      orderBy: { enrollments: { _count: "desc" } },
      take: 5,
    }),
    prisma.enrollment.aggregate({
      _count: { id: true },
    }),
  ]);

  const enrollmentSelesai = await prisma.enrollment.count({
    where: { completedAt: { not: null } },
  });
  const tingkatSelesai =
    tingkatPenyelesaian._count.id > 0
      ? Math.round((enrollmentSelesai / tingkatPenyelesaian._count.id) * 100)
      : 0;

  // ============================================================
  // 14.8: Laporan pendapatan
  // ============================================================
  const pendapatanBulanan = await prisma.transaction.groupBy({
    by: ["paidAt"],
    where: { status: "SUCCESS", paidAt: { gte: startOf30Days } },
    _sum: { totalAmount: true },
  });

  // Kelompokkan per bulan
  const pendapatanPerBulan: Record<string, number> = {};
  for (const t of pendapatanBulanan) {
    if (!t.paidAt) continue;
    const key = t.paidAt.toISOString().slice(0, 7); // YYYY-MM
    pendapatanPerBulan[key] = (pendapatanPerBulan[key] ?? 0) + Number(t._sum.totalAmount ?? 0);
  }

  const totalPendapatanBulanIni = await prisma.transaction.aggregate({
    where: { status: "SUCCESS", paidAt: { gte: startOfMonth } },
    _sum: { totalAmount: true },
  });

  const totalPendapatan = await prisma.transaction.aggregate({
    where: { status: "SUCCESS" },
    _sum: { totalAmount: true },
  });

  // ============================================================
  // Ringkasan cepat
  // ============================================================
  const [totalPengguna, totalTryoutSelesai, totalKelas] = await Promise.all([
    prisma.user.count({ where: { isActive: true } }),
    prisma.tryoutSession.count({ where: { status: "COMPLETED" } }),
    prisma.kelas.count({ where: { status: "PUBLISHED" } }),
  ]);

  const maxPenggunaHari = Math.max(...Object.values(penggunaPerHari), 1);
  const maxSkorBucket = Math.max(...Object.values(skorBuckets), 1);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analitik Platform</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Data diperbarui secara real-time
          </p>
        </div>
        {/* 14.9: Export CSV */}
        <Link
          href="/api/admin/laporan/export?format=csv"
          className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-2.5 rounded-lg font-medium hover:bg-gray-700 dark:hover:bg-gray-100 transition-colors text-sm flex items-center gap-2"
        >
          📥 Export CSV
        </Link>
      </div>

      {/* Ringkasan */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Pengguna Aktif", value: totalPengguna.toLocaleString("id-ID"), icon: "👥" },
          { label: "Tryout Selesai", value: totalTryoutSelesai.toLocaleString("id-ID"), icon: "📝" },
          { label: "Kelas Aktif", value: totalKelas.toLocaleString("id-ID"), icon: "📚" },
          {
            label: "Total Pendapatan",
            value: `Rp ${Number(totalPendapatan._sum.totalAmount ?? 0).toLocaleString("id-ID")}`,
            icon: "💰",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5"
          >
            <div className="text-2xl mb-2">{s.icon}</div>
            <div className="text-xl font-bold text-gray-900 dark:text-white">{s.value}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* 14.5: Pertumbuhan pengguna */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">
          Pertumbuhan Pengguna (30 Hari Terakhir)
        </h2>
        <div className="flex items-end gap-1 h-32">
          {Object.entries(penggunaPerHari).slice(-30).map(([date, count]) => (
            <div
              key={date}
              title={`${date}: ${count} pengguna baru`}
              className="flex-1 bg-blue-500 dark:bg-blue-600 rounded-t hover:bg-blue-600 dark:hover:bg-blue-500 transition-colors cursor-pointer"
              style={{ height: `${Math.max(4, (count / maxPenggunaHari) * 100)}%` }}
            />
          ))}
          {Object.keys(penggunaPerHari).length === 0 && (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
              Belum ada data
            </div>
          )}
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-2">
          <span>30 hari lalu</span>
          <span>Hari ini</span>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Total {penggunaBaru30Hari.length} pengguna baru dalam 30 hari terakhir
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 14.6: Statistik tryout */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">
            Statistik Tryout
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Total sesi selesai</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {totalSesiSelesai.toLocaleString("id-ID")}
              </span>
            </div>

            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                Rata-rata Skor per Paket (Top 5)
              </p>
              <div className="space-y-2">
                {avgSkorPerPaket.map((p) => (
                  <div key={p.paketId} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700 dark:text-gray-300 truncate max-w-[60%]">
                      {paketNameMap[p.paketId] ?? p.paketId}
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {Number(p._avg.skorTotal ?? 0).toFixed(0)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                Distribusi Skor
              </p>
              <div className="space-y-1.5">
                {Object.entries(skorBuckets).map(([range, count]) => (
                  <div key={range} className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400 w-16 flex-shrink-0">
                      {range}
                    </span>
                    <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${(count / maxSkorBucket) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 w-8 text-right">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 14.7: Statistik konten */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">
            Statistik Konten
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Tingkat penyelesaian kelas</span>
              <span className="font-semibold text-gray-900 dark:text-white">{tingkatSelesai}%</span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full"
                style={{ width: `${tingkatSelesai}%` }}
              />
            </div>

            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                Kelas Terpopuler
              </p>
              <div className="space-y-2">
                {kelasTerpopuler.map((k) => (
                  <div key={k.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700 dark:text-gray-300 truncate max-w-[70%]">
                      {k.judul}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      {k._count.enrollments} peserta
                    </span>
                  </div>
                ))}
                {kelasTerpopuler.length === 0 && (
                  <p className="text-sm text-gray-400">Belum ada data</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 14.8: Laporan pendapatan */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 dark:text-white">
            Laporan Pendapatan
          </h2>
          <div className="text-right">
            <p className="text-xs text-gray-400">Bulan ini</p>
            <p className="text-lg font-bold text-green-600 dark:text-green-400">
              Rp {Number(totalPendapatanBulanIni._sum.totalAmount ?? 0).toLocaleString("id-ID")}
            </p>
          </div>
        </div>

        {Object.keys(pendapatanPerBulan).length > 0 ? (
          <div className="space-y-2">
            {Object.entries(pendapatanPerBulan)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([bulan, total]) => {
                const maxPendapatan = Math.max(...Object.values(pendapatanPerBulan), 1);
                return (
                  <div key={bulan} className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 dark:text-gray-400 w-16 flex-shrink-0">
                      {bulan}
                    </span>
                    <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-3">
                      <div
                        className="bg-green-500 h-3 rounded-full"
                        style={{ width: `${(total / maxPendapatan) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300 w-28 text-right">
                      Rp {total.toLocaleString("id-ID")}
                    </span>
                  </div>
                );
              })}
          </div>
        ) : (
          <p className="text-sm text-gray-400">Belum ada data pendapatan</p>
        )}
      </div>
    </div>
  );
}
