import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const metadata = { title: "Manajemen Paket Tryout" };

const STATUS_BADGE: Record<string, string> = {
  DRAFT: "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400",
  PUBLISHED: "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300",
  ARCHIVED: "bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400",
};

const KATEGORI_LABEL: Record<string, string> = {
  CPNS_SKD: "CPNS/SKD", SEKDIN: "Sekdin", UTBK_SNBT: "UTBK/SNBT",
};

export default async function AdminTryoutPage() {
  const paketList = await prisma.paketTryout.findMany({
    select: {
      id: true, slug: true, judul: true, kategori: true,
      subKategori: true, durasi: true, totalSoal: true,
      harga: true, modelAkses: true, status: true, createdAt: true,
      _count: { select: { sesi: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const stats = {
    total: paketList.length,
    published: paketList.filter((p) => p.status === "PUBLISHED").length,
    draft: paketList.filter((p) => p.status === "DRAFT").length,
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Paket Tryout</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {stats.published} aktif · {stats.draft} draft · {stats.total} total
          </p>
        </div>
        <Link href="/admin/tryout/buat"
          className="bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
          <span>+</span> Buat Paket
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
        {paketList.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <div className="text-4xl mb-3">📭</div>
            <p>Belum ada paket tryout</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <tr>
                {["Paket", "Kategori", "Soal", "Sesi", "Harga", "Status", "Aksi"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {paketList.map((paket) => (
                <tr key={paket.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">{paket.judul}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{paket.subKategori ?? paket.slug}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
                      {KATEGORI_LABEL[paket.kategori] ?? paket.kategori}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{paket.totalSoal}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{paket._count.sesi.toLocaleString("id-ID")}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                    {paket.modelAkses === "GRATIS" ? (
                      <span className="text-green-600 dark:text-green-400 font-medium">Gratis</span>
                    ) : (
                      `Rp ${Number(paket.harga).toLocaleString("id-ID")}`
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[paket.status] ?? ""}`}>
                      {paket.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Link href={`/admin/tryout/${paket.id}/edit`}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">
                        Edit
                      </Link>
                      {paket.status === "DRAFT" && (
                        <PublishButton paketId={paket.id} />
                      )}
                    </div>
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

// Server component button placeholder — actual publish via client component
function PublishButton({ paketId }: { paketId: string }) {
  return (
    <Link href={`/admin/tryout/${paketId}/edit?action=publish`}
      className="text-xs text-green-600 dark:text-green-400 hover:underline font-medium">
      Publish
    </Link>
  );
}
