"use client";

import { useState } from "react";

interface NotifItem {
  id: string;
  judul: string;
  pesan: string;
  tipe: string;
  isRead: boolean;
  createdAt: string;
  data: Record<string, unknown> | null;
}

interface NotifikasiListProps {
  initialNotifications: NotifItem[];
  initialUnreadCount: number;
}

const TIPE_ICON: Record<string, string> = {
  TRYOUT_RESULT: "📊",
  LIVE_CLASS_REMINDER: "📡",
  PAYMENT_SUCCESS: "✅",
  PAYMENT_FAILED: "❌",
  SUBSCRIPTION_EXPIRING: "⚠️",
  NEW_CONTENT: "🆕",
  SYSTEM: "🔔",
};

const TIPE_LABEL: Record<string, string> = {
  TRYOUT_RESULT: "Hasil Tryout",
  LIVE_CLASS_REMINDER: "Live Class",
  PAYMENT_SUCCESS: "Pembayaran",
  PAYMENT_FAILED: "Pembayaran",
  SUBSCRIPTION_EXPIRING: "Langganan",
  NEW_CONTENT: "Konten Baru",
  SYSTEM: "Sistem",
};

export function NotifikasiList({
  initialNotifications,
  initialUnreadCount,
}: NotifikasiListProps) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  async function markAsRead(id: string) {
    const notif = notifications.find((n) => n.id === id);
    if (!notif || notif.isRead) return;

    try {
      await fetch(`/api/notifikasi/${id}/read`, { method: "PATCH" });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // silent fail
    }
  }

  async function markAllAsRead() {
    if (unreadCount === 0) return;
    setIsMarkingAll(true);
    try {
      await fetch("/api/notifikasi", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } finally {
      setIsMarkingAll(false);
    }
  }

  if (notifications.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl py-16 text-center text-gray-400">
        <div className="text-4xl mb-3">🔔</div>
        <p>Belum ada notifikasi</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {unreadCount > 0 && (
        <div className="flex justify-end">
          <button
            onClick={markAllAsRead}
            disabled={isMarkingAll}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50"
          >
            {isMarkingAll ? "Memproses..." : "Tandai semua dibaca"}
          </button>
        </div>
      )}

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden divide-y divide-gray-100 dark:divide-gray-800">
        {notifications.map((notif) => (
          <button
            key={notif.id}
            onClick={() => markAsRead(notif.id)}
            className={`w-full text-left px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
              !notif.isRead ? "bg-blue-50/40 dark:bg-blue-950/20" : ""
            }`}
          >
            <div className="flex items-start gap-4">
              <span className="text-2xl flex-shrink-0 mt-0.5">
                {TIPE_ICON[notif.tipe] ?? "🔔"}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs text-gray-400 font-medium">
                    {TIPE_LABEL[notif.tipe] ?? notif.tipe}
                  </span>
                  {!notif.isRead && (
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                  )}
                </div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {notif.judul}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                  {notif.pesan}
                </p>
                <p className="text-xs text-gray-400 mt-1.5">
                  {new Date(notif.createdAt).toLocaleDateString("id-ID", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
