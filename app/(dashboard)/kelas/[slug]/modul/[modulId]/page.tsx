"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { MarkdownRenderer } from "@/components/shared/markdown-renderer";

interface KontenItem {
  id: string; tipe: string; judul: string;
  konten?: string | null; fileUrl?: string | null;
  linkUrl?: string | null; durasi?: number | null;
  muxPlaybackId?: string | null;
}

interface ModulData {
  id: string; judul: string; deskripsi?: string | null;
  urutan: number; isKuisAktif: boolean;
  konten: KontenItem[];
  prevModulId?: string | null;
  nextModulId?: string | null;
}

export default function ModulPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params["slug"] as string;
  const modulId = params["modulId"] as string;

  const [modul, setModul] = useState<ModulData | null>(null);
  const [activeKonten, setActiveKonten] = useState<KontenItem | null>(null);
  const [videoProgress, setVideoProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const progressSaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetchModul();
  }, [modulId]);

  async function fetchModul() {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/modul/${modulId}`);
      if (res.ok) {
        const data = await res.json() as { data: ModulData };
        setModul(data.data);
        setActiveKonten(data.data.konten[0] ?? null);

        // Restore posisi video
        const progressRes = await fetch(`/api/video-progress?modulId=${modulId}`);
        if (progressRes.ok) {
          const progressData = await progressRes.json() as { data: { posisiDetik: number } };
          setVideoProgress(progressData.data.posisiDetik);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }

  function handleVideoProgress(currentTime: number, duration: number) {
    const isSelesai = duration > 0 && currentTime / duration >= 0.9;

    // Debounce save setiap 10 detik
    if (progressSaveRef.current) clearTimeout(progressSaveRef.current);
    progressSaveRef.current = setTimeout(() => {
      fetch("/api/video-progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modulId, posisiDetik: Math.floor(currentTime), isSelesai }),
      }).catch(() => null);
    }, 10000);
  }

  function handleModulSelesai() {
    fetch("/api/video-progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ modulId, posisiDetik: videoProgress, isSelesai: true }),
    }).then(() => {
      if (modul?.nextModulId) {
        router.push(`/kelas/${slug}/modul/${modul.nextModulId}`);
      } else {
        router.push(`/kelas/${slug}`);
      }
    }).catch(() => null);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!modul) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 dark:text-gray-400">Modul tidak ditemukan</p>
        <Link href={`/kelas/${slug}`} className="text-blue-600 hover:underline mt-2 inline-block">
          Kembali ke Kelas
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <Link href="/kelas" className="hover:text-blue-600">Kelas</Link>
        <span>/</span>
        <Link href={`/kelas/${slug}`} className="hover:text-blue-600 truncate max-w-32">{slug}</Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-white truncate">{modul.judul}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Konten utama */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
            {/* Header modul */}
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">{modul.judul}</h1>
              {modul.deskripsi && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{modul.deskripsi}</p>
              )}
            </div>

            {/* Konten aktif */}
            {activeKonten && (
              <div className="p-5">
                <h3 className="font-medium text-gray-900 dark:text-white mb-4">{activeKonten.judul}</h3>

                {activeKonten.tipe === "TEKS" && activeKonten.konten && (
                  <div className="prose dark:prose-invert max-w-none">
                    <MarkdownRenderer content={activeKonten.konten} />
                  </div>
                )}

                {activeKonten.tipe === "VIDEO" && (
                  <div className="aspect-video bg-black rounded-xl overflow-hidden">
                    {activeKonten.muxPlaybackId ? (
                      <video
                        controls
                        className="w-full h-full"
                        onTimeUpdate={(e) => {
                          const video = e.currentTarget;
                          handleVideoProgress(video.currentTime, video.duration);
                        }}
                        onLoadedMetadata={(e) => {
                          if (videoProgress > 0) {
                            e.currentTarget.currentTime = videoProgress;
                          }
                        }}
                      >
                        <source src={`https://stream.mux.com/${activeKonten.muxPlaybackId}.m3u8`} type="application/x-mpegURL" />
                      </video>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <p>Video tidak tersedia</p>
                      </div>
                    )}
                  </div>
                )}

                {activeKonten.tipe === "PDF" && activeKonten.fileUrl && (
                  <div className="space-y-3">
                    <iframe src={activeKonten.fileUrl} className="w-full h-96 rounded-xl border border-gray-200 dark:border-gray-700" title={activeKonten.judul} />
                    <a href={activeKonten.fileUrl} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline">
                      📄 Unduh PDF
                    </a>
                  </div>
                )}

                {activeKonten.tipe === "LINK_EKSTERNAL" && activeKonten.linkUrl && (
                  <a href={activeKonten.linkUrl} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 px-4 py-3 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors">
                    🔗 Buka Tautan Eksternal
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Navigasi modul */}
          <div className="flex items-center justify-between">
            {modul.prevModulId ? (
              <Link href={`/kelas/${slug}/modul/${modul.prevModulId}`}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                ← Modul Sebelumnya
              </Link>
            ) : <div />}

            <button onClick={handleModulSelesai}
              className="px-6 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors">
              {modul.nextModulId ? "Selesai & Lanjut →" : "Selesaikan Kelas ✓"}
            </button>
          </div>
        </div>

        {/* Sidebar daftar konten */}
        <div className="space-y-3">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Konten Modul</h3>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {modul.konten.map((k) => {
                const isActive = activeKonten?.id === k.id;
                const tipeIcon: Record<string, string> = {
                  VIDEO: "🎥", TEKS: "📄", PDF: "📋", LINK_EKSTERNAL: "🔗",
                };
                return (
                  <button key={k.id} onClick={() => setActiveKonten(k)}
                    className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors ${
                      isActive ? "bg-blue-50 dark:bg-blue-950" : "hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}>
                    <span className="text-base flex-shrink-0 mt-0.5">{tipeIcon[k.tipe] ?? "📄"}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-medium truncate ${isActive ? "text-blue-700 dark:text-blue-300" : "text-gray-700 dark:text-gray-300"}`}>
                        {k.judul}
                      </p>
                      {k.durasi && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          {Math.floor(k.durasi / 60)} menit
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
