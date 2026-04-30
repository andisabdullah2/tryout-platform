import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import type { Role } from "@prisma/client";
import { UserActions } from "./user-actions";

export const metadata = { title: "Manajemen Pengguna" };

interface SearchParams {
  q?: string;
  role?: string;
  status?: string;
  page?: string;
}

const LABEL_ROLE: Record<Role, string> = {
  ADMIN: "Admin",
  INSTRUKTUR: "Instruktur",
  PESERTA: "Peserta",
};

const BADGE_ROLE: Record<Role, string> = {
  ADMIN: "bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300",
  INSTRUKTUR: "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300",
  PESERTA: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300",
};

export default async function PenggunaPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await auth();
  const params = await searchParams;

  const q = params.q;
  const roleFilter = params.role as Role | undefined;
  const statusFilter = params.status; // "active" | "inactive" | undefined
  const page = parseInt(params.page ?? "1");
  const limit = 20;
  const skip = (page - 1) * limit;

  const where = {
    ...(roleFilter && Object.values<string>(["ADMIN", "INSTRUKTUR", "PESERTA"]).includes(roleFilter)
      ? { role: roleFilter }
      : {}),
    ...(statusFilter === "active"
      ? { isActive: true }
      : statusFilter === "inactive"
      ? { isActive: false }
      : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" as const } },
            { email: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [userList, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        emailVerified: true,
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip,
    }),
    prisma.user.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  // Statistik per role
  const [totalUsers, usersPerRole] = await Promise.all([
    prisma.user.count(),
    prisma.user.groupBy({
      by: ["role"],
      _count: true,
    }),
  ]);

  const buildPageUrl = (p: number) => {
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    if (roleFilter) sp.set("role", roleFilter);
    if (statusFilter) sp.set("status", statusFilter);
    sp.set("page", String(p));
    return `/admin/pengguna?${sp.toString()}`;
  };

  const hasFilter = !!(q ?? roleFilter ?? statusFilter);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manajemen Pengguna</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Total {totalUsers.toLocaleString("id-ID")} pengguna terdaftar
          </p>
        </div>
      </div>

      {/* Stats per role */}
      <div className="grid grid-cols-3 gap-4">
        {usersPerRole.map((r) => (
          <div
            key={r.role}
            className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 text-center"
          >
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {r._count.toLocaleString("id-ID")}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {LABEL_ROLE[r.role]}
            </div>
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
            placeholder="Cari nama atau email..."
            className="flex-1 min-w-48 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            name="role"
            defaultValue={roleFilter ?? ""}
            className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Semua Peran</option>
            <option value="ADMIN">Admin</option>
            <option value="INSTRUKTUR">Instruktur</option>
            <option value="PESERTA">Peserta</option>
          </select>
          <select
            name="status"
            defaultValue={statusFilter ?? ""}
            className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Semua Status</option>
            <option value="active">Aktif</option>
            <option value="inactive">Nonaktif</option>
          </select>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Filter
          </button>
          {hasFilter && (
            <Link
              href="/admin/pengguna"
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Reset
            </Link>
          )}
        </div>
      </form>

      {/* Tabel pengguna */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
        {userList.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <div className="text-4xl mb-3">👤</div>
            <p>Tidak ada pengguna ditemukan</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Pengguna
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">
                  Peran
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden xl:table-cell">
                  Terdaftar
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {userList.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{user.email}</p>
                    {user.emailVerified && (
                      <span className="text-xs text-green-600 dark:text-green-400">✓ Terverifikasi</span>
                    )}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${BADGE_ROLE[user.role]}`}
                    >
                      {LABEL_ROLE[user.role]}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        user.isActive
                          ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                          : "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300"
                      }`}
                    >
                      {user.isActive ? "Aktif" : "Nonaktif"}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden xl:table-cell">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(user.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <UserActions
                      userId={user.id}
                      currentRole={user.role}
                      isActive={user.isActive}
                      isSelf={session?.user?.id === user.id}
                    />
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
            Menampilkan {skip + 1}–{Math.min(skip + limit, total)} dari {total} pengguna
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={buildPageUrl(page - 1)}
                className="px-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                ← Sebelumnya
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={buildPageUrl(page + 1)}
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
