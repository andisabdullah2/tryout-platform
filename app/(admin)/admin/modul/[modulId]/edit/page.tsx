"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface KontenModul {
  id: string;
  modulId: string;
  tipe: "TEKS" | "PDF" | "VIDEO" | "LINK_EKSTERNAL";
  judul: string;
  konten: string | null;
  fileUrl: string | null;
  linkUrl: string | null;
  durasi: number | null;
  urutan: number;
  muxAssetId: string | null;
  muxPlaybackId: string | null;
}

interface Modul {
  id: string;
  kelasId: string;
  judul: string;
  deskripsi: string | null;
  urutan: number;
  isLocked: boolean;
  isKuisAktif: boolean;
  kelas: {
    id: string;
    judul: string;
    kategori: string;
  };
  konten: KontenModul[];
}

export default function EditModulPage() {
  const params = useParams();
  const router = useRouter();
  const modulId = params.modulId as string;

  const [modul, setModul] = useState<Modul | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [kelasList, setKelasList] = useState<
    Array<{ id: string; judul: string; kategori: string }>
  >([]);
  const [showKontenModal, setShowKontenModal] = useState(false);
  const [editingKonten, setEditingKonten] = useState<KontenModul | null>(null);

  const [form, setForm] = useState({
    kelasId: "",
    judul: "",
    deskripsi: "",
    urutan: 1,
    isLocked: false,
    isKuisAktif: false,
  });

  // Fetch modul data
  useEffect(() => {
    async function fetchModul() {
      try {
        const res = await fetch(`/api/modul/${modulId}`);
        const json = await res.json();
        if (!json.success) throw new Error(json.error);

        const data: Modul = json.data;
        setModul(data);
        setForm({
          kelasId: data.kelasId,
          judul: data.judul,
          deskripsi: data.deskripsi ?? "",
          urutan: data.urutan,
          isLocked: data.isLocked,
          isKuisAktif: data.isKuisAktif,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal memuat data");
      } finally {
        setIsLoading(false);
      }
    }

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

    fetchModul();
    fetchKelas();
  }, [modulId]);

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
    setIsSaving(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(`/api/modul/${modulId}`, {
        method: "PUT",
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
      if (!json.success) throw new Error(json.error ?? "Gagal update modul");

      setSuccessMsg("Modul berhasil diperbarui");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (
      !confirm(
        `Hapus modul "${modul?.judul}"? Semua konten di modul ini akan ikut terhapus.`
      )
    )
      return;

    setIsDeleting(true);
    setError(null);

    try {
      const res = await fetch(`/api/modul/${modulId}`, {
        method: "DELETE",
      });

      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Gagal hapus modul");

      router.push("/admin/modul");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      setIsDeleting(false);
    }
  }

  async function handleDeleteKonten(kontenId: string) {
    if (!confirm("Hapus konten ini?")) return;

    try {
      const res = await fetch(`/api/konten/${kontenId}`, {
        method: "DELETE",
      });

      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Gagal hapus konten");

      window.location.reload();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Terjadi kesalahan");
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center text-gray-500">
        Memuat...
      </div>
    );
  }

  if (error && !modul) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400">
          {error}
        </div>
        <Link
          href="/admin/modul"
          className="inline-block text-blue-600 dark:text-blue-400 hover:underline"
        >
          ← Kembali ke Daftar Modul
        </Link>
      </div>
    );
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
          <span>Edit</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Edit Modul
        </h1>
        {modul && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Kelas: {modul.kelas.judul} ({modul.kelas.kategori})
          </p>
        )}
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={isSaving}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
            <Link
              href="/admin/modul"
              className="px-6 py-2.5 rounded-lg font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              Batal
            </Link>
          </div>

          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-6 py-2.5 rounded-lg font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? "Menghapus..." : "Hapus Modul"}
          </button>
        </div>
      </form>

      {/* Konten Section */}
      {modul && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white">
                Konten Pembelajaran
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {modul.konten.length} konten
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setEditingKonten(null);
                setShowKontenModal(true);
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              + Tambah Konten
            </button>
          </div>

          {modul.konten.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              <div className="text-3xl mb-2">📝</div>
              <p className="text-sm">Belum ada konten pembelajaran</p>
            </div>
          ) : (
            <div className="space-y-2">
              {modul.konten.map((k) => (
                <div
                  key={k.id}
                  className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-gray-400">
                      #{k.urutan}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {k.judul}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            k.tipe === "TEKS"
                              ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                              : k.tipe === "VIDEO"
                              ? "bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300"
                              : k.tipe === "PDF"
                              ? "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300"
                              : "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                          }`}
                        >
                          {k.tipe}
                        </span>
                      </div>
                      {k.durasi && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          {Math.floor(k.durasi / 60)} menit
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingKonten(k);
                        setShowKontenModal(true);
                      }}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteKonten(k.id)}
                      className="text-xs text-red-600 dark:text-red-400 hover:underline"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Konten Modal */}
      {showKontenModal && (
        <KontenModal
          modulId={modulId}
          konten={editingKonten}
          onClose={() => {
            setShowKontenModal(false);
            setEditingKonten(null);
          }}
          onSuccess={() => {
            setShowKontenModal(false);
            setEditingKonten(null);
            // Refresh modul data
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}

// Konten Modal Component
function KontenModal({
  modulId,
  konten,
  onClose,
  onSuccess,
}: {
  modulId: string;
  konten: KontenModul | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    tipe: konten?.tipe ?? "TEKS",
    judul: konten?.judul ?? "",
    konten: konten?.konten ?? "",
    fileUrl: konten?.fileUrl ?? "",
    linkUrl: konten?.linkUrl ?? "",
    durasi: konten?.durasi ?? 0,
    urutan: konten?.urutan ?? 1,
  });

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      const url = konten
        ? `/api/konten/${konten.id}`
        : `/api/modul/${modulId}/konten`;
      const method = konten ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipe: form.tipe,
          judul: form.judul,
          konten: form.tipe === "TEKS" ? form.konten : null,
          fileUrl:
            form.tipe === "PDF" || form.tipe === "VIDEO" ? form.fileUrl : null,
          linkUrl: form.tipe === "LINK_EKSTERNAL" ? form.linkUrl : null,
          durasi: form.tipe === "VIDEO" ? Number(form.durasi) : null,
          urutan: Number(form.urutan),
        }),
      });

      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Gagal menyimpan konten");

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {konten ? "Edit Konten" : "Tambah Konten"}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Tipe */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tipe Konten <span className="text-red-500">*</span>
            </label>
            <select
              name="tipe"
              value={form.tipe}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="TEKS">📝 Teks / Artikel</option>
              <option value="VIDEO">🎥 Video</option>
              <option value="PDF">📄 PDF</option>
              <option value="LINK_EKSTERNAL">🔗 Link Eksternal</option>
            </select>
          </div>

          {/* Judul */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Judul <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="judul"
              value={form.judul}
              onChange={handleChange}
              required
              placeholder="Judul konten"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
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
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Conditional fields based on tipe */}
          {form.tipe === "TEKS" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Konten <span className="text-red-500">*</span>
              </label>
              <textarea
                name="konten"
                value={form.konten}
                onChange={handleChange}
                required
                rows={8}
                placeholder="Tulis konten pembelajaran..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                Support Markdown format
              </p>
            </div>
          )}

          {(form.tipe === "PDF" || form.tipe === "VIDEO") && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                File URL <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                name="fileUrl"
                value={form.fileUrl}
                onChange={handleChange}
                required
                placeholder="https://..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {form.tipe === "VIDEO" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Durasi (detik)
              </label>
              <input
                type="number"
                name="durasi"
                value={form.durasi}
                onChange={handleChange}
                min={0}
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {form.tipe === "LINK_EKSTERNAL" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Link URL <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                name="linkUrl"
                value={form.linkUrl}
                onChange={handleChange}
                required
                placeholder="https://..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
            <button
              type="submit"
              disabled={isSaving}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isSaving ? "Menyimpan..." : "Simpan"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-lg font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

