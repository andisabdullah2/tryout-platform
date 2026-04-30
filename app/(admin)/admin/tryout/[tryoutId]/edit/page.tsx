"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

interface PaketTryout {
  id: string;
  slug: string;
  judul: string;
  deskripsi: string;
  kategori: string;
  subKategori: string | null;
  durasi: number;
  totalSoal: number;
  harga: number;
  modelAkses: string;
  status: string;
  thumbnailUrl: string | null;
  passingGrade: Record<string, number> | null;
  konfigurasi: Record<string, unknown> | null;
}

interface SoalDalamPaket {
  id: string;
  urutan: number;
  soalId: string;
  soal: {
    id: string;
    konten: string;
    kategori: string;
    subtes: string;
    topik: string;
    tingkatKesulitan: string;
    tipe: string;
    opsi: { id: string; label: string; isBenar: boolean }[];
  };
}

interface SoalBankItem {
  id: string;
  konten: string;
  kategori: string;
  subtes: string;
  topik: string;
  tingkatKesulitan: string;
  tipe: string;
}

type ActiveTab = "info" | "soal";

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

const STATUS_OPTIONS = [
  { value: "DRAFT", label: "Draft" },
  { value: "PUBLISHED", label: "Published" },
  { value: "ARCHIVED", label: "Archived" },
];

const BADGE_KESULITAN: Record<string, string> = {
  MUDAH: "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300",
  SEDANG: "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300",
  SULIT: "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300",
};

const SUBTES_LABEL: Record<string, string> = {
  TWK: "TWK — Tes Wawasan Kebangsaan",
  TIU: "TIU — Tes Intelegensia Umum",
  TKP: "TKP — Tes Karakteristik Pribadi",
  TPS_PENALARAN_UMUM: "TPS — Penalaran Umum",
  TPS_PPU: "TPS — PPU",
  TPS_PBM: "TPS — PBM",
  TPS_PK: "TPS — PK",
  LITERASI_IND: "Literasi Bahasa Indonesia",
  LITERASI_ENG: "Literasi Bahasa Inggris",
  PENALARAN_MATEMATIKA: "Penalaran Matematika",
  MATEMATIKA: "Matematika",
  BAHASA_INDONESIA: "Bahasa Indonesia",
  BAHASA_INGGRIS: "Bahasa Inggris",
  PENGETAHUAN_UMUM: "Pengetahuan Umum",
  WAWASAN_KEBANGSAAN: "Wawasan Kebangsaan",
  UMUM: "Umum",
};

const SUBTES_BADGE: Record<string, string> = {
  TWK: "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300",
  TIU: "bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300",
  TKP: "bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300",
  TPS_PENALARAN_UMUM: "bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300",
  TPS_PPU: "bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-300",
  TPS_PBM: "bg-fuchsia-100 dark:bg-fuchsia-900 text-fuchsia-700 dark:text-fuchsia-300",
  TPS_PK: "bg-pink-100 dark:bg-pink-900 text-pink-700 dark:text-pink-300",
  LITERASI_IND: "bg-rose-100 dark:bg-rose-900 text-rose-700 dark:text-rose-300",
  LITERASI_ENG: "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300",
  PENALARAN_MATEMATIKA: "bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300",
  MATEMATIKA: "bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300",
  BAHASA_INDONESIA: "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300",
  BAHASA_INGGRIS: "bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300",
  PENGETAHUAN_UMUM: "bg-cyan-100 dark:bg-cyan-900 text-cyan-700 dark:text-cyan-300",
  WAWASAN_KEBANGSAAN: "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300",
  UMUM: "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400",
};

const SUBTES_PER_KATEGORI: Record<string, string[]> = {
  CPNS_SKD: ["TWK", "TIU", "TKP"],
  UTBK_SNBT: ["TPS_PENALARAN_UMUM", "TPS_PPU", "TPS_PBM", "TPS_PK", "LITERASI_IND", "LITERASI_ENG", "PENALARAN_MATEMATIKA"],
  SEKDIN: ["MATEMATIKA", "BAHASA_INDONESIA", "BAHASA_INGGRIS", "PENGETAHUAN_UMUM", "WAWASAN_KEBANGSAAN", "UMUM"],
};

export default function EditTryoutPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tryoutId = params.tryoutId as string;

  const [activeTab, setActiveTab] = useState<ActiveTab>("info");
  const [paket, setPaket] = useState<PaketTryout | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // State tab soal
  const [soalDalamPaket, setSoalDalamPaket] = useState<SoalDalamPaket[]>([]);
  const [soalBank, setSoalBank] = useState<SoalBankItem[]>([]);
  const [soalBankTotal, setSoalBankTotal] = useState(0);
  const [soalBankPage, setSoalBankPage] = useState(1);
  const [filterKategori, setFilterKategori] = useState("");
  const [filterQ, setFilterQ] = useState("");
  const [filterSubtes, setFilterSubtes] = useState("");
  const [selectedSoalIds, setSelectedSoalIds] = useState<Set<string>>(new Set());
  const [isLoadingSoal, setIsLoadingSoal] = useState(false);
  const [isAddingSoal, setIsAddingSoal] = useState(false);

  const [form, setForm] = useState({
    judul: "",
    deskripsi: "",
    durasi: 0,
    harga: 0,
    modelAkses: "GRATIS",
    status: "DRAFT",
    subKategori: "",
    thumbnailUrl: "",
    passingGradeJson: "",
    konfigurasiJson: "",
  });

  useEffect(() => {
    async function fetchPaket() {
      try {
        const res = await fetch(`/api/tryout/${tryoutId}`);
        const json = await res.json();
        if (!json.success) throw new Error(json.error);
        const data: PaketTryout = json.data;
        setPaket(data);
        setForm({
          judul: data.judul,
          deskripsi: data.deskripsi,
          durasi: data.durasi,
          harga: Number(data.harga),
          modelAkses: data.modelAkses,
          status: data.status,
          subKategori: data.subKategori ?? "",
          thumbnailUrl: data.thumbnailUrl ?? "",
          passingGradeJson: data.passingGrade ? JSON.stringify(data.passingGrade, null, 2) : "",
          konfigurasiJson: data.konfigurasi ? JSON.stringify(data.konfigurasi, null, 2) : "",
        });
        if (searchParams.get("action") === "publish") {
          await fetch(`/api/tryout/${data.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "PUBLISHED" }),
          });
          setForm((prev) => ({ ...prev, status: "PUBLISHED" }));
          setSuccessMsg("Paket berhasil dipublish");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal memuat data");
      } finally {
        setIsLoading(false);
      }
    }
    fetchPaket();
  }, [tryoutId, searchParams]);

  // Fetch soal dalam paket
  const fetchSoalDalamPaket = useCallback(async () => {
    setIsLoadingSoal(true);
    try {
      const res = await fetch(`/api/tryout/${tryoutId}/soal`);
      const json = await res.json();
      if (json.success) setSoalDalamPaket(json.data);
    } finally {
      setIsLoadingSoal(false);
    }
  }, [tryoutId]);

  // Fetch bank soal untuk dipilih
  const fetchSoalBank = useCallback(async (page = 1, kategori = "", q = "", subtes = "") => {
    setIsLoadingSoal(true);
    try {
      const qs = new URLSearchParams({
        page: String(page),
        limit: "15",
        ...(kategori && { kategori }),
        ...(subtes && { subtes }),
        ...(q && { q }),
      });
      const res = await fetch(`/api/soal?${qs}`);
      const json = await res.json();
      if (json.success) {
        setSoalBank(json.data.items);
        setSoalBankTotal(json.data.total);
      }
    } finally {
      setIsLoadingSoal(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "soal") {
      fetchSoalDalamPaket();
      fetchSoalBank(1, filterKategori, filterQ, filterSubtes);
    }
  }, [activeTab, fetchSoalDalamPaket, fetchSoalBank, filterKategori, filterQ, filterSubtes]);

  async function handleTambahSoal() {
    if (selectedSoalIds.size === 0) return;
    setIsAddingSoal(true);
    setError(null);
    try {
      const res = await fetch(`/api/tryout/${tryoutId}/soal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ soalIds: Array.from(selectedSoalIds) }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setSelectedSoalIds(new Set());
      setSuccessMsg(`${json.data.ditambahkan} soal berhasil ditambahkan`);
      await fetchSoalDalamPaket();
      setPaket((prev) => prev ? { ...prev, totalSoal: json.data.totalSoal } : prev);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menambahkan soal");
    } finally {
      setIsAddingSoal(false);
    }
  }

  async function handleHapusSoal(soalId: string) {
    if (!confirm("Hapus soal ini dari paket?")) return;
    try {
      const res = await fetch(`/api/tryout/${tryoutId}/soal`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ soalId }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      await fetchSoalDalamPaket();
      setPaket((prev) => prev ? { ...prev, totalSoal: json.data.totalSoal } : prev);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus soal");
    }
  }

  function toggleSelectSoal(id: string) {
    setSelectedSoalIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccessMsg(null);
    let passingGrade: Record<string, number> | null = null;
    let konfigurasi: Record<string, unknown> | null = null;
    if (form.passingGradeJson.trim()) {
      try { passingGrade = JSON.parse(form.passingGradeJson); }
      catch { setError("Format JSON Passing Grade tidak valid"); setIsSaving(false); return; }
    }
    if (form.konfigurasiJson.trim()) {
      try { konfigurasi = JSON.parse(form.konfigurasiJson); }
      catch { setError("Format JSON Konfigurasi tidak valid"); setIsSaving(false); return; }
    }
    try {
      const res = await fetch(`/api/tryout/${tryoutId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          judul: form.judul, deskripsi: form.deskripsi,
          durasi: Number(form.durasi), harga: Number(form.harga),
          modelAkses: form.modelAkses, status: form.status,
          subKategori: form.subKategori || null,
          thumbnailUrl: form.thumbnailUrl || null,
          passingGrade, konfigurasi,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setSuccessMsg("Perubahan berhasil disimpan");
      setTimeout(() => router.push("/admin/tryout"), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan perubahan");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Arsipkan paket ini?")) return;
    try {
      const res = await fetch(`/api/tryout/${tryoutId}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      router.push("/admin/tryout");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengarsipkan paket");
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-gray-500 dark:text-gray-400">Memuat data...</div>
      </div>
    );
  }

  if (!paket) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <div className="text-4xl mb-4">🔍</div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Paket tidak ditemukan</h2>
        <Link href="/admin/tryout" className="text-blue-600 hover:underline">Kembali ke daftar</Link>
      </div>
    );
  }

  const soalDalamPaketIds = new Set(soalDalamPaket.map((s) => s.soalId));
  const totalPages = Math.ceil(soalBankTotal / 15);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
            <Link href="/admin/tryout" className="hover:text-blue-600">Paket Tryout</Link>
            <span>/</span><span>Edit</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Paket Tryout</h1>
        </div>
        <button onClick={handleDelete} className="text-sm text-red-600 dark:text-red-400 hover:underline">
          Arsipkan
        </button>
      </div>

      {/* Info readonly */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 flex flex-wrap gap-4 text-sm">
        <div>
          <span className="text-gray-500 dark:text-gray-400">Kategori: </span>
          <span className="font-medium text-gray-900 dark:text-white">
            {KATEGORI_OPTIONS.find((k) => k.value === paket.kategori)?.label ?? paket.kategori}
          </span>
        </div>
        <div>
          <span className="text-gray-500 dark:text-gray-400">Total Soal: </span>
          <span className="font-medium text-gray-900 dark:text-white">{paket.totalSoal}</span>
        </div>
        <div>
          <span className="text-gray-500 dark:text-gray-400">Slug: </span>
          <span className="font-mono text-xs text-gray-600 dark:text-gray-300">{paket.slug}</span>
        </div>
      </div>

      {/* Alerts */}
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

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 dark:border-gray-800">
        {([["info", "Informasi Paket"], ["soal", `Kelola Soal (${paket.totalSoal})`]] as [ActiveTab, string][]).map(([tab, label]) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab: Informasi Paket */}
      {activeTab === "info" && (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 space-y-5">
            <h2 className="font-semibold text-gray-900 dark:text-white">Informasi Dasar</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Judul Paket <span className="text-red-500">*</span></label>
              <input type="text" required value={form.judul} onChange={(e) => setForm({ ...form, judul: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Deskripsi <span className="text-red-500">*</span></label>
              <textarea required rows={4} value={form.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sub Kategori <span className="text-gray-400 font-normal">(opsional)</span></label>
              <input type="text" value={form.subKategori} onChange={(e) => setForm({ ...form, subKategori: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 space-y-5">
            <h2 className="font-semibold text-gray-900 dark:text-white">Pengaturan</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Durasi (menit) <span className="text-red-500">*</span></label>
                <input type="number" required min={10} value={form.durasi} onChange={(e) => setForm({ ...form, durasi: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Harga (Rp)</label>
                <input type="number" min={0} value={form.harga} onChange={(e) => setForm({ ...form, harga: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Model Akses</label>
                <select value={form.modelAkses} onChange={(e) => setForm({ ...form, modelAkses: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {MODEL_AKSES_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">URL Thumbnail <span className="text-gray-400 font-normal">(opsional)</span></label>
              <input type="url" value={form.thumbnailUrl} onChange={(e) => setForm({ ...form, thumbnailUrl: e.target.value })} placeholder="https://..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 space-y-5">
            <h2 className="font-semibold text-gray-900 dark:text-white">Konfigurasi Lanjutan</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Passing Grade <span className="text-gray-400 font-normal">(JSON)</span></label>
              <textarea rows={3} value={form.passingGradeJson} onChange={(e) => setForm({ ...form, passingGradeJson: e.target.value })}
                placeholder='{"twk": 65, "tiu": 80, "tkp": 166, "total": 311}'
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Konfigurasi Penilaian <span className="text-gray-400 font-normal">(JSON)</span></label>
              <textarea rows={4} value={form.konfigurasiJson} onChange={(e) => setForm({ ...form, konfigurasiJson: e.target.value })}
                placeholder='{"twk": {"jumlahSoal": 35, "nilaiBenar": 5}}'
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <Link href="/admin/tryout" className="px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              Batal
            </Link>
            <button type="submit" disabled={isSaving}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      )}

      {/* Tab: Kelola Soal */}
      {activeTab === "soal" && (
        <div className="space-y-6">
          {/* Soal dalam paket — dikelompokkan per subtes */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900 dark:text-white">
                Soal dalam Paket ({soalDalamPaket.length})
              </h2>
            </div>
            {isLoadingSoal ? (
              <div className="py-8 text-center text-gray-400 text-sm">Memuat...</div>
            ) : soalDalamPaket.length === 0 ? (
              <div className="py-12 text-center text-gray-400">
                <div className="text-3xl mb-2">📭</div>
                <p className="text-sm">Belum ada soal. Tambahkan dari bank soal di bawah.</p>
              </div>
            ) : (() => {
              // Kelompokkan per subtes
              const subtesOrder: string[] = [];
              const subtesGroups: Record<string, SoalDalamPaket[]> = {};
              soalDalamPaket.forEach((item) => {
                const s = item.soal.subtes;
                if (!subtesGroups[s]) { subtesGroups[s] = []; subtesOrder.push(s); }
                subtesGroups[s].push(item);
              });

              return (
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {subtesOrder.map((subtes) => (
                    <div key={subtes}>
                      {/* Header subtes */}
                      <div className={`px-6 py-2 flex items-center justify-between ${SUBTES_BADGE[subtes] ?? SUBTES_BADGE.UMUM!} bg-opacity-30`}>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${SUBTES_BADGE[subtes] ?? SUBTES_BADGE.UMUM!}`}>
                          {SUBTES_LABEL[subtes] ?? subtes}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {subtesGroups[subtes]!.length} soal
                        </span>
                      </div>
                      {/* Soal dalam subtes */}
                      {subtesGroups[subtes]!.map((item) => (
                        <div key={item.id} className="px-6 py-3 flex items-start gap-4 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                          <span className="text-xs text-gray-400 w-6 text-center mt-0.5 shrink-0">{item.urutan}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-900 dark:text-white line-clamp-2">
                              {item.soal.konten.replace(/[#*`$\\]/g, "").substring(0, 120)}
                              {item.soal.konten.length > 120 ? "..." : ""}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-gray-400">{item.soal.topik}</span>
                              <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${BADGE_KESULITAN[item.soal.tingkatKesulitan] ?? ""}`}>
                                {item.soal.tingkatKesulitan}
                              </span>
                              <span className="text-xs text-gray-400">
                                {item.soal.opsi.filter((o) => o.isBenar).length} jawaban benar
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleHapusSoal(item.soalId)}
                            className="text-xs text-red-500 hover:text-red-700 dark:hover:text-red-400 shrink-0 mt-0.5"
                          >
                            Hapus
                          </button>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>

          {/* Bank soal — pilih soal untuk ditambahkan */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-3">Tambah dari Bank Soal</h2>
              <div className="flex flex-wrap gap-2">
                <input
                  type="text"
                  placeholder="Cari soal..."
                  value={filterQ}
                  onChange={(e) => { setFilterQ(e.target.value); setSoalBankPage(1); }}
                  className="flex-1 min-w-40 px-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={filterKategori}
                  onChange={(e) => { setFilterKategori(e.target.value); setFilterSubtes(""); setSoalBankPage(1); }}
                  className="px-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Semua Kategori</option>
                  {KATEGORI_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                {/* Filter subtes — muncul jika kategori dipilih */}
                {filterKategori && (
                  <select
                    value={filterSubtes}
                    onChange={(e) => { setFilterSubtes(e.target.value); setSoalBankPage(1); }}
                    className="px-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Semua Subtes</option>
                    {(SUBTES_PER_KATEGORI[filterKategori] ?? []).map((s) => (
                      <option key={s} value={s}>{SUBTES_LABEL[s] ?? s}</option>
                    ))}
                  </select>
                )}
                {selectedSoalIds.size > 0 && (
                  <button
                    onClick={handleTambahSoal}
                    disabled={isAddingSoal}
                    className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {isAddingSoal ? "Menambahkan..." : `+ Tambah ${selectedSoalIds.size} Soal`}
                  </button>
                )}
              </div>
            </div>

            {isLoadingSoal ? (
              <div className="py-8 text-center text-gray-400 text-sm">Memuat bank soal...</div>
            ) : soalBank.length === 0 ? (
              <div className="py-12 text-center text-gray-400">
                <p className="text-sm">Tidak ada soal ditemukan.</p>
                <Link href="/admin/bank-soal/buat" className="text-blue-600 hover:underline text-sm mt-1 inline-block">
                  Tambah soal baru
                </Link>
              </div>
            ) : (
              <>
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {soalBank.map((soal) => {
                    const sudahAda = soalDalamPaketIds.has(soal.id);
                    const dipilih = selectedSoalIds.has(soal.id);
                    return (
                      <div
                        key={soal.id}
                        onClick={() => !sudahAda && toggleSelectSoal(soal.id)}
                        className={`px-6 py-3 flex items-start gap-4 transition-colors ${
                          sudahAda
                            ? "opacity-40 cursor-not-allowed"
                            : "cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/10"
                        } ${dipilih ? "bg-blue-50 dark:bg-blue-900/20" : ""}`}
                      >
                        <div className="mt-0.5 shrink-0">
                          {sudahAda ? (
                            <span className="text-xs text-green-600 dark:text-green-400 font-medium">✓ Ada</span>
                          ) : (
                            <input
                              type="checkbox"
                              checked={dipilih}
                              onChange={() => toggleSelectSoal(soal.id)}
                              onClick={(e) => e.stopPropagation()}
                              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 dark:text-white line-clamp-2">
                            {soal.konten.replace(/[#*`$\\]/g, "").substring(0, 120)}
                            {soal.konten.length > 120 ? "..." : ""}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${SUBTES_BADGE[soal.subtes] ?? SUBTES_BADGE.UMUM!}`}>
                              {SUBTES_LABEL[soal.subtes] ?? soal.subtes}
                            </span>
                            <span className="text-gray-300 dark:text-gray-600">·</span>
                            <span className="text-xs text-gray-400">{soal.topik}</span>
                            <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${BADGE_KESULITAN[soal.tingkatKesulitan] ?? ""}`}>
                              {soal.tingkatKesulitan}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination bank soal */}
                {totalPages > 1 && (
                  <div className="px-6 py-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                      Halaman {soalBankPage} dari {totalPages} ({soalBankTotal} soal)
                    </span>
                    <div className="flex gap-2">
                      <button
                        disabled={soalBankPage <= 1}
                        onClick={() => { const p = soalBankPage - 1; setSoalBankPage(p); fetchSoalBank(p, filterKategori, filterQ, filterSubtes); }}
                        className="px-3 py-1 border border-gray-300 dark:border-gray-700 rounded text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40"
                      >
                        ←
                      </button>
                      <button
                        disabled={soalBankPage >= totalPages}
                        onClick={() => { const p = soalBankPage + 1; setSoalBankPage(p); fetchSoalBank(p, filterKategori, filterQ, filterSubtes); }}
                        className="px-3 py-1 border border-gray-300 dark:border-gray-700 rounded text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40"
                      >
                        →
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
