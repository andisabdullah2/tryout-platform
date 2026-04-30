"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface PromoActionsProps {
  promoId: string;
  isActive: boolean;
}

export function PromoActions({ promoId, isActive }: PromoActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleToggleActive() {
    setLoading(true);
    try {
      await fetch(`/api/promo/${promoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Hapus kode promo ini? Jika sudah digunakan, promo akan dinonaktifkan.")) return;
    setLoading(true);
    try {
      await fetch(`/api/promo/${promoId}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <button
        onClick={handleToggleActive}
        disabled={loading}
        className={`text-xs font-medium hover:underline disabled:opacity-50 ${
          isActive
            ? "text-yellow-600 dark:text-yellow-400"
            : "text-green-600 dark:text-green-400"
        }`}
      >
        {isActive ? "Nonaktifkan" : "Aktifkan"}
      </button>
      <span className="text-gray-300 dark:text-gray-700">|</span>
      <a
        href={`/admin/promo/${promoId}/edit`}
        className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
      >
        Edit
      </a>
      <span className="text-gray-300 dark:text-gray-700">|</span>
      <button
        onClick={handleDelete}
        disabled={loading}
        className="text-xs text-red-500 dark:text-red-400 hover:underline font-medium disabled:opacity-50"
      >
        Hapus
      </button>
    </div>
  );
}
