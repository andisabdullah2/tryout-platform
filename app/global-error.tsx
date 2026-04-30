"use client"

import { useEffect } from "react"
import { captureException } from "@/lib/monitoring/sentry"

interface GlobalErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

/**
 * Global error boundary untuk menangkap error yang tidak tertangani.
 * Menampilkan halaman error yang ramah pengguna dalam Bahasa Indonesia.
 * Error dilaporkan ke Sentry secara otomatis.
 */
export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // Laporkan error ke Sentry
    captureException(error, {
      digest: error.digest,
      source: "global-error-boundary",
    })
  }, [error])

  return (
    <html lang="id">
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg text-center">
            {/* Ikon error */}
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <svg
                className="h-8 w-8 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            {/* Judul */}
            <h1 className="mb-2 text-2xl font-bold text-gray-900">
              Terjadi Kesalahan
            </h1>

            {/* Pesan */}
            <p className="mb-6 text-gray-600">
              Terjadi kesalahan. Tim kami telah diberitahu dan sedang menangani
              masalah ini.
            </p>

            {/* Error digest untuk debugging */}
            {error.digest && (
              <p className="mb-6 rounded-lg bg-gray-100 px-3 py-2 font-mono text-xs text-gray-500">
                Kode error: {error.digest}
              </p>
            )}

            {/* Tombol aksi */}
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                onClick={reset}
                className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Coba Lagi
              </button>
              <a
                href="/"
                className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Kembali ke Beranda
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
