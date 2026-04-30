import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const metadata = { title: "Manajemen Kelas" };

const STATUS_BADGE: Record<string, string> = {
  DRAFT: "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400",
  PUBLISHED: "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300",
  ARCHIVED: "bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400",
};

const KATEGORI_LABEL: Record<string, string> = {
  CPNS_SKD: "CPNS/SKD", SEKDIN: "Sekdin", UTBK_SNBT: "UTBK/SNBT",
};

export default async function AdminKelasPage() {
  const kelasList = await prisma.kelas.findMany({
    select: {
      id: true, slug: true, judul: true, kategori: true,
      harga: true, modelAkses: true, status: true, createdAt: true,
      _count: { select: { enrollments: true, modul: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manajemen Kelas</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{kelasList.length} kelas total</p>
        </div>
        <Link href="/admin/kelas/buat"
          className="bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
          <span>+</span> Buat Kelas
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
        {kelasList.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <div className="text-4xl mb-3">📭</div>
            <p>Belum ada kelas</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <tr>
                {["Kelas", "Kategori", "Modul", "Peserta", "Harga", "Status", "Aksi"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {kelasList.map((kelas) => (
                <tr key={kelas.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">{kelas.judul}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{kelas.slug}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                      {KATEGORI_LABEL[kelas.kategori] ?? kelas.kategori}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{kelas._count.modul}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{kelas._count.enrollments.toLocaleString("id-ID")}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                    {kelas.modelAkses === "GRATIS" ? (
                      <span className="text-green-600 dark:text-green-400 font-medium">Gratis</span>
                    ) : (
                      `Rp ${Number(kelas.harga).toLocaleString("id-ID")}`
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[kelas.status] ?? ""}`}>
                      {kelas.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/kelas/${kelas.id}/edit`}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">
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
