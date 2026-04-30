"use client";

import { useState } from "react";
import { MarkdownRenderer } from "@/components/shared/markdown-renderer";

export interface OpsiForm {
  id?: string;
  label: string;
  konten: string;
  isBenar: boolean;
  nilaiTkp?: number | null;
}

export interface SoalFormData {
  konten: string;
  gambarUrl?: string | null;
  tipe: "PILIHAN_GANDA" | "PILIHAN_GANDA_KOMPLEKS" | "ISIAN_SINGKAT";
  kategori: "CPNS_SKD" | "SEKDIN" | "UTBK_SNBT";
  subtes: string;
  topik: string;
  tingkatKesulitan: "MUDAH" | "SEDANG" | "SULIT";
  pembahasanTeks?: string | null;
  pembahasanVideoUrl?: string | null;
  opsi: OpsiForm[];
}

interface SoalEditorProps {
  initialData?: Partial<SoalFormData>;
  onSubmit: (data: SoalFormData) => Promise<void>;
  isLoading?: boolean;
  submitLabel?: string;
}

const SUBTES_BY_KATEGORI: Record<string, { value: string; label: string }[]> = {
  CPNS_SKD: [
    { value: "TWK", label: "TWK - Tes Wawasan Kebangsaan" },
    { value: "TIU", label: "TIU - Tes Intelegensia Umum" },
    { value: "TKP", label: "TKP - Tes Karakteristik Pribadi" },
  ],
  SEKDIN: [
    { value: "UMUM", label: "Umum" },
    { value: "MATEMATIKA", label: "Matematika" },
    { value: "BAHASA_INDONESIA", label: "Bahasa Indonesia" },
    { value: "BAHASA_INGGRIS", label: "Bahasa Inggris" },
    { value: "PENGETAHUAN_UMUM", label: "Pengetahuan Umum" },
    { value: "WAWASAN_KEBANGSAAN", label: "Wawasan Kebangsaan" },
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

const DEFAULT_OPSI: OpsiForm[] = [
  { label: "A", konten: "", isBenar: false },
  { label: "B", konten: "", isBenar: false },
  { label: "C", konten: "", isBenar: false },
  { label: "D", konten: "", isBenar: false },
];

export function SoalEditor({
  initialData,
  onSubmit,
  isLoading = false,
  submitLabel = "Simpan Soal",
}: SoalEditorProps) {
  const [form, setForm] = useState<SoalFormData>({
    konten: initialData?.konten ?? "",
    gambarUrl: initialData?.gambarUrl ?? null,
    tipe: initialData?.tipe ?? "PILIHAN_GANDA",
    kategori: initialData?.kategori ?? "CPNS_SKD",
    subtes: initialData?.subtes ?? "TWK",
    topik: initialData?.topik ?? "",
    tingkatKesulitan: initialData?.tingkatKesulitan ?? "SEDANG",
    pembahasanTeks: initialData?.pembahasanTeks ?? "",
    pembahasanVideoUrl: initialData?.pembahasanVideoUrl ?? null,
    opsi: initialData?.opsi ?? DEFAULT_OPSI,
  });

  const [previewMode, setPreviewMode] = useState<"soal" | "pembahasan" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isTKP = form.subtes === "TKP";
  const subtesOptions = SUBTES_BY_KATEGORI[form.kategori] ?? [];

  function handleKategoriChange(kategori: "CPNS_SKD" | "SEKDIN" | "UTBK_SNBT") {
    const firstSubtes = SUBTES_BY_KATEGORI[kategori]?.[0]?.value ?? "";
    setForm((prev) => ({ ...prev, kategori, subtes: firstSubtes }));
  }

  function handleOpsiChange(index: number, field: keyof OpsiForm, value: string | boolean | number) {
    setForm((prev) => {
      const newOpsi = [...prev.opsi];
      newOpsi[index] = { ...newOpsi[index]!, [field]: value };

      // Untuk pilihan ganda biasa: hanya satu jawaban benar
      if (field === "isBenar" && value === true && prev.tipe === "PILIHAN_GANDA") {
        newOpsi.forEach((o, i) => {
          if (i !== index) newOpsi[i] = { ...o, isBenar: false };
        });
      }

      return { ...prev, opsi: newOpsi };
    });
  }

  function addOpsi() {
    if (form.opsi.length >= 5) return;
    const labels = ["A", "B", "C", "D", "E"];
    const nextLabel = labels[form.opsi.length] ?? "E";
    setForm((prev) => ({
      ...prev,
      opsi: [...prev.opsi, { label: nextLabel, konten: "", isBenar: false }],
    }));
  }

  function removeOpsi(index: number) {
    if (form.opsi.length <= 2) return;
    setForm((prev) => ({
      ...prev,
      opsi: prev.opsi.filter((_, i) => i !== index),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Validasi jawaban benar
    const adaJawabanBenar = form.opsi.some((o) => o.isBenar);
    if (!adaJawabanBenar) {
      setError("Pilih minimal satu jawaban yang benar");
      return;
    }

    // Validasi konten opsi tidak kosong
    const opsiKosong = form.opsi.some((o) => !o.konten.trim());
    if (opsiKosong) {
      setError("Semua opsi jawaban harus diisi");
      return;
    }

    try {
      await onSubmit(form);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
          ❌ {error}
        </div>
      )}

      {/* Metadata soal */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 space-y-4">
        <h3 className="font-semibold text-gray-900 dark:text-white">Informasi Soal</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Kategori */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Kategori Ujian <span className="text-red-500">*</span>
            </label>
            <select
              value={form.kategori}
              onChange={(e) => handleKategoriChange(e.target.value as "CPNS_SKD" | "SEKDIN" | "UTBK_SNBT")}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="CPNS_SKD">CPNS / SKD</option>
              <option value="SEKDIN">Sekolah Kedinasan</option>
              <option value="UTBK_SNBT">UTBK / SNBT</option>
            </select>
          </div>

          {/* Subtes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Subtes <span className="text-red-500">*</span>
            </label>
            <select
              value={form.subtes}
              onChange={(e) => setForm((prev) => ({ ...prev, subtes: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {subtesOptions.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          {/* Topik */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Topik <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.topik}
              onChange={(e) => setForm((prev) => ({ ...prev, topik: e.target.value }))}
              required
              placeholder="e.g., Pancasila, Aljabar"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Tingkat Kesulitan */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tingkat Kesulitan
            </label>
            <select
              value={form.tingkatKesulitan}
              onChange={(e) => setForm((prev) => ({ ...prev, tingkatKesulitan: e.target.value as "MUDAH" | "SEDANG" | "SULIT" }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="MUDAH">Mudah</option>
              <option value="SEDANG">Sedang</option>
              <option value="SULIT">Sulit</option>
            </select>
          </div>
        </div>

        {/* Tipe Soal */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Tipe Soal
          </label>
          <div className="flex gap-4">
            {[
              { value: "PILIHAN_GANDA", label: "Pilihan Ganda" },
              { value: "PILIHAN_GANDA_KOMPLEKS", label: "Pilihan Ganda Kompleks" },
              { value: "ISIAN_SINGKAT", label: "Isian Singkat" },
            ].map((t) => (
              <label key={t.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="tipe"
                  value={t.value}
                  checked={form.tipe === t.value}
                  onChange={(e) => setForm((prev) => ({ ...prev, tipe: e.target.value as SoalFormData["tipe"] }))}
                  className="text-blue-600"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{t.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Konten Soal */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-white">Konten Soal</h3>
          <button
            type="button"
            onClick={() => setPreviewMode(previewMode === "soal" ? null : "soal")}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            {previewMode === "soal" ? "Edit" : "Preview"}
          </button>
        </div>

        <p className="text-xs text-gray-400">
          Mendukung Markdown dan LaTeX. Gunakan <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">$...$</code> untuk rumus inline dan <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">$$...$$</code> untuk rumus blok.
        </p>

        {previewMode === "soal" ? (
          <div className="min-h-32 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
            <MarkdownRenderer content={form.konten} />
          </div>
        ) : (
          <textarea
            value={form.konten}
            onChange={(e) => setForm((prev) => ({ ...prev, konten: e.target.value }))}
            required
            rows={6}
            placeholder="Tulis konten soal di sini. Mendukung Markdown dan LaTeX.&#10;&#10;Contoh LaTeX: $x^2 + y^2 = z^2$"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
          />
        )}

        {/* URL Gambar */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            URL Gambar (opsional)
          </label>
          <input
            type="url"
            value={form.gambarUrl ?? ""}
            onChange={(e) => setForm((prev) => ({ ...prev, gambarUrl: e.target.value || null }))}
            placeholder="https://..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Opsi Jawaban */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Opsi Jawaban
            {!form.opsi.some((o) => o.isBenar) && (
              <span className="ml-2 text-xs text-red-500 font-normal">
                * Pilih jawaban benar
              </span>
            )}
          </h3>
          {form.opsi.length < 5 && (
            <button
              type="button"
              onClick={addOpsi}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              + Tambah Opsi
            </button>
          )}
        </div>

        <div className="space-y-3">
          {form.opsi.map((opsi, index) => (
            <div
              key={index}
              className={`flex items-start gap-3 p-3 rounded-lg border-2 transition-colors ${
                opsi.isBenar
                  ? "border-green-400 dark:border-green-600 bg-green-50 dark:bg-green-950"
                  : "border-gray-200 dark:border-gray-700"
              }`}
            >
              {/* Label */}
              <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-sm font-bold text-gray-700 dark:text-gray-300 flex-shrink-0 mt-1">
                {opsi.label}
              </div>

              {/* Konten opsi */}
              <div className="flex-1">
                <input
                  type="text"
                  value={opsi.konten}
                  onChange={(e) => handleOpsiChange(index, "konten", e.target.value)}
                  placeholder={`Opsi ${opsi.label}`}
                  className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {/* Nilai TKP */}
                {isTKP && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs text-gray-500">Nilai TKP:</span>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => handleOpsiChange(index, "nilaiTkp", n)}
                        className={`w-7 h-7 rounded text-xs font-bold transition-colors ${
                          opsi.nilaiTkp === n
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-blue-100"
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Tandai benar */}
              <div className="flex items-center gap-2 flex-shrink-0 mt-1">
                <button
                  type="button"
                  onClick={() => handleOpsiChange(index, "isBenar", !opsi.isBenar)}
                  className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                    opsi.isBenar
                      ? "bg-green-500 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-green-100 dark:hover:bg-green-900"
                  }`}
                  title={opsi.isBenar ? "Jawaban benar" : "Tandai sebagai benar"}
                >
                  {opsi.isBenar ? "✓ Benar" : "Benar?"}
                </button>
                {form.opsi.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOpsi(index)}
                    className="text-red-400 hover:text-red-600 text-sm"
                    title="Hapus opsi"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pembahasan */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-white">Pembahasan (Opsional)</h3>
          <button
            type="button"
            onClick={() => setPreviewMode(previewMode === "pembahasan" ? null : "pembahasan")}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            {previewMode === "pembahasan" ? "Edit" : "Preview"}
          </button>
        </div>

        {previewMode === "pembahasan" ? (
          <div className="min-h-24 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
            <MarkdownRenderer content={form.pembahasanTeks ?? ""} />
          </div>
        ) : (
          <textarea
            value={form.pembahasanTeks ?? ""}
            onChange={(e) => setForm((prev) => ({ ...prev, pembahasanTeks: e.target.value || null }))}
            rows={4}
            placeholder="Tulis pembahasan soal. Mendukung Markdown dan LaTeX."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
          />
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            URL Video Pembahasan (opsional)
          </label>
          <input
            type="url"
            value={form.pembahasanVideoUrl ?? ""}
            onChange={(e) => setForm((prev) => ({ ...prev, pembahasanVideoUrl: e.target.value || null }))}
            placeholder="https://..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="px-6 py-2.5 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? "Menyimpan..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
