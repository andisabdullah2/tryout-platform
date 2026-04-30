"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { getPusherClient } from "@/lib/realtime/pusher";

interface Notification {
  id: string;
  judul: string;
  pesan: string;
  tipe: string;
  isRead: boolean;
  createdAt: string;
}

export function NotificationBell({ userId }: { userId?: string }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchNotifications();

    // Setup Pusher real-time listener
    if (userId) {
      try {
        const pusher = getPusherClient();
        const channel = pusher.subscribe(`private-user-${userId}`);

        channel.bind("notification", (data: Notification) => {
          setNotifications((prev) => [data, ...prev].slice(0, 5));
          setUnreadCount((prev) => prev + 1);
        });

        return () => {
          channel.unbind("notification");
          pusher.unsubscribe(`private-user-${userId}`);
        };
      } catch (error) {
        console.error("Pusher setup error:", error);
      }
    }
  }, [userId]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function fetchNotifications() {
    try {
      const res = await fetch("/api/notifikasi?limit=5");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.data?.items ?? []);
        setUnreadCount(data.data?.unreadCount ?? 0);
      }
    } catch {
      // silent fail
    }
  }

  async function markAsRead(id: string) {
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
    try {
      await fetch("/api/notifikasi", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // silent fail
    }
  }

  const tipeIcon: Record<string, string> = {
    TRYOUT_RESULT: "📊",
    LIVE_CLASS_REMINDER: "📡",
    PAYMENT_SUCCESS: "✅",
    PAYMENT_FAILED: "❌",
    SUBSCRIPTION_EXPIRING: "⚠️",
    NEW_CONTENT: "🆕",
    SYSTEM: "🔔",
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800 transition-colors"
        aria-label={`Notifikasi${unreadCount > 0 ? `, ${unreadCount} belum dibaca` : ""}`}
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
              Notifikasi
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                Tandai semua dibaca
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-400 text-sm">
                Tidak ada notifikasi
              </div>
            ) : (
              notifications.map((notif) => (
                <button
                  key={notif.id}
                  onClick={() => markAsRead(notif.id)}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-50 dark:border-gray-800 last:border-0 ${
                    !notif.isRead ? "bg-blue-50/50 dark:bg-blue-950/20" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-lg flex-shrink-0 mt-0.5">
                      {tipeIcon[notif.tipe] ?? "🔔"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {notif.judul}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                        {notif.pesan}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(notif.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    {!notif.isRead && (
                      <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />
                    )}
                  </div>
                </button>
              ))
            )}
          </div>

          <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-800">
            <Link
              href="/notifikasi"
              onClick={() => setIsOpen(false)}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              Lihat semua notifikasi →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
