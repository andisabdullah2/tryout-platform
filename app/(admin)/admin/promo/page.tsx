import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { PromoActions } from "./promo-actions";
import type { Prisma } from "@prisma/client";

export const metadata = { title: "Manajemen Kode Promo" };

interface SearchParams {
  q?: string;
  status?: string;
  page?: string;
}

const STATUS_BADGE: Record<string, string> = {
  active: "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300",
  inactive: "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400",
  expired: "bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400",
};

function getPromoStatus(promo: {
  isActive: boolean;
  expiredAt: Date | null;
  batasUse: number | null;
  totalUsed: number;
}): "active" | "inactive" | "expired" | "habis" {
  if (!promo.isActive) return "inactive";
  if (promo.expiredAt && promo.expiredAt < new Date()) return "expired";
  if (promo.batasUse !== null && promo.totalUsed >= promo.batasUse) return "habis";
  return "active";
}

const STATUS_LABEL: Record<string, string> = {
  active: "Aktif",
  inactive: "Nonaktif",
  expired: "Kedaluwarsa",
  habis: "Habis",
};

const STATUS_BADGE_MAP: Record<string, string> = {
  active: STATUS_BADGE.active,
  inactive: STATUS_BADGE.inactive,
  expired: STATUS_BADGE.expired,
  habis: "bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300",
};

export default async function PromoPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await auth();
  const params = await searchParams;

  const q = params.q;
  const statusFilter = params.status;
  const page = parseInt(params.page ?? "1");
  const limit = 20;
  const skip = (page - 1) * limit;
  const now = new Date();

  const where: Prisma.PromoCodeWhereInput = {
    ...(q && { kode: { contains: q.toUpperCase() } }),
    ...(statusFilter === "active" && {
      isActive: true,
      OR: [{ expiredAt: null }, { expiredAt: { gt: now } }],
    }),
    ...(statusFilter === "inactive" && { isActive: false }),
    ...(statusFilter === "expired" && { expiredAt: { lte: now } }),
  };

  const [promos, total, stats] = await Promise.all([
    prisma.promoCode.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip,
    }),
    prisma.promoCode.count({ where }),
    prisma.promoCode.aggregate({
      _count: { id: true },
      _sum: { totalUsed: true },
    }),
  ]);

  const totalPages = Math.ceil(total / limit);

  const activeCount = await prisma.promoCode.count({
    where: { isActive: true, OR: [{ expiredAt: null }, { expiredAt: { gt: now } }] },
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Kode Promo</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Kelola kode diskon untuk peserta
          </p>
        </div>
        <Link
          href="/admin/promo/buat"
          className="bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <span>+</span> Buat Promo
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Promo", value: stats._count.id, icon: "🏷️", color: "text-blue-600 dark:text-blue-400" },
          { label: "Promo Aktif", value: activeCount, icon: "✅", color: "text-green-600 dark:text-green-400" },
          { label: "Total Digunakan", value: stats._sum.totalUsed ?? 0, icon: "🎯", color: "text-purple-600 dark:text-purple-400" },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 text-center"
          >
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className={`text-2xl font-bold ${s.color}`}>{s.value.toLocaleString("id-ID")}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <form
        method="GET"
        className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4"
      >
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Cari kode promo..."
            className="flex-1 min-w-48 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase placeholder:normal-case"
          />
          <select
            name="status"
            defaultValue={statusFilter ?? ""}
            className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Semua Status</option>
            <option value="active">Aktif</option>
            <option value="inactive">Nonaktif</option>
            <option value="expired">Kedaluwarsa</option>
          </select>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Filter
          </button>
          {(q ?? statusFilter) && (
            <Link
              href="/admin/promo"
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Reset
            </Link>
          )}
        </div>
      </form>

      {/* Tabel promo */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
        {promos.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <div className="text-4xl mb-3">🏷️</div>
            <p>Belum ada kode promo</p>
            <Link
              href="/admin/promo/buat"
              className="text-blue-600 hover:underline text-sm mt-2 inline-block"
            >
              Buat promo pertama
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Kode
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">
                    Diskon
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">
                    Penggunaan
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">
                    Kedaluwarsa
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {promos.map((promo) => {
                  const status = getPromoStatus(promo);
                  return (
                    <tr
                      key={promo.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-mono font-semibold text-gray-900 dark:text-white text-sm">
                            {promo.kode}
                          </p>
                          {promo.deskripsi && (
                            <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">
                              {promo.deskripsi}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          {promo.tipeDiskon === "PERSEN"
                            ? `${Number(promo.nilaiDiskon)}%`
                            : `Rp ${Number(promo.nilaiDiskon).toLocaleString("id-ID")}`}
                        </span>
                        <span className="text-xs text-gray-400 ml-1">
                          {promo.tipeDiskon === "PERSEN" ? "diskon" : "potongan"}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <div className="text-sm text-gray-700 dark:text-gray-300">
                          <span className="font-medium">{promo.totalUsed}</span>
                          {promo.batasUse !== null && (
                            <span className="text-gray-400"> / {promo.batasUse}</span>
                          )}
                          {promo.batasUse === null && (
                            <span className="text-gray-400"> / ∞</span>
                          )}
                        </div>
                        {promo.batasUse !== null && (
                          <div className="mt-1 w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                            <div
                              className="bg-blue-500 h-1.5 rounded-full"
                              style={{
                                width: `${Math.min(100, (promo.totalUsed / promo.batasUse) * 100)}%`,
                              }}
                            />
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        {promo.expiredAt ? (
                          <span
                            className={`text-sm ${promo.expiredAt < new Date() ? "text-red-500 dark:text-red-400" : "text-gray-600 dark:text-gray-400"}`}
                          >
                            {new Date(promo.expiredAt).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">Tidak ada</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE_MAP[status] ?? ""}`}
                        >
                          {STATUS_LABEL[status] ?? status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <PromoActions promoId={promo.id} isActive={promo.isActive} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Menampilkan {skip + 1}–{Math.min(skip + limit, total)} dari {total} promo
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={`/admin/promo?page=${page - 1}${statusFilter ? `&status=${statusFilter}` : ""}${q ? `&q=${q}` : ""}`}
                className="px-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                ← Sebelumnya
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={`/admin/promo?page=${page + 1}${statusFilter ? `&status=${statusFilter}` : ""}${q ? `&q=${q}` : ""}`}
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
