"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface PaketInfo {
  id: string;
  judul: string;
  kategori: string;
  durasi: number;
  totalSoal: number;
  passingGrade: Record<string, number> | null;
}

export default function MulaiTryoutPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params["slug"] as string;

  const [paket, setPaket] = useState<PaketInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPaket();
  }, [slug]);

  async function fetchPaket() {
    try {
      const res = await fetch(`/api/tryout/slug/${slug}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) setPaket(data.data);
        else setError("Paket tidak ditemukan");
      } else {
        setError("Paket tidak ditemukan");
      }
    } catch {
      setError("Gagal memuat informasi paket");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleMulai() {
    if (!paket) return;
    setIsStarting(true);
    setError(null);

    try {
      const res = await fetch("/api/tryout/sesi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paketId: paket.id }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Gagal memulai tryout");
        return;
      }

      router.push(`/tryout/sesi/${data.data.sessionId}`);
    } catch {
      setError("Terjadi kesalahan jaringan");
    } finally {
      setIsStarting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  const KATEGORI_LABEL: Record<string, string> = {
    CPNS_SKD: "CPNS / SKD", SEKDIN: "Sekolah Kedinasan", UTBK_SNBT: "UTBK / SNBT",
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <Link href="/tryout" className="hover:text-blue-600">Tryout</Link>
        <span>/</span>
        <Link href={`/tryout/${slug}`} className="hover:text-blue-600">{paket?.judul ?? slug}</Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-white">Konfirmasi</span>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-8 text-center space-y-6">
        <div className="text-6xl">📝</div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {paket?.judul ?? "Memuat..."}
          </h1>
          {paket && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {KATEGORI_LABEL[paket.kategori] ?? paket.kategori}
            </span>
          )}
        </div>

        {paket && (
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{paket.totalSoal}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total Soal</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{paket.durasi}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Menit</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">1×</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Sesi Aktif</div>
            </div>
          </div>
        )}

        {paket?.passingGrade && (
          <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 text-left">
            <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-2">⚠️ Passing Grade</p>
            <div className="grid grid-cols-2 gap-1 text-sm">
              {Object.entries(paket.passingGrade).map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-yellow-700 dark:text-yellow-300">{k.toUpperCase()}</span>
                  <span className="font-bold text-yellow-800 dark:text-yellow-200">{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-xl p-4 text-left space-y-2">
          <p className="text-sm font-semibold text-blue-800 dark:text-blue-200">📋 Perhatian sebelum mulai:</p>
          <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1 list-disc list-inside">
            <li>Pastikan koneksi internet stabil</li>
            <li>Jawaban disimpan otomatis setiap 30 detik</li>
            <li>Tidak dapat membuka sesi baru selama sesi aktif</li>
            <li>Copy-paste soal dinonaktifkan selama tryout</li>
            <li>Waktu berjalan terus meski browser ditutup</li>
          </ul>
        </div>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
            ❌ {error}
          </div>
        )}

        <div className="flex gap-3">
          <Link href={`/tryout/${slug}`}
            className="flex-1 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-center">
            Batal
          </Link>
          <button
            onClick={handleMulai}
            disabled={isStarting || !paket}
            className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isStarting ? "Memulai..." : "Mulai Tryout Sekarang"}
          </button>
        </div>
      </div>
    </div>
  );
}
