"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Role } from "@prisma/client";

interface UserActionsProps {
  userId: string;
  currentRole: Role;
  isActive: boolean;
  isSelf: boolean;
}

const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: "ADMIN", label: "Admin" },
  { value: "INSTRUKTUR", label: "Instruktur" },
  { value: "PESERTA", label: "Peserta" },
];

export function UserActions({ userId, currentRole, isActive, isSelf }: UserActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function patchUser(body: { role?: Role; isActive?: boolean }) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/pengguna/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Terjadi kesalahan");
      } else {
        router.refresh();
      }
    } catch {
      setError("Terjadi kesalahan jaringan");
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleActive() {
    if (isSelf) return;
    const action = isActive ? "nonaktifkan" : "aktifkan";
    if (!confirm(`${action.charAt(0).toUpperCase() + action.slice(1)} akun pengguna ini?`)) return;
    await patchUser({ isActive: !isActive });
  }

  async function handleRoleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newRole = e.target.value as Role;
    if (newRole === currentRole) return;
    if (!confirm(`Ubah peran pengguna menjadi ${newRole}?`)) {
      e.target.value = currentRole;
      return;
    }
    await patchUser({ role: newRole });
  }

  return (
    <div className="flex items-center justify-end gap-2">
      {error && (
        <span className="text-xs text-red-500 dark:text-red-400">{error}</span>
      )}
      {/* Role selector */}
      <select
        defaultValue={currentRole}
        onChange={handleRoleChange}
        disabled={loading}
        className="text-xs border border-gray-300 dark:border-gray-700 rounded-md px-2 py-1 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        aria-label="Ubah peran pengguna"
      >
        {ROLE_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <span className="text-gray-300 dark:text-gray-700">|</span>

      {/* Toggle active */}
      <button
        onClick={handleToggleActive}
        disabled={loading || isSelf}
        title={isSelf ? "Tidak dapat menonaktifkan akun sendiri" : undefined}
        className={`text-xs font-medium hover:underline disabled:opacity-50 disabled:cursor-not-allowed ${
          isActive
            ? "text-yellow-600 dark:text-yellow-400"
            : "text-green-600 dark:text-green-400"
        }`}
      >
        {isActive ? "Nonaktifkan" : "Aktifkan"}
      </button>

      <span className="text-gray-300 dark:text-gray-700">|</span>

      <a
        href={`/admin/pengguna/${userId}`}
        className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
      >
        Detail
      </a>
    </div>
  );
}
