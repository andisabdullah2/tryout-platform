"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Modul {
  id: string;
  judul: string;
  urutan: number;
  isLocked: boolean;
  isKuisAktif: boolean;
  _count?: { konten: number };
}

interface Kelas {
  id: string;
  slug: string;
  judul: string;
  deskripsi: string;
  kategori: string;
  harga: number;
  modelAkses: string;
  status: string;
  thumbnailUrl: string | null;
  instrukturId: string;
  modul: Modul[];
  _count: { enrollments: number };
}

const KATEGORI_LABEL: Record<string, string> = {
  CPNS_SKD: "CPNS/SKD",
  SEKDIN: "Sekdin",
  UTBK_SNBT: "UTBK/SNBT",
};

const MODEL_AKSES_OPTIONS = [
  { value: "GRATIS", label: "Gratis" },
  { value: "BERBAYAR", label: "Berbayar" },
  { value: "LANGGANAN", label: "Langganan" },
];

const STATUS_OPTIONS = [
  { value: "DRAFT", label: "Draft" },
  { value: "PUBLISHED", label: "Published" },
  { value: "ARCHIVED", label: "Archived" },
];

export default function EditKelasPage() {
  const params = useParams();
  const router = useRouter();
  const kelasId = params.kelasId as string;

  const [kelas, setKelas] = useState<Kelas | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [form, setForm] = useState({
    judul: "",
    deskripsi: "",
    harga: 0,
    modelAkses: "GRATIS",
    status: "DRAFT",
    thumbnailUrl: "",
  });

  useEffect(() => {
    async function fetchKelas() {
      try {
        const res = await fetch(`/api/kelas/${kelasId}`);
        const json = await res.json();
        if (!json.success) throw new Error(json.error);

        const data: Kelas = json.data;
        setKelas(data);
        setForm({
          judul: data.judul,
          deskripsi: data.deskripsi,
          harga: Number(data.harga),
          modelAkses: data.modelAkses,
          status: data.status,
          thumbnailUrl: data.thumbnailUrl ?? "",
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal memuat data");
      } finally {
        setIsLoading(false);
      }
    }
    fetchKelas();
  }, [kelasId]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(`/api/kelas/${kelasId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          judul: form.judul,
          deskripsi: form.deskripsi,
          harga: Number(form.harga),
          modelAkses: form.modelAkses,
          status: form.status,
          thumbnailUrl: form.thumbnailUrl || null,
        }),
      });

      const json = await res.json();
      if (!json.success) throw new Error(json.error);

      setSuccessMsg("Perubahan berhasil disimpan");
      setTimeout(() => router.push("/admin/kelas"), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan perubahan");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Arsipkan kelas ini?")) return;
    try {
      const res = await fetch(`/api/kelas/${kelasId}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      router.push("/admin/kelas");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengarsipkan kelas");
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-gray-500 dark:text-gray-400">Memuat data...</div>
      </div>
    );
  }

  if (!kelas) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <div className="text-4xl mb-4">🔍</div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Kelas tidak ditemukan
        </h2>
        <Link href="/admin/kelas" className="text-blue-600 hover:underline">
          Kembali ke daftar
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
            <Link href="/admin/kelas" className="hover:text-blue-600">Manajemen Kelas</Link>
            <span>/</span>
            <span>Edit</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Kelas</h1>
        </div>
        <button
          onClick={handleDelete}
          className="text-sm text-red-600 dark:text-red-400 hover:underline"
        >
          Arsipkan
        </button>
      </div>

      {/* Info readonly */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 flex flex-wrap gap-4 text-sm">
        <div>
          <span className="text-gray-500 dark:text-gray-400">Kategori: </span>
          <span className="font-medium text-gray-900 dark:text-white">
            {KATEGORI_LABEL[kelas.kategori] ?? kelas.kategori}
          </span>
        </div>
        <div>
          <span className="text-gray-500 dark:text-gray-400">Peserta: </span>
          <span className="font-medium text-gray-900 dark:text-white">
            {kelas._count.enrollments.toLocaleString("id-ID")}
          </span>
        </div>
        <div>
          <span className="text-gray-500 dark:text-gray-400">Slug: </span>
          <span className="font-mono text-xs text-gray-600 dark:text-gray-300">{kelas.slug}</span>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-sm">
          {error}
        </div>
      )}
      {successMsg && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-green-700 dark:text-green-400 text-sm">
          {successMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 space-y-5">
          <h2 className="font-semibold text-gray-900 dark:text-white">Informasi Kelas</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Judul <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="judul"
              required
              value={form.judul}
              onChange={handleChange}
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
              rows={4}
              value={form.deskripsi}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
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

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 space-y-5">
          <h2 className="font-semibold text-gray-900 dark:text-white">Harga & Status</h2>

          <div className="grid grid-cols-3 gap-4">
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
                Harga (Rp)
              </label>
              <input
                type="number"
                name="harga"
                min={0}
                value={form.harga}
                onChange={handleChange}
                disabled={form.modelAkses === "GRATIS"}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Daftar Modul */}
        {kelas.modul.length > 0 && (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 space-y-3">
            <h2 className="font-semibold text-gray-900 dark:text-white">
              Modul ({kelas.modul.length})
            </h2>
            <div className="space-y-2">
              {kelas.modul.map((modul) => (
                <div
                  key={modul.id}
                  className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400 w-5 text-center">{modul.urutan}</span>
                    <span className="text-sm text-gray-900 dark:text-white">{modul.judul}</span>
                    {modul.isLocked && (
                      <span className="text-xs text-amber-600 dark:text-amber-400">🔒 Terkunci</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400">
              Manajemen modul dan konten tersedia melalui panel instruktur.
            </p>
          </div>
        )}

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
            disabled={isSaving}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </form>
    </div>
  );
}
