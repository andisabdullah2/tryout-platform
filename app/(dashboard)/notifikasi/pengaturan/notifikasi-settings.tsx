"use client";

import { useState } from "react";

interface NotifPreference {
  key: string;
  label: string;
  description: string;
  icon: string;
  defaultEnabled: boolean;
}

const NOTIF_PREFERENCES: NotifPreference[] = [
  {
    key: "tryout_result",
    label: "Hasil Tryout",
    description: "Notifikasi saat hasil tryout tersedia setelah sesi selesai",
    icon: "📊",
    defaultEnabled: true,
  },
  {
    key: "live_class_reminder",
    label: "Pengingat Live Class",
    description: "Pengingat 24 jam sebelum live class dimulai",
    icon: "📡",
    defaultEnabled: true,
  },
  {
    key: "payment",
    label: "Status Pembayaran",
    description: "Notifikasi saat pembayaran berhasil atau gagal",
    icon: "💳",
    defaultEnabled: true,
  },
  {
    key: "subscription_expiring",
    label: "Langganan Akan Berakhir",
    description: "Pengingat 7 hari sebelum langganan berakhir",
    icon: "⚠️",
    defaultEnabled: true,
  },
  {
    key: "new_content",
    label: "Konten Baru",
    description: "Notifikasi saat ada paket tryout atau kelas baru yang relevan",
    icon: "🆕",
    defaultEnabled: false,
  },
  {
    key: "system",
    label: "Notifikasi Sistem",
    description: "Pengumuman dan informasi penting dari platform",
    icon: "🔔",
    defaultEnabled: true,
  },
];

export function NotifikasiSettings() {
  // Baca preferensi dari localStorage (persisted client-side)
  const [preferences, setPreferences] = useState<Record<string, boolean>>(() => {
    if (typeof window === "undefined") {
      return Object.fromEntries(
        NOTIF_PREFERENCES.map((p) => [p.key, p.defaultEnabled])
      );
    }
    try {
      const saved = localStorage.getItem("notif_preferences");
      if (saved) return JSON.parse(saved) as Record<string, boolean>;
    } catch {
      // ignore
    }
    return Object.fromEntries(
      NOTIF_PREFERENCES.map((p) => [p.key, p.defaultEnabled])
    );
  });

  const [saved, setSaved] = useState(false);

  function togglePreference(key: string) {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
    setSaved(false);
  }

  function savePreferences() {
    try {
      localStorage.setItem("notif_preferences", JSON.stringify(preferences));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      // ignore
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden divide-y divide-gray-100 dark:divide-gray-800">
        {NOTIF_PREFERENCES.map((pref) => (
          <div key={pref.key} className="px-5 py-4 flex items-center gap-4">
            <span className="text-2xl flex-shrink-0">{pref.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {pref.label}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {pref.description}
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={preferences[pref.key] ?? pref.defaultEnabled}
              onClick={() => togglePreference(pref.key)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex-shrink-0 ${
                (preferences[pref.key] ?? pref.defaultEnabled)
                  ? "bg-blue-600"
                  : "bg-gray-300 dark:bg-gray-600"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  (preferences[pref.key] ?? pref.defaultEnabled)
                    ? "translate-x-6"
                    : "translate-x-1"
                }`}
              />
            </button>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={savePreferences}
          className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
        >
          Simpan Pengaturan
        </button>
        {saved && (
          <span className="text-sm text-green-600 dark:text-green-400 font-medium">
            ✓ Tersimpan
          </span>
        )}
      </div>

      <p className="text-xs text-gray-400 dark:text-gray-500">
        Pengaturan notifikasi disimpan di perangkat ini. Notifikasi penting seperti
        pembayaran dan keamanan akun tidak dapat dinonaktifkan.
      </p>
    </div>
  );
}
