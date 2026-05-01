/**
 * Fisher-Yates shuffle untuk pengacakan soal dan opsi jawaban
 * Setiap peserta mendapat urutan soal yang berbeda (Property 10)
 */

/**
 * Mengacak array menggunakan Fisher-Yates algorithm
 * Mengembalikan array baru (tidak mutate input)
 */
export function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j]!, result[i]!];
  }
  return result;
}

/**
 * Mengacak urutan soal untuk sesi tryout
 * Mengembalikan array soalId yang sudah diacak
 */
export function acakUrutanSoal(soalIds: string[]): string[] {
  return shuffle(soalIds);
}

// Canonical subtes order — navigation numbers stay sequential per kategori
const SUBTES_ORDER = ["TWK", "TIU", "TKP", "PU", "PPU", "PBM", "PK", "LBInd", "LBing", "PM"];

/**
 * Mengacak soal per subtes, lalu gabung sesuai urutan subtes.
 * Nomor navigasi tetap berurutan dalam setiap kelompok (TWK 1-30, TIU 31-50, TKP 51-80, dll).
 */
export function acakUrutanSoalPerSubtes(
  soalList: { id: string; subtes: string }[]
): string[] {
  const groups = new Map<string, string[]>();

  for (const s of soalList) {
    if (!groups.has(s.subtes)) groups.set(s.subtes, []);
    groups.get(s.subtes)!.push(s.id);
  }

  const orderedKeys = [
    ...SUBTES_ORDER.filter((k) => groups.has(k)),
    ...[...groups.keys()].filter((k) => !SUBTES_ORDER.includes(k)),
  ];

  return orderedKeys.flatMap((key) => shuffle(groups.get(key)!));
}

/**
 * Mengacak urutan opsi jawaban untuk setiap soal
 * Mengembalikan map soalId -> opsiId[] yang sudah diacak
 */
export function acakOpsiJawaban(
  soalOpsiMap: Record<string, string[]>
): Record<string, string[]> {
  const result: Record<string, string[]> = {};
  for (const [soalId, opsiIds] of Object.entries(soalOpsiMap)) {
    result[soalId] = shuffle(opsiIds);
  }
  return result;
}
