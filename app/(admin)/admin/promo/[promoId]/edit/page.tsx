import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { PromoForm } from "../../promo-form";

export const metadata = { title: "Edit Kode Promo" };

export default async function EditPromoPage({
  params,
}: {
  params: Promise<{ promoId: string }>;
}) {
  await auth();
  const { promoId } = await params;

  const promo = await prisma.promoCode.findUnique({ where: { id: promoId } });
  if (!promo) notFound();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <a
          href="/admin/promo"
          className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1 mb-4"
        >
          ← Kembali ke Daftar Promo
        </a>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Kode Promo</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Perbarui konfigurasi kode promo{" "}
          <span className="font-mono font-semibold text-gray-700 dark:text-gray-300">
            {promo.kode}
          </span>
        </p>
      </div>
      <PromoForm
        mode="edit"
        promoId={promo.id}
        defaultValues={{
          kode: promo.kode,
          deskripsi: promo.deskripsi ?? "",
          tipeDiskon: promo.tipeDiskon as "PERSEN" | "NOMINAL",
          nilaiDiskon: Number(promo.nilaiDiskon),
          batasUse: promo.batasUse ?? undefined,
          expiredAt: promo.expiredAt
            ? promo.expiredAt.toISOString().slice(0, 16)
            : "",
          isActive: promo.isActive,
        }}
      />
    </div>
  );
}
