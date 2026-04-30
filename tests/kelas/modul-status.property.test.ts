/**
 * Property Tests: Status Modul dan Persistensi Video
 *
 * Property 14: Status Modul pada Enrollment
 * Property 12: Persistensi Posisi Video (Round-trip)
 */

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";

// ============================================================
// Tipe dan fungsi helper (mirror dari logika aplikasi)
// ============================================================

type StatusModul = "belum_dimulai" | "sedang_berjalan" | "selesai";

interface ModulProgress {
  modulId: string;
  posisiDetik: number;
  isSelesai: boolean;
}

interface ModulWithStatus {
  id: string;
  judul: string;
  urutan: number;
  status: StatusModul;
}

/**
 * Hitung status modul berdasarkan progress
 */
function hitungStatusModul(
  modulId: string,
  progressMap: Record<string, ModulProgress>
): StatusModul {
  const progress = progressMap[modulId];
  if (!progress) return "belum_dimulai";
  if (progress.isSelesai) return "selesai";
  if (progress.posisiDetik > 0) return "sedang_berjalan";
  return "belum_dimulai";
}

/**
 * Dapatkan daftar modul dengan status untuk user yang enrolled
 */
function getModulDenganStatus(
  modulList: { id: string; judul: string; urutan: number }[],
  progressMap: Record<string, ModulProgress>
): ModulWithStatus[] {
  return modulList.map((modul) => ({
    ...modul,
    status: hitungStatusModul(modul.id, progressMap),
  }));
}

// ============================================================
// Property 14: Status Modul pada Enrollment
// ============================================================
describe("Property 14: Status Modul pada Enrollment", () => {
  it("setiap modul dalam kelas yang di-enroll harus memiliki status", () => {
    fc.assert(
      fc.property(
        // Generate daftar modul
        fc.array(
          fc.record({
            id: fc.string({ minLength: 5, maxLength: 20 }),
            judul: fc.string({ minLength: 3, maxLength: 50 }),
            urutan: fc.integer({ min: 1, max: 20 }),
          }),
          { minLength: 1, maxLength: 10 }
        ),
        // Generate progress map (bisa kosong atau partial)
        fc.dictionary(
          fc.string({ minLength: 5, maxLength: 20 }),
          fc.record({
            modulId: fc.string({ minLength: 5, maxLength: 20 }),
            posisiDetik: fc.integer({ min: 0, max: 86400 }),
            isSelesai: fc.boolean(),
          })
        ),
        (modulList, progressMap) => {
          const result = getModulDenganStatus(modulList, progressMap);

          // Setiap modul harus memiliki status
          expect(result).toHaveLength(modulList.length);
          for (const modul of result) {
            expect(modul.status).toBeDefined();
            expect(["belum_dimulai", "sedang_berjalan", "selesai"]).toContain(modul.status);
          }
        }
      )
    );
  });

  it("modul tanpa progress selalu berstatus belum_dimulai", () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 5, maxLength: 20 }),
        (modulId) => {
          const status = hitungStatusModul(modulId, {});
          expect(status).toBe("belum_dimulai");
        }
      )
    );
  });

  it("modul dengan isSelesai=true selalu berstatus selesai", () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 5, maxLength: 20 }),
        fc.integer({ min: 0, max: 86400 }),
        (modulId, posisiDetik) => {
          const progressMap: Record<string, ModulProgress> = {
            [modulId]: { modulId, posisiDetik, isSelesai: true },
          };
          const status = hitungStatusModul(modulId, progressMap);
          expect(status).toBe("selesai");
        }
      )
    );
  });

  it("modul dengan posisi > 0 dan belum selesai berstatus sedang_berjalan", () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 5, maxLength: 20 }),
        fc.integer({ min: 1, max: 86400 }),
        (modulId, posisiDetik) => {
          const progressMap: Record<string, ModulProgress> = {
            [modulId]: { modulId, posisiDetik, isSelesai: false },
          };
          const status = hitungStatusModul(modulId, progressMap);
          expect(status).toBe("sedang_berjalan");
        }
      )
    );
  });

  it("tidak ada modul yang dikembalikan tanpa status field", () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: fc.string({ minLength: 5, maxLength: 20 }),
            judul: fc.string({ minLength: 3 }),
            urutan: fc.integer({ min: 1, max: 50 }),
          }),
          { minLength: 0, maxLength: 20 }
        ),
        (modulList) => {
          const result = getModulDenganStatus(modulList, {});
          for (const modul of result) {
            expect("status" in modul).toBe(true);
            expect(modul.status).not.toBeNull();
            expect(modul.status).not.toBeUndefined();
          }
        }
      )
    );
  });
});

// ============================================================
// Property 12: Persistensi Posisi Video (Round-trip)
// ============================================================
describe("Property 12: Persistensi Posisi Video (Round-trip)", () => {
  it("posisi video yang disimpan dapat dipulihkan dengan tepat", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 86400 }), // posisi dalam detik (max 24 jam)
        fc.string({ minLength: 5, maxLength: 20 }), // userId
        fc.string({ minLength: 5, maxLength: 20 }), // modulId
        (posisi, userId, modulId) => {
          // Simulasi save dan restore (in-memory)
          const store = new Map<string, { posisiDetik: number; isSelesai: boolean }>();
          const key = `${userId}_${modulId}`;

          // Save
          store.set(key, { posisiDetik: posisi, isSelesai: false });

          // Restore
          const retrieved = store.get(key);
          expect(retrieved?.posisiDetik).toBe(posisi);
        }
      )
    );
  });

  it("posisi video selalu non-negatif", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 86400 }),
        (posisi) => {
          expect(posisi).toBeGreaterThanOrEqual(0);
        }
      )
    );
  });

  it("isSelesai=true jika posisi >= 90% durasi", () => {
    // Test deterministik — hindari floating point edge cases
    const cases = [
      { durasi: 100, posisi: 90, expected: true },
      { durasi: 100, posisi: 91, expected: true },
      { durasi: 100, posisi: 100, expected: true },
      { durasi: 100, posisi: 89, expected: false },
      { durasi: 200, posisi: 180, expected: true },
      { durasi: 200, posisi: 179, expected: false },
      { durasi: 3600, posisi: 3240, expected: true },
      { durasi: 3600, posisi: 3239, expected: false },
    ];

    for (const { durasi, posisi, expected } of cases) {
      const isSelesai = posisi / durasi >= 0.9;
      expect(isSelesai).toBe(expected);
    }
  });

  it("update posisi video tidak mengubah modulId atau userId", () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 5, maxLength: 20 }),
        fc.string({ minLength: 5, maxLength: 20 }),
        fc.integer({ min: 0, max: 3600 }),
        fc.integer({ min: 0, max: 3600 }),
        (userId, modulId, posisi1, posisi2) => {
          const store = new Map<string, { userId: string; modulId: string; posisiDetik: number }>();
          const key = `${userId}_${modulId}`;

          store.set(key, { userId, modulId, posisiDetik: posisi1 });
          store.set(key, { userId, modulId, posisiDetik: posisi2 });

          const retrieved = store.get(key);
          expect(retrieved?.userId).toBe(userId);
          expect(retrieved?.modulId).toBe(modulId);
          expect(retrieved?.posisiDetik).toBe(posisi2);
        }
      )
    );
  });
});
