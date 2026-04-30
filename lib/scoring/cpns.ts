/**
 * Logika penilaian SKD CPNS
 *
 * Formula SKD:
 * - TWK (Tes Wawasan Kebangsaan): benar +5, salah 0, tidak dijawab 0
 * - TIU (Tes Intelegensia Umum): benar +5, salah 0, tidak dijawab 0
 * - TKP (Tes Karakteristik Pribadi): skala 1-5 per soal, tidak dijawab 0
 */

export interface SkorSKDInput {
  twk: {
    benar: number;
    salah: number;
  };
  tiu: {
    benar: number;
    salah: number;
  };
  tkp: number[]; // array nilai per soal TKP (0 = tidak dijawab, 1-5 = nilai)
}

export interface SkorSKDResult {
  skorTWK: number;
  skorTIU: number;
  skorTKP: number;
  skorTotal: number;
  jumlahBenarTWK: number;
  jumlahBenarTIU: number;
  jumlahBenarTKP: number;
  lulus: boolean;
  passingGrade: {
    twk: number;
    tiu: number;
    tkp: number;
    total: number;
  };
}

export const PASSING_GRADE_SKD = {
  twk: 65,
  tiu: 80,
  tkp: 166,
  total: 311,
};

/**
 * Menghitung skor SKD CPNS berdasarkan jawaban peserta
 */
export function hitungSkorSKD(input: SkorSKDInput): SkorSKDResult {
  // TWK: benar +5, salah 0
  const skorTWK = input.twk.benar * 5;

  // TIU: benar +5, salah 0
  const skorTIU = input.tiu.benar * 5;

  // TKP: sum nilai opsi (0 jika tidak dijawab)
  const skorTKP = input.tkp.reduce((acc, val) => acc + val, 0);

  const skorTotal = skorTWK + skorTIU + skorTKP;

  // Hitung jumlah benar TKP (nilai > 0)
  const jumlahBenarTKP = input.tkp.filter((v) => v > 0).length;

  const lulus =
    skorTWK >= PASSING_GRADE_SKD.twk &&
    skorTIU >= PASSING_GRADE_SKD.tiu &&
    skorTKP >= PASSING_GRADE_SKD.tkp &&
    skorTotal >= PASSING_GRADE_SKD.total;

  return {
    skorTWK,
    skorTIU,
    skorTKP,
    skorTotal,
    jumlahBenarTWK: input.twk.benar,
    jumlahBenarTIU: input.tiu.benar,
    jumlahBenarTKP,
    lulus,
    passingGrade: PASSING_GRADE_SKD,
  };
}

/**
 * Menghitung skor SKD dari array jawaban peserta
 */
export interface JawabanSKD {
  soalId: string;
  subtes: "TWK" | "TIU" | "TKP";
  opsiId: string | null;
  isBenar: boolean | null;
  nilaiTkp?: number | null; // nilai TKP dari opsi yang dipilih (1-5)
}

export function hitungSkorSKDDariJawaban(jawaban: JawabanSKD[]): SkorSKDResult {
  const twkJawaban = jawaban.filter((j) => j.subtes === "TWK");
  const tiuJawaban = jawaban.filter((j) => j.subtes === "TIU");
  const tkpJawaban = jawaban.filter((j) => j.subtes === "TKP");

  const twkBenar = twkJawaban.filter((j) => j.isBenar === true).length;
  const twkSalah = twkJawaban.filter(
    (j) => j.opsiId !== null && j.isBenar === false
  ).length;

  const tiuBenar = tiuJawaban.filter((j) => j.isBenar === true).length;
  const tiuSalah = tiuJawaban.filter(
    (j) => j.opsiId !== null && j.isBenar === false
  ).length;

  const tkpNilai = tkpJawaban.map((j) => {
    if (j.opsiId === null) return 0; // tidak dijawab
    return j.nilaiTkp ?? 0;
  });

  return hitungSkorSKD({
    twk: { benar: twkBenar, salah: twkSalah },
    tiu: { benar: tiuBenar, salah: tiuSalah },
    tkp: tkpNilai,
  });
}
