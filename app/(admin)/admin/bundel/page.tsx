import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const metadata = { title: "Manajemen Bundel Tryout" };

const STATUS_BADGE: Record<string, string> = {
  DRAFT: "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400",
  PUBLISHED: "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300",
  ARCHIVED: "bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400",
};

export default async function AdminBundelPage() {
  const bundelList = await prisma.bundelTryout.findMany({
    include: {
      paket: { include: { paket: { select: { judul: true } } }, orderBy: { urutan: "asc" } },
      _count: { select: { transaksiItem: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Bundel Tryout</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Kelompokkan beberapa paket tryout dalam satu produk
          </p>
        </div>
        <Link
          href="/admin/bundel/buat"
          className="bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <span>+</span> Buat Bundel
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
        {bundelList.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <div className="text-4xl mb-3">📦</div>
            <p>Belum ada bundel tryout</p>
            <Link href="/admin/bundel/buat" className="text-blue-600 hover:underline text-sm mt-2 inline-block">
              Buat bundel pertama
            </Link>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <tr>
                {["Bundel", "Isi Tryout", "Terjual", "Harga", "Status", "Aksi"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {bundelList.map((bundel) => (
                <tr key={bundel.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{bundel.judul}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{bundel.slug}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-0.5">
                      {bundel.paket.map((bp) => (
                        <p key={bp.id} className="text-xs text-gray-600 dark:text-gray-400">
                          {bp.urutan}. {bp.paket.judul}
                        </p>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                    {bundel._count.transaksiItem}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                    Rp {Number(bundel.harga).toLocaleString("id-ID")}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[bundel.status] ?? ""}`}>
                      {bundel.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/bundel/${bundel.id}/edit`}
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
