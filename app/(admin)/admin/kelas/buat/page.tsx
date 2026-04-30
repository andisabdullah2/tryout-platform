"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const KATEGORI_OPTIONS = [
  { value: "CPNS_SKD", label: "CPNS / SKD" },
  { value: "SEKDIN", label: "Sekdin" },
  { value: "UTBK_SNBT", label: "UTBK / SNBT" },
];

const MODEL_AKSES_OPTIONS = [
  { value: "GRATIS", label: "Gratis" },
  { value: "BERBAYAR", label: "Berbayar" },
  { value: "LANGGANAN", label: "Langganan" },
];

export default function BuatKelasPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    judul: "",
    deskripsi: "",
    kategori: "CPNS_SKD",
    harga: 0,
    modelAkses: "GRATIS",
    thumbnailUrl: "",
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/kelas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          judul: form.judul,
          deskripsi: form.deskripsi,
          kategori: form.kategori,
          harga: Number(form.harga),
          modelAkses: form.modelAkses,
          thumbnailUrl: form.thumbnailUrl || null,
        }),
      });

      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Gagal membuat kelas");

      router.push("/admin/kelas");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
          <Link href="/admin/kelas" className="hover:text-blue-600">
            Manajemen Kelas
          </Link>
          <span>/</span>
          <span>Buat Baru</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Buat Kelas</h1>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 space-y-5">
          <h2 className="font-semibold text-gray-900 dark:text-white">Informasi Kelas</h2>

          {/* Judul */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Judul Kelas <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="judul"
              required
              minLength={5}
              value={form.judul}
              onChange={handleChange}
              placeholder="Contoh: Persiapan SKD CPNS Lengkap"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Deskripsi */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Deskripsi <span className="text-red-500">*</span>
            </label>
            <textarea
              name="deskripsi"
              required
              minLength={10}
              rows={4}
              value={form.deskripsi}
              onChange={handleChange}
              placeholder="Deskripsi lengkap tentang kelas ini, materi yang akan dipelajari, dan target peserta..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Kategori */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Kategori <span className="text-red-500">*</span>
            </label>
            <select
              name="kategori"
              value={form.kategori}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {KATEGORI_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 space-y-5">
          <h2 className="font-semibold text-gray-900 dark:text-white">Harga & Akses</h2>

          <div className="grid grid-cols-2 gap-4">
            {/* Model Akses */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Model Akses
              </label>
              <select
                name="modelAkses"
                value={form.modelAkses}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {MODEL_AKSES_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            {/* Harga */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Harga (Rp)
              </label>
              <input
                type="number"
                name="harga"
                min={0}
                value={form.harga}
                onChange={handleChange}
                disabled={form.modelAkses === "GRATIS"}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {/* Thumbnail */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              URL Thumbnail
              <span className="text-gray-400 font-normal ml-1">(opsional)</span>
            </label>
            <input
              type="url"
              name="thumbnailUrl"
              value={form.thumbnailUrl}
              onChange={handleChange}
              placeholder="https://..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 text-sm text-blue-700 dark:text-blue-300">
          Setelah kelas dibuat, kamu bisa menambahkan modul dan konten melalui halaman edit kelas.
          Kelas akan berstatus <strong>Draft</strong> sampai kamu publish.
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <Link
            href="/admin/kelas"
            className="px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? "Membuat..." : "Buat Kelas"}
          </button>
        </div>
      </form>
    </div>
  );
}
