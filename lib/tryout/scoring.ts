import { prisma } from "@/lib/prisma";
import { hitungSkorSKDDariJawaban } from "@/lib/scoring/cpns";
import { hitungSkorUTBKPerKomponen } from "@/lib/scoring/utbk";
import { hitungSkorSekdin } from "@/lib/scoring/sekdin";
import type { KategoriUjian } from "@prisma/client";

export interface SkorResult {
  skorTotal: number;
  skorPerSubtes: Record<string, number>;
  jumlahBenar: number;
  jumlahSalah: number;
  jumlahKosong: number;
  lulus: boolean;
  durasiPengerjaan: number; // detik
}

/**
 * Hitung skor berdasarkan kategori ujian dan jawaban peserta
 */
export async function hitungSkor(
  sessionId: string,
  kategori: KategoriUjian,
  konfigurasi: Record<string, unknown> | null,
  startedAt: Date
): Promise<SkorResult> {
  const durasiPengerjaan = Math.floor((Date.now() - startedAt.getTime()) / 1000);

  // Ambil semua jawaban dengan info soal dan opsi
  const jawaban = await prisma.jawabanPeserta.findMany({
    where: { sessionId },
    include: {
      soal: {
        select: {
          subtes: true,
          kategori: true,
          opsi: { select: { id: true, isBenar: true, nilaiTkp: true } },
        },
      },
    },
  });

  // Hitung isBenar dan nilaiDapat untuk setiap jawaban
  const jawabanDenganNilai = jawaban.map((j) => {
    if (!j.opsiId) {
      return { ...j, isBenar: false, nilaiDapat: 0 };
    }
    const opsiDipilih = j.soal.opsi.find((o) => o.id === j.opsiId);
    const isBenar = opsiDipilih?.isBenar ?? false;
    const nilaiTkp = opsiDipilih?.nilaiTkp ?? 0;
    return { ...j, isBenar, nilaiDapat: nilaiTkp };
  });

  // Update isBenar di database
  await Promise.all(
    jawabanDenganNilai.map((j) =>
      prisma.jawabanPeserta.update({
        where: { id: j.id },
        data: {
          isBenar: j.isBenar,
          nilaiDapat: j.nilaiDapat,
        },
      })
    )
  );

  const jumlahBenar = jawabanDenganNilai.filter((j) => j.isBenar).length;
  const jumlahSalah = jawabanDenganNilai.filter((j) => j.opsiId && !j.isBenar).length;
  const jumlahKosong = jawabanDenganNilai.filter((j) => !j.opsiId).length;

  let skorTotal = 0;
  let skorPerSubtes: Record<string, number> = {};
  let lulus = false;

  if (kategori === "CPNS_SKD") {
    const jawabanSKD = jawabanDenganNilai.map((j) => ({
      soalId: j.soalId,
      subtes: j.soal.subtes as "TWK" | "TIU" | "TKP",
      opsiId: j.opsiId,
      isBenar: j.isBenar,
      nilaiTkp: j.soal.opsi.find((o) => o.id === j.opsiId)?.nilaiTkp ?? null,
    }));

    const hasil = hitungSkorSKDDariJawaban(jawabanSKD);
    skorTotal = hasil.skorTotal;
    skorPerSubtes = {
      TWK: hasil.skorTWK,
      TIU: hasil.skorTIU,
      TKP: hasil.skorTKP,
    };
    lulus = hasil.lulus;

  } else if (kategori === "UTBK_SNBT") {
    const jawabanUTBK = jawabanDenganNilai.map((j) => ({
      soalId: j.soalId,
      komponen: j.soal.subtes,
      isBenar: j.isBenar,
      tingkatKesulitan: 1.0, // default IRT parameter
    }));

    const hasil = hitungSkorUTBKPerKomponen(jawabanUTBK);
    skorTotal = hasil.total;
    skorPerSubtes = hasil.komponenSkor;
    lulus = false; // UTBK tidak ada passing grade biner

  } else if (kategori === "SEKDIN") {
    // Gunakan konfigurasi dari paket
    const konfig = (konfigurasi as Record<string, { nilaiBenar: number; nilaiSalah: number; nilaiKosong: number; jumlahSoal: number }>) ?? {};

    const jawabanSekdin = jawabanDenganNilai.map((j) => ({
      soalId: j.soalId,
      kategori: j.soal.subtes,
      opsiId: j.opsiId,
      isBenar: j.isBenar,
    }));

    const hasil = hitungSkorSekdin(jawabanSekdin, konfig);
    skorTotal = hasil.skorTotal;
    skorPerSubtes = hasil.skorPerKategori;
    lulus = false;
  }

  return {
    skorTotal,
    skorPerSubtes,
    jumlahBenar,
    jumlahSalah,
    jumlahKosong,
    lulus,
    durasiPengerjaan,
  };
}
