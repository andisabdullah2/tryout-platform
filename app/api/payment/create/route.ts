import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { createSnapTransaction } from "@/lib/payment/midtrans";
import { applyPromoCode } from "@/lib/payment/promo";
import { nanoid } from "nanoid";
import { rateLimit } from "@/lib/security/rate-limit";

const createPaymentSchema = z.object({
  items: z.array(z.object({
    tipe: z.enum(["PAKET_TRYOUT", "KELAS", "LANGGANAN", "BUNDEL"]),
    id: z.string().min(1),
    nama: z.string().min(1),
    harga: z.number().min(0),
  })).min(1),
  promoCode: z.string().optional(),
  /** Jika true, hanya validasi promo tanpa membuat transaksi */
  dryRun: z.boolean().optional(),
});

export async function POST(request: NextRequest) {
  const limited = await rateLimit(request, "payment");
  if (limited) return limited;

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Tidak terautentikasi" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validation = createPaymentSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: "Data tidak valid", details: validation.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const { items, promoCode, dryRun } = validation.data;
    const userId = session.user.id;

    // Ambil data user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true, phone: true },
    });
    if (!user) {
      return NextResponse.json({ success: false, error: "User tidak ditemukan" }, { status: 404 });
    }

    // Hitung total
    const subtotal = items.reduce((sum, item) => sum + item.harga, 0);

    // Terapkan promo jika ada
    let promoResult = { valid: false, diskon: 0, finalAmount: subtotal, diskonDiterapkan: 0, promoId: undefined as string | undefined };
    if (promoCode) {
      promoResult = await applyPromoCode(promoCode, subtotal);
      if (!promoResult.valid) {
        return NextResponse.json({ success: false, error: promoResult.error }, { status: 422 });
      }
    }

    const totalAmount = promoResult.finalAmount;

    // Mode dry-run: hanya validasi promo, tidak buat transaksi
    if (dryRun) {
      return NextResponse.json({
        success: true,
        data: {
          diskon: promoResult.diskonDiterapkan,
          totalAmount,
        },
      });
    }

    const timestamp = new Date().getTime();
    const orderId = `TRX-${timestamp}-${nanoid(5).toUpperCase()}`;

    // Buat transaksi di database
    const transaction = await prisma.transaction.create({
      data: {
        userId,
        orderId,
        totalAmount,
        gateway: "midtrans",
        diskon: promoResult.diskonDiterapkan,
        promoId: promoResult.promoId ?? null,
        expiredAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        items: {
          create: items.map((item) => ({
            tipe: item.tipe,
            nama: item.nama,
            harga: item.harga,
            ...(item.tipe === "PAKET_TRYOUT" && { paketId: item.id }),
            ...(item.tipe === "KELAS" && { kelasId: item.id }),
            ...(item.tipe === "BUNDEL" && { bundelId: item.id }),
          })),
        },
      },
    });

    // Siapkan item untuk Midtrans
    const snapItems = items.map((item) => ({
      id: item.id,
      name: item.nama.substring(0, 50),
      price: item.harga,
      quantity: 1,
    }));

    // Tambahkan diskon sebagai item negatif jika ada
    if (promoResult.diskonDiterapkan > 0) {
      snapItems.push({
        id: "PROMO",
        name: `Diskon: ${promoCode}`,
        price: -promoResult.diskonDiterapkan,
        quantity: 1,
      });
    }

    // Buat Midtrans Snap transaction
    const snapResult = await createSnapTransaction({
      orderId,
      amount: totalAmount,
      customer: { name: user.name, email: user.email, phone: user.phone ?? undefined },
      items: snapItems,
    }) as { token: string; redirect_url: string };

    // Update transaction dengan gateway response
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: { gatewayResponse: snapResult as Record<string, unknown> },
    });

    return NextResponse.json({
      success: true,
      data: {
        orderId,
        snapToken: snapResult.token,
        paymentUrl: snapResult.redirect_url,
        totalAmount,
        diskon: promoResult.diskonDiterapkan,
      },
    });
  } catch (error) {
    console.error("Create payment error:", error);
    return NextResponse.json({ success: false, error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
