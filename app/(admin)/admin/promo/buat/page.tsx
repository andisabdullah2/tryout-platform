import { auth } from "@/lib/auth";
import { PromoForm } from "../promo-form";

export const metadata = { title: "Buat Kode Promo" };

export default async function BuatPromoPage() {
  await auth();
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <a
          href="/admin/promo"
          className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1 mb-4"
        >
          ← Kembali ke Daftar Promo
        </a>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Buat Kode Promo</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Buat kode diskon baru untuk peserta
        </p>
      </div>
      <PromoForm mode="create" />
    </div>
  );
}
