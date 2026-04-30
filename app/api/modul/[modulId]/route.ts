import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateModulSchema = z.object({
  kelasId: z.string().min(1).optional(),
  judul: z.string().min(3).optional(),
  deskripsi: z.string().optional().nullable(),
  urutan: z.number().int().min(1).optional(),
  isLocked: z.boolean().optional(),
  isKuisAktif: z.boolean().optional(),
});

type RouteParams = { params: Promise<{ modulId: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Tidak terautentikasi" }, { status: 401 });
  }

  const { modulId } = await params;

  const modul = await prisma.modul.findUnique({
    where: { id: modulId },
    include: {
      konten: { orderBy: { urutan: "asc" } },
      kelas: { select: { id: true, slug: true, judul: true, instrukturId: true } },
    },
  });

  if (!modul) {
    return NextResponse.json({ success: false, error: "Modul tidak ditemukan" }, { status: 404 });
  }

  // Cek akses
  const kelas = modul.kelas;
  if (kelas.instrukturId !== session.user.id && session.user.role !== "ADMIN") {
    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_kelasId: { userId: session.user.id, kelasId: kelas.id } },
    });
    const kelasData = await prisma.kelas.findUnique({
      where: { id: kelas.id },
      select: { modelAkses: true },
    });

    if (kelasData?.modelAkses !== "GRATIS" && !enrollment) {
      return NextResponse.json({ success: false, error: "Akses ditolak", code: "ACCESS_DENIED" }, { status: 403 });
    }
  }

  // Cek apakah modul terkunci (modul sebelumnya belum selesai)
  if (modul.isLocked && modul.urutan > 1) {
    const prevModul = await prisma.modul.findFirst({
      where: { kelasId: modul.kelasId, urutan: modul.urutan - 1 },
    });

    if (prevModul) {
      const prevProgress = await prisma.videoProgress.findUnique({
        where: { userId_modulId: { userId: session.user.id, modulId: prevModul.id } },
      });

      if (!prevProgress?.isSelesai) {
        return NextResponse.json(
          { success: false, error: "Selesaikan modul sebelumnya terlebih dahulu", code: "MODULE_LOCKED" },
          { status: 403 }
        );
      }
    }
  }

  // Ambil modul prev/next untuk navigasi
  const [prevModul, nextModul] = await Promise.all([
    prisma.modul.findFirst({
      where: { kelasId: modul.kelasId, urutan: modul.urutan - 1 },
      select: { id: true },
    }),
    prisma.modul.findFirst({
      where: { kelasId: modul.kelasId, urutan: modul.urutan + 1 },
      select: { id: true },
    }),
  ]);

  return NextResponse.json({
    success: true,
    data: {
      ...modul,
      prevModulId: prevModul?.id ?? null,
      nextModulId: nextModul?.id ?? null,
    },
  });
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: "Tidak terautentikasi" },
      { status: 401 }
    );
  }
  if (session.user.role === "PESERTA") {
    return NextResponse.json(
      { success: false, error: "Akses ditolak" },
      { status: 403 }
    );
  }

  const { modulId } = await params;

  try {
    const body = await request.json();
    const validation = updateModulSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Data tidak valid",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 422 }
      );
    }

    const modul = await prisma.modul.update({
      where: { id: modulId },
      data: validation.data,
      include: {
        kelas: {
          select: {
            id: true,
            judul: true,
            kategori: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: modul });
  } catch (error: unknown) {
    console.error("Update modul error:", error);

    // Check unique constraint violation
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Urutan modul sudah ada di kelas ini. Gunakan urutan lain.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: "Tidak terautentikasi" },
      { status: 401 }
    );
  }
  if (session.user.role !== "ADMIN") {
    return NextResponse.json(
      { success: false, error: "Hanya Admin yang dapat menghapus modul" },
      { status: 403 }
    );
  }

  const { modulId } = await params;

  try {
    await prisma.modul.delete({
      where: { id: modulId },
    });

    return NextResponse.json({
      success: true,
      data: { message: "Modul berhasil dihapus" },
    });
  } catch (error) {
    console.error("Delete modul error:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
