/**
 * Logika penilaian UTBK/SNBT
 *
 * Menggunakan skala 0-1000 dengan metode Item Response Theory (IRT) sederhana.
 * Skor dihitung berdasarkan tingkat kesulitan soal dan jawaban benar/salah.
 */

export interface JawabanUTBK {
  soalId: string;
  isBenar: boolean;
  tingkatKesulitan: number; // parameter IRT: 0.1 - 3.0
}

export interface SkorUTBKResult {
  total: number;
  komponenSkor: Record<string, number>;
}

export interface JawabanUTBKPerKomponen {
  soalId: string;
  komponen: string; // e.g., "TPS", "LITERASI_IND", "PENALARAN_MATEMATIKA"
  isBenar: boolean;
  tingkatKesulitan: number;
}

const SKOR_MIN = 0;
const SKOR_MAX = 1000;
const SKOR_DASAR = 200; // skor minimum yang diberikan

/**
 * Menghitung skor UTBK/SNBT menggunakan IRT sederhana
 * Skor selalu dalam rentang [0, 1000]
 */
export function hitungSkorUTBK(jawaban: JawabanUTBK[]): SkorUTBKResult {
  if (jawaban.length === 0) {
    return { total: SKOR_DASAR, komponenSkor: {} };
  }

  // Hitung raw score berdasarkan IRT sederhana
  // Soal lebih sulit memberikan bobot lebih tinggi
  let totalBobot = 0;
  let totalBenar = 0;

  for (const j of jawaban) {
    const bobot = Math.max(0.1, Math.min(3.0, j.tingkatKesulitan));
    totalBobot += bobot;
    if (j.isBenar) {
      totalBenar += bobot;
    }
  }

  // Proporsi jawaban benar berbobot
  const proporsi = totalBobot > 0 ? totalBenar / totalBobot : 0;

  // Konversi ke skala 0-1000
  // Skor dasar 200, skor maksimum 1000
  const rentang = SKOR_MAX - SKOR_DASAR;
  const skor = Math.round(SKOR_DASAR + proporsi * rentang);

  // Pastikan dalam rentang valid
  const skorFinal = Math.max(SKOR_MIN, Math.min(SKOR_MAX, skor));

  return {
    total: skorFinal,
    komponenSkor: {},
  };
}

/**
 * Menghitung skor UTBK per komponen
 */
export function hitungSkorUTBKPerKomponen(
  jawaban: JawabanUTBKPerKomponen[]
): SkorUTBKResult {
  if (jawaban.length === 0) {
    return { total: SKOR_DASAR, komponenSkor: {} };
  }

  // Kelompokkan per komponen
  const komponenMap = new Map<string, JawabanUTBK[]>();

  for (const j of jawaban) {
    const existing = komponenMap.get(j.komponen) ?? [];
    existing.push({
      soalId: j.soalId,
      isBenar: j.isBenar,
      tingkatKesulitan: j.tingkatKesulitan,
    });
    komponenMap.set(j.komponen, existing);
  }

  // Hitung skor per komponen
  const komponenSkor: Record<string, number> = {};
  let totalSkor = 0;
  let jumlahKomponen = 0;

  for (const [komponen, jawabanKomponen] of Array.from(komponenMap)) {
    const hasil = hitungSkorUTBK(jawabanKomponen);
    komponenSkor[komponen] = hasil.total;
    totalSkor += hasil.total;
    jumlahKomponen++;
  }

  // Total skor adalah rata-rata skor komponen
  const skorTotal =
    jumlahKomponen > 0
      ? Math.round(totalSkor / jumlahKomponen)
      : SKOR_DASAR;

  const skorFinal = Math.max(SKOR_MIN, Math.min(SKOR_MAX, skorTotal));

  return {
    total: skorFinal,
    komponenSkor,
  };
}
