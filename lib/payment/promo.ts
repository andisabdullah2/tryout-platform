import { prisma } from "@/lib/prisma";

export interface PromoResult {
  valid: boolean;
  error?: string;
  diskon: number;
  finalAmount: number;
  diskonDiterapkan: number;
  promoId?: string;
}

/**
 * Validasi dan hitung diskon kode promo (Property 13)
 */
export async function applyPromoCode(
  kode: string,
  originalAmount: number
): Promise<PromoResult> {
  const promo = await prisma.promoCode.findUnique({
    where: { kode: kode.toUpperCase() },
  });

  if (!promo || !promo.isActive) {
    return { valid: false, error: "Kode promo tidak valid", diskon: 0, finalAmount: originalAmount, diskonDiterapkan: 0 };
  }

  if (promo.expiredAt && promo.expiredAt < new Date()) {
    return { valid: false, error: "Kode promo sudah kedaluwarsa", diskon: 0, finalAmount: originalAmount, diskonDiterapkan: 0 };
  }

  if (promo.batasUse !== null && promo.totalUsed >= promo.batasUse) {
    return { valid: false, error: "Kode promo sudah habis digunakan", diskon: 0, finalAmount: originalAmount, diskonDiterapkan: 0 };
  }

  const nilaiDiskon = Number(promo.nilaiDiskon);
  let diskonDiterapkan: number;
  let finalAmount: number;

  if (promo.tipeDiskon === "PERSEN") {
    diskonDiterapkan = Math.round(originalAmount * (nilaiDiskon / 100));
    finalAmount = Math.max(0, originalAmount - diskonDiterapkan);
  } else {
    // NOMINAL
    diskonDiterapkan = Math.min(nilaiDiskon, originalAmount);
    finalAmount = Math.max(0, originalAmount - diskonDiterapkan);
  }

  return {
    valid: true,
    diskon: nilaiDiskon,
    finalAmount,
    diskonDiterapkan,
    promoId: promo.id,
  };
}

/**
 * Fungsi murni untuk kalkulasi diskon (untuk property testing)
 */
export function applyPromoDiscount(
  harga: number,
  promo: { tipe: "PERSEN" | "NOMINAL"; nilai: number }
): { finalAmount: number; diskonDiterapkan: number } {
  if (promo.tipe === "NOMINAL") {
    const diskonDiterapkan = Math.min(promo.nilai, harga);
    return { finalAmount: Math.max(0, harga - diskonDiterapkan), diskonDiterapkan };
  } else {
    const diskonDiterapkan = Math.round(harga * (promo.nilai / 100));
    return { finalAmount: Math.max(0, harga - diskonDiterapkan), diskonDiterapkan };
  }
}
