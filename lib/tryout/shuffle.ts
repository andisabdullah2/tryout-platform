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
