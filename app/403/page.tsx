import Link from "next/link";

export const metadata = { title: "Akses Ditolak" };

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <div className="text-center">
        <div className="text-8xl mb-6">🚫</div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          403
        </h1>
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
          Akses Ditolak
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md">
          Anda tidak memiliki izin untuk mengakses halaman ini. Silakan hubungi
          administrator jika Anda merasa ini adalah kesalahan.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/dashboard"
            className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Ke Dashboard
          </Link>
          <Link
            href="/"
            className="border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 px-6 py-2.5 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
