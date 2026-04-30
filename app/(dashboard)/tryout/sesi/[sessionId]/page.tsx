"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { TryoutTimer } from "@/components/tryout/tryout-timer";
import { SoalRenderer } from "@/components/tryout/soal-renderer";
import { SoalNavigator } from "@/components/tryout/soal-navigator";
import type { SoalInfo } from "@/components/tryout/soal-navigator";

interface Opsi { id: string; label: string; konten: string }
interface Soal {
  id: string; konten: string; gambarUrl?: string | null;
  tipe: string; subtes: string; opsi: Opsi[];
}
interface SesiData {
  id: string; status: string; expiresAt: string; startedAt: string;
  paket: { id: string; judul: string; kategori: string; durasi: number; totalSoal: number };
  soal: Soal[];
}

function getLocalAnswers(sessionId: string): Record<string, string | null> {
  try {
    const raw = localStorage.getItem(`tryout_${sessionId}_answers`);
    return raw ? (JSON.parse(raw) as Record<string, string | null>) : {};
  } catch {
    return {};
  }
}

function saveLocalAnswers(sessionId: string, answers: Record<string, string | null>) {
  try {
    localStorage.setItem(`tryout_${sessionId}_answers`, JSON.stringify(answers));
  } catch {
    // ignore storage errors
  }
}

export default function SesiTryoutPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params["sessionId"] as string;

  const [sesi, setSesi] = useState<SesiData | null>(null);
  const [answers, setAnswers] = useState<Record<string, string | null>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const autoSaveRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const answersRef = useRef(answers);
  answersRef.current = answers;

  useEffect(() => {
    loadSesi();
  }, [sessionId]);

  useEffect(() => {
    if (!sesi) return;
    autoSaveRef.current = setInterval(() => {
      saveAnswers(answersRef.current);
    }, 30000);
    return () => {
      if (autoSaveRef.current) clearInterval(autoSaveRef.current);
    };
  }, [sesi?.id]);

  async function loadSesi() {
    try {
      const res = await fetch(`/api/tryout/sesi/${sessionId}`);
      const data = await res.json() as {
        success: boolean;
        error?: string;
        code?: string;
        data?: {
          id: string;
          status: string;
          expiresAt: string;
          startedAt: string;
          paket: { id: string; judul: string; kategori: string; durasi: number; totalSoal: number };
          soal: Soal[];
          jawaban: Record<string, string | null>;
        };
      };

      if (!res.ok || !data.success) {
        if (data.code === "SESSION_EXPIRED") {
          setError("Waktu tryout sudah habis. Sesi telah berakhir.");
        } else {
          setError(data.error ?? "Sesi tidak ditemukan");
        }
        return;
      }

      const sesiData = data.data!;

      if (sesiData.status === "COMPLETED") {
        // Sesi sudah selesai — redirect ke hasil
        router.replace(`/tryout/sesi/${sessionId}/hasil`);
        return;
      }

      setSesi({
        id: sesiData.id,
        status: sesiData.status,
        expiresAt: sesiData.expiresAt,
        startedAt: sesiData.startedAt,
        paket: sesiData.paket,
        soal: sesiData.soal ?? [],
      });

      // Merge server answers + localStorage (localStorage menang untuk jawaban terbaru)
      const localAnswers = getLocalAnswers(sessionId);
      const serverAnswers = sesiData.jawaban ?? {};
      setAnswers({ ...serverAnswers, ...localAnswers });

    } catch {
      setError("Gagal memuat sesi tryout");
    } finally {
      setIsLoading(false);
    }
  }

  async function saveAnswers(currentAnswers: Record<string, string | null>) {
    try {
      await fetch(`/api/tryout/sesi/${sessionId}/jawab`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: currentAnswers }),
      });
    } catch {
      // Jawaban sudah tersimpan di localStorage sebagai fallback
    }
  }

  function handleSelectOpsi(soalId: string, opsiId: string) {
    setAnswers((prev) => {
      const newAnswers = { ...prev, [soalId]: opsiId };
      saveLocalAnswers(sessionId, newAnswers);
      // Save ke server segera untuk soal yang baru dijawab
      fetch(`/api/tryout/sesi/${sessionId}/jawab`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ soalId, opsiId }),
      }).catch(() => null);
      return newAnswers;
    });
  }

  const handleTimeUp = useCallback(async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    await saveAnswers(answersRef.current);
    await submitSesi();
  }, [isSubmitting, sessionId]);

  async function submitSesi() {
    try {
      const res = await fetch(`/api/tryout/sesi/${sessionId}/selesai`, {
        method: "POST",
      });
      if (res.ok) {
        localStorage.removeItem(`tryout_${sessionId}_answers`);
        router.push(`/tryout/sesi/${sessionId}/hasil`);
      }
    } catch {
      setError("Gagal menyelesaikan tryout. Coba lagi.");
      setIsSubmitting(false);
    }
  }

  async function handleSelesai() {
    setIsSubmitting(true);
    await saveAnswers(answersRef.current);
    await submitSesi();
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto" />
          <p className="text-gray-500 dark:text-gray-400">Memuat soal tryout...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-gray-950 flex items-center justify-center px-4">
        <div className="text-center space-y-4 max-w-md">
          <div className="text-5xl">⚠️</div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Terjadi Kesalahan</h2>
          <p className="text-gray-500 dark:text-gray-400">{error}</p>
          <button onClick={() => router.push("/tryout")}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700">
            Kembali ke Katalog
          </button>
        </div>
      </div>
    );
  }

  if (!sesi || sesi.soal.length === 0) return null;

  const currentSoal = sesi.soal[currentIndex];
  if (!currentSoal) return null;

  const answeredIds = new Set(
    Object.entries(answers)
      .filter(([, v]) => v !== null)
      .map(([k]) => k)
  );
  const soalIds = sesi.soal.map((s) => s.id);
  const soalList: SoalInfo[] = sesi.soal.map((s) => ({ id: s.id, subtes: s.subtes }));
  const totalAnswered = answeredIds.size;
  const totalSoal = sesi.soal.length;

  // Label subtes untuk header
  const SUBTES_LABEL: Record<string, string> = {
    TWK: "Tes Wawasan Kebangsaan",
    TIU: "Tes Intelegensia Umum",
    TKP: "Tes Karakteristik Pribadi",
    TPS_PENALARAN_UMUM: "TPS — Penalaran Umum",
    TPS_PPU: "TPS — Pengetahuan & Pemahaman Umum",
    TPS_PBM: "TPS — Pemahaman Bacaan & Menulis",
    TPS_PK: "TPS — Pengetahuan Kuantitatif",
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

  const SUBTES_COLOR: Record<string, string> = {
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

  const currentSubtesLabel = SUBTES_LABEL[currentSoal.subtes] ?? currentSoal.subtes;
  const currentSubtesColor = SUBTES_COLOR[currentSoal.subtes] ?? SUBTES_COLOR.UMUM!;

  // Hitung nomor soal dalam subtes (misal: TIU soal ke-3)
  const soalDalamSubtes = sesi.soal.filter((s) => s.subtes === currentSoal.subtes);
  const nomorDalamSubtes = soalDalamSubtes.findIndex((s) => s.id === currentSoal.id) + 1;

  return (
    <div className="fixed inset-0 bg-gray-50 dark:bg-gray-950 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center justify-between flex-shrink-0 z-10">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-lg font-bold text-gray-900 dark:text-white truncate hidden sm:block">
            {sesi.paket.judul}
          </span>
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${currentSubtesColor}`}>
              {currentSubtesLabel}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {currentIndex + 1}/{totalSoal}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <TryoutTimer expiresAt={sesi.expiresAt} onTimeUp={handleTimeUp} />
          <button
            onClick={() => setShowConfirm(true)}
            disabled={isSubmitting}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isSubmitting ? "Menyimpan..." : "Selesai"}
          </button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Soal area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {/* Badge subtes di atas soal */}
          <div className="flex items-center gap-2 mb-3">
            <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${currentSubtesColor}`}>
              {currentSubtesLabel}
            </span>
            <span className="text-xs text-gray-400">
              Soal ke-{nomorDalamSubtes} dari {soalDalamSubtes.length}
            </span>
          </div>

          <SoalRenderer
            nomor={currentIndex + 1}
            konten={currentSoal.konten}
            gambarUrl={currentSoal.gambarUrl}
            opsi={currentSoal.opsi}
            selectedOpsiId={answers[currentSoal.id] ?? null}
            onSelect={(opsiId) => handleSelectOpsi(currentSoal.id, opsiId)}
          />

          {/* Navigasi prev/next */}
          <div className="flex items-center justify-between mt-4">
            <button
              onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
              disabled={currentIndex === 0}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              ← Sebelumnya
            </button>

            <span className="text-sm text-gray-500 dark:text-gray-400">
              {totalAnswered}/{totalSoal} dijawab
            </span>

            <button
              onClick={() => setCurrentIndex((i) => Math.min(totalSoal - 1, i + 1))}
              disabled={currentIndex === totalSoal - 1}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Berikutnya →
            </button>
          </div>
        </main>

        {/* Sidebar navigator (desktop) */}
        <aside className="hidden lg:block w-64 flex-shrink-0 overflow-y-auto p-4 border-l border-gray-200 dark:border-gray-800">
          <SoalNavigator
            totalSoal={totalSoal}
            currentIndex={currentIndex}
            answeredIds={answeredIds}
            soalList={soalList}
            onNavigate={setCurrentIndex}
          />
        </aside>
      </div>

      {/* Modal konfirmasi selesai */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-sm w-full shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Selesaikan Tryout?</h3>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <p>✅ Dijawab: <strong className="text-gray-900 dark:text-white">{totalAnswered}</strong> soal</p>
              <p>⬜ Belum dijawab: <strong className="text-gray-900 dark:text-white">{totalSoal - totalAnswered}</strong> soal</p>
            </div>
            {/* Ringkasan per subtes */}
            <div className="space-y-1.5 border-t border-gray-100 dark:border-gray-800 pt-3">
              {[...new Set(sesi.soal.map((s) => s.subtes))].map((subtes) => {
                const soalSubtes = sesi.soal.filter((s) => s.subtes === subtes);
                const dijawab = soalSubtes.filter((s) => answeredIds.has(s.id)).length;
                return (
                  <div key={subtes} className="flex items-center justify-between text-xs">
                    <span className={`px-2 py-0.5 rounded-full font-medium ${SUBTES_COLOR[subtes] ?? SUBTES_COLOR.UMUM!}`}>
                      {SUBTES_LABEL[subtes] ?? subtes}
                    </span>
                    <span className={dijawab === soalSubtes.length ? "text-green-600 dark:text-green-400 font-medium" : "text-gray-500"}>
                      {dijawab}/{soalSubtes.length}
                    </span>
                  </div>
                );
              })}
            </div>
            {totalSoal - totalAnswered > 0 && (
              <p className="text-sm text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950 p-3 rounded-lg">
                ⚠️ Masih ada {totalSoal - totalAnswered} soal yang belum dijawab. Yakin ingin selesai?
              </p>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2.5 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Lanjut Kerjakan
              </button>
              <button
                onClick={() => { setShowConfirm(false); handleSelesai(); }}
                disabled={isSubmitting}
                className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {isSubmitting ? "Menyimpan..." : "Ya, Selesai"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
