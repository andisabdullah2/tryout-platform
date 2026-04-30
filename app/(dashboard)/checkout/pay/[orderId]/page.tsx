"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

declare global {
  interface Window {
    snap?: {
      pay: (
        token: string,
        options: {
          onSuccess: (result: MidtransResult) => void;
          onPending: (result: MidtransResult) => void;
          onError: (result: MidtransResult) => void;
          onClose: () => void;
        }
      ) => void;
    };
  }
}

interface MidtransResult {
  order_id: string;
  transaction_status: string;
  payment_type?: string;
}

interface TransactionData {
  orderId: string;
  totalAmount: number;
  status: string;
  snapToken: string | null;
  items: Array<{
    nama: string;
    harga: number;
    tipe: string;
  }>;
}

export default function PaymentRetryPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params["orderId"] as string;

  const [transaction, setTransaction] = useState<TransactionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaying, setIsPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/payment/transaction/${orderId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setTransaction(data.data);
        } else {
          setError("Transaksi tidak ditemukan");
        }
      })
      .catch(() => setError("Gagal memuat data transaksi"))
      .finally(() => setIsLoading(false));
  }, [orderId]);

  async function handlePay() {
    if (!transaction?.snapToken) {
      setError("Token pembayaran tidak tersedia");
      return;
    }

    setIsPaying(true);
    setError(null);

    try {
      await loadSnapScript();

      window.snap!.pay(transaction.snapToken, {
        onSuccess(result) {
          console.info("Payment success:", result);
          router.push(`/riwayat?status=success&order=${orderId}`);
        },
        onPending(result) {
          console.info("Payment pending:", result);
          router.push(`/riwayat?status=pending&order=${orderId}`);
        },
        onError(result) {
          console.error("Payment error:", result);
          setError("Pembayaran gagal. Silakan coba lagi.");
          setIsPaying(false);
        },
        onClose() {
          setIsPaying(false);
        },
      });
    } catch (err) {
      console.error("Payment error:", err);
      setError(err instanceof Error ? err.message : "Gagal memuat Midtrans Snap");
      setIsPaying(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error && !transaction) {
    return (
      <div className="max-w-md mx-auto">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
          <div className="text-4xl mb-3">❌</div>
          <p className="text-red-700 dark:text-red-400 font-medium">{error}</p>
          <Link
            href="/riwayat"
            className="mt-4 inline-block text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            Kembali ke Riwayat
          </Link>
        </div>
      </div>
    );
  }

  if (transaction?.status !== "PENDING") {
    return (
      <div className="max-w-md mx-auto">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6 text-center">
          <div className="text-4xl mb-3">⚠️</div>
          <p className="text-yellow-700 dark:text-yellow-400 font-medium mb-4">
            Transaksi ini tidak dapat dibayar karena status: {transaction?.status}
          </p>
          <Link
            href="/riwayat"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            Kembali ke Riwayat
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <Link href="/riwayat" className="hover:text-blue-600 dark:hover:text-blue-400">
          Riwayat
        </Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-white">Bayar</span>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Lanjutkan Pembayaran</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Order ID: {transaction.orderId}
        </p>
      </div>

      {/* Ringkasan pesanan */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Ringkasan Pesanan
          </h3>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {transaction.items.map((item, i) => (
            <div key={i} className="px-5 py-3 flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {item.nama}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{item.tipe}</p>
              </div>
              <span className="text-sm font-semibold text-gray-900 dark:text-white flex-shrink-0">
                Rp {item.harga.toLocaleString("id-ID")}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Total */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5">
        <div className="flex justify-between font-bold text-gray-900 dark:text-white text-lg">
          <span>Total Pembayaran</span>
          <span>Rp {transaction.totalAmount.toLocaleString("id-ID")}</span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Tombol bayar */}
      <button
        onClick={handlePay}
        disabled={isPaying || !transaction.snapToken}
        className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-semibold text-base hover:bg-blue-700 active:bg-blue-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isPaying ? (
          <>
            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Memproses...
          </>
        ) : (
          <>🔒 Bayar Sekarang</>
        )}
      </button>

      <p className="text-xs text-center text-gray-400 dark:text-gray-500">
        Pembayaran diproses secara aman oleh Midtrans
      </p>
    </div>
  );
}

/** Load Midtrans Snap script */
function loadSnapScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.snap) {
      resolve();
      return;
    }

    const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;
    if (!clientKey) {
      reject(new Error("NEXT_PUBLIC_MIDTRANS_CLIENT_KEY tidak ditemukan"));
      return;
    }

    const isProduction = process.env.NODE_ENV === "production";
    const snapUrl = isProduction
      ? "https://app.midtrans.com/snap/snap.js"
      : "https://app.sandbox.midtrans.com/snap/snap.js";

    const existing = document.querySelector(`script[src="${snapUrl}"]`);
    if (existing) {
      const interval = setInterval(() => {
        if (window.snap) {
          clearInterval(interval);
          resolve();
        }
      }, 100);
      setTimeout(() => {
        clearInterval(interval);
        reject(new Error("Midtrans Snap timeout"));
      }, 10000);
      return;
    }

    const script = document.createElement("script");
    script.src = snapUrl;
    script.setAttribute("data-client-key", clientKey);

    script.onload = () => {
      const checkSnap = setInterval(() => {
        if (window.snap) {
          clearInterval(checkSnap);
          resolve();
        }
      }, 50);

      setTimeout(() => {
        clearInterval(checkSnap);
        if (!window.snap) {
          reject(new Error("Midtrans Snap loaded but window.snap not initialized"));
        }
      }, 5000);
    };

    script.onerror = () => reject(new Error("Gagal memuat Midtrans Snap"));
    document.head.appendChild(script);
  });
}
