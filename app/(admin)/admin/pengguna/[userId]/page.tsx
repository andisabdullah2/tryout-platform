import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Role } from "@prisma/client";
import { UserActions } from "../user-actions";

export const metadata = { title: "Detail Pengguna" };

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

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const session = await auth();
  const { userId } = await params;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      emailVerified: true,
      phone: true,
      image: true,
      loginAttempts: true,
      lockedUntil: true,
      _count: {
        select: {
          tryoutSessions: true,
          enrollments: true,
          transactions: true,
        },
      },
    },
  });

  if (!user) notFound();

  const isSelf = session?.user?.id === user.id;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <Link href="/admin/pengguna" className="hover:text-blue-600 dark:hover:text-blue-400">
          Manajemen Pengguna
        </Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-white">{user.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{user.name}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{user.email}</p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`text-xs px-2.5 py-1 rounded-full font-medium ${BADGE_ROLE[user.role]}`}
          >
            {LABEL_ROLE[user.role]}
          </span>
          <span
            className={`text-xs px-2.5 py-1 rounded-full font-medium ${
              user.isActive
                ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                : "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300"
            }`}
          >
            {user.isActive ? "Aktif" : "Nonaktif"}
          </span>
        </div>
      </div>

      {/* Info card */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl divide-y divide-gray-100 dark:divide-gray-800">
        <div className="px-6 py-4">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Informasi Akun
          </h2>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div>
              <dt className="text-gray-500 dark:text-gray-400">ID Pengguna</dt>
              <dd className="text-gray-900 dark:text-white font-mono text-xs mt-0.5">{user.id}</dd>
            </div>
            <div>
              <dt className="text-gray-500 dark:text-gray-400">Nomor Telepon</dt>
              <dd className="text-gray-900 dark:text-white mt-0.5">{user.phone ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-gray-500 dark:text-gray-400">Email Terverifikasi</dt>
              <dd className="text-gray-900 dark:text-white mt-0.5">
                {user.emailVerified
                  ? new Date(user.emailVerified).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  : "Belum terverifikasi"}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500 dark:text-gray-400">Terdaftar</dt>
              <dd className="text-gray-900 dark:text-white mt-0.5">
                {new Date(user.createdAt).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500 dark:text-gray-400">Terakhir Diperbarui</dt>
              <dd className="text-gray-900 dark:text-white mt-0.5">
                {new Date(user.updatedAt).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500 dark:text-gray-400">Percobaan Login Gagal</dt>
              <dd className="text-gray-900 dark:text-white mt-0.5">
                {user.loginAttempts}
                {user.lockedUntil && new Date(user.lockedUntil) > new Date() && (
                  <span className="ml-2 text-xs text-red-500">
                    (Terkunci hingga{" "}
                    {new Date(user.lockedUntil).toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    )
                  </span>
                )}
              </dd>
            </div>
          </dl>
        </div>

        {/* Statistik aktivitas */}
        <div className="px-6 py-4">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Statistik Aktivitas
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                {user._count.tryoutSessions}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Sesi Tryout</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                {user._count.enrollments}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Enrollment</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                {user._count.transactions}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Transaksi</div>
            </div>
          </div>
        </div>

        {/* Aksi */}
        <div className="px-6 py-4">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Kelola Pengguna
          </h2>
          <UserActions
            userId={user.id}
            currentRole={user.role}
            isActive={user.isActive}
            isSelf={isSelf}
          />
          {isSelf && (
            <p className="text-xs text-gray-400 mt-2">
              Anda tidak dapat mengubah status akun sendiri.
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-start">
        <Link
          href="/admin/pengguna"
          className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
        >
          ← Kembali ke daftar pengguna
        </Link>
      </div>
    </div>
  );
}
