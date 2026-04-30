import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  paketId: z.string().optional(),
  bundelId: z.string().optional(),
}).refine((d) => d.paketId || d.bundelId, { message: "paketId atau bundelId diperlukan" });

export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Tidak terautentikasi" }, { status: 401 });
  }

  const body = await request.json();
  const validation = schema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json({ error: "paketId atau bundelId diperlukan" }, { status: 422 });
  }

  const userId = session.user.id;
  const orderId = `MOCK-${Date.now()}`;

  if (validation.data.bundelId) {
    const bundelId = validation.data.bundelId;

    const bundel = await prisma.bundelTryout.findUnique({
      where: { id: bundelId },
      select: { id: true, judul: true, harga: true },
    });
    if (!bundel) return NextResponse.json({ error: "Bundel tidak ditemukan" }, { status: 404 });

    const sudahBeli = await prisma.transactionItem.findFirst({
      where: { bundelId, transaction: { userId, status: "SUCCESS" } },
    });
    if (sudahBeli) return NextResponse.json({ success: true, message: "Sudah memiliki akses", alreadyOwned: true });

    await prisma.transaction.create({
      data: {
        userId, orderId,
        totalAmount: bundel.harga,
        status: "SUCCESS",
        gateway: "mock",
        metode: "TRANSFER_BANK",
        gatewayTxId: orderId,
        paidAt: new Date(),
        expiredAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        items: {
          create: [{ tipe: "BUNDEL", bundelId, nama: bundel.judul, harga: bundel.harga }],
        },
      },
    });

    await prisma.notification.create({
      data: {
        userId, tipe: "PAYMENT_SUCCESS",
        judul: "Pembayaran Berhasil (Dev)",
        pesan: `Akses ke bundel "${bundel.judul}" telah diaktifkan`,
        data: { orderId, bundelId },
      },
    });

    return NextResponse.json({ success: true, message: `Akses ke bundel "${bundel.judul}" berhasil diaktifkan`, orderId });
  }

  // Single paket
  const paketId = validation.data.paketId!;
  const paket = await prisma.paketTryout.findUnique({
    where: { id: paketId },
    select: { id: true, judul: true, harga: true },
  });
  if (!paket) return NextResponse.json({ error: "Paket tidak ditemukan" }, { status: 404 });

  const sudahBeli = await prisma.transactionItem.findFirst({
    where: { paketId, transaction: { userId, status: "SUCCESS" } },
  });
  if (sudahBeli) return NextResponse.json({ success: true, message: "Sudah memiliki akses", alreadyOwned: true });

  await prisma.transaction.create({
    data: {
      userId, orderId,
      totalAmount: paket.harga,
      status: "SUCCESS",
      gateway: "mock",
      metode: "TRANSFER_BANK",
      gatewayTxId: orderId,
      paidAt: new Date(),
      expiredAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      items: {
        create: [{ tipe: "PAKET_TRYOUT", paketId, nama: paket.judul, harga: paket.harga }],
      },
    },
  });

  await prisma.notification.create({
    data: {
      userId, tipe: "PAYMENT_SUCCESS",
      judul: "Pembayaran Berhasil (Dev)",
      pesan: `Akses ke "${paket.judul}" telah diaktifkan`,
      data: { orderId, paketId },
    },
  });

  return NextResponse.json({ success: true, message: `Akses ke "${paket.judul}" berhasil diaktifkan`, orderId });
}

