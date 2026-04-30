import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const metadata = { title: "Manajemen Modul" };

export default async function AdminModulPage() {
  const modulList = await prisma.modul.findMany({
    select: {
      id: true,
      judul: true,
      deskripsi: true,
      urutan: true,
      isLocked: true,
      isKuisAktif: true,
      createdAt: true,
      kelas: {
        select: {
          id: true,
          judul: true,
          slug: true,
          kategori: true,
        },
      },
      _count: {
        select: {
          konten: true,
          videoProgress: true,
        },
      },
    },
    orderBy: [{ kelas: { judul: "asc" } }, { urutan: "asc" }],
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Manajemen Modul
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {modulList.length} modul total
          </p>
        </div>
        <Link
          href="/admin/modul/buat"
          className="bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <span>+</span> Buat Modul
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
        {modulList.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <div className="text-4xl mb-3">📭</div>
            <p>Belum ada modul</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <tr>
                {[
                  "Modul",
                  "Kelas",
                  "Urutan",
                  "Konten",
                  "Status",
                  "Kuis",
                  "Aksi",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {modulList.map((modul) => (
                <tr
                  key={modul.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">
                      {modul.judul}
                    </p>
                    {modul.deskripsi && (
                      <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
                        {modul.deskripsi}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/kelas/${modul.kelas.id}/edit`}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {modul.kelas.judul}
                    </Link>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {modul.kelas.slug}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-mono text-gray-600 dark:text-gray-400">
                      #{modul.urutan}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                    {modul._count.konten}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        modul.isLocked
                          ? "bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400"
                          : "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                      }`}
                    >
                      {modul.isLocked ? "🔒 Terkunci" : "🔓 Terbuka"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        modul.isKuisAktif
                          ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                      }`}
                    >
                      {modul.isKuisAktif ? "✓ Aktif" : "— Nonaktif"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/modul/${modul.id}/edit`}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
