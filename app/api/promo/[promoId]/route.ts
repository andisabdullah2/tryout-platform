import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updatePromoSchema = z.object({
  deskripsi: z.string().optional(),
  tipeDiskon: z.enum(["PERSEN", "NOMINAL"]).optional(),
  nilaiDiskon: z.number().positive().optional(),
  batasUse: z.number().int().positive().nullable().optional(),
  expiredAt: z.string().datetime().nullable().optional(),
  isActive: z.boolean().optional(),
});

/** GET /api/promo/[promoId] */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ promoId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Akses ditolak" }, { status: 403 });
  }

  const { promoId } = await params;
  const promo = await prisma.promoCode.findUnique({ where: { id: promoId } });
  if (!promo) {
    return NextResponse.json({ success: false, error: "Kode promo tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: promo });
}

/** PATCH /api/promo/[promoId] — update kode promo */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ promoId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Akses ditolak" }, { status: 403 });
  }

  const { promoId } = await params;

  try {
    const body = await request.json();
    const validation = updatePromoSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: "Data tidak valid", details: validation.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const data = validation.data;

    if (data.tipeDiskon === "PERSEN" && data.nilaiDiskon !== undefined && data.nilaiDiskon > 100) {
      return NextResponse.json(
        { success: false, error: "Diskon persen tidak boleh melebihi 100%" },
        { status: 422 }
      );
    }

    const promo = await prisma.promoCode.update({
      where: { id: promoId },
      data: {
        ...(data.deskripsi !== undefined && { deskripsi: data.deskripsi }),
        ...(data.tipeDiskon !== undefined && { tipeDiskon: data.tipeDiskon }),
        ...(data.nilaiDiskon !== undefined && { nilaiDiskon: data.nilaiDiskon }),
        ...(data.batasUse !== undefined && { batasUse: data.batasUse }),
        ...(data.expiredAt !== undefined && { expiredAt: data.expiredAt ? new Date(data.expiredAt) : null }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });

    return NextResponse.json({ success: true, data: promo });
  } catch (error) {
    console.error("Update promo error:", error);
    return NextResponse.json({ success: false, error: "Terjadi kesalahan server" }, { status: 500 });
  }
}

/** DELETE /api/promo/[promoId] */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ promoId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Akses ditolak" }, { status: 403 });
  }

  const { promoId } = await params;

  // Cek apakah promo sudah digunakan dalam transaksi
  const usageCount = await prisma.transaction.count({ where: { promoId } });
  if (usageCount > 0) {
    // Nonaktifkan saja, jangan hapus (menjaga integritas data transaksi)
    await prisma.promoCode.update({ where: { id: promoId }, data: { isActive: false } });
    return NextResponse.json({
      success: true,
      message: "Kode promo dinonaktifkan karena sudah digunakan dalam transaksi",
    });
  }

  await prisma.promoCode.delete({ where: { id: promoId } });
  return NextResponse.json({ success: true, message: "Kode promo dihapus" });
}
