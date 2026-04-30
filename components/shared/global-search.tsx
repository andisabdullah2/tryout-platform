"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { SearchResult } from "@/app/api/search/route";

const TIPE_ICON: Record<string, string> = {
  tryout: "📝",
  kelas: "📚",
  modul: "📖",
};

const TIPE_LABEL: Record<string, string> = {
  tryout: "Tryout",
  kelas: "Kelas",
  modul: "Modul",
};

const KATEGORI_LABEL: Record<string, string> = {
  CPNS_SKD: "CPNS/SKD",
  SEKDIN: "Sekdin",
  UTBK_SNBT: "UTBK/SNBT",
};

function getResultUrl(result: SearchResult): string {
  if (result.tipe === "tryout") return `/tryout/${result.slug}`;
  if (result.tipe === "kelas") return `/kelas/${result.slug}`;
  if (result.tipe === "modul") return `/kelas/${result.kelasSlug}`;
  return "/";
}

export function GlobalSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced search — 300ms delay
  const search = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/search?q=${encodeURIComponent(q.trim())}&limit=9`
      );
      if (res.ok) {
        const data = (await res.json()) as {
          success: boolean;
          data: { results: SearchResult[] };
        };
        setResults(data.data?.results ?? []);
        setIsOpen(true);
      }
    } catch {
      // silent fail
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void search(query);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, search]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard shortcut: Ctrl+K / Cmd+K
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
      if (e.key === "Escape") {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  function handleSelect(result: SearchResult) {
    setIsOpen(false);
    setQuery("");
    router.push(getResultUrl(result));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      setIsOpen(false);
      router.push(`/cari?q=${encodeURIComponent(query.trim())}`);
    }
  }

  // Group results by type
  const grouped = results.reduce<Record<string, SearchResult[]>>((acc, r) => {
    if (!acc[r.tipe]) acc[r.tipe] = [];
    acc[r.tipe]!.push(r);
    return acc;
  }, {});

  return (
    <div ref={containerRef} className="relative w-full max-w-sm">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => results.length > 0 && setIsOpen(true)}
            placeholder="Cari tryout, kelas... (⌘K)"
            className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400"
            aria-label="Pencarian global"
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            role="combobox"
            aria-autocomplete="list"
          />
          {isLoading && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2">
              <span className="inline-block w-3.5 h-3.5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </span>
          )}
        </div>
      </form>

      {/* Dropdown results */}
      {isOpen && (
        <div
          role="listbox"
          className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-50 overflow-hidden max-h-96 overflow-y-auto"
        >
          {results.length === 0 && !isLoading ? (
            <div className="px-4 py-6 text-center text-sm text-gray-400">
              Tidak ada hasil untuk &ldquo;{query}&rdquo;
            </div>
          ) : (
            <>
              {Object.entries(grouped).map(([tipe, items]) => (
                <div key={tipe}>
                  <div className="px-3 py-1.5 bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {TIPE_ICON[tipe]} {TIPE_LABEL[tipe]}
                    </span>
                  </div>
                  {items.map((result) => (
                    <button
                      key={result.id}
                      role="option"
                      aria-selected={false}
                      onClick={() => handleSelect(result)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-50 dark:border-gray-800 last:border-0"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-lg flex-shrink-0 mt-0.5">
                          {TIPE_ICON[result.tipe]}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {result.judul}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {result.kategori && (
                              <span className="text-xs text-gray-400">
                                {KATEGORI_LABEL[result.kategori] ?? result.kategori}
                              </span>
                            )}
                            {result.modelAkses === "GRATIS" && (
                              <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                                Gratis
                              </span>
                            )}
                            {result.harga !== undefined && result.modelAkses !== "GRATIS" && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                Rp {result.harga.toLocaleString("id-ID")}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ))}

              {/* Link ke halaman pencarian penuh */}
              <button
                onClick={() => {
                  setIsOpen(false);
                  router.push(`/cari?q=${encodeURIComponent(query.trim())}`);
                }}
                className="w-full px-4 py-3 text-sm text-blue-600 dark:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-center font-medium border-t border-gray-100 dark:border-gray-800"
              >
                Lihat semua hasil untuk &ldquo;{query}&rdquo; →
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
