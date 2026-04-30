import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const userId = session.user.id;

  // Ambil data statistik peserta
  const [totalTryout, totalKelas, lastTryout, activeSubscription] =
    await Promise.all([
      prisma.tryoutSession.count({
        where: { userId, status: "COMPLETED" },
      }),
      prisma.enrollment.count({ where: { userId } }),
      prisma.hasilTryout.findFirst({
        where: { userId },
        orderBy: { createdAt: "desc" },
        include: { session: { include: { paket: true } } },
      }),
      prisma.subscription.findFirst({
        where: { userId, isActive: true, endDate: { gt: new Date() } },
        orderBy: { endDate: "desc" },
      }),
    ]);

  const stats = [
    {
      label: "Tryout Selesai",
      value: totalTryout,
      icon: "📝",
      color: "bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400",
    },
    {
      label: "Kelas Diikuti",
      value: totalKelas,
      icon: "📚",
      color: "bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Status Langganan",
      value: activeSubscription ? "Aktif" : "Gratis",
      icon: "⭐",
      color: activeSubscription
        ? "bg-yellow-50 dark:bg-yellow-950 text-yellow-600 dark:text-yellow-400"
        : "bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400",
    },
  ];

  const quickLinks = [
    {
      href: "/tryout",
      label: "Mulai Tryout",
      desc: "Pilih paket tryout CPNS, Sekdin, atau UTBK",
      icon: "📝",
      color: "border-blue-200 dark:border-blue-800 hover:border-blue-400",
    },
    {
      href: "/kelas",
      label: "Belajar Sekarang",
      desc: "Akses video dan materi pembelajaran",
      icon: "🎥",
      color: "border-emerald-200 dark:border-emerald-800 hover:border-emerald-400",
    },
    {
      href: "/live-class",
      label: "Live Class",
      desc: "Jadwal kelas online bersama instruktur",
      icon: "📡",
      color: "border-purple-200 dark:border-purple-800 hover:border-purple-400",
    },
    {
      href: "/leaderboard",
      label: "Leaderboard",
      desc: "Lihat peringkat Anda",
      icon: "🏆",
      color: "border-yellow-200 dark:border-yellow-800 hover:border-yellow-400",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Halo, {session.user.name?.split(" ")[0] ?? "Peserta"} 👋
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Selamat datang kembali. Yuk lanjutkan belajar hari ini!
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5"
          >
            <div className={`inline-flex p-2.5 rounded-lg ${stat.color} mb-3`}>
              <span className="text-xl">{stat.icon}</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stat.value}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Mulai dari Sini
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`bg-white dark:bg-gray-900 border-2 ${link.color} rounded-xl p-5 flex items-start gap-4 transition-colors group`}
            >
              <span className="text-3xl">{link.icon}</span>
              <div>
                <div className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {link.label}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  {link.desc}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Tryout Terakhir */}
      {lastTryout && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Tryout Terakhir
          </h2>
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {lastTryout.session.paket.judul}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  {new Date(lastTryout.createdAt).toLocaleDateString("id-ID", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {Number(lastTryout.skorTotal).toFixed(0)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Skor Total
                </div>
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <Link
                href={`/tryout/sesi/${lastTryout.sessionId}/hasil`}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                Lihat Hasil →
              </Link>
              <Link
                href={`/tryout/${lastTryout.session.paket.slug}`}
                className="text-sm text-gray-500 dark:text-gray-400 hover:underline"
              >
                Ulangi Tryout
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
