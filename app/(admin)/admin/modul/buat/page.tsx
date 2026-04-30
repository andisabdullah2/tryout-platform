"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function BuatModulPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [kelasList, setKelasList] = useState<
    Array<{ id: string; judul: string; kategori: string }>
  >([]);

  const [form, setForm] = useState({
    kelasId: "",
    judul: "",
    deskripsi: "",
    urutan: 1,
    isLocked: false,
    isKuisAktif: false,
  });

  // Fetch kelas list
  useEffect(() => {
    async function fetchKelas() {
      try {
        const res = await fetch("/api/kelas");
        const json = await res.json();
        if (json.success && json.data?.items) {
          setKelasList(json.data.items);
        }
      } catch (err) {
        console.error("Failed to fetch kelas", err);
      }
    }
    fetchKelas();
  }, []);

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/modul", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kelasId: form.kelasId,
          judul: form.judul,
          deskripsi: form.deskripsi || null,
          urutan: Number(form.urutan),
          isLocked: form.isLocked,
          isKuisAktif: form.isKuisAktif,
        }),
      });

      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Gagal membuat modul");

      router.push("/admin/modul");
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
          <Link href="/admin/modul" className="hover:text-blue-600">
            Manajemen Modul
          </Link>
          <span>/</span>
          <span>Buat Baru</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Buat Modul
        </h1>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 space-y-5">
          <h2 className="font-semibold text-gray-900 dark:text-white">
            Informasi Modul
          </h2>

          {/* Kelas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Kelas <span className="text-red-500">*</span>
            </label>
            <select
              name="kelasId"
              value={form.kelasId}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">-- Pilih Kelas --</option>
              {kelasList.map((kelas) => (
                <option key={kelas.id} value={kelas.id}>
                  {kelas.judul} ({kelas.kategori})
                </option>
              ))}
            </select>
          </div>

          {/* Judul */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Judul Modul <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="judul"
              value={form.judul}
              onChange={handleChange}
              required
              placeholder="Modul 1: Pengenalan Materi"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Deskripsi */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Deskripsi
            </label>
            <textarea
              name="deskripsi"
              value={form.deskripsi}
              onChange={handleChange}
              rows={3}
              placeholder="Deskripsi singkat modul..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Urutan */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Urutan <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="urutan"
              value={form.urutan}
              onChange={handleChange}
              required
              min={1}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Urutan modul dalam kelas (1, 2, 3, ...)
            </p>
          </div>

          {/* isLocked */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="isLocked"
              id="isLocked"
              checked={form.isLocked}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <label
              htmlFor="isLocked"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              🔒 Kunci modul (hanya bisa diakses peserta premium)
            </label>
          </div>

          {/* isKuisAktif */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="isKuisAktif"
              id="isKuisAktif"
              checked={form.isKuisAktif}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <label
              htmlFor="isKuisAktif"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              ✓ Aktifkan kuis untuk modul ini
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Menyimpan..." : "Simpan Modul"}
          </button>
          <Link
            href="/admin/modul"
            className="px-6 py-2.5 rounded-lg font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            Batal
          </Link>
        </div>
      </form>
    </div>
  );
}
