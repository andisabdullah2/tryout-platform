import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import type { KategoriUjian, ModelAkses } from "@prisma/client";

const createKelasSchema = z.object({
  judul: z.string().min(5, "Judul minimal 5 karakter"),
  deskripsi: z.string().min(10),
  kategori: z.enum(["CPNS_SKD", "SEKDIN", "UTBK_SNBT"]),
  thumbnailUrl: z.string().url().optional().nullable(),
  harga: z.number().min(0).default(0),
  modelAkses: z.enum(["GRATIS", "BERBAYAR", "LANGGANAN"]).default("GRATIS"),
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const kategori = searchParams.get("kategori") as KategoriUjian | null;
  const modelAkses = searchParams.get("modelAkses") as ModelAkses | null;
  const q = searchParams.get("q");
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "12"), 50);
  const skip = (page - 1) * limit;

  const session = await auth();
  const statusFilter =
    session?.user?.role === "ADMIN" || session?.user?.role === "INSTRUKTUR"
      ? undefined
      : "PUBLISHED" as const;

  const where = {
    ...(statusFilter && { status: statusFilter }),
    ...(kategori && { kategori }),
    ...(modelAkses && { modelAkses }),
    ...(q && { judul: { contains: q, mode: "insensitive" as const } }),
  };

  const [items, total] = await Promise.all([
    prisma.kelas.findMany({
      where,
      select: {
        id: true, slug: true, judul: true, deskripsi: true,
        kategori: true, thumbnailUrl: true, harga: true,
        modelAkses: true, status: true, instrukturId: true,
        _count: { select: { enrollments: true, modul: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit, skip,
    }),
    prisma.kelas.count({ where }),
  ]);

  return NextResponse.json({
    success: true,
    data: { items, total, page, totalPages: Math.ceil(total / limit) },
  });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Tidak terautentikasi" }, { status: 401 });
  }
  if (session.user.role === "PESERTA") {
    return NextResponse.json({ success: false, error: "Akses ditolak" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const validation = createKelasSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: "Data tidak valid", details: validation.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const baseSlug = validation.data.judul
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .substring(0, 50);
    const slug = `${baseSlug}-${Date.now()}`;

    const kelas = await prisma.kelas.create({
      data: {
        ...validation.data,
        slug,
        instrukturId: session.user.id,
      },
    });

    return NextResponse.json({ success: true, data: kelas }, { status: 201 });
  } catch (error) {
    console.error("Create kelas error:", error);
    return NextResponse.json({ success: false, error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
