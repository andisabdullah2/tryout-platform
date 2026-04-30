import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import { NotifikasiSettings } from "./notifikasi-settings";

export const metadata = { title: "Pengaturan Notifikasi" };

export default async function PengaturanNotifikasiPage() {
  const session = await auth();
  if (!session?.user?.id) notFound();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <a
          href="/notifikasi"
          className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1 mb-4"
        >
          ← Kembali ke Notifikasi
        </a>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Pengaturan Notifikasi
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Pilih jenis notifikasi yang ingin kamu terima
        </p>
      </div>

      <NotifikasiSettings />
    </div>
  );
}
