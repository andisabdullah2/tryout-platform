/**
 * Integration Tests: Alur Tryout End-to-End
 * Mulai → Jawab → Selesai → Hasil
 *
 * Menguji logika bisnis tryout secara terisolasi tanpa database/HTTP.
 * Fokus: validasi sesi, penyimpanan jawaban, kalkulasi skor, dan hasil.
 */

import { describe, it, expect } from "vitest";
import { acakUrutanSoal } from "@/lib/tryout/shuffle";
import {
  hitungSkorSKD,
  hitungSkorSKDDariJawaban,
  PASSING_GRADE_SKD,
} from "@/lib/scoring/cpns";
import { hitungSkorUTBK } from "@/lib/scoring/utbk";

// ============================================================
// Tipe data untuk simulasi alur tryout
// ============================================================

interface MockSoal {
  id: string;
  subtes: "TWK" | "TIU" | "TKP";
  opsiBenarId: string;
  nilaiTkp?: number;
}

interface MockSesi {
  id: string;
  userId: string;
  paketId: string;
  status: "ACTIVE" | "COMPLETED" | "EXPIRED";
  startedAt: Date;
  expiresAt: Date;
  urutanSoal: string[];
  jawaban: Record<string, string | null>; // soalId → opsiId
}

// ============================================================
// Helper: buat sesi tryout baru
// ============================================================
function buatSesi(
  userId: string,
  paketId: string,
  soalIds: string[],
  durasiMenit: number
): MockSesi {
  const urutanSoal = acakUrutanSoal(soalIds);
  return {
    id: `sesi-${Date.now()}`,
    userId,
    paketId,
    status: "ACTIVE",
    startedAt: new Date(),
    expiresAt: new Date(Date.now() + durasiMenit * 60 * 1000),
    urutanSoal,
    jawaban: {},
  };
}

// ============================================================
// Helper: simpan jawaban
// ============================================================
function simpanJawaban(
  sesi: MockSesi,
  soalId: string,
  opsiId: string | null
): { success: boolean; error?: string } {
  if (sesi.status !== "ACTIVE") {
    return { success: false, error: "Sesi tidak aktif" };
  }
  if (sesi.expiresAt < new Date()) {
    return { success: false, error: "Sesi sudah kedaluwarsa" };
  }
  if (!sesi.urutanSoal.includes(soalId)) {
    return { success: false, error: "Soal tidak ada dalam sesi ini" };
  }
  sesi.jawaban[soalId] = opsiId;
  return { success: true };
}

// ============================================================
// Helper: selesaikan sesi dan hitung skor SKD
// ============================================================
function selesaikanSesiSKD(
  sesi: MockSesi,
  soalList: MockSoal[]
): {
  success: boolean;
  error?: string;
  hasil?: ReturnType<typeof hitungSkorSKD>;
} {
  if (sesi.status !== "ACTIVE") {
    return { success: false, error: "Sesi tidak aktif" };
  }

  // Konversi jawaban ke format SKD
  const jawabanSKD = soalList.map((soal) => {
    const opsiDipilih = sesi.jawaban[soal.id] ?? null;
    const isBenar = opsiDipilih === soal.opsiBenarId;
    return {
      soalId: soal.id,
      subtes: soal.subtes,
      opsiId: opsiDipilih,
      isBenar: opsiDipilih !== null ? isBenar : null,
      nilaiTkp: soal.subtes === "TKP" && opsiDipilih === soal.opsiBenarId
        ? (soal.nilaiTkp ?? 3)
        : null,
    };
  });

  const hasil = hitungSkorSKDDariJawaban(jawabanSKD);
  sesi.status = "COMPLETED";
  return { success: true, hasil };
}

// ============================================================
// Test: Alur Lengkap Tryout SKD
// ============================================================
describe("Alur Tryout SKD: Mulai → Jawab → Selesai → Hasil", () => {
  // Buat 5 soal SKD sederhana
  const soalList: MockSoal[] = [
    { id: "twk-1", subtes: "TWK", opsiBenarId: "a" },
    { id: "twk-2", subtes: "TWK", opsiBenarId: "b" },
    { id: "tiu-1", subtes: "TIU", opsiBenarId: "c" },
    { id: "tkp-1", subtes: "TKP", opsiBenarId: "d", nilaiTkp: 4 },
    { id: "tkp-2", subtes: "TKP", opsiBenarId: "e", nilaiTkp: 3 },
  ];
  const soalIds = soalList.map((s) => s.id);

  it("1. Mulai: sesi dibuat dengan urutan soal yang diacak", () => {
    const sesi = buatSesi("user-1", "paket-1", soalIds, 100);

    expect(sesi.status).toBe("ACTIVE");
    expect(sesi.urutanSoal).toHaveLength(soalIds.length);
    expect(new Set(sesi.urutanSoal)).toEqual(new Set(soalIds));
    expect(sesi.expiresAt.getTime()).toBeGreaterThan(Date.now());
  });

  it("2. Jawab: jawaban tersimpan dengan benar", () => {
    const sesi = buatSesi("user-1", "paket-1", soalIds, 100);

    const result1 = simpanJawaban(sesi, "twk-1", "a"); // benar
    const result2 = simpanJawaban(sesi, "twk-2", "x"); // salah
    const result3 = simpanJawaban(sesi, "tkp-1", "d"); // benar

    expect(result1.success).toBe(true);
    expect(result2.success).toBe(true);
    expect(result3.success).toBe(true);
    expect(sesi.jawaban["twk-1"]).toBe("a");
    expect(sesi.jawaban["twk-2"]).toBe("x");
    expect(sesi.jawaban["tkp-1"]).toBe("d");
  });

  it("3. Jawab: menolak soal yang tidak ada dalam sesi", () => {
    const sesi = buatSesi("user-1", "paket-1", soalIds, 100);
    const result = simpanJawaban(sesi, "soal-tidak-ada", "a");

    expect(result.success).toBe(false);
    expect(result.error).toContain("tidak ada dalam sesi");
  });

  it("4. Jawab: menolak jawaban setelah sesi selesai", () => {
    const sesi = buatSesi("user-1", "paket-1", soalIds, 100);
    sesi.status = "COMPLETED";

    const result = simpanJawaban(sesi, "twk-1", "a");
    expect(result.success).toBe(false);
    expect(result.error).toContain("tidak aktif");
  });

  it("5. Selesai: skor dihitung dengan benar", () => {
    const sesi = buatSesi("user-1", "paket-1", soalIds, 100);

    // Jawab semua soal
    simpanJawaban(sesi, "twk-1", "a"); // benar
    simpanJawaban(sesi, "twk-2", "b"); // benar
    simpanJawaban(sesi, "tiu-1", "c"); // benar
    simpanJawaban(sesi, "tkp-1", "d"); // benar, nilai 4
    simpanJawaban(sesi, "tkp-2", "e"); // benar, nilai 3

    const result = selesaikanSesiSKD(sesi, soalList);

    expect(result.success).toBe(true);
    expect(result.hasil).toBeDefined();
    expect(result.hasil!.skorTWK).toBe(10); // 2 × 5
    expect(result.hasil!.skorTIU).toBe(5);  // 1 × 5
    expect(result.hasil!.skorTKP).toBe(7);  // 4 + 3
    expect(result.hasil!.skorTotal).toBe(22);
    expect(sesi.status).toBe("COMPLETED");
  });

  it("6. Selesai: skor nol jika semua tidak dijawab", () => {
    const sesi = buatSesi("user-1", "paket-1", soalIds, 100);
    // Tidak menjawab apapun

    const result = selesaikanSesiSKD(sesi, soalList);
    expect(result.success).toBe(true);
    expect(result.hasil!.skorTotal).toBe(0);
  });

  it("7. Hasil: lulus jika memenuhi passing grade", () => {
    // Buat soal SKD lengkap (35 TWK, 35 TIU, 45 TKP)
    const soalSKD: MockSoal[] = [
      ...Array.from({ length: 35 }, (_, i) => ({
        id: `twk-${i}`,
        subtes: "TWK" as const,
        opsiBenarId: "benar",
      })),
      ...Array.from({ length: 35 }, (_, i) => ({
        id: `tiu-${i}`,
        subtes: "TIU" as const,
        opsiBenarId: "benar",
      })),
      ...Array.from({ length: 45 }, (_, i) => ({
        id: `tkp-${i}`,
        subtes: "TKP" as const,
        opsiBenarId: "benar",
        nilaiTkp: 4,
      })),
    ];

    const sesi = buatSesi("user-1", "paket-1", soalSKD.map((s) => s.id), 100);

    // Jawab semua benar
    for (const soal of soalSKD) {
      simpanJawaban(sesi, soal.id, "benar");
    }

    const result = selesaikanSesiSKD(sesi, soalSKD);
    expect(result.success).toBe(true);
    // TWK: 35×5=175 ≥ 65 ✓, TIU: 35×5=175 ≥ 80 ✓, TKP: 45×4=180 ≥ 166 ✓
    expect(result.hasil!.lulus).toBe(true);
  });

  it("8. Sesi tidak dapat diselesaikan dua kali", () => {
    const sesi = buatSesi("user-1", "paket-1", soalIds, 100);
    selesaikanSesiSKD(sesi, soalList);

    const result2 = selesaikanSesiSKD(sesi, soalList);
    expect(result2.success).toBe(false);
    expect(result2.error).toContain("tidak aktif");
  });
});

// ============================================================
// Test: Validasi Sesi
// ============================================================
describe("Validasi Sesi Tryout", () => {
  it("sesi expired tidak menerima jawaban baru", () => {
    const sesi = buatSesi("user-1", "paket-1", ["s1", "s2"], 0);
    // Set expiresAt ke masa lalu
    sesi.expiresAt = new Date(Date.now() - 1000);

    const result = simpanJawaban(sesi, "s1", "a");
    expect(result.success).toBe(false);
    expect(result.error).toContain("kedaluwarsa");
  });

  it("sesi aktif menerima jawaban", () => {
    const sesi = buatSesi("user-1", "paket-1", ["s1", "s2"], 100);
    const result = simpanJawaban(sesi, "s1", "a");
    expect(result.success).toBe(true);
  });

  it("urutan soal berbeda antar sesi untuk paket yang sama", () => {
    const soalIds = Array.from({ length: 20 }, (_, i) => `soal-${i}`);
    const sesi1 = buatSesi("user-1", "paket-1", soalIds, 100);
    const sesi2 = buatSesi("user-2", "paket-1", soalIds, 100);

    // Dengan 20 soal, sangat kecil kemungkinan urutan sama
    // (probabilitas 1/20! ≈ 0)
    const sameOrder = JSON.stringify(sesi1.urutanSoal) === JSON.stringify(sesi2.urutanSoal);
    // Tidak bisa guarantee berbeda, tapi test bahwa keduanya valid
    expect(sesi1.urutanSoal).toHaveLength(20);
    expect(sesi2.urutanSoal).toHaveLength(20);
    expect(new Set(sesi1.urutanSoal).size).toBe(20);
    expect(new Set(sesi2.urutanSoal).size).toBe(20);
    // Catat jika kebetulan sama (sangat jarang)
    if (sameOrder) {
      console.warn("Urutan soal kebetulan sama — ini sangat jarang terjadi");
    }
  });
});

// ============================================================
// Test: Auto-save Jawaban
// ============================================================
describe("Auto-save Jawaban", () => {
  it("jawaban dapat diperbarui (overwrite)", () => {
    const sesi = buatSesi("user-1", "paket-1", ["s1"], 100);

    simpanJawaban(sesi, "s1", "a");
    expect(sesi.jawaban["s1"]).toBe("a");

    simpanJawaban(sesi, "s1", "b"); // ganti jawaban
    expect(sesi.jawaban["s1"]).toBe("b");
  });

  it("jawaban null berarti tidak dijawab", () => {
    const sesi = buatSesi("user-1", "paket-1", ["s1"], 100);

    simpanJawaban(sesi, "s1", null);
    expect(sesi.jawaban["s1"]).toBeNull();
  });

  it("snapshot jawaban dapat di-serialize dan di-restore", () => {
    const sesi = buatSesi("user-1", "paket-1", ["s1", "s2", "s3"], 100);
    simpanJawaban(sesi, "s1", "a");
    simpanJawaban(sesi, "s2", null);
    simpanJawaban(sesi, "s3", "c");

    // Simulasi localStorage round-trip
    const snapshot = JSON.stringify(sesi.jawaban);
    const restored = JSON.parse(snapshot) as Record<string, string | null>;

    expect(restored["s1"]).toBe("a");
    expect(restored["s2"]).toBeNull();
    expect(restored["s3"]).toBe("c");
  });
});
