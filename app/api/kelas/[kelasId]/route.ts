import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateKelasSchema = z.object({
  judul: z.string().min(5).optional(),
  deskripsi: z.string().min(10).optional(),
  thumbnailUrl: z.string().url().optional().nullable(),
  harga: z.number().min(0).optional(),
  modelAkses: z.enum(["GRATIS", "BERBAYAR", "LANGGANAN"]).optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
});

type RouteParams = { params: Promise<{ kelasId: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { kelasId } = await params;
  const session = await auth();

  const kelas = await prisma.kelas.findUnique({
    where: { id: kelasId },
    include: {
      modul: {
        include: {
          konten: { orderBy: { urutan: "asc" } },
          videoProgress: session?.user?.id
            ? { where: { userId: session.user.id } }
            : false,
        },
        orderBy: { urutan: "asc" },
      },
      _count: { select: { enrollments: true } },
    },
  });

  if (!kelas) {
    return NextResponse.json({ success: false, error: "Kelas tidak ditemukan" }, { status: 404 });
  }

  if (session?.user?.role === "PESERTA" && kelas.status !== "PUBLISHED") {
    return NextResponse.json({ success: false, error: "Kelas tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: kelas });
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Tidak terautentikasi" }, { status: 401 });
  }
  if (session.user.role === "PESERTA") {
    return NextResponse.json({ success: false, error: "Akses ditolak" }, { status: 403 });
  }

  const { kelasId } = await params;

  try {
    const body = await request.json();
    const validation = updateKelasSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: "Data tidak valid", details: validation.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const kelas = await prisma.kelas.update({
      where: { id: kelasId },
      data: validation.data,
    });

    return NextResponse.json({ success: true, data: kelas });
  } catch (error) {
    console.error("Update kelas error:", error);
    return NextResponse.json({ success: false, error: "Terjadi kesalahan server" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Tidak terautentikasi" }, { status: 401 });
  }
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Hanya Admin yang dapat menghapus kelas" }, { status: 403 });
  }

  const { kelasId } = await params;

  await prisma.kelas.update({
    where: { id: kelasId },
    data: { status: "ARCHIVED" },
  });

  return NextResponse.json({ success: true, data: { message: "Kelas berhasil diarsipkan" } });
}
