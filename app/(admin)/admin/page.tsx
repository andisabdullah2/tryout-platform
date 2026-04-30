import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Dashboard Admin" };

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session?.user) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    totalPenggunaAktif,
    tryoutHariIni,
    kelasAktif,
    pendapatanBulanIni,
    penggunaBaru7Hari,
  ] = await Promise.all([
    prisma.user.count({ where: { isActive: true } }),
    prisma.tryoutSession.count({
      where: { status: "COMPLETED", completedAt: { gte: today } },
    }),
    prisma.kelas.count({ where: { status: "PUBLISHED" } }),
    prisma.transaction.aggregate({
      where: {
        status: "SUCCESS",
        paidAt: {
          gte: new Date(today.getFullYear(), today.getMonth(), 1),
        },
      },
      _sum: { totalAmount: true },
    }),
    prisma.user.count({
      where: {
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    }),
  ]);

  const stats = [
    {
      label: "Pengguna Aktif",
      value: totalPenggunaAktif.toLocaleString("id-ID"),
      icon: "👥",
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-950",
    },
    {
      label: "Tryout Hari Ini",
      value: tryoutHariIni.toLocaleString("id-ID"),
      icon: "📝",
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-950",
    },
    {
      label: "Kelas Aktif",
      value: kelasAktif.toLocaleString("id-ID"),
      icon: "📚",
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-50 dark:bg-purple-950",
    },
    {
      label: "Pendapatan Bulan Ini",
      value: `Rp ${Number(pendapatanBulanIni._sum.totalAmount ?? 0).toLocaleString("id-ID")}`,
      icon: "💰",
      color: "text-yellow-600 dark:text-yellow-400",
      bg: "bg-yellow-50 dark:bg-yellow-950",
    },
    {
      label: "Pengguna Baru (7 Hari)",
      value: penggunaBaru7Hari.toLocaleString("id-ID"),
      icon: "🆕",
      color: "text-pink-600 dark:text-pink-400",
      bg: "bg-pink-50 dark:bg-pink-950",
    },
  ];

  const quickActions = [
    { href: "/admin/bank-soal/buat", label: "Tambah Soal Baru", icon: "➕" },
    { href: "/admin/tryout/buat", label: "Buat Paket Tryout", icon: "📋" },
    { href: "/admin/kelas", label: "Kelola Kelas", icon: "🎓" },
    { href: "/admin/pengguna", label: "Kelola Pengguna", icon: "👤" },
    { href: "/admin/promo", label: "Kode Promo", icon: "🏷️" },
    { href: "/admin/analitik", label: "Lihat Analitik", icon: "📊" },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Dashboard Admin
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Selamat datang, {session.user.name}. Berikut ringkasan platform hari ini.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5"
          >
            <div className={`inline-flex p-2.5 rounded-lg ${stat.bg} mb-3`}>
              <span className="text-xl">{stat.icon}</span>
            </div>
            <div className={`text-xl font-bold ${stat.color}`}>
              {stat.value}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Aksi Cepat
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickActions.map((action) => (
            <a
              key={action.href}
              href={action.href}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 text-center hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-sm transition-all group"
            >
              <div className="text-2xl mb-2">{action.icon}</div>
              <div className="text-xs font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight">
                {action.label}
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
