import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

type RouteParams = { params: Promise<{ bundelId: string }> };

const updateSchema = z.object({
  judul: z.string().min(5).optional(),
  deskripsi: z.string().min(10).optional(),
  harga: z.number().min(0).optional(),
  thumbnailUrl: z.string().url().optional().nullable(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
  paketIds: z.array(z.string()).min(1).optional(),
});

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { bundelId } = await params;
  const session = await auth();

  const bundel = await prisma.bundelTryout.findUnique({
    where: { id: bundelId },
    include: {
      paket: {
        include: {
          paket: {
            select: {
              id: true,
              slug: true,
              judul: true,
              deskripsi: true,
              durasi: true,
              totalSoal: true,
              kategori: true,
              passingGrade: true,
              thumbnailUrl: true,
            },
          },
        },
        orderBy: { urutan: "asc" },
      },
      _count: { select: { transaksiItem: true } },
    },
  });

  if (!bundel) {
    return NextResponse.json({ success: false, error: "Bundel tidak ditemukan" }, { status: 404 });
  }

  const isAdminOrInstruktur =
    session?.user?.role === "ADMIN" || session?.user?.role === "INSTRUKTUR";

  if (!isAdminOrInstruktur && bundel.status !== "PUBLISHED") {
    return NextResponse.json({ success: false, error: "Bundel tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: bundel });
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id || session.user.role === "PESERTA") {
    return NextResponse.json({ success: false, error: "Akses ditolak" }, { status: 403 });
  }

  const { bundelId } = await params;
  const body = await request.json();
  const validation = updateSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json({ success: false, error: "Data tidak valid" }, { status: 422 });
  }

  const { paketIds, ...updateData } = validation.data;

  const bundel = await prisma.bundelTryout.update({
    where: { id: bundelId },
    data: {
      ...updateData,
      ...(paketIds && {
        paket: {
          deleteMany: {},
          create: paketIds.map((paketId, i) => ({ paketId, urutan: i + 1 })),
        },
      }),
    },
    include: {
      paket: { include: { paket: { select: { id: true, judul: true } } } },
    },
  });

  return NextResponse.json({ success: true, data: bundel });
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Akses ditolak" }, { status: 403 });
  }

  const { bundelId } = await params;
  await prisma.bundelTryout.update({
    where: { id: bundelId },
    data: { status: "ARCHIVED" },
  });

  return NextResponse.json({ success: true });
}
