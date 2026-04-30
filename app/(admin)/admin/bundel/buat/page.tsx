"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface PaketOption {
  id: string;
  judul: string;
  kategori: string;
  totalSoal: number;
  durasi: number;
  status: string;
}

const KATEGORI_OPTIONS = [
  { value: "CPNS_SKD", label: "CPNS / SKD" },
  { value: "SEKDIN", label: "Sekdin" },
  { value: "UTBK_SNBT", label: "UTBK / SNBT" },
];

export default function BuatBundelPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paketList, setPaketList] = useState<PaketOption[]>([]);
  const [selectedPaketIds, setSelectedPaketIds] = useState<string[]>([]);

  const [form, setForm] = useState({
    judul: "",
    deskripsi: "",
    kategori: "CPNS_SKD",
    harga: 0,
    thumbnailUrl: "",
  });

  useEffect(() => {
    fetch("/api/tryout?limit=50")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setPaketList(d.data.items);
      });
  }, []);

  function togglePaket(id: string) {
    setSelectedPaketIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function movePaket(id: string, dir: "up" | "down") {
    setSelectedPaketIds((prev) => {
      const idx = prev.indexOf(id);
      if (idx === -1) return prev;
      const next = [...prev];
      const swap = dir === "up" ? idx - 1 : idx + 1;
      if (swap < 0 || swap >= next.length) return prev;
      [next[idx], next[swap]] = [next[swap]!, next[idx]!];
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (selectedPaketIds.length === 0) {
      setError("Pilih minimal 1 paket tryout");
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/bundel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          harga: Number(form.harga),
          thumbnailUrl: form.thumbnailUrl || null,
          paketIds: selectedPaketIds,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Gagal membuat bundel");
      router.push("/admin/bundel");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setIsLoading(false);
    }
  }

  const selectedPaket = selectedPaketIds
    .map((id) => paketList.find((p) => p.id === id))
    .filter(Boolean) as PaketOption[];

  const availablePaket = paketList.filter((p) => !selectedPaketIds.includes(p.id));

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
          <Link href="/admin/bundel" className="hover:text-blue-600">Bundel Tryout</Link>
          <span>/</span>
          <span>Buat Baru</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Buat Bundel Tryout</h1>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Info dasar */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-gray-900 dark:text-white">Informasi Bundel</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Judul Bundel <span className="text-red-500">*</span>
            </label>
            <input
              type="text" required minLength={5}
              value={form.judul}
              onChange={(e) => setForm({ ...form, judul: e.target.value })}
              placeholder="Contoh: Bundel SKD CPNS Lengkap 3 Paket"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Deskripsi <span className="text-red-500">*</span>
            </label>
            <textarea
              required minLength={10} rows={3}
              value={form.deskripsi}
              onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
              placeholder="Deskripsi bundel ini..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Kategori <span className="text-red-500">*</span>
              </label>
              <select
                value={form.kategori}
                onChange={(e) => setForm({ ...form, kategori: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {KATEGORI_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Harga (Rp) <span className="text-red-500">*</span>
              </label>
              <input
                type="number" required min={0}
                value={form.harga}
                onChange={(e) => setForm({ ...form, harga: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Pilih paket */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-gray-900 dark:text-white">
            Paket Tryout dalam Bundel
            {selectedPaketIds.length > 0 && (
              <span className="ml-2 text-sm font-normal text-blue-600 dark:text-blue-400">
                {selectedPaketIds.length} dipilih
              </span>
            )}
          </h2>

          {/* Urutan yang dipilih */}
          {selectedPaket.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">
                Urutan dalam bundel
              </p>
              {selectedPaket.map((p, i) => (
                <div key={p.id} className="flex items-center gap-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg px-3 py-2">
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400 w-5">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{p.judul}</p>
                    <p className="text-xs text-gray-400">{p.totalSoal} soal · {p.durasi} menit</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={() => movePaket(p.id, "up")} disabled={i === 0}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30">↑</button>
                    <button type="button" onClick={() => movePaket(p.id, "down")} disabled={i === selectedPaket.length - 1}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30">↓</button>
                    <button type="button" onClick={() => togglePaket(p.id)}
                      className="p-1 text-red-400 hover:text-red-600 ml-1">✕</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Paket tersedia */}
          {availablePaket.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">
                Paket tersedia — klik untuk menambahkan
              </p>
              <div className="max-h-64 overflow-y-auto space-y-1.5 border border-gray-200 dark:border-gray-700 rounded-lg p-2">
                {availablePaket.map((p) => (
                  <button
                    key={p.id} type="button"
                    onClick={() => togglePaket(p.id)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-left transition-colors"
                  >
                    <span className="text-lg">➕</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{p.judul}</p>
                      <p className="text-xs text-gray-400">{p.totalSoal} soal · {p.durasi} menit · {p.status}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {paketList.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">
              Belum ada paket tryout.{" "}
              <Link href="/admin/tryout/buat" className="text-blue-600 hover:underline">Buat paket dulu</Link>
            </p>
          )}
        </div>

        <div className="flex items-center justify-between pt-2">
          <Link href="/admin/bundel"
            className="px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            Batal
          </Link>
          <button type="submit" disabled={isLoading || selectedPaketIds.length === 0}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            {isLoading ? "Membuat..." : "Buat Bundel"}
          </button>
        </div>
      </form>
    </div>
  );
}
