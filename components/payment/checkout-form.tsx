"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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

export interface CheckoutItem {
  tipe: "PAKET_TRYOUT" | "KELAS" | "LANGGANAN";
  id: string;
  nama: string;
  harga: number;
}

interface CheckoutFormProps {
  items: CheckoutItem[];
  /** Callback setelah pembayaran berhasil */
  onSuccess?: (orderId: string) => void;
}

export function CheckoutForm({ items, onSuccess }: CheckoutFormProps) {
  const router = useRouter();
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState<{
    kode: string;
    diskon: number;
    finalAmount: number;
  } | null>(null);
  const [promoError, setPromoError] = useState("");
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

  const subtotal = items.reduce((sum, item) => sum + item.harga, 0);
  const totalAmount = promoApplied?.finalAmount ?? subtotal;
  const diskon = promoApplied?.diskon ?? 0;

  async function handleApplyPromo() {
    if (!promoCode.trim()) return;
    setIsApplyingPromo(true);
    setPromoError("");
    setPromoApplied(null);

    try {
      const res = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, promoCode: promoCode.trim(), dryRun: true }),
      });
      const data = (await res.json()) as {
        success: boolean;
        error?: string;
        data?: { diskon: number; totalAmount: number };
      };

      if (!res.ok || !data.success) {
        setPromoError(data.error ?? "Kode promo tidak valid");
        return;
      }

      setPromoApplied({
        kode: promoCode.trim().toUpperCase(),
        diskon: data.data!.diskon,
        finalAmount: data.data!.totalAmount,
      });
    } catch {
      setPromoError("Gagal memvalidasi kode promo");
    } finally {
      setIsApplyingPromo(false);
    }
  }

  function handleRemovePromo() {
    setPromoApplied(null);
    setPromoCode("");
    setPromoError("");
  }

  async function handleCheckout() {
    setIsProcessing(true);
    setError("");

    try {
      // Muat Midtrans Snap script jika belum ada
      await loadSnapScript();

      const res = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          promoCode: promoApplied?.kode,
        }),
      });

      const data = (await res.json()) as {
        success: boolean;
        error?: string;
        data?: { snapToken: string; orderId: string };
      };

      if (!res.ok || !data.success || !data.data?.snapToken) {
        setError(data.error ?? "Gagal membuat transaksi");
        setIsProcessing(false);
        return;
      }

      const { snapToken, orderId } = data.data;

      // Buka Midtrans Snap popup
      window.snap!.pay(snapToken, {
        onSuccess(result) {
          console.info("Payment success:", result);
          if (onSuccess) {
            onSuccess(orderId);
          } else {
            router.push(`/riwayat?status=success&order=${orderId}`);
          }
        },
        onPending(result) {
          console.info("Payment pending:", result);
          router.push(`/riwayat?status=pending&order=${orderId}`);
        },
        onError(result) {
          console.error("Payment error:", result);
          setError("Pembayaran gagal. Silakan coba lagi.");
          setIsProcessing(false);
        },
        onClose() {
          // User menutup popup tanpa menyelesaikan pembayaran
          setIsProcessing(false);
        },
      });
    } catch (err) {
      console.error("Checkout error:", err);
      setError("Terjadi kesalahan. Silakan coba lagi.");
      setIsProcessing(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* Daftar item */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Ringkasan Pesanan
          </h3>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {items.map((item) => (
            <div key={item.id} className="px-5 py-3 flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {item.nama}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {item.tipe === "PAKET_TRYOUT"
                    ? "Paket Tryout"
                    : item.tipe === "KELAS"
                      ? "Kelas"
                      : "Langganan"}
                </p>
              </div>
              <span className="text-sm font-semibold text-gray-900 dark:text-white flex-shrink-0">
                {item.harga === 0
                  ? "Gratis"
                  : `Rp ${item.harga.toLocaleString("id-ID")}`}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Kode promo */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Kode Promo
        </h3>

        {promoApplied ? (
          <div className="flex items-center justify-between bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg px-4 py-2.5">
            <div>
              <span className="text-sm font-semibold text-green-700 dark:text-green-300">
                {promoApplied.kode}
              </span>
              <span className="text-xs text-green-600 dark:text-green-400 ml-2">
                Hemat Rp {promoApplied.diskon.toLocaleString("id-ID")}
              </span>
            </div>
            <button
              onClick={handleRemovePromo}
              className="text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium"
              aria-label="Hapus kode promo"
            >
              Hapus
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              value={promoCode}
              onChange={(e) => {
                setPromoCode(e.target.value.toUpperCase());
                setPromoError("");
              }}
              onKeyDown={(e) => e.key === "Enter" && handleApplyPromo()}
              placeholder="Masukkan kode promo"
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase placeholder:normal-case"
              disabled={isApplyingPromo}
              aria-label="Kode promo"
            />
            <button
              onClick={handleApplyPromo}
              disabled={!promoCode.trim() || isApplyingPromo}
              className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-sm font-medium hover:bg-gray-700 dark:hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isApplyingPromo ? "..." : "Terapkan"}
            </button>
          </div>
        )}

        {promoError && (
          <p className="text-xs text-red-500 dark:text-red-400" role="alert">
            {promoError}
          </p>
        )}
      </div>

      {/* Ringkasan harga */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 space-y-2">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>Subtotal</span>
          <span>Rp {subtotal.toLocaleString("id-ID")}</span>
        </div>
        {diskon > 0 && (
          <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
            <span>Diskon Promo</span>
            <span>- Rp {diskon.toLocaleString("id-ID")}</span>
          </div>
        )}
        <div className="border-t border-gray-100 dark:border-gray-800 pt-2 flex justify-between font-bold text-gray-900 dark:text-white">
          <span>Total</span>
          <span>Rp {totalAmount.toLocaleString("id-ID")}</span>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div
          className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3 text-sm text-red-600 dark:text-red-400"
          role="alert"
        >
          {error}
        </div>
      )}

      {/* Tombol bayar */}
      <button
        onClick={handleCheckout}
        disabled={isProcessing || items.length === 0}
        className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-semibold text-base hover:bg-blue-700 active:bg-blue-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        aria-busy={isProcessing}
      >
        {isProcessing ? (
          <>
            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden="true" />
            Memproses...
          </>
        ) : (
          <>
            🔒 Bayar Rp {totalAmount.toLocaleString("id-ID")}
          </>
        )}
      </button>

      <p className="text-xs text-center text-gray-400 dark:text-gray-500">
        Pembayaran diproses secara aman oleh Midtrans. Kami tidak menyimpan data kartu Anda.
      </p>
    </div>
  );
}

/** Muat Midtrans Snap.js secara dinamis */
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
      // Script sudah ada, tunggu sampai snap tersedia
      const interval = setInterval(() => {
        if (window.snap) {
          clearInterval(interval);
          resolve();
        }
      }, 100);
      setTimeout(() => {
        clearInterval(interval);
        reject(new Error("Midtrans Snap timeout - script loaded but window.snap not ready"));
      }, 10000);
      return;
    }

    const script = document.createElement("script");
    script.src = snapUrl;
    script.setAttribute("data-client-key", clientKey);

    script.onload = () => {
      // Tunggu window.snap tersedia setelah script load
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

    script.onerror = () => reject(new Error("Gagal memuat Midtrans Snap - network error or CSP block"));
    document.head.appendChild(script);
  });
}
