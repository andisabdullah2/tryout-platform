import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createModulSchema = z.object({
  kelasId: z.string().min(1, "Kelas wajib dipilih"),
  judul: z.string().min(3, "Judul minimal 3 karakter"),
  deskripsi: z.string().optional().nullable(),
  urutan: z.number().int().min(1),
  isLocked: z.boolean().default(false),
  isKuisAktif: z.boolean().default(false),
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const kelasId = searchParams.get("kelasId");
  const q = searchParams.get("q");

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: "Tidak terautentikasi" },
      { status: 401 }
    );
  }

  const where = {
    ...(kelasId && { kelasId }),
    ...(q && { judul: { contains: q, mode: "insensitive" as const } }),
  };

  try {
    const items = await prisma.modul.findMany({
      where,
      select: {
        id: true,
        kelasId: true,
        judul: true,
        deskripsi: true,
        urutan: true,
        isLocked: true,
        isKuisAktif: true,
        createdAt: true,
        kelas: {
          select: {
            id: true,
            judul: true,
            slug: true,
            kategori: true,
          },
        },
        _count: {
          select: {
            konten: true,
            videoProgress: true,
          },
        },
      },
      orderBy: [{ kelas: { judul: "asc" } }, { urutan: "asc" }],
    });

    return NextResponse.json({
      success: true,
      data: items,
    });
  } catch (error) {
    console.error("GET modul error:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

  try {
    const body = await request.json();
    const validation = createModulSchema.safeParse(body);

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

    const modul = await prisma.modul.create({
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

    return NextResponse.json({ success: true, data: modul }, { status: 201 });
  } catch (error: unknown) {
    console.error("Create modul error:", error);

    // Check unique constraint violation (kelasId + urutan)
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
