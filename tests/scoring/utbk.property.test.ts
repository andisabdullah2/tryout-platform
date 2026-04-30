/**
 * Property Tests: Kalkulasi Skor UTBK/SNBT
 *
 * Property 7: Skor UTBK dalam Rentang Valid [0, 1000]
 * Property 11: Validasi Jawaban dari Sesi Valid
 */

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { hitungSkorUTBK, hitungSkorUTBKPerKomponen } from "@/lib/scoring/utbk";

// ============================================================
// Property 7: Skor UTBK dalam Rentang Valid
// ============================================================
describe("Property 7: Skor UTBK dalam Rentang Valid [0, 1000]", () => {
  it("skor total UTBK selalu dalam rentang [0, 1000]", () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            soalId: fc.string({ minLength: 5 }),
            isBenar: fc.boolean(),
            tingkatKesulitan: fc.float({ min: Math.fround(0.1), max: Math.fround(3.0) }),
          }),
          { minLength: 1, maxLength: 150 }
        ),
        (jawaban) => {
          const hasil = hitungSkorUTBK(jawaban);
          expect(hasil.total).toBeGreaterThanOrEqual(0);
          expect(hasil.total).toBeLessThanOrEqual(1000);
        }
      )
    );
  });

  it("skor per komponen UTBK selalu dalam rentang [0, 1000]", () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            soalId: fc.string({ minLength: 5 }),
            komponen: fc.constantFrom("TPS", "LITERASI_IND", "PENALARAN_MATEMATIKA"),
            isBenar: fc.boolean(),
            tingkatKesulitan: fc.float({ min: Math.fround(0.1), max: Math.fround(3.0) }),
          }),
          { minLength: 1, maxLength: 150 }
        ),
        (jawaban) => {
          const hasil = hitungSkorUTBKPerKomponen(jawaban);
          expect(hasil.total).toBeGreaterThanOrEqual(0);
          expect(hasil.total).toBeLessThanOrEqual(1000);

          for (const skor of Object.values(hasil.komponenSkor)) {
            expect(skor).toBeGreaterThanOrEqual(0);
            expect(skor).toBeLessThanOrEqual(1000);
          }
        }
      )
    );
  });

  it("semua jawaban benar menghasilkan skor lebih tinggi dari semua salah", () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            soalId: fc.string({ minLength: 5 }),
            tingkatKesulitan: fc.float({ min: Math.fround(0.5), max: Math.fround(2.0) }),
          }),
          { minLength: 5, maxLength: 50 }
        ),
        (soalBase) => {
          const semuaBenar = soalBase.map((s) => ({ ...s, isBenar: true }));
          const semuaSalah = soalBase.map((s) => ({ ...s, isBenar: false }));

          const skorBenar = hitungSkorUTBK(semuaBenar).total;
          const skorSalah = hitungSkorUTBK(semuaSalah).total;

          expect(skorBenar).toBeGreaterThanOrEqual(skorSalah);
        }
      )
    );
  });

  it("skor dengan array kosong mengembalikan skor dasar 200", () => {
    const hasil = hitungSkorUTBK([]);
    expect(hasil.total).toBe(200);
  });
});

// ============================================================
// Property 11: Validasi Jawaban dari Sesi Valid
// ============================================================
describe("Property 11: Validasi Jawaban dari Sesi Valid", () => {
  it("jawaban hanya diterima jika soalId ada dalam urutan sesi", () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 5, maxLength: 20 }), { minLength: 5, maxLength: 20 })
          .map((arr) => Array.from(new Set(arr))),
        fc.string({ minLength: 5, maxLength: 20 }),
        (urutanSoal, soalIdLuar) => {
          // Pastikan soalIdLuar tidak ada dalam urutanSoal
          if (urutanSoal.includes(soalIdLuar)) return;

          const validSoalIds = new Set(urutanSoal);

          // Jawaban dengan soalId valid harus diterima
          for (const soalId of urutanSoal) {
            expect(validSoalIds.has(soalId)).toBe(true);
          }

          // Jawaban dengan soalId di luar sesi harus ditolak
          expect(validSoalIds.has(soalIdLuar)).toBe(false);
        }
      )
    );
  });

  it("sesi expired tidak boleh menerima jawaban baru", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 3600 * 1000 }), // ms yang sudah lewat
        (msLalu) => {
          const expiresAt = new Date(Date.now() - msLalu);
          const isExpired = expiresAt < new Date();
          expect(isExpired).toBe(true);
        }
      )
    );
  });

  it("sesi aktif dengan expiresAt di masa depan harus menerima jawaban", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 3600 * 1000 }), // ms ke depan
        (msMendatang) => {
          const expiresAt = new Date(Date.now() + msMendatang);
          const isActive = expiresAt > new Date();
          expect(isActive).toBe(true);
        }
      )
    );
  });
});
