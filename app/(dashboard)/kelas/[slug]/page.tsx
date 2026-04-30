import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import EnrollButton from "./_components/EnrollButton";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const kelas = await prisma.kelas.findUnique({ where: { slug }, select: { judul: true } });
  return { title: kelas?.judul ?? "Detail Kelas" };
}

export default async function DetailKelasPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await auth();

  const kelas = await prisma.kelas.findUnique({
    where: { slug, status: "PUBLISHED" },
    include: {
      modul: {
        include: {
          konten: { select: { id: true, tipe: true, judul: true, durasi: true }, orderBy: { urutan: "asc" } },
          videoProgress: session?.user?.id
            ? { where: { userId: session.user.id } }
            : false,
        },
        orderBy: { urutan: "asc" },
      },
      _count: { select: { enrollments: true } },
    },
  });

  if (!kelas) notFound();

  let isEnrolled = false;
  const progressMap: Record<string, { posisiDetik: number; isSelesai: boolean }> = {};

  if (session?.user?.id) {
    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_kelasId: { userId: session.user.id, kelasId: kelas.id } },
    });
    isEnrolled = !!enrollment;

    // Build progress map
    for (const modul of kelas.modul) {
      const vp = Array.isArray(modul.videoProgress) ? modul.videoProgress[0] : null;
      progressMap[modul.id] = {
        posisiDetik: vp?.posisiDetik ?? 0,
        isSelesai: vp?.isSelesai ?? false,
      };
    }
  }

  // Hitung persentase kemajuan
  const totalModul = kelas.modul.length;
  const selesaiModul = Object.values(progressMap).filter((p) => p.isSelesai).length;
  const progressPersen = totalModul > 0 ? Math.round((selesaiModul / totalModul) * 100) : 0;

  const hasAccess = kelas.modelAkses === "GRATIS" || isEnrolled;

  const KATEGORI_LABEL: Record<string, string> = {
    CPNS_SKD: "CPNS / SKD", SEKDIN: "Sekolah Kedinasan", UTBK_SNBT: "UTBK / SNBT",
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <Link href="/kelas" className="hover:text-blue-600 dark:hover:text-blue-400">Kelas</Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-white truncate">{kelas.judul}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Info utama */}
        <div className="lg:col-span-2 space-y-5">
          <div>
            <span className="text-xs bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full font-medium">
              {KATEGORI_LABEL[kelas.kategori] ?? kelas.kategori}
            </span>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{kelas.judul}</h1>
          </div>

          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{kelas.deskripsi}</p>

          {/* Progress bar (jika sudah enroll) */}
          {isEnrolled && totalModul > 0 && (
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Kemajuan Belajar</span>
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{progressPersen}%</span>
              </div>
              <div className="w-full bg-blue-100 dark:bg-blue-900 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${progressPersen}%` }} />
              </div>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                {selesaiModul}/{totalModul} modul selesai
              </p>
            </div>
          )}

          {/* Daftar modul */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Kurikulum ({totalModul} Modul)
              </h3>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {kelas.modul.map((modul, index) => {
                const progress = progressMap[modul.id];
                const isSelesai = progress?.isSelesai ?? false;
                const isLocked = modul.isLocked && !isEnrolled;

                // Cek apakah modul sebelumnya sudah selesai (untuk unlock)
                const prevModul = index > 0 ? kelas.modul[index - 1] : null;
                const prevSelesai = prevModul ? (progressMap[prevModul.id]?.isSelesai ?? false) : true;
                const canAccess = hasAccess && (!modul.isLocked || prevSelesai);

                return (
                  <div key={modul.id}
                    className={`px-5 py-4 flex items-start gap-4 ${canAccess ? "hover:bg-gray-50 dark:hover:bg-gray-800" : "opacity-60"}`}>
                    {/* Status icon */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      isSelesai ? "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400"
                      : isLocked ? "bg-gray-100 dark:bg-gray-800 text-gray-400"
                      : "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
                    }`}>
                      {isSelesai ? "✓" : isLocked ? "🔒" : index + 1}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium text-gray-900 dark:text-white text-sm">{modul.judul}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                          isSelesai ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                        }`}>
                          {isSelesai ? "Selesai" : "Belum"}
                        </span>
                      </div>
                      {modul.deskripsi && (
                        <p className="text-xs text-gray-400 mt-0.5">{modul.deskripsi}</p>
                      )}
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                        <span>{modul.konten.length} konten</span>
                        {modul.konten.some((k) => k.tipe === "VIDEO") && (
                          <span>🎥 Video</span>
                        )}
                        {modul.isKuisAktif && <span>📝 Kuis</span>}
                      </div>
                    </div>

                    {canAccess && (
                      <Link href={`/kelas/${slug}/modul/${modul.id}`}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex-shrink-0 mt-1">
                        {isSelesai ? "Ulangi" : "Mulai"} →
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 sticky top-6">
            {kelas.modelAkses !== "GRATIS" && !isEnrolled && (
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Rp {Number(kelas.harga).toLocaleString("id-ID")}
              </div>
            )}

            {!session ? (
              <Link href={`/login?callbackUrl=/kelas/${slug}`}
                className="w-full block text-center bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors">
                Login untuk Daftar
              </Link>
            ) : isEnrolled ? (
              <Link href={`/kelas/${slug}/modul/${kelas.modul[0]?.id ?? ""}`}
                className="w-full block text-center bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors">
                {progressPersen > 0 ? "Lanjutkan Belajar" : "Mulai Belajar"}
              </Link>
            ) : kelas.modelAkses === "GRATIS" ? (
              <EnrollButton kelasId={kelas.id} />
            ) : (
              <Link href={`/checkout?kelas=${kelas.id}`}
                className="w-full block text-center bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors">
                Beli Sekarang
              </Link>
            )}

            <div className="mt-4 space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-2"><span>✓</span><span>{totalModul} modul pembelajaran</span></div>
              <div className="flex items-center gap-2"><span>✓</span><span>Akses seumur hidup</span></div>
              <div className="flex items-center gap-2"><span>✓</span><span>{kelas._count.enrollments.toLocaleString("id-ID")} peserta</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}