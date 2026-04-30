/**
 * Property Tests: Validasi Soal
 *
 * Property 8: Validasi Soal Harus Memiliki Jawaban Benar
 * - Soal tanpa jawaban benar harus ditolak
 * - Soal dengan minimal satu jawaban benar harus diterima
 */

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";

interface OpsiJawaban {
  label: string;
  konten: string;
  isBenar: boolean;
  nilaiTkp?: number | null;
}

/**
 * Fungsi validasi soal (sama dengan logika di API route)
 */
function validateSoalHasJawabanBenar(opsi: OpsiJawaban[]): {
  valid: boolean;
  error?: string;
} {
  if (opsi.length < 2) {
    return { valid: false, error: "Minimal 2 opsi jawaban" };
  }

  const adaJawabanBenar = opsi.some((o) => o.isBenar);
  if (!adaJawabanBenar) {
    return {
      valid: false,
      error: "Soal harus memiliki minimal satu jawaban yang benar",
    };
  }

  return { valid: true };
}

// Arbitrary untuk opsi jawaban
const opsiArbitrary = fc.record({
  label: fc.constantFrom("A", "B", "C", "D", "E"),
  konten: fc.string({ minLength: 1, maxLength: 200 }),
  isBenar: fc.boolean(),
});

describe("Property 8: Validasi Soal Harus Memiliki Jawaban Benar", () => {
  it("soal dengan semua opsi isBenar=false selalu ditolak", () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            label: fc.constantFrom("A", "B", "C", "D", "E"),
            konten: fc.string({ minLength: 1 }),
            isBenar: fc.constant(false),
          }),
          { minLength: 2, maxLength: 5 }
        ),
        (opsi) => {
          const result = validateSoalHasJawabanBenar(opsi);
          expect(result.valid).toBe(false);
          expect(result.error).toContain("minimal satu jawaban yang benar");
        }
      )
    );
  });

  it("soal dengan minimal satu opsi isBenar=true selalu diterima (dari sisi validasi jawaban benar)", () => {
    fc.assert(
      fc.property(
        fc.array(opsiArbitrary, { minLength: 1, maxLength: 4 }),
        (opsiTambahan) => {
          // Pastikan ada minimal satu jawaban benar
          const opsiDenganBenar: OpsiJawaban[] = [
            { label: "A", konten: "Jawaban benar", isBenar: true },
            ...opsiTambahan.map((o, i) => ({
              ...o,
              label: ["B", "C", "D", "E"][i] ?? "B",
              isBenar: false,
            })),
          ];

          const result = validateSoalHasJawabanBenar(opsiDenganBenar);
          expect(result.valid).toBe(true);
        }
      )
    );
  });

  it("soal dengan kurang dari 2 opsi selalu ditolak", () => {
    fc.assert(
      fc.property(
        fc.array(opsiArbitrary, { minLength: 0, maxLength: 1 }),
        (opsi) => {
          const result = validateSoalHasJawabanBenar(opsi);
          expect(result.valid).toBe(false);
        }
      )
    );
  });

  it("soal dengan semua opsi benar tetap valid (pilihan ganda kompleks)", () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            label: fc.constantFrom("A", "B", "C", "D"),
            konten: fc.string({ minLength: 1 }),
            isBenar: fc.constant(true),
          }),
          { minLength: 2, maxLength: 4 }
        ),
        (opsi) => {
          const result = validateSoalHasJawabanBenar(opsi);
          expect(result.valid).toBe(true);
        }
      )
    );
  });

  it("tepat satu jawaban benar dari banyak opsi selalu valid", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 3 }), // index jawaban benar
        fc.integer({ min: 2, max: 5 }), // jumlah opsi
        (indexBenar, jumlahOpsi) => {
          const labels = ["A", "B", "C", "D", "E"];
          const opsi: OpsiJawaban[] = Array.from({ length: jumlahOpsi }, (_, i) => ({
            label: labels[i] ?? "A",
            konten: `Opsi ${labels[i]}`,
            isBenar: i === Math.min(indexBenar, jumlahOpsi - 1),
          }));

          const result = validateSoalHasJawabanBenar(opsi);
          expect(result.valid).toBe(true);
        }
      )
    );
  });
});
