import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import type { KategoriUjian, SubtesType, TingkatKesulitan, TipeSoal } from "@prisma/client";
import { sanitizeText } from "@/lib/security/sanitize";

const createSoalSchema = z.object({
  konten: z.string().min(10, "Konten soal minimal 10 karakter"),
  gambarUrl: z.string().url().optional().nullable(),
  tipe: z.enum(["PILIHAN_GANDA", "PILIHAN_GANDA_KOMPLEKS", "ISIAN_SINGKAT"]).default("PILIHAN_GANDA"),
  kategori: z.enum(["CPNS_SKD", "SEKDIN", "UTBK_SNBT"]),
  subtes: z.enum([
    "TWK", "TIU", "TKP",
    "TPS_PENALARAN_UMUM", "TPS_PPU", "TPS_PBM", "TPS_PK",
    "LITERASI_IND", "LITERASI_ENG", "PENALARAN_MATEMATIKA",
    "UMUM", "MATEMATIKA", "BAHASA_INDONESIA", "BAHASA_INGGRIS",
    "PENGETAHUAN_UMUM", "WAWASAN_KEBANGSAAN",
  ]),
  topik: z.string().min(2, "Topik minimal 2 karakter"),
  tingkatKesulitan: z.enum(["MUDAH", "SEDANG", "SULIT"]).default("SEDANG"),
  pembahasanTeks: z.string().optional().nullable(),
  pembahasanVideoUrl: z.string().url().optional().nullable(),
  opsi: z.array(z.object({
    label: z.string().min(1),
    konten: z.string().min(1),
    isBenar: z.boolean(),
    nilaiTkp: z.number().int().min(1).max(5).optional().nullable(),
  })).min(2, "Minimal 2 opsi jawaban"),
});

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Tidak terautentikasi" }, { status: 401 });
  }
  if (session.user.role === "PESERTA") {
    return NextResponse.json({ success: false, error: "Akses ditolak" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const kategori = searchParams.get("kategori") as KategoriUjian | null;
  const subtes = searchParams.get("subtes") as SubtesType | null;
  const topik = searchParams.get("topik");
  const tingkatKesulitan = searchParams.get("tingkatKesulitan") as TingkatKesulitan | null;
  const tipe = searchParams.get("tipe") as TipeSoal | null;
  const q = searchParams.get("q");
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "20"), 100);
  const skip = (page - 1) * limit;

  const where = {
    isActive: true,
    ...(kategori && { kategori }),
    ...(subtes && { subtes }),
    ...(topik && { topik: { contains: topik, mode: "insensitive" as const } }),
    ...(tingkatKesulitan && { tingkatKesulitan }),
    ...(tipe && { tipe }),
    ...(q && {
      konten: { contains: q, mode: "insensitive" as const },
    }),
  };

  const [items, total] = await Promise.all([
    prisma.soal.findMany({
      where,
      include: {
        opsi: { orderBy: { label: "asc" } },
        _count: { select: { paketSoal: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip,
    }),
    prisma.soal.count({ where }),
  ]);

  return NextResponse.json({
    success: true,
    data: {
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    },
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
    const validation = createSoalSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: "Data tidak valid", details: validation.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const { opsi, ...soalData } = validation.data;

    // Validasi: minimal satu jawaban benar (Property 8)
    const adaJawabanBenar = opsi.some((o) => o.isBenar);
    if (!adaJawabanBenar) {
      return NextResponse.json(
        { success: false, error: "Soal harus memiliki minimal satu jawaban yang benar" },
        { status: 422 }
      );
    }

    const soal = await prisma.soal.create({
      data: {
        ...soalData,
        createdById: session.user.id,
        opsi: {
          create: opsi.map((o) => ({
            label: o.label,
            konten: o.konten,
            isBenar: o.isBenar,
            nilaiTkp: o.nilaiTkp ?? null,
          })),
        },
      },
      include: { opsi: true },
    });

    return NextResponse.json({ success: true, data: soal }, { status: 201 });
  } catch (error) {
    console.error("Create soal error:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
