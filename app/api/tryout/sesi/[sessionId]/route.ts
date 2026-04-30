import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteParams = { params: Promise<{ sessionId: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Tidak terautentikasi" }, { status: 401 });
  }

  const { sessionId } = await params;

  const sesi = await prisma.tryoutSession.findFirst({
    where: { id: sessionId, userId: session.user.id },
    include: {
      paket: {
        select: { id: true, judul: true, kategori: true, durasi: true, totalSoal: true },
      },
      jawaban: { select: { soalId: true, opsiId: true } },
    },
  });

  if (!sesi) {
    return NextResponse.json({ success: false, error: "Sesi tidak ditemukan" }, { status: 404 });
  }

  // Cek apakah sesi sudah expired
  if (sesi.status === "ACTIVE" && sesi.expiresAt < new Date()) {
    await prisma.tryoutSession.update({
      where: { id: sessionId },
      data: { status: "EXPIRED" },
    });
    return NextResponse.json(
      { success: false, error: "Sesi tryout sudah kedaluwarsa", code: "SESSION_EXPIRED" },
      { status: 410 }
    );
  }

  // Buat map jawaban
  const jawabanMap = Object.fromEntries(
    sesi.jawaban.map((j) => [j.soalId, j.opsiId])
  );

  // Ambil soal dalam urutan yang sudah diacak saat sesi dibuat
  const urutanSoal = sesi.urutanSoal as string[];
  const soalList = await prisma.soal.findMany({
    where: { id: { in: urutanSoal } },
    select: {
      id: true,
      konten: true,
      gambarUrl: true,
      tipe: true,
      subtes: true,
      opsi: {
        select: { id: true, label: true, konten: true },
        orderBy: { label: "asc" },
      },
    },
  });

  // Kembalikan soal sesuai urutan acak yang tersimpan di sesi
  const soalMap = Object.fromEntries(soalList.map((s) => [s.id, s]));
  const soalTerurut = urutanSoal
    .map((id) => soalMap[id])
    .filter(Boolean);

  return NextResponse.json({
    success: true,
    data: {
      id: sesi.id,
      status: sesi.status,
      startedAt: sesi.startedAt,
      expiresAt: sesi.expiresAt,
      lastSyncedAt: sesi.lastSyncedAt,
      urutanSoal,
      paket: sesi.paket,
      jawaban: jawabanMap,
      snapshotJawaban: sesi.snapshotJawaban,
      soal: soalTerurut,
    },
  });
}
