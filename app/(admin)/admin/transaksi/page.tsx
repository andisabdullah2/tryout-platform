import { prisma } from "@/lib/prisma";
import Link from "next/link";
import type { StatusTransaksi } from "@prisma/client";

export const metadata = { title: "Manajemen Transaksi" };

interface SearchParams {
  status?: string;
  q?: string;
  page?: string;
}

const STATUS_BADGE: Record<string, string> = {
  PENDING:  "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300",
  SUCCESS:  "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300",
  FAILED:   "bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400",
  EXPIRED:  "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400",
  REFUNDED: "bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300",
};

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Menunggu", SUCCESS: "Berhasil", FAILED: "Gagal",
  EXPIRED: "Kedaluwarsa", REFUNDED: "Dikembalikan",
};

export default async function AdminTransaksiPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const status = params.status as StatusTransaksi | undefined;
  const q = params.q;
  const page = parseInt(params.page ?? "1");
  const limit = 20;
  const skip = (page - 1) * limit;

  const where = {
    ...(status && { status }),
    ...(q && {
      OR: [
        { orderId: { contains: q, mode: "insensitive" as const } },
        { user: { email: { contains: q, mode: "insensitive" as const } } },
        { user: { name: { contains: q, mode: "insensitive" as const } } },
      ],
    }),
  };

  const [transaksiList, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: { select: { nama: true, harga: true, tipe: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip,
    }),
    prisma.transaction.count({ where }),
  ]);

  // Statistik ringkas
  const [totalPendapatan, countPerStatus] = await Promise.all([
    prisma.transaction.aggregate({
      where: { status: "SUCCESS" },
      _sum: { totalAmount: true },
    }),
    prisma.transaction.groupBy({
      by: ["status"],
      _count: true,
    }),
  ]);

  const totalPages = Math.ceil(total / limit);
  const pendapatan = Number(totalPendapatan._sum.totalAmount ?? 0);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transaksi</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {total.toLocaleString("id-ID")} transaksi total
          </p>
        </div>
        <a
          href="/api/admin/transaksi/export"
          className="border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          Export CSV
        </a>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Pendapatan</p>
          <p className="text-xl font-bold text-green-600 dark:text-green-400 mt-1">
            Rp {pendapatan.toLocaleString("id-ID")}
          </p>
        </div>
        {countPerStatus.map((s) => (
          <div key={s.status} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {STATUS_LABEL[s.status] ?? s.status}
            </p>
            <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
              {s._count.toLocaleString("id-ID")}
            </p>
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
            placeholder="Cari order ID, nama, atau email..."
            className="flex-1 min-w-48 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            name="status"
            defaultValue={status ?? ""}
            className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Semua Status</option>
            {Object.entries(STATUS_LABEL).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Filter
          </button>
          {(q ?? status) && (
            <Link
              href="/admin/transaksi"
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Reset
            </Link>
          )}
        </div>
      </form>

      {/* Tabel */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
        {transaksiList.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <div className="text-4xl mb-3">📭</div>
            <p>Tidak ada transaksi ditemukan</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <tr>
                {["Order ID", "Pengguna", "Item", "Total", "Metode", "Status", "Tanggal"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {transaksiList.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs text-gray-600 dark:text-gray-400">
                      {tx.orderId}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{tx.user.name}</p>
                    <p className="text-xs text-gray-400">{tx.user.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-0.5">
                      {tx.items.map((item, i) => (
                        <p key={i} className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1">
                          {item.nama}
                        </p>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      Rp {Number(tx.totalAmount).toLocaleString("id-ID")}
                    </span>
                    {Number(tx.diskon) > 0 && (
                      <p className="text-xs text-green-600 dark:text-green-400">
                        -Rp {Number(tx.diskon).toLocaleString("id-ID")}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {tx.metode?.replace(/_/g, " ") ?? "-"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[tx.status] ?? ""}`}>
                      {STATUS_LABEL[tx.status] ?? tx.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(tx.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </span>
                    {tx.paidAt && (
                      <p className="text-xs text-green-600 dark:text-green-400">
                        Dibayar {new Date(tx.paidAt).toLocaleDateString("id-ID", {
                          day: "numeric", month: "short",
                        })}
                      </p>
                    )}
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
            Menampilkan {skip + 1}–{Math.min(skip + limit, total)} dari {total} transaksi
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={`/admin/transaksi?page=${page - 1}${status ? `&status=${status}` : ""}${q ? `&q=${q}` : ""}`}
                className="px-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                ← Sebelumnya
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={`/admin/transaksi?page=${page + 1}${status ? `&status=${status}` : ""}${q ? `&q=${q}` : ""}`}
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
