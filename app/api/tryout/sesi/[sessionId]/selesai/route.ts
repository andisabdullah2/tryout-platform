import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hitungSkor } from "@/lib/tryout/scoring";
import { updateStatistikSoal } from "@/lib/soal/statistik";
import { updateLeaderboard } from "@/lib/tryout/leaderboard";
import { notifyTryoutResult } from "@/lib/notification/service";

type RouteParams = { params: Promise<{ sessionId: string }> };

export async function POST(_request: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Tidak terautentikasi" }, { status: 401 });
  }

  const { sessionId } = await params;

  // Validasi sesi
  const sesi = await prisma.tryoutSession.findFirst({
    where: { id: sessionId, userId: session.user.id },
    include: {
      paket: {
        select: {
          id: true, kategori: true, konfigurasi: true, passingGrade: true,
        },
      },
    },
  });

  if (!sesi) {
    return NextResponse.json({ success: false, error: "Sesi tidak ditemukan" }, { status: 404 });
  }

  // Jika sudah selesai, kembalikan hasil yang ada
  if (sesi.status === "COMPLETED") {
    const hasil = await prisma.hasilTryout.findUnique({ where: { sessionId } });
    return NextResponse.json({ success: true, data: { hasil, alreadyCompleted: true } });
  }

  if (sesi.status === "EXPIRED" || sesi.status === "ABANDONED") {
    return NextResponse.json(
      { success: false, error: "Sesi sudah tidak aktif", code: "SESSION_INACTIVE" },
      { status: 410 }
    );
  }

  try {
    // Hitung skor
    const skorResult = await hitungSkor(
      sessionId,
      sesi.paket.kategori,
      sesi.paket.konfigurasi as Record<string, unknown> | null,
      sesi.startedAt
    );

    // Cek passing grade
    const passingGrade = sesi.paket.passingGrade as Record<string, number> | null;
    let lulus = skorResult.lulus;

    if (passingGrade && sesi.paket.kategori === "CPNS_SKD") {
      lulus =
        (skorResult.skorPerSubtes["TWK"] ?? 0) >= (passingGrade["twk"] ?? 0) &&
        (skorResult.skorPerSubtes["TIU"] ?? 0) >= (passingGrade["tiu"] ?? 0) &&
        (skorResult.skorPerSubtes["TKP"] ?? 0) >= (passingGrade["tkp"] ?? 0) &&
        skorResult.skorTotal >= (passingGrade["total"] ?? 0);
    }

    // Simpan hasil tryout dan update status sesi dalam satu transaksi
    const [hasil] = await prisma.$transaction([
      prisma.hasilTryout.create({
        data: {
          sessionId,
          userId: session.user.id,
          paketId: sesi.paketId,
          skorTotal: skorResult.skorTotal,
          skorPerSubtes: skorResult.skorPerSubtes,
          jumlahBenar: skorResult.jumlahBenar,
          jumlahSalah: skorResult.jumlahSalah,
          jumlahKosong: skorResult.jumlahKosong,
          lulus,
          durasiPengerjaan: skorResult.durasiPengerjaan,
        },
      }),
      prisma.tryoutSession.update({
        where: { id: sessionId },
        data: { status: "COMPLETED", completedAt: new Date() },
      }),
    ]);

    // Update statistik soal dan leaderboard secara async (tidak blocking)
    const jawaban = await prisma.jawabanPeserta.findMany({
      where: { sessionId },
      select: { soalId: true, isBenar: true },
    });

    Promise.all([
      updateStatistikSoal(jawaban.map((j) => ({ soalId: j.soalId, isBenar: j.isBenar }))),
      updateLeaderboard(session.user.id, sesi.paketId, sessionId, skorResult.skorTotal, lulus),
      notifyTryoutResult(session.user.id, {
        paketJudul: sesi.paket.id, // paket judul akan diambil dari paket
        skorTotal: skorResult.skorTotal,
        lulus,
        sessionId,
      }),
    ]).catch(console.error);

    return NextResponse.json({
      success: true,
      data: {
        hasil: {
          id: hasil.id,
          sessionId,
          skorTotal: Number(hasil.skorTotal),
          skorPerSubtes: hasil.skorPerSubtes,
          jumlahBenar: hasil.jumlahBenar,
          jumlahSalah: hasil.jumlahSalah,
          jumlahKosong: hasil.jumlahKosong,
          lulus: hasil.lulus,
          durasiPengerjaan: hasil.durasiPengerjaan,
          passingGrade,
        },
      },
    });

  } catch (error) {
    console.error("Selesai sesi error:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan saat menghitung skor" },
      { status: 500 }
    );
  }
}
