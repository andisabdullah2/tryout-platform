import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteParams = { params: Promise<{ kelasId: string }> };

export async function POST(_request: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Tidak terautentikasi" }, { status: 401 });
  }

  const { kelasId } = await params;
  const userId = session.user.id;

  const kelas = await prisma.kelas.findUnique({
    where: { id: kelasId, status: "PUBLISHED" },
  });

  if (!kelas) {
    return NextResponse.json({ success: false, error: "Kelas tidak ditemukan" }, { status: 404 });
  }

  // Validasi akses untuk kelas berbayar
  if (kelas.modelAkses !== "GRATIS") {
    const [transaksi, langganan] = await Promise.all([
      prisma.transactionItem.findFirst({
        where: { kelasId, transaction: { userId, status: "SUCCESS" } },
      }),
      prisma.subscription.findFirst({
        where: { userId, isActive: true, endDate: { gt: new Date() } },
      }),
    ]);

    const hasAccess = !!(transaksi || (langganan && kelas.modelAkses === "LANGGANAN"));
    if (!hasAccess) {
      return NextResponse.json(
        { success: false, error: "Anda tidak memiliki akses ke kelas ini", code: "ACCESS_DENIED" },
        { status: 403 }
      );
    }
  }

  // Cek apakah sudah terdaftar
  const existing = await prisma.enrollment.findUnique({
    where: { userId_kelasId: { userId, kelasId } },
  });

  if (existing) {
    return NextResponse.json({
      success: true,
      data: { message: "Sudah terdaftar di kelas ini", enrollment: existing },
    });
  }

  const enrollment = await prisma.enrollment.create({
    data: { userId, kelasId },
  });

  return NextResponse.json({ success: true, data: enrollment }, { status: 201 });
}
