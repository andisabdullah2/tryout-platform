"use client";

import { useEffect } from "react";
import { MarkdownRenderer } from "@/components/shared/markdown-renderer";

interface Opsi {
  id: string;
  label: string;
  konten: string;
}

interface SoalRendererProps {
  nomor: number;
  konten: string;
  gambarUrl?: string | null;
  opsi: Opsi[];
  selectedOpsiId: string | null;
  onSelect: (opsiId: string) => void;
  disabled?: boolean;
}

export function SoalRenderer({
  nomor,
  konten,
  gambarUrl,
  opsi,
  selectedOpsiId,
  onSelect,
  disabled = false,
}: SoalRendererProps) {
  // Nonaktifkan copy-paste dan klik kanan selama tryout (Property 16.5)
  useEffect(() => {
    if (disabled) return;

    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    const handleCopy = (e: ClipboardEvent) => e.preventDefault();
    const handleCut = (e: ClipboardEvent) => e.preventDefault();
    const handleKeyDown = (e: KeyboardEvent) => {
      // Blokir Ctrl+C, Ctrl+X, Ctrl+A, Ctrl+P
      if (e.ctrlKey && ["c", "x", "a", "p"].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("copy", handleCopy);
    document.addEventListener("cut", handleCut);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("cut", handleCut);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [disabled]);

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 space-y-5 select-none">
      {/* Nomor soal */}
      <div className="flex items-center gap-3">
        <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
          {nomor}
        </span>
        <span className="text-xs text-gray-400">Soal {nomor}</span>
      </div>

      {/* Konten soal */}
      <div className="text-gray-900 dark:text-white leading-relaxed">
        <MarkdownRenderer content={konten} />
      </div>

      {/* Gambar soal */}
      {gambarUrl && (
        <div className="flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={gambarUrl}
            alt={`Gambar soal ${nomor}`}
            className="max-w-full max-h-64 rounded-lg border border-gray-200 dark:border-gray-700"
            draggable={false}
          />
        </div>
      )}

      {/* Opsi jawaban */}
      <div className="space-y-2.5" role="radiogroup" aria-label={`Pilihan jawaban soal ${nomor}`}>
        {opsi.map((o) => {
          const isSelected = selectedOpsiId === o.id;
          return (
            <button
              key={o.id}
              onClick={() => !disabled && onSelect(o.id)}
              disabled={disabled}
              role="radio"
              aria-checked={isSelected}
              className={`
                w-full flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all
                ${isSelected
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                  : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                }
                ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}
              `}
            >
              {/* Label opsi */}
              <span className={`
                w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5
                ${isSelected
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                }
              `}>
                {o.label}
              </span>

              {/* Konten opsi */}
              <div className={`flex-1 text-sm leading-relaxed ${isSelected ? "text-blue-900 dark:text-blue-100" : "text-gray-700 dark:text-gray-300"}`}>
                <MarkdownRenderer content={o.konten} />
              </div>

              {/* Indikator terpilih */}
              {isSelected && (
                <span className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
