import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteParams = { params: Promise<{ orderId: string }> };

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Tidak terautentikasi" }, { status: 401 });
  }

  const { orderId } = await params;

  const transaction = await prisma.transaction.findUnique({
    where: { orderId },
    include: {
      items: {
        select: {
          id: true,
          tipe: true,
          nama: true,
          harga: true,
        },
      },
    },
  });

  if (!transaction) {
    return NextResponse.json({ success: false, error: "Transaksi tidak ditemukan" }, { status: 404 });
  }

  // Hanya owner yang bisa lihat
  if (transaction.userId !== session.user.id) {
    return NextResponse.json({ success: false, error: "Akses ditolak" }, { status: 403 });
  }

  // Extract snapToken from gatewayResponse
  const snapToken = transaction.gatewayResponse
    ? (transaction.gatewayResponse as { token?: string }).token
    : null;

  return NextResponse.json({
    success: true,
    data: {
      orderId: transaction.orderId,
      totalAmount: Number(transaction.totalAmount),
      status: transaction.status,
      snapToken,
      items: transaction.items.map((item) => ({
        nama: item.nama,
        harga: Number(item.harga),
        tipe: item.tipe,
      })),
    },
  });
}
