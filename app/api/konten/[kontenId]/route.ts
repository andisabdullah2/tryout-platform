import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateKontenSchema = z.object({
  tipe: z.enum(["TEKS", "PDF", "VIDEO", "LINK_EKSTERNAL"]).optional(),
  judul: z.string().min(3).optional(),
  konten: z.string().optional().nullable(),
  fileUrl: z.string().url().optional().nullable(),
  linkUrl: z.string().url().optional().nullable(),
  durasi: z.number().int().optional().nullable(),
  urutan: z.number().int().min(1).optional(),
  muxAssetId: z.string().optional().nullable(),
  muxPlaybackId: z.string().optional().nullable(),
});

type RouteParams = { params: Promise<{ kontenId: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { kontenId } = await params;

  try {
    const konten = await prisma.kontenModul.findUnique({
      where: { id: kontenId },
      include: {
        modul: {
          select: {
            id: true,
            judul: true,
            kelas: {
              select: {
                id: true,
                judul: true,
              },
            },
          },
        },
      },
    });

    if (!konten) {
      return NextResponse.json(
        { success: false, error: "Konten tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: konten });
  } catch (error) {
    console.error("GET konten error:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
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

  const { kontenId } = await params;

  try {
    const body = await request.json();
    const validation = updateKontenSchema.safeParse(body);

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

    const konten = await prisma.kontenModul.update({
      where: { id: kontenId },
      data: validation.data,
    });

    return NextResponse.json({ success: true, data: konten });
  } catch (error) {
    console.error("Update konten error:", error);
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
      { success: false, error: "Hanya Admin yang dapat menghapus konten" },
      { status: 403 }
    );
  }

  const { kontenId } = await params;

  try {
    await prisma.kontenModul.delete({
      where: { id: kontenId },
    });

    return NextResponse.json({
      success: true,
      data: { message: "Konten berhasil dihapus" },
    });
  } catch (error) {
    console.error("Delete konten error:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
