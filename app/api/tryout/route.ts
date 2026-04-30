import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import type { KategoriUjian, ModelAkses, StatusPaket } from "@prisma/client";

const createPaketSchema = z.object({
  judul: z.string().min(5, "Judul minimal 5 karakter"),
  deskripsi: z.string().min(10),
  kategori: z.enum(["CPNS_SKD", "SEKDIN", "UTBK_SNBT"]),
  subKategori: z.string().optional().nullable(),
  durasi: z.number().int().min(10, "Durasi minimal 10 menit"),
  harga: z.number().min(0).default(0),
  modelAkses: z.enum(["GRATIS", "BERBAYAR", "LANGGANAN"]).default("GRATIS"),
  thumbnailUrl: z.string().url().optional().nullable(),
  passingGrade: z.record(z.number()).optional().nullable(),
  konfigurasi: z.record(z.unknown()).optional().nullable(),
  soalIds: z.array(z.string()).optional(), // manual selection
  // atau random selection
  randomConfig: z.object({
    kategori: z.enum(["CPNS_SKD", "SEKDIN", "UTBK_SNBT"]),
    subtes: z.string().optional(),
    tingkatKesulitan: z.enum(["MUDAH", "SEDANG", "SULIT"]).optional(),
    jumlah: z.number().int().min(1),
  }).optional(),
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const kategori = searchParams.get("kategori") as KategoriUjian | null;
  const modelAkses = searchParams.get("modelAkses") as ModelAkses | null;
  const status = (searchParams.get("status") as StatusPaket | null) ?? "PUBLISHED";
  const q = searchParams.get("q");
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "12"), 50);
  const skip = (page - 1) * limit;

  const session = await auth();
  // Admin/Instruktur bisa lihat semua status, peserta hanya PUBLISHED
  const statusFilter =
    session?.user?.role === "ADMIN" || session?.user?.role === "INSTRUKTUR"
      ? (searchParams.get("status") as StatusPaket | null) ?? undefined
      : "PUBLISHED";

  const where = {
    ...(statusFilter && { status: statusFilter }),
    ...(kategori && { kategori }),
    ...(modelAkses && { modelAkses }),
    ...(q && { judul: { contains: q, mode: "insensitive" as const } }),
  };

  const [items, total] = await Promise.all([
    prisma.paketTryout.findMany({
      where,
      select: {
        id: true,
        slug: true,
        judul: true,
        deskripsi: true,
        kategori: true,
        subKategori: true,
        durasi: true,
        totalSoal: true,
        harga: true,
        modelAkses: true,
        status: true,
        thumbnailUrl: true,
        passingGrade: true,
        createdAt: true,
        _count: { select: { sesi: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip,
    }),
    prisma.paketTryout.count({ where }),
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
    const validation = createPaketSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: "Data tidak valid", details: validation.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const { soalIds, randomConfig, ...paketData } = validation.data;

    // Tentukan soal yang akan dimasukkan
    let selectedSoalIds: string[] = soalIds ?? [];

    if (randomConfig && selectedSoalIds.length === 0) {
      // Pilih soal secara acak berdasarkan kriteria
      const soalList = await prisma.soal.findMany({
        where: {
          isActive: true,
          kategori: randomConfig.kategori,
          ...(randomConfig.subtes && { subtes: randomConfig.subtes as never }),
          ...(randomConfig.tingkatKesulitan && { tingkatKesulitan: randomConfig.tingkatKesulitan }),
        },
        select: { id: true },
        take: randomConfig.jumlah * 3, // ambil lebih banyak untuk diacak
      });

      // Fisher-Yates shuffle
      const shuffled = [...soalList];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
      }
      selectedSoalIds = shuffled.slice(0, randomConfig.jumlah).map((s) => s.id);
    }

    // Generate slug unik
    const baseSlug = paketData.judul
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .substring(0, 50);
    const timestamp = Date.now();
    const slug = `${baseSlug}-${timestamp}`;

    const paket = await prisma.paketTryout.create({
      data: {
        ...paketData,
        passingGrade: paketData.passingGrade as never ?? undefined,
        konfigurasi: paketData.konfigurasi as never ?? undefined,
        slug,
        totalSoal: selectedSoalIds.length,
        createdById: session.user.id,
        soal: {
          create: selectedSoalIds.map((soalId, index) => ({
            soalId,
            urutan: index + 1,
          })),
        },
      },
      include: {
        soal: { include: { soal: { select: { id: true, konten: true } } } },
      },
    });

    return NextResponse.json({ success: true, data: paket }, { status: 201 });
  } catch (error) {
    console.error("Create paket error:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
