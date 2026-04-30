import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createBundelSchema = z.object({
  judul: z.string().min(5),
  deskripsi: z.string().min(10),
  kategori: z.enum(["CPNS_SKD", "SEKDIN", "UTBK_SNBT"]),
  harga: z.number().min(0),
  thumbnailUrl: z.string().url().optional().nullable(),
  paketIds: z.array(z.string()).min(1, "Minimal 1 paket tryout"),
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const kategori = searchParams.get("kategori");
  const q = searchParams.get("q");
  const session = await auth();

  const isAdminOrInstruktur =
    session?.user?.role === "ADMIN" || session?.user?.role === "INSTRUKTUR";

  const where = {
    ...(!isAdminOrInstruktur && { status: "PUBLISHED" as const }),
    ...(kategori && { kategori: kategori as never }),
    ...(q && { judul: { contains: q, mode: "insensitive" as const } }),
  };

  const bundel = await prisma.bundelTryout.findMany({
    where,
    include: {
      paket: {
        include: {
          paket: {
            select: {
              id: true,
              slug: true,
              judul: true,
              durasi: true,
              totalSoal: true,
              kategori: true,
            },
          },
        },
        orderBy: { urutan: "asc" },
      },
      _count: { select: { transaksiItem: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ success: true, data: bundel });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || session.user.role === "PESERTA") {
    return NextResponse.json({ success: false, error: "Akses ditolak" }, { status: 403 });
  }

  const body = await request.json();
  const validation = createBundelSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(
      { success: false, error: "Data tidak valid", details: validation.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const { paketIds, ...bundelData } = validation.data;

  const baseSlug = bundelData.judul
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .substring(0, 50);
  const slug = `${baseSlug}-${Date.now()}`;

  const bundel = await prisma.bundelTryout.create({
    data: {
      ...bundelData,
      slug,
      createdById: session.user.id,
      paket: {
        create: paketIds.map((paketId, i) => ({ paketId, urutan: i + 1 })),
      },
    },
    include: {
      paket: { include: { paket: { select: { id: true, judul: true } } } },
    },
  });

  return NextResponse.json({ success: true, data: bundel }, { status: 201 });
}
