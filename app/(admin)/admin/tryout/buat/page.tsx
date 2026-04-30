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

const SUBTES_PER_KATEGORI: Record<string, { value: string; label: string }[]> = {
  CPNS_SKD: [
    { value: "TWK", label: "TWK - Tes Wawasan Kebangsaan" },
    { value: "TIU", label: "TIU - Tes Intelegensia Umum" },
    { value: "TKP", label: "TKP - Tes Karakteristik Pribadi" },
  ],
  SEKDIN: [
    { value: "MATEMATIKA", label: "Matematika" },
    { value: "BAHASA_INDONESIA", label: "Bahasa Indonesia" },
    { value: "BAHASA_INGGRIS", label: "Bahasa Inggris" },
    { value: "PENGETAHUAN_UMUM", label: "Pengetahuan Umum" },
    { value: "WAWASAN_KEBANGSAAN", label: "Wawasan Kebangsaan" },
    { value: "UMUM", label: "Umum" },
  ],
  UTBK_SNBT: [
    { value: "TPS_PENALARAN_UMUM", label: "TPS - Penalaran Umum" },
    { value: "TPS_PPU", label: "TPS - Pengetahuan & Pemahaman Umum" },
    { value: "TPS_PBM", label: "TPS - Pemahaman Bacaan & Menulis" },
    { value: "TPS_PK", label: "TPS - Pengetahuan Kuantitatif" },
    { value: "LITERASI_IND", label: "Literasi Bahasa Indonesia" },
    { value: "LITERASI_ENG", label: "Literasi Bahasa Inggris" },
    { value: "PENALARAN_MATEMATIKA", label: "Penalaran Matematika" },
  ],
};

type MetodePilihSoal = "manual" | "acak";

export default function BuatTryoutPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metode, setMetode] = useState<MetodePilihSoal>("acak");

  const [form, setForm] = useState({
    judul: "",
    deskripsi: "",
    kategori: "CPNS_SKD",
    subKategori: "",
    durasi: 100,
    harga: 0,
    modelAkses: "GRATIS",
    thumbnailUrl: "",
    passingGradeJson: '{"twk": 65, "tiu": 80, "tkp": 166, "total": 311}',
    konfigurasiJson: "",
    // Untuk pilih acak
    randomSubtes: "",
    randomTingkat: "",
    randomJumlah: 110,
    // Untuk pilih manual (comma-separated IDs)
    soalIdsText: "",
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

    // Parse JSON fields
    let passingGrade: Record<string, number> | null = null;
    let konfigurasi: Record<string, unknown> | null = null;

    if (form.passingGradeJson.trim()) {
      try {
        passingGrade = JSON.parse(form.passingGradeJson);
      } catch {
        setError("Format JSON Passing Grade tidak valid");
        setIsLoading(false);
        return;
      }
    }

    if (form.konfigurasiJson.trim()) {
      try {
        konfigurasi = JSON.parse(form.konfigurasiJson);
      } catch {
        setError("Format JSON Konfigurasi tidak valid");
        setIsLoading(false);
        return;
      }
    }

    const body: Record<string, unknown> = {
      judul: form.judul,
      deskripsi: form.deskripsi,
      kategori: form.kategori,
      subKategori: form.subKategori || null,
      durasi: Number(form.durasi),
      harga: Number(form.harga),
      modelAkses: form.modelAkses,
      thumbnailUrl: form.thumbnailUrl || null,
      passingGrade,
      konfigurasi,
    };

    if (metode === "acak") {
      body.randomConfig = {
        kategori: form.kategori,
        ...(form.randomSubtes && { subtes: form.randomSubtes }),
        ...(form.randomTingkat && { tingkatKesulitan: form.randomTingkat }),
        jumlah: Number(form.randomJumlah),
      };
    } else {
      const ids = form.soalIdsText
        .split(/[\n,]+/)
        .map((s) => s.trim())
        .filter(Boolean);
      body.soalIds = ids;
    }

    try {
      const res = await fetch("/api/tryout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Gagal membuat paket");

      router.push("/admin/tryout");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setIsLoading(false);
    }
  }

  const subtesOptions = SUBTES_PER_KATEGORI[form.kategori] ?? [];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
          <Link href="/admin/tryout" className="hover:text-blue-600">
            Paket Tryout
          </Link>
          <span>/</span>
          <span>Buat Baru</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Buat Paket Tryout
        </h1>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Informasi Dasar */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 space-y-5">
          <h2 className="font-semibold text-gray-900 dark:text-white">Informasi Dasar</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Judul Paket <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="judul"
              required
              minLength={5}
              value={form.judul}
              onChange={handleChange}
              placeholder="Contoh: Tryout SKD CPNS Paket A"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Deskripsi <span className="text-red-500">*</span>
            </label>
            <textarea
              name="deskripsi"
              required
              minLength={10}
              rows={3}
              value={form.deskripsi}
              onChange={handleChange}
              placeholder="Deskripsi singkat tentang paket tryout ini..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
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

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Sub Kategori
                <span className="text-gray-400 font-normal ml-1">(opsional)</span>
              </label>
              <input
                type="text"
                name="subKategori"
                value={form.subKategori}
                onChange={handleChange}
                placeholder="Contoh: STAN, IPDN"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Pengaturan */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 space-y-5">
          <h2 className="font-semibold text-gray-900 dark:text-white">Pengaturan</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Durasi (menit) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="durasi"
                required
                min={10}
                value={form.durasi}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

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
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

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
        </div>

        {/* Pilih Soal */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 space-y-5">
          <h2 className="font-semibold text-gray-900 dark:text-white">Pilih Soal</h2>

          {/* Toggle metode */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMetode("acak")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                metode === "acak"
                  ? "bg-blue-600 text-white"
                  : "border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              Pilih Acak
            </button>
            <button
              type="button"
              onClick={() => setMetode("manual")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                metode === "manual"
                  ? "bg-blue-600 text-white"
                  : "border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              Pilih Manual
            </button>
          </div>

          {metode === "acak" ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Soal akan dipilih secara acak dari bank soal berdasarkan kriteria berikut.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Filter Subtes
                    <span className="text-gray-400 font-normal ml-1">(opsional)</span>
                  </label>
                  <select
                    name="randomSubtes"
                    value={form.randomSubtes}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Semua Subtes</option>
                    {subtesOptions.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Filter Kesulitan
                    <span className="text-gray-400 font-normal ml-1">(opsional)</span>
                  </label>
                  <select
                    name="randomTingkat"
                    value={form.randomTingkat}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Semua Kesulitan</option>
                    <option value="MUDAH">Mudah</option>
                    <option value="SEDANG">Sedang</option>
                    <option value="SULIT">Sulit</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Jumlah Soal <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="randomJumlah"
                    required={metode === "acak"}
                    min={1}
                    value={form.randomJumlah}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Masukkan ID soal yang ingin dimasukkan, satu per baris atau dipisahkan koma.
                Lihat ID soal di{" "}
                <Link href="/admin/bank-soal" className="text-blue-600 hover:underline">
                  Bank Soal
                </Link>
                .
              </p>
              <textarea
                name="soalIdsText"
                rows={6}
                value={form.soalIdsText}
                onChange={handleChange}
                placeholder={"cm1abc123...\ncm1def456...\ncm1ghi789..."}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          )}
        </div>

        {/* Konfigurasi Lanjutan */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 space-y-5">
          <h2 className="font-semibold text-gray-900 dark:text-white">Konfigurasi Lanjutan</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Passing Grade
              <span className="text-gray-400 font-normal ml-1">(JSON, opsional)</span>
            </label>
            <textarea
              name="passingGradeJson"
              rows={3}
              value={form.passingGradeJson}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Konfigurasi Penilaian
              <span className="text-gray-400 font-normal ml-1">(JSON, opsional)</span>
            </label>
            <textarea
              name="konfigurasiJson"
              rows={4}
              value={form.konfigurasiJson}
              onChange={handleChange}
              placeholder={'{"twk": {"jumlahSoal": 35, "nilaiBenar": 5, "nilaiSalah": 0}}'}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <Link
            href="/admin/tryout"
            className="px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? "Membuat..." : "Buat Paket"}
          </button>
        </div>
      </form>
    </div>
  );
}
