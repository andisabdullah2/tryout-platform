import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import type { Prisma } from "@prisma/client";

const createPromoSchema = z.object({
  kode: z
    .string()
    .min(3, "Kode minimal 3 karakter")
    .max(20, "Kode maksimal 20 karakter")
    .regex(/^[A-Z0-9_-]+$/, "Kode hanya boleh huruf kapital, angka, - dan _"),
  deskripsi: z.string().optional(),
  tipeDiskon: z.enum(["PERSEN", "NOMINAL"]),
  nilaiDiskon: z.number().positive("Nilai diskon harus positif"),
  batasUse: z.number().int().positive().nullable().optional(),
  expiredAt: z.string().datetime().nullable().optional(),
  isActive: z.boolean().optional().default(true),
});

/** GET /api/promo — list semua kode promo (admin only) */
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Akses ditolak" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");
  const statusFilter = searchParams.get("status"); // "active" | "inactive" | "expired"
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = 20;
  const skip = (page - 1) * limit;

  const now = new Date();

  const where: Prisma.PromoCodeWhereInput = {
    ...(q && { kode: { contains: q.toUpperCase() } }),
    ...(statusFilter === "active" && { isActive: true, OR: [{ expiredAt: null }, { expiredAt: { gt: now } }] }),
    ...(statusFilter === "inactive" && { isActive: false }),
    ...(statusFilter === "expired" && { expiredAt: { lte: now } }),
  };

  const [promos, total] = await Promise.all([
    prisma.promoCode.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip,
    }),
    prisma.promoCode.count({ where }),
  ]);

  return NextResponse.json({
    success: true,
    data: promos,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  });
}

/** POST /api/promo — buat kode promo baru (admin only) */
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Akses ditolak" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const validation = createPromoSchema.safeParse({
      ...body,
      kode: (body.kode as string)?.toUpperCase(),
    });

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: "Data tidak valid", details: validation.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const data = validation.data;

    // Validasi nilai diskon persen tidak melebihi 100
    if (data.tipeDiskon === "PERSEN" && data.nilaiDiskon > 100) {
      return NextResponse.json(
        { success: false, error: "Diskon persen tidak boleh melebihi 100%" },
        { status: 422 }
      );
    }

    // Cek duplikat kode
    const existing = await prisma.promoCode.findUnique({ where: { kode: data.kode } });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "Kode promo sudah digunakan" },
        { status: 409 }
      );
    }

    const promo = await prisma.promoCode.create({
      data: {
        kode: data.kode,
        deskripsi: data.deskripsi,
        tipeDiskon: data.tipeDiskon,
        nilaiDiskon: data.nilaiDiskon,
        batasUse: data.batasUse ?? null,
        expiredAt: data.expiredAt ? new Date(data.expiredAt) : null,
        isActive: data.isActive,
      },
    });

    return NextResponse.json({ success: true, data: promo }, { status: 201 });
  } catch (error) {
    console.error("Create promo error:", error);
    return NextResponse.json({ success: false, error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
