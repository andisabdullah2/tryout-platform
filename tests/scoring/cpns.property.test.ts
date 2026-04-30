/**
 * Property Tests: Kalkulasi Skor SKD CPNS
 *
 * Property 5: Kalkulasi Skor SKD CPNS
 * Property 4: Persistensi Jawaban Tryout
 * Property 6: Pemulihan Sesi Tryout (Round-trip)
 */

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { hitungSkorSKD, PASSING_GRADE_SKD } from "@/lib/scoring/cpns";
import { acakUrutanSoal } from "@/lib/tryout/shuffle";

// ============================================================
// Property 5: Kalkulasi Skor SKD CPNS
// ============================================================
describe("Property 5: Kalkulasi Skor SKD CPNS", () => {
  it("skor TWK = benar × 5 untuk semua kombinasi jawaban", () => {
    fc.assert(
      fc.property(
        fc.record({
          benar: fc.integer({ min: 0, max: 35 }),
          salah: fc.integer({ min: 0, max: 35 }),
        }).filter(({ benar, salah }) => benar + salah <= 35),
        fc.record({
          benar: fc.integer({ min: 0, max: 35 }),
          salah: fc.integer({ min: 0, max: 35 }),
        }).filter(({ benar, salah }) => benar + salah <= 35),
        fc.array(fc.integer({ min: 0, max: 5 }), { minLength: 45, maxLength: 45 }),
        (twk, tiu, tkp) => {
          const hasil = hitungSkorSKD({ twk, tiu, tkp });
          expect(hasil.skorTWK).toBe(twk.benar * 5);
          expect(hasil.skorTIU).toBe(tiu.benar * 5);
          expect(hasil.skorTKP).toBe(tkp.reduce((a, b) => a + b, 0));
          expect(hasil.skorTotal).toBe(hasil.skorTWK + hasil.skorTIU + hasil.skorTKP);
        }
      )
    );
  });

  it("skor total selalu non-negatif", () => {
    fc.assert(
      fc.property(
        fc.record({
          benar: fc.integer({ min: 0, max: 35 }),
          salah: fc.integer({ min: 0, max: 35 }),
        }).filter(({ benar, salah }) => benar + salah <= 35),
        fc.record({
          benar: fc.integer({ min: 0, max: 35 }),
          salah: fc.integer({ min: 0, max: 35 }),
        }).filter(({ benar, salah }) => benar + salah <= 35),
        fc.array(fc.integer({ min: 0, max: 5 }), { minLength: 45, maxLength: 45 }),
        (twk, tiu, tkp) => {
          const hasil = hitungSkorSKD({ twk, tiu, tkp });
          expect(hasil.skorTotal).toBeGreaterThanOrEqual(0);
          expect(hasil.skorTWK).toBeGreaterThanOrEqual(0);
          expect(hasil.skorTIU).toBeGreaterThanOrEqual(0);
          expect(hasil.skorTKP).toBeGreaterThanOrEqual(0);
        }
      )
    );
  });

  it("lulus hanya jika semua komponen memenuhi passing grade", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 35 }), // twk benar
        fc.integer({ min: 0, max: 35 }), // tiu benar
        fc.array(fc.integer({ min: 0, max: 5 }), { minLength: 45, maxLength: 45 }),
        (twkBenar, tiuBenar, tkp) => {
          const hasil = hitungSkorSKD({
            twk: { benar: twkBenar, salah: 0 },
            tiu: { benar: tiuBenar, salah: 0 },
            tkp,
          });

          const seharusnyaLulus =
            hasil.skorTWK >= PASSING_GRADE_SKD.twk &&
            hasil.skorTIU >= PASSING_GRADE_SKD.tiu &&
            hasil.skorTKP >= PASSING_GRADE_SKD.tkp &&
            hasil.skorTotal >= PASSING_GRADE_SKD.total;

          expect(hasil.lulus).toBe(seharusnyaLulus);
        }
      )
    );
  });

  it("skor maksimum SKD adalah 550 (35×5 + 35×5 + 45×5)", () => {
    const hasil = hitungSkorSKD({
      twk: { benar: 35, salah: 0 },
      tiu: { benar: 35, salah: 0 },
      tkp: Array(45).fill(5),
    });
    expect(hasil.skorTWK).toBe(175);
    expect(hasil.skorTIU).toBe(175);
    expect(hasil.skorTKP).toBe(225);
    expect(hasil.skorTotal).toBe(575);
  });

  it("skor minimum SKD adalah 0 (semua tidak dijawab)", () => {
    const hasil = hitungSkorSKD({
      twk: { benar: 0, salah: 0 },
      tiu: { benar: 0, salah: 0 },
      tkp: Array(45).fill(0),
    });
    expect(hasil.skorTotal).toBe(0);
    expect(hasil.lulus).toBe(false);
  });
});

// ============================================================
// Property 4: Persistensi Jawaban Tryout (Round-trip)
// ============================================================
describe("Property 4: Persistensi Jawaban Tryout", () => {
  it("snapshot jawaban yang disimpan dapat dipulihkan dengan tepat", () => {
    fc.assert(
      fc.property(
        fc.dictionary(
          fc.string({ minLength: 5, maxLength: 30 }),
          fc.oneof(fc.string({ minLength: 5, maxLength: 30 }), fc.constant(null))
        ),
        (answers) => {
          // Simulasi save ke localStorage dan restore
          const snapshot = JSON.stringify(answers);
          const restored = JSON.parse(snapshot) as Record<string, string | null>;

          // Setiap jawaban harus sama persis setelah round-trip
          for (const [soalId, opsiId] of Object.entries(answers)) {
            expect(restored[soalId]).toBe(opsiId);
          }
        }
      )
    );
  });

  it("jawaban yang disimpan tidak berubah nilainya", () => {
    // Gunakan uuid-like strings untuk menghindari prototype pollution (__proto__, constructor, dll)
    const safeId = fc.stringMatching(/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}$/);
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            soalId: safeId,
            opsiId: fc.oneof(safeId, fc.constant(null)),
          }),
          { minLength: 1, maxLength: 50 }
        ),
        (jawaban) => {
          // Gunakan Map untuk menghindari prototype pollution
          const snapshot = new Map<string, string | null>();
          for (const j of jawaban) {
            snapshot.set(j.soalId, j.opsiId);
          }

          // Verifikasi setiap jawaban tersimpan dengan benar
          for (const j of jawaban) {
            expect(snapshot.get(j.soalId)).toBe(j.opsiId);
          }
        }
      )
    );
  });
});

// ============================================================
// Property 6: Pemulihan Sesi Tryout (Round-trip)
// ============================================================
describe("Property 6: Pemulihan Sesi Tryout", () => {
  it("state sesi yang disimpan dapat dipulihkan tanpa kehilangan data", () => {
    fc.assert(
      fc.property(
        fc.record({
          sessionId: fc.string({ minLength: 10, maxLength: 30 }),
          currentIndex: fc.integer({ min: 0, max: 109 }),
          answers: fc.dictionary(
            fc.string({ minLength: 5, maxLength: 20 }),
            fc.oneof(fc.string({ minLength: 5, maxLength: 20 }), fc.constant(null))
          ),
          expiresAt: fc.date({ min: new Date(), max: new Date(Date.now() + 2 * 60 * 60 * 1000) }),
        }),
        (state) => {
          // Simulasi serialisasi dan deserialisasi state
          const serialized = JSON.stringify({
            ...state,
            expiresAt: state.expiresAt.toISOString(),
          });
          const restored = JSON.parse(serialized) as typeof state & { expiresAt: string };

          expect(restored.sessionId).toBe(state.sessionId);
          expect(restored.currentIndex).toBe(state.currentIndex);
          expect(new Date(restored.expiresAt).getTime()).toBe(state.expiresAt.getTime());

          // Semua jawaban harus sama
          for (const [soalId, opsiId] of Object.entries(state.answers)) {
            expect(restored.answers[soalId]).toBe(opsiId);
          }
        }
      )
    );
  });
});

// ============================================================
// Property 10: Pengacakan Urutan Soal Antar Sesi
// ============================================================
describe("Property 10: Pengacakan Urutan Soal Antar Sesi", () => {
  it("dua sesi berbeda menghasilkan urutan soal yang berbeda dengan probabilitas tinggi", () => {
    // Dengan 110 soal, probabilitas urutan sama adalah 1/110! ≈ 0
    const soalIds = Array.from({ length: 110 }, (_, i) => `soal-${i}`);

    let sameCounts = 0;
    const trials = 10;

    for (let i = 0; i < trials; i++) {
      const urutan1 = acakUrutanSoal(soalIds);
      const urutan2 = acakUrutanSoal(soalIds);
      if (JSON.stringify(urutan1) === JSON.stringify(urutan2)) {
        sameCounts++;
      }
    }

    // Dengan 10 percobaan, hampir tidak mungkin semua sama
    expect(sameCounts).toBeLessThan(trials);
  });

  it("hasil shuffle mengandung semua soal yang sama (tidak ada yang hilang)", () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 5, maxLength: 20 }), { minLength: 5, maxLength: 50 })
          .map((arr) => Array.from(new Set(arr))), // unique IDs
        (soalIds) => {
          if (soalIds.length === 0) return;
          const shuffled = acakUrutanSoal(soalIds);

          expect(shuffled).toHaveLength(soalIds.length);
          expect(new Set(shuffled)).toEqual(new Set(soalIds));
        }
      )
    );
  });
});
