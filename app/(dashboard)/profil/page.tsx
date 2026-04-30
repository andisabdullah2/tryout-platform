"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useTheme } from "@/components/theme-provider";

interface ProfilData {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  image: string | null;
  role: string;
  darkMode: boolean;
  useAlias: boolean;
  alias: string | null;
  createdAt: string;
}

export default function ProfilPage() {
  const { data: session, update } = useSession();
  const { setTheme } = useTheme();
  const [profil, setProfil] = useState<ProfilData | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", alias: "" });
  const [useAlias, setUseAlias] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchProfil();
  }, []);

  async function fetchProfil() {
    setIsLoading(true);
    try {
      const res = await fetch("/api/profil");
      if (res.ok) {
        const data = await res.json();
        const p: ProfilData = data.data;
        setProfil(p);
        setForm({
          name: p.name,
          phone: p.phone ?? "",
          alias: p.alias ?? "",
        });
        setUseAlias(p.useAlias);
        setDarkMode(p.darkMode);
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/profil", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone || null,
          alias: form.alias || null,
          useAlias,
          darkMode,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error ?? "Gagal menyimpan perubahan");
        return;
      }

      setSuccessMsg("Profil berhasil diperbarui");
      setTheme(darkMode ? "dark" : "light");
      await update({ name: form.name });
    } catch {
      setErrorMsg("Terjadi kesalahan jaringan");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profil Saya</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Kelola informasi akun dan preferensi Anda
        </p>
      </div>

      {/* Avatar */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-2xl">
            {profil?.name?.charAt(0).toUpperCase() ?? session?.user?.name?.charAt(0).toUpperCase() ?? "U"}
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white text-lg">
              {profil?.name ?? session?.user?.name}
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {profil?.email ?? session?.user?.email}
            </p>
            <span className="inline-block mt-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
              {profil?.role ?? "PESERTA"}
            </span>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSave} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 space-y-5">
        <h2 className="font-semibold text-gray-900 dark:text-white">Informasi Pribadi</h2>

        {successMsg && (
          <div className="p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-300 text-sm">
            ✅ {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
            ❌ {errorMsg}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Nama Lengkap
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            minLength={2}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Email
          </label>
          <input
            type="email"
            value={profil?.email ?? ""}
            disabled
            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
          />
          <p className="text-xs text-gray-400 mt-1">Email tidak dapat diubah</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Nomor Telepon
          </label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="08xxxxxxxxxx"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="border-t border-gray-100 dark:border-gray-800 pt-5">
          <h3 className="font-medium text-gray-900 dark:text-white mb-4">Preferensi</h3>

          <div className="space-y-4">
            {/* Dark Mode */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Mode Gelap</p>
                <p className="text-xs text-gray-400">Aktifkan tampilan gelap</p>
              </div>
              <button
                type="button"
                onClick={() => setDarkMode(!darkMode)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  darkMode ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-700"
                }`}
                role="switch"
                aria-checked={darkMode}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    darkMode ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* Alias Leaderboard */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Gunakan Nama Samaran di Leaderboard
                </p>
                <p className="text-xs text-gray-400">
                  Sembunyikan nama asli di papan peringkat publik
                </p>
              </div>
              <button
                type="button"
                onClick={() => setUseAlias(!useAlias)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  useAlias ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-700"
                }`}
                role="switch"
                aria-checked={useAlias}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    useAlias ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {useAlias && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nama Samaran
                </label>
                <input
                  type="text"
                  value={form.alias}
                  onChange={(e) => setForm({ ...form, alias: e.target.value })}
                  placeholder="Nama yang ditampilkan di leaderboard"
                  maxLength={50}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </form>

      {/* Info akun */}
      {profil && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-3">Info Akun</h2>
          <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
            <p>
              Bergabung sejak:{" "}
              <span className="text-gray-700 dark:text-gray-300">
                {new Date(profil.createdAt).toLocaleDateString("id-ID", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
