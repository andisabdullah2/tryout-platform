import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import type { KategoriUjian, TingkatKesulitan } from "@prisma/client";

export const metadata = { title: "Bank Soal" };

interface SearchParams {
  kategori?: string;
  subtes?: string;
  tingkatKesulitan?: string;
  q?: string;
  page?: string;
}

const LABEL_KATEGORI: Record<string, string> = {
  CPNS_SKD: "CPNS/SKD",
  SEKDIN: "Sekdin",
  UTBK_SNBT: "UTBK/SNBT",
};

const LABEL_KESULITAN: Record<string, string> = {
  MUDAH: "Mudah",
  SEDANG: "Sedang",
  SULIT: "Sulit",
};

const BADGE_KESULITAN: Record<string, string> = {
  MUDAH: "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300",
  SEDANG: "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300",
  SULIT: "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300",
};

export default async function BankSoalPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await auth();
  const params = await searchParams;

  const kategori = params.kategori as KategoriUjian | undefined;
  const tingkatKesulitan = params.tingkatKesulitan as TingkatKesulitan | undefined;
  const q = params.q;
  const page = parseInt(params.page ?? "1");
  const limit = 20;
  const skip = (page - 1) * limit;

  const where = {
    isActive: true,
    ...(kategori && { kategori }),
    ...(tingkatKesulitan && { tingkatKesulitan }),
    ...(q && { konten: { contains: q, mode: "insensitive" as const } }),
  };

  const [soalList, total] = await Promise.all([
    prisma.soal.findMany({
      where,
      include: {
        _count: { select: { paketSoal: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip,
    }),
    prisma.soal.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  // Statistik
  const [totalSoal, soalPerKategori] = await Promise.all([
    prisma.soal.count({ where: { isActive: true } }),
    prisma.soal.groupBy({
      by: ["kategori"],
      where: { isActive: true },
      _count: true,
    }),
  ]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Bank Soal</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Total {totalSoal.toLocaleString("id-ID")} soal aktif
          </p>
        </div>
        <Link
          href="/admin/bank-soal/buat"
          className="bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <span>+</span> Tambah Soal
        </Link>
      </div>

      {/* Stats per kategori */}
      <div className="grid grid-cols-3 gap-4">
        {soalPerKategori.map((s) => (
          <div
            key={s.kategori}
            className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 text-center"
          >
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {s._count.toLocaleString("id-ID")}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {LABEL_KATEGORI[s.kategori] ?? s.kategori}
            </div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <form method="GET" className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Cari konten soal..."
            className="flex-1 min-w-48 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            name="kategori"
            defaultValue={kategori ?? ""}
            className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Semua Kategori</option>
            <option value="CPNS_SKD">CPNS/SKD</option>
            <option value="SEKDIN">Sekdin</option>
            <option value="UTBK_SNBT">UTBK/SNBT</option>
          </select>
          <select
            name="tingkatKesulitan"
            defaultValue={tingkatKesulitan ?? ""}
            className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Semua Kesulitan</option>
            <option value="MUDAH">Mudah</option>
            <option value="SEDANG">Sedang</option>
            <option value="SULIT">Sulit</option>
          </select>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Filter
          </button>
          {(q ?? kategori ?? tingkatKesulitan) && (
            <Link
              href="/admin/bank-soal"
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Reset
            </Link>
          )}
        </div>
      </form>

      {/* Tabel soal */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
        {soalList.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <div className="text-4xl mb-3">📭</div>
            <p>Tidak ada soal ditemukan</p>
            <Link href="/admin/bank-soal/buat" className="text-blue-600 hover:underline text-sm mt-2 inline-block">
              Tambah soal pertama
            </Link>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Soal
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">
                  Kategori
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">
                  Topik
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">
                  Kesulitan
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden xl:table-cell">
                  Digunakan
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {soalList.map((soal) => (
                <tr key={soal.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-sm text-gray-900 dark:text-white line-clamp-2 max-w-xs">
                      {soal.konten.replace(/[#*`$]/g, "").substring(0, 100)}
                      {soal.konten.length > 100 ? "..." : ""}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {soal.subtes} · {new Date(soal.createdAt).toLocaleDateString("id-ID")}
                    </p>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
                      {LABEL_KATEGORI[soal.kategori] ?? soal.kategori}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{soal.topik}</span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${BADGE_KESULITAN[soal.tingkatKesulitan] ?? ""}`}>
                      {LABEL_KESULITAN[soal.tingkatKesulitan] ?? soal.tingkatKesulitan}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden xl:table-cell">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {soal._count.paketSoal} paket
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/bank-soal/${soal.id}/edit`}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
                      >
                        Edit
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Menampilkan {skip + 1}–{Math.min(skip + limit, total)} dari {total} soal
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={`/admin/bank-soal?page=${page - 1}${kategori ? `&kategori=${kategori}` : ""}${q ? `&q=${q}` : ""}`}
                className="px-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                ← Sebelumnya
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={`/admin/bank-soal?page=${page + 1}${kategori ? `&kategori=${kategori}` : ""}${q ? `&q=${q}` : ""}`}
                className="px-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Berikutnya →
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
