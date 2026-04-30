import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSoalSchema = z.object({
  konten: z.string().min(10).optional(),
  gambarUrl: z.string().url().optional().nullable(),
  tipe: z.enum(["PILIHAN_GANDA", "PILIHAN_GANDA_KOMPLEKS", "ISIAN_SINGKAT"]).optional(),
  kategori: z.enum(["CPNS_SKD", "SEKDIN", "UTBK_SNBT"]).optional(),
  subtes: z.enum([
    "TWK", "TIU", "TKP",
    "TPS_PENALARAN_UMUM", "TPS_PPU", "TPS_PBM", "TPS_PK",
    "LITERASI_IND", "LITERASI_ENG", "PENALARAN_MATEMATIKA",
    "UMUM", "MATEMATIKA", "BAHASA_INDONESIA", "BAHASA_INGGRIS",
    "PENGETAHUAN_UMUM", "WAWASAN_KEBANGSAAN",
  ]).optional(),
  topik: z.string().min(2).optional(),
  tingkatKesulitan: z.enum(["MUDAH", "SEDANG", "SULIT"]).optional(),
  pembahasanTeks: z.string().optional().nullable(),
  pembahasanVideoUrl: z.string().url().optional().nullable(),
  isActive: z.boolean().optional(),
  opsi: z.array(z.object({
    id: z.string().optional(),
    label: z.string().min(1),
    konten: z.string().min(1),
    isBenar: z.boolean(),
    nilaiTkp: z.number().int().min(1).max(5).optional().nullable(),
  })).optional(),
});

type RouteParams = { params: Promise<{ soalId: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Tidak terautentikasi" }, { status: 401 });
  }

  const { soalId } = await params;

  const soal = await prisma.soal.findUnique({
    where: { id: soalId },
    include: {
      opsi: { orderBy: { label: "asc" } },
      _count: { select: { paketSoal: true, jawabanPeserta: true } },
    },
  });

  if (!soal) {
    return NextResponse.json({ success: false, error: "Soal tidak ditemukan" }, { status: 404 });
  }

  // Peserta tidak bisa melihat jawaban benar kecuali dalam konteks pembahasan
  if (session.user.role === "PESERTA") {
    const soalSafe = {
      ...soal,
      opsi: soal.opsi.map(({ isBenar: _, nilaiTkp: __, ...rest }) => rest),
      pembahasanTeks: null,
      pembahasanVideoUrl: null,
    };
    return NextResponse.json({ success: true, data: soalSafe });
  }

  return NextResponse.json({ success: true, data: soal });
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Tidak terautentikasi" }, { status: 401 });
  }
  if (session.user.role === "PESERTA") {
    return NextResponse.json({ success: false, error: "Akses ditolak" }, { status: 403 });
  }

  const { soalId } = await params;

  const soal = await prisma.soal.findUnique({ where: { id: soalId } });
  if (!soal) {
    return NextResponse.json({ success: false, error: "Soal tidak ditemukan" }, { status: 404 });
  }

  try {
    const body = await request.json();
    const validation = updateSoalSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: "Data tidak valid", details: validation.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const { opsi, ...soalData } = validation.data;

    // Validasi jawaban benar jika opsi diupdate
    if (opsi) {
      const adaJawabanBenar = opsi.some((o) => o.isBenar);
      if (!adaJawabanBenar) {
        return NextResponse.json(
          { success: false, error: "Soal harus memiliki minimal satu jawaban yang benar" },
          { status: 422 }
        );
      }
    }

    // Update soal dengan transaction
    const updatedSoal = await prisma.$transaction(async (tx) => {
      if (opsi) {
        // Hapus opsi lama dan buat baru
        await tx.opsiJawaban.deleteMany({ where: { soalId } });
        await tx.opsiJawaban.createMany({
          data: opsi.map((o) => ({
            soalId,
            label: o.label,
            konten: o.konten,
            isBenar: o.isBenar,
            nilaiTkp: o.nilaiTkp ?? null,
          })),
        });
      }

      return tx.soal.update({
        where: { id: soalId },
        data: soalData,
        include: { opsi: { orderBy: { label: "asc" } } },
      });
    });

    return NextResponse.json({ success: true, data: updatedSoal });
  } catch (error) {
    console.error("Update soal error:", error);
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
    return NextResponse.json({ success: false, error: "Hanya Admin yang dapat menghapus soal" }, { status: 403 });
  }

  const { soalId } = await params;

  // Cek apakah soal digunakan dalam paket aktif
  const paketAktif = await prisma.paketTryoutSoal.findFirst({
    where: {
      soalId,
      paket: { status: "PUBLISHED" },
    },
    include: { paket: { select: { judul: true } } },
  });

  if (paketAktif) {
    return NextResponse.json(
      {
        success: false,
        error: `Soal sedang digunakan dalam paket tryout aktif: "${paketAktif.paket.judul}". Arsipkan paket terlebih dahulu.`,
        code: "SOAL_IN_USE",
      },
      { status: 409 }
    );
  }

  // Soft delete — nonaktifkan soal
  await prisma.soal.update({
    where: { id: soalId },
    data: { isActive: false },
  });

  return NextResponse.json({
    success: true,
    data: { message: "Soal berhasil dihapus" },
  });
}
