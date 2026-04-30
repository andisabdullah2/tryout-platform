import Link from "next/link";
import { auth } from "@/lib/auth";

export default async function HomePage() {
  const session = await auth();

  const features = [
    {
      icon: "📝",
      title: "Tryout CPNS (SKD)",
      description:
        "Simulasi ujian SKD dengan 110 soal TWK, TIU, TKP. Formula penilaian resmi dan passing grade terkini.",
    },
    {
      icon: "🏫",
      title: "Tryout Sekdin",
      description:
        "Paket tryout untuk STAN, IPDN, STIS, STIN, dan sekolah kedinasan lainnya.",
    },
    {
      icon: "🎓",
      title: "Tryout UTBK/SNBT",
      description:
        "Latihan TPS, Literasi, dan Penalaran Matematika dengan skoring IRT skala 0–1000.",
    },
    {
      icon: "🎥",
      title: "Video Pembelajaran",
      description:
        "Ribuan video materi dari instruktur berpengalaman. Tonton kapan saja, di mana saja.",
    },
    {
      icon: "📡",
      title: "Live Class",
      description:
        "Sesi belajar langsung bersama instruktur. Tanya jawab real-time dan rekaman tersedia.",
    },
    {
      icon: "🏆",
      title: "Leaderboard & Badge",
      description:
        "Pantau peringkat Anda, raih badge pencapaian, dan tetap termotivasi.",
    },
  ];

  const stats = [
    { value: "10.000+", label: "Peserta Aktif" },
    { value: "500+", label: "Paket Tryout" },
    { value: "50+", label: "Instruktur" },
    { value: "99.5%", label: "Uptime" },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl">🎯</span>
              <span className="font-bold text-gray-900 dark:text-white text-lg">
                TryoutPlatform
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-6">
              <Link
                href="/tryout"
                className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 text-sm font-medium"
              >
                Tryout
              </Link>
              <Link
                href="/kelas"
                className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 text-sm font-medium"
              >
                Kelas
              </Link>
              <Link
                href="/leaderboard"
                className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 text-sm font-medium"
              >
                Leaderboard
              </Link>
            </div>

            <div className="flex items-center gap-3">
              {session ? (
                <Link
                  href="/dashboard"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-gray-700 dark:text-gray-300 text-sm font-medium hover:text-blue-600"
                  >
                    Masuk
                  </Link>
                  <Link
                    href="/register"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    Daftar Gratis
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="absolute inset-0 bg-grid-white/[0.05]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur rounded-full px-4 py-1.5 text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Platform Tryout & Belajar Terpercaya
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Raih Impianmu dengan{" "}
              <span className="text-yellow-300">Persiapan Terbaik</span>
            </h1>
            <p className="text-lg md:text-xl text-blue-100 mb-8 leading-relaxed">
              Platform tryout online dan pembelajaran lengkap untuk persiapan
              CPNS, Sekolah Kedinasan, dan UTBK/SNBT. Ribuan soal, video
              pembelajaran, dan live class bersama instruktur berpengalaman.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/register"
                className="inline-flex items-center justify-center bg-yellow-400 text-gray-900 px-8 py-3.5 rounded-xl font-bold text-lg hover:bg-yellow-300 transition-colors shadow-lg"
              >
                Mulai Gratis Sekarang →
              </Link>
              <Link
                href="/tryout"
                className="inline-flex items-center justify-center bg-white/10 backdrop-blur border border-white/20 text-white px-8 py-3.5 rounded-xl font-semibold text-lg hover:bg-white/20 transition-colors"
              >
                Lihat Paket Tryout
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-400">
                  {stat.value}
                </div>
                <div className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Semua yang Kamu Butuhkan
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            Dari tryout simulasi hingga pembelajaran terstruktur — semua ada di
            satu platform.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 hover:shadow-md transition-shadow"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Kategori Ujian */}
      <section className="bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Pilih Kategori Ujianmu
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "CPNS / SKD",
                desc: "TWK, TIU, TKP — Persiapan seleksi CPNS dan PPPK",
                color: "from-blue-500 to-blue-700",
                href: "/tryout?kategori=CPNS_SKD",
                icon: "🏛️",
              },
              {
                title: "Sekolah Kedinasan",
                desc: "STAN, IPDN, STIS, STIN, Poltek SSN, Akpol/Akmil",
                color: "from-emerald-500 to-emerald-700",
                href: "/tryout?kategori=SEKDIN",
                icon: "🎖️",
              },
              {
                title: "UTBK / SNBT",
                desc: "TPS, Literasi, Penalaran Matematika — Masuk PTN",
                color: "from-purple-500 to-purple-700",
                href: "/tryout?kategori=UTBK_SNBT",
                icon: "📚",
              },
            ].map((cat) => (
              <Link
                key={cat.title}
                href={cat.href}
                className={`relative overflow-hidden bg-gradient-to-br ${cat.color} text-white rounded-xl p-8 hover:scale-[1.02] transition-transform`}
              >
                <div className="text-5xl mb-4">{cat.icon}</div>
                <h3 className="text-xl font-bold mb-2">{cat.title}</h3>
                <p className="text-white/80 text-sm">{cat.desc}</p>
                <div className="mt-4 text-sm font-medium">
                  Lihat Paket →
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Siap Mulai Belajar?
          </h2>
          <p className="text-blue-100 text-lg mb-8">
            Daftar gratis sekarang dan akses ratusan soal tryout tanpa biaya.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center justify-center bg-yellow-400 text-gray-900 px-10 py-4 rounded-xl font-bold text-lg hover:bg-yellow-300 transition-colors shadow-lg"
          >
            Daftar Gratis — Mulai Sekarang
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🎯</span>
                <span className="font-bold text-white text-lg">
                  TryoutPlatform
                </span>
              </div>
              <p className="text-sm leading-relaxed">
                Platform tryout online dan pembelajaran terpercaya untuk
                persiapan CPNS, Sekdin, dan UTBK/SNBT.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Produk</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/tryout" className="hover:text-white transition-colors">
                    Tryout Online
                  </Link>
                </li>
                <li>
                  <Link href="/kelas" className="hover:text-white transition-colors">
                    Kelas Belajar
                  </Link>
                </li>
                <li>
                  <Link href="/live-class" className="hover:text-white transition-colors">
                    Live Class
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Akun</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/register" className="hover:text-white transition-colors">
                    Daftar
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-white transition-colors">
                    Masuk
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-white transition-colors">
                    Dashboard
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            © {new Date().getFullYear()} TryoutPlatform. Hak cipta dilindungi.
          </div>
        </div>
      </footer>
    </div>
  );
}
