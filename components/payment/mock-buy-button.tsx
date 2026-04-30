"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface MockBuyButtonProps {
  paketId?: string;
  bundelId?: string;
}

export function MockBuyButton({ paketId, bundelId }: MockBuyButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleMockBuy() {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/payment/mock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paketId, bundelId }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error ?? "Gagal mengaktifkan akses");
        return;
      }
      router.refresh();
    } catch {
      setError("Terjadi kesalahan jaringan");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-1">
      <button
        onClick={handleMockBuy}
        disabled={isLoading}
        className="w-full py-2.5 border-2 border-dashed border-orange-400 dark:border-orange-600 text-orange-600 dark:text-orange-400 rounded-xl text-sm font-medium hover:bg-orange-50 dark:hover:bg-orange-950 disabled:opacity-50 transition-colors"
      >
        {isLoading ? "Mengaktifkan..." : "🧪 Aktifkan Gratis (Dev Mode)"}
      </button>
      {error && <p className="text-xs text-red-500 text-center">{error}</p>}
      <p className="text-xs text-center text-orange-500 dark:text-orange-400">Hanya tersedia di development</p>
    </div>
  );
}
