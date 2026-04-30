import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const metadata = { title: "Live Class" };

export default async function LiveClassPage() {
  const session = await auth();

  // Ambil live class yang akan datang dan sedang berlangsung
  const [upcoming, live] = await Promise.all([
    prisma.liveClass.findMany({
      where: { status: "SCHEDULED", jadwalMulai: { gte: new Date() } },
      include: { kelas: { select: { judul: true, slug: true } } },
      orderBy: { jadwalMulai: "asc" },
      take: 10,
    }),
    prisma.liveClass.findMany({
      where: { status: "LIVE" },
      include: { kelas: { select: { judul: true, slug: true } } },
      orderBy: { jadwalMulai: "desc" },
    }),
  ]);

  // Kelas yang di-enroll user
  const enrolledKelasIds = session?.user?.id
    ? new Set(
        (await prisma.enrollment.findMany({
          where: { userId: session.user.id },
          select: { kelasId: true },
        })).map((e) => e.kelasId)
      )
    : new Set<string>();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Live Class</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Sesi belajar langsung bersama instruktur
        </p>
      </div>

      {/* Sedang berlangsung */}
      {live.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            Sedang Berlangsung
          </h2>
          <div className="space-y-3">
            {live.map((lc) => (
              <div key={lc.id}
                className="bg-red-50 dark:bg-red-950 border-2 border-red-300 dark:border-red-700 rounded-xl p-5 flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{lc.judul}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    {lc.kelas.judul} · {lc.jumlahHadir} peserta hadir
                  </p>
                </div>
                <Link href={`/live-class/${lc.id}`}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors flex-shrink-0">
                  🔴 Bergabung
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Jadwal mendatang */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Jadwal Mendatang
        </h2>
        {upcoming.length === 0 ? (
          <div className="py-12 text-center text-gray-400 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl">
            <div className="text-4xl mb-3">📅</div>
            <p>Belum ada jadwal live class</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcoming.map((lc) => {
              const isEnrolled = enrolledKelasIds.has(lc.kelasId);
              const jadwal = new Date(lc.jadwalMulai);
              return (
                <div key={lc.id}
                  className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 flex items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    {/* Tanggal */}
                    <div className="text-center bg-blue-50 dark:bg-blue-950 rounded-xl p-3 flex-shrink-0 min-w-16">
                      <div className="text-xs text-blue-600 dark:text-blue-400 font-medium uppercase">
                        {jadwal.toLocaleDateString("id-ID", { month: "short" })}
                      </div>
                      <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                        {jadwal.getDate()}
                      </div>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{lc.judul}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        {lc.kelas.judul}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {jadwal.toLocaleTimeString("id-ID", {
                          hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta",
                        })} WIB · {lc.durasiEstimasi} menit
                      </p>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    {isEnrolled ? (
                      <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-3 py-1.5 rounded-full font-medium">
                        ✓ Terdaftar
                      </span>
                    ) : (
                      <Link href={`/kelas/${lc.kelas.slug}`}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">
                        Daftar Kelas →
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
