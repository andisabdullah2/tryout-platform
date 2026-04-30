/**
 * Logika penilaian Sekdin (Sekolah Kedinasan)
 *
 * Konfigurasi fleksibel per paket tryout.
 * Mendukung berbagai format penilaian sesuai masing-masing Sekdin.
 */

export interface KonfigurasiPenilaianSekdin {
  nilaiBenar: number; // nilai untuk jawaban benar
  nilaiSalah: number; // nilai untuk jawaban salah (bisa negatif)
  nilaiKosong: number; // nilai untuk tidak menjawab
  jumlahSoal: number;
}

export interface JawabanSekdin {
  soalId: string;
  kategori: string; // e.g., "TPA", "BAHASA_INGGRIS", "MATEMATIKA"
  opsiId: string | null;
  isBenar: boolean | null;
}

export interface SkorSekdinResult {
  skorTotal: number;
  skorPerKategori: Record<string, number>;
  jumlahBenar: number;
  jumlahSalah: number;
  jumlahKosong: number;
  persentaseBenar: number;
}

/**
 * Menghitung skor Sekdin berdasarkan konfigurasi paket
 */
export function hitungSkorSekdin(
  jawaban: JawabanSekdin[],
  konfigurasi: Record<string, KonfigurasiPenilaianSekdin>
): SkorSekdinResult {
  const skorPerKategori: Record<string, number> = {};
  let totalSkor = 0;
  let jumlahBenar = 0;
  let jumlahSalah = 0;
  let jumlahKosong = 0;

  // Kelompokkan jawaban per kategori
  const jawabanPerKategori = new Map<string, JawabanSekdin[]>();
  for (const j of jawaban) {
    const existing = jawabanPerKategori.get(j.kategori) ?? [];
    existing.push(j);
    jawabanPerKategori.set(j.kategori, existing);
  }

  // Hitung skor per kategori
  for (const [kategori, jawabanKat] of Array.from(jawabanPerKategori)) {
    const config = konfigurasi[kategori];
    if (!config) continue;

    let skorKategori = 0;

    for (const j of jawabanKat) {
      if (j.opsiId === null) {
        // Tidak dijawab
        skorKategori += config.nilaiKosong;
        jumlahKosong++;
      } else if (j.isBenar === true) {
        // Jawaban benar
        skorKategori += config.nilaiBenar;
        jumlahBenar++;
      } else {
        // Jawaban salah
        skorKategori += config.nilaiSalah;
        jumlahSalah++;
      }
    }

    skorPerKategori[kategori] = skorKategori;
    totalSkor += skorKategori;
  }

  const totalSoal = jawaban.length;
  const persentaseBenar =
    totalSoal > 0 ? (jumlahBenar / totalSoal) * 100 : 0;

  return {
    skorTotal: totalSkor,
    skorPerKategori,
    jumlahBenar,
    jumlahSalah,
    jumlahKosong,
    persentaseBenar: Math.round(persentaseBenar * 100) / 100,
  };
}

/**
 * Konfigurasi default untuk STAN (PKN STAN)
 */
export const KONFIGURASI_STAN: Record<string, KonfigurasiPenilaianSekdin> = {
  TPA: {
    nilaiBenar: 4,
    nilaiSalah: -1,
    nilaiKosong: 0,
    jumlahSoal: 60,
  },
  BAHASA_INGGRIS: {
    nilaiBenar: 4,
    nilaiSalah: -1,
    nilaiKosong: 0,
    jumlahSoal: 40,
  },
};

/**
 * Konfigurasi default untuk IPDN
 */
export const KONFIGURASI_IPDN: Record<string, KonfigurasiPenilaianSekdin> = {
  TPA: {
    nilaiBenar: 5,
    nilaiSalah: 0,
    nilaiKosong: 0,
    jumlahSoal: 50,
  },
  PENGETAHUAN_UMUM: {
    nilaiBenar: 5,
    nilaiSalah: 0,
    nilaiKosong: 0,
    jumlahSoal: 50,
  },
};
