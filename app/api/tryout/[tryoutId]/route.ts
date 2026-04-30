import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updatePaketSchema = z.object({
  judul: z.string().min(5).optional(),
  deskripsi: z.string().min(10).optional(),
  durasi: z.number().int().min(10).optional(),
  harga: z.number().min(0).optional(),
  modelAkses: z.enum(["GRATIS", "BERBAYAR", "LANGGANAN"]).optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
  thumbnailUrl: z.string().url().optional().nullable(),
  passingGrade: z.record(z.number()).optional().nullable(),
  konfigurasi: z.record(z.unknown()).optional().nullable(),
  subKategori: z.string().optional().nullable(),
});

type RouteParams = { params: Promise<{ tryoutId: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { tryoutId } = await params;

  const paket = await prisma.paketTryout.findUnique({
    where: { id: tryoutId },
    include: {
      soal: {
        include: {
          soal: {
            select: {
              id: true,
              konten: true,
              kategori: true,
              subtes: true,
              topik: true,
              tingkatKesulitan: true,
              tipe: true,
            },
          },
        },
        orderBy: { urutan: "asc" },
      },
      _count: { select: { sesi: true } },
    },
  });

  if (!paket) {
    return NextResponse.json({ success: false, error: "Paket tidak ditemukan" }, { status: 404 });
  }

  const session = await auth();
  // Peserta hanya bisa lihat paket PUBLISHED
  if (session?.user?.role === "PESERTA" && paket.status !== "PUBLISHED") {
    return NextResponse.json({ success: false, error: "Paket tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: paket });
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Tidak terautentikasi" }, { status: 401 });
  }
  if (session.user.role === "PESERTA") {
    return NextResponse.json({ success: false, error: "Akses ditolak" }, { status: 403 });
  }

  const { tryoutId } = await params;

  try {
    const body = await request.json();
    const validation = updatePaketSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: "Data tidak valid", details: validation.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const paket = await prisma.paketTryout.update({
      where: { id: tryoutId },
      data: {
        ...validation.data,
        passingGrade: validation.data.passingGrade as never ?? undefined,
        konfigurasi: validation.data.konfigurasi as never ?? undefined,
      },
    });

    return NextResponse.json({ success: true, data: paket });
  } catch (error) {
    console.error("Update paket error:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Tidak terautentikasi" }, { status: 401 });
  }
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Hanya Admin yang dapat menghapus paket" }, { status: 403 });
  }

  const { tryoutId } = await params;

  // Cek apakah ada sesi aktif
  const sesiAktif = await prisma.tryoutSession.count({
    where: { paketId: tryoutId, status: "ACTIVE" },
  });

  if (sesiAktif > 0) {
    return NextResponse.json(
      { success: false, error: "Tidak dapat menghapus paket yang memiliki sesi aktif" },
      { status: 409 }
    );
  }

  // Arsipkan paket (soft delete)
  await prisma.paketTryout.update({
    where: { id: tryoutId },
    data: { status: "ARCHIVED" },
  });

  return NextResponse.json({ success: true, data: { message: "Paket berhasil diarsipkan" } });
}
