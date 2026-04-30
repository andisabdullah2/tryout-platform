import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

type RouteParams = { params: Promise<{ tryoutId: string }> };

// GET — daftar soal dalam paket
export async function GET(_request: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id || session.user.role === "PESERTA") {
    return NextResponse.json({ success: false, error: "Akses ditolak" }, { status: 403 });
  }

  const { tryoutId } = await params;

  const paketSoal = await prisma.paketTryoutSoal.findMany({
    where: { paketId: tryoutId },
    include: {
      soal: {
        select: {
          id: true,
          konten: true,
          kategori: true,
          subtes: true,
          topik: true,
          tingkatKesulitan: true,
          tipe: true,
          opsi: { select: { id: true, label: true, isBenar: true } },
        },
      },
    },
    orderBy: { urutan: "asc" },
  });

  return NextResponse.json({ success: true, data: paketSoal });
}

// POST — tambah soal ke paket
const addSoalSchema = z.object({
  soalIds: z.array(z.string()).min(1, "Minimal 1 soal"),
});

export async function POST(request: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id || session.user.role === "PESERTA") {
    return NextResponse.json({ success: false, error: "Akses ditolak" }, { status: 403 });
  }

  const { tryoutId } = await params;

  const body = await request.json();
  const validation = addSoalSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(
      { success: false, error: "Data tidak valid", details: validation.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  // Cek soal yang sudah ada di paket agar tidak duplikat
  const existing = await prisma.paketTryoutSoal.findMany({
    where: { paketId: tryoutId },
    select: { soalId: true, urutan: true },
    orderBy: { urutan: "desc" },
  });

  const existingIds = new Set(existing.map((e) => e.soalId));
  const maxUrutan = existing[0]?.urutan ?? 0;

  const newSoalIds = validation.data.soalIds.filter((id) => !existingIds.has(id));

  if (newSoalIds.length === 0) {
    return NextResponse.json(
      { success: false, error: "Semua soal yang dipilih sudah ada di paket ini" },
      { status: 409 }
    );
  }

  // Tambahkan soal baru
  await prisma.paketTryoutSoal.createMany({
    data: newSoalIds.map((soalId, i) => ({
      paketId: tryoutId,
      soalId,
      urutan: maxUrutan + i + 1,
    })),
  });

  // Update totalSoal di paket
  const totalSoal = existing.length + newSoalIds.length;
  await prisma.paketTryout.update({
    where: { id: tryoutId },
    data: { totalSoal },
  });

  return NextResponse.json({
    success: true,
    data: { ditambahkan: newSoalIds.length, totalSoal },
  });
}

// DELETE — hapus soal dari paket
const deleteSoalSchema = z.object({
  soalId: z.string(),
});

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id || session.user.role === "PESERTA") {
    return NextResponse.json({ success: false, error: "Akses ditolak" }, { status: 403 });
  }

  const { tryoutId } = await params;

  const body = await request.json();
  const validation = deleteSoalSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json({ success: false, error: "soalId diperlukan" }, { status: 422 });
  }

  await prisma.paketTryoutSoal.deleteMany({
    where: { paketId: tryoutId, soalId: validation.data.soalId },
  });

  // Reorder urutan setelah hapus
  const remaining = await prisma.paketTryoutSoal.findMany({
    where: { paketId: tryoutId },
    orderBy: { urutan: "asc" },
  });

  await Promise.all(
    remaining.map((item, i) =>
      prisma.paketTryoutSoal.update({
        where: { id: item.id },
        data: { urutan: i + 1 },
      })
    )
  );

  await prisma.paketTryout.update({
    where: { id: tryoutId },
    data: { totalSoal: remaining.length },
  });

  return NextResponse.json({
    success: true,
    data: { totalSoal: remaining.length },
  });
}
