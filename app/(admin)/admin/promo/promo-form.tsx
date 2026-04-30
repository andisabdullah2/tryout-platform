"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface PromoFormValues {
  kode: string;
  deskripsi: string;
  tipeDiskon: "PERSEN" | "NOMINAL";
  nilaiDiskon: number;
  batasUse?: number;
  expiredAt: string;
  isActive: boolean;
}

interface PromoFormProps {
  mode: "create" | "edit";
  promoId?: string;
  defaultValues?: Partial<PromoFormValues>;
}

const DEFAULT_VALUES: PromoFormValues = {
  kode: "",
  deskripsi: "",
  tipeDiskon: "PERSEN",
  nilaiDiskon: 10,
  batasUse: undefined,
  expiredAt: "",
  isActive: true,
};

export function PromoForm({ mode, promoId, defaultValues }: PromoFormProps) {
  const router = useRouter();
  const initial = { ...DEFAULT_VALUES, ...defaultValues };

  const [kode, setKode] = useState(initial.kode);
  const [deskripsi, setDeskripsi] = useState(initial.deskripsi);
  const [tipeDiskon, setTipeDiskon] = useState<"PERSEN" | "NOMINAL">(initial.tipeDiskon);
  const [nilaiDiskon, setNilaiDiskon] = useState(initial.nilaiDiskon);
  const [batasUse, setBatasUse] = useState<string>(
    initial.batasUse !== undefined ? String(initial.batasUse) : ""
  );
  const [expiredAt, setExpiredAt] = useState(initial.expiredAt);
  const [isActive, setIsActive] = useState(initial.isActive);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");

  function validate(): boolean {
    const newErrors: Record<string, string> = {};

    if (mode === "create") {
      if (!kode.trim()) newErrors.kode = "Kode wajib diisi";
      else if (kode.length < 3) newErrors.kode = "Kode minimal 3 karakter";
      else if (!/^[A-Z0-9_-]+$/.test(kode))
        newErrors.kode = "Hanya huruf kapital, angka, - dan _";
    }

    if (!nilaiDiskon || nilaiDiskon <= 0) {
      newErrors.nilaiDiskon = "Nilai diskon harus lebih dari 0";
    }
    if (tipeDiskon === "PERSEN" && nilaiDiskon > 100) {
      newErrors.nilaiDiskon = "Diskon persen tidak boleh melebihi 100%";
    }
    if (batasUse && parseInt(batasUse) <= 0) {
      newErrors.batasUse = "Batas penggunaan harus lebih dari 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setServerError("");

    const payload = {
      ...(mode === "create" && { kode }),
      deskripsi: deskripsi || undefined,
      tipeDiskon,
      nilaiDiskon,
      batasUse: batasUse ? parseInt(batasUse) : null,
      expiredAt: expiredAt ? new Date(expiredAt).toISOString() : null,
      isActive,
    };

    try {
      const url = mode === "create" ? "/api/promo" : `/api/promo/${promoId}`;
      const method = mode === "create" ? "POST" : "PATCH";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await res.json()) as { success: boolean; error?: string };

      if (!res.ok || !data.success) {
        setServerError(data.error ?? "Terjadi kesalahan");
        return;
      }

      router.push("/admin/promo");
      router.refresh();
    } catch {
      setServerError("Terjadi kesalahan jaringan");
    } finally {
      setIsSubmitting(false);
    }
  }

  const inputClass =
    "w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
  const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";
  const errorClass = "text-xs text-red-500 dark:text-red-400 mt-1";

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 space-y-5"
    >
      {/* Kode promo */}
      {mode === "create" && (
        <div>
          <label htmlFor="kode" className={labelClass}>
            Kode Promo <span className="text-red-500">*</span>
          </label>
          <input
            id="kode"
            type="text"
            value={kode}
            onChange={(e) => setKode(e.target.value.toUpperCase())}
            placeholder="Contoh: DISKON50"
            className={`${inputClass} font-mono uppercase`}
            maxLength={20}
            aria-describedby={errors.kode ? "kode-error" : undefined}
          />
          {errors.kode && (
            <p id="kode-error" className={errorClass} role="alert">
              {errors.kode}
            </p>
          )}
          <p className="text-xs text-gray-400 mt-1">
            Hanya huruf kapital, angka, tanda hubung (-) dan garis bawah (_)
          </p>
        </div>
      )}

      {/* Deskripsi */}
      <div>
        <label htmlFor="deskripsi" className={labelClass}>
          Deskripsi
        </label>
        <input
          id="deskripsi"
          type="text"
          value={deskripsi}
          onChange={(e) => setDeskripsi(e.target.value)}
          placeholder="Contoh: Diskon spesial Hari Kemerdekaan"
          className={inputClass}
          maxLength={100}
        />
      </div>

      {/* Tipe & Nilai Diskon */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="tipeDiskon" className={labelClass}>
            Tipe Diskon <span className="text-red-500">*</span>
          </label>
          <select
            id="tipeDiskon"
            value={tipeDiskon}
            onChange={(e) => setTipeDiskon(e.target.value as "PERSEN" | "NOMINAL")}
            className={inputClass}
          >
            <option value="PERSEN">Persentase (%)</option>
            <option value="NOMINAL">Nominal (Rp)</option>
          </select>
        </div>
        <div>
          <label htmlFor="nilaiDiskon" className={labelClass}>
            Nilai Diskon <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
              {tipeDiskon === "PERSEN" ? "%" : "Rp"}
            </span>
            <input
              id="nilaiDiskon"
              type="number"
              value={nilaiDiskon}
              onChange={(e) => setNilaiDiskon(Number(e.target.value))}
              min={1}
              max={tipeDiskon === "PERSEN" ? 100 : undefined}
              className={`${inputClass} pl-9`}
              aria-describedby={errors.nilaiDiskon ? "nilai-error" : undefined}
            />
          </div>
          {errors.nilaiDiskon && (
            <p id="nilai-error" className={errorClass} role="alert">
              {errors.nilaiDiskon}
            </p>
          )}
        </div>
      </div>

      {/* Batas Penggunaan */}
      <div>
        <label htmlFor="batasUse" className={labelClass}>
          Batas Penggunaan
        </label>
        <input
          id="batasUse"
          type="number"
          value={batasUse}
          onChange={(e) => setBatasUse(e.target.value)}
          placeholder="Kosongkan untuk tidak terbatas"
          min={1}
          className={inputClass}
          aria-describedby={errors.batasUse ? "batas-error" : undefined}
        />
        {errors.batasUse && (
          <p id="batas-error" className={errorClass} role="alert">
            {errors.batasUse}
          </p>
        )}
        <p className="text-xs text-gray-400 mt-1">
          Kosongkan jika tidak ada batas penggunaan
        </p>
      </div>

      {/* Tanggal Kedaluwarsa */}
      <div>
        <label htmlFor="expiredAt" className={labelClass}>
          Tanggal Kedaluwarsa
        </label>
        <input
          id="expiredAt"
          type="datetime-local"
          value={expiredAt}
          onChange={(e) => setExpiredAt(e.target.value)}
          className={inputClass}
          min={new Date().toISOString().slice(0, 16)}
        />
        <p className="text-xs text-gray-400 mt-1">
          Kosongkan jika tidak ada tanggal kedaluwarsa
        </p>
      </div>

      {/* Status Aktif */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          role="switch"
          aria-checked={isActive}
          onClick={() => setIsActive(!isActive)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            isActive ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              isActive ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
        <label className="text-sm text-gray-700 dark:text-gray-300">
          {isActive ? "Promo aktif" : "Promo nonaktif"}
        </label>
      </div>

      {/* Preview */}
      {nilaiDiskon > 0 && (
        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
            Preview Diskon
          </p>
          <p className="text-xs text-blue-600 dark:text-blue-400">
            Pembelian Rp 100.000 →{" "}
            <span className="font-semibold">
              {tipeDiskon === "PERSEN"
                ? `Hemat Rp ${Math.round(100000 * (nilaiDiskon / 100)).toLocaleString("id-ID")} (${nilaiDiskon}%)`
                : `Hemat Rp ${Math.min(nilaiDiskon, 100000).toLocaleString("id-ID")}`}
            </span>
          </p>
        </div>
      )}

      {/* Server error */}
      {serverError && (
        <div
          className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3 text-sm text-red-600 dark:text-red-400"
          role="alert"
        >
          {serverError}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
          aria-busy={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden="true" />
              Menyimpan...
            </>
          ) : mode === "create" ? (
            "Buat Promo"
          ) : (
            "Simpan Perubahan"
          )}
        </button>
        <a
          href="/admin/promo"
          className="px-6 py-2.5 border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm"
        >
          Batal
        </a>
      </div>
    </form>
  );
}
