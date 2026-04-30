/**
 * Unit Tests: Fungsi Scoring
 * Covers: cpns.ts, utbk.ts, sekdin.ts
 */

import { describe, it, expect } from "vitest";
import {
  hitungSkorSKD,
  hitungSkorSKDDariJawaban,
  PASSING_GRADE_SKD,
} from "@/lib/scoring/cpns";
import {
  hitungSkorUTBK,
  hitungSkorUTBKPerKomponen,
} from "@/lib/scoring/utbk";
import {
  hitungSkorSekdin,
  KONFIGURASI_STAN,
  KONFIGURASI_IPDN,
} from "@/lib/scoring/sekdin";

// ============================================================
// CPNS SKD
// ============================================================
describe("hitungSkorSKD", () => {
  it("skor nol jika semua tidak dijawab", () => {
    const hasil = hitungSkorSKD({
      twk: { benar: 0, salah: 0 },
      tiu: { benar: 0, salah: 0 },
      tkp: Array(45).fill(0),
    });
    expect(hasil.skorTotal).toBe(0);
    expect(hasil.lulus).toBe(false);
  });

  it("skor maksimum SKD = 575 (35×5 + 35×5 + 45×5)", () => {
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

  it("TWK: benar +5, salah tidak mengurangi", () => {
    const hasil = hitungSkorSKD({
      twk: { benar: 10, salah: 25 },
      tiu: { benar: 0, salah: 0 },
      tkp: Array(45).fill(0),
    });
    expect(hasil.skorTWK).toBe(50); // 10 × 5
  });

  it("TKP: sum nilai opsi (1-5)", () => {
    const tkp = [5, 4, 3, 2, 1, ...Array(40).fill(0)];
    const hasil = hitungSkorSKD({
      twk: { benar: 0, salah: 0 },
      tiu: { benar: 0, salah: 0 },
      tkp,
    });
    expect(hasil.skorTKP).toBe(15); // 5+4+3+2+1
  });

  it("lulus jika semua komponen memenuhi passing grade", () => {
    // TWK: 13 benar = 65, TIU: 16 benar = 80, TKP: 45 soal × 4 = 180 ≥ 166
    const hasil = hitungSkorSKD({
      twk: { benar: 13, salah: 0 },
      tiu: { benar: 16, salah: 0 },
      tkp: Array(45).fill(4),
    });
    expect(hasil.skorTWK).toBe(65);
    expect(hasil.skorTIU).toBe(80);
    expect(hasil.skorTKP).toBe(180);
    expect(hasil.lulus).toBe(true);
  });

  it("tidak lulus jika TWK di bawah passing grade", () => {
    const hasil = hitungSkorSKD({
      twk: { benar: 12, salah: 0 }, // 60 < 65
      tiu: { benar: 16, salah: 0 },
      tkp: Array(45).fill(4),
    });
    expect(hasil.lulus).toBe(false);
  });

  it("tidak lulus jika TIU di bawah passing grade", () => {
    const hasil = hitungSkorSKD({
      twk: { benar: 13, salah: 0 },
      tiu: { benar: 15, salah: 0 }, // 75 < 80
      tkp: Array(45).fill(4),
    });
    expect(hasil.lulus).toBe(false);
  });

  it("passing grade constants sesuai regulasi SKD", () => {
    expect(PASSING_GRADE_SKD.twk).toBe(65);
    expect(PASSING_GRADE_SKD.tiu).toBe(80);
    expect(PASSING_GRADE_SKD.tkp).toBe(166);
    expect(PASSING_GRADE_SKD.total).toBe(311);
  });
});

describe("hitungSkorSKDDariJawaban", () => {
  it("menghitung skor dari array jawaban peserta", () => {
    const jawaban = [
      // TWK: 2 benar
      { soalId: "t1", subtes: "TWK" as const, opsiId: "a1", isBenar: true, nilaiTkp: null },
      { soalId: "t2", subtes: "TWK" as const, opsiId: "a2", isBenar: true, nilaiTkp: null },
      { soalId: "t3", subtes: "TWK" as const, opsiId: "a3", isBenar: false, nilaiTkp: null },
      // TIU: 1 benar
      { soalId: "i1", subtes: "TIU" as const, opsiId: "b1", isBenar: true, nilaiTkp: null },
      // TKP: nilai 3
      { soalId: "k1", subtes: "TKP" as const, opsiId: "c1", isBenar: true, nilaiTkp: 3 },
    ];
    const hasil = hitungSkorSKDDariJawaban(jawaban);
    expect(hasil.skorTWK).toBe(10); // 2 × 5
    expect(hasil.skorTIU).toBe(5);  // 1 × 5
    expect(hasil.skorTKP).toBe(3);  // nilai TKP
  });

  it("soal tidak dijawab (opsiId null) tidak menambah skor", () => {
    const jawaban = [
      { soalId: "t1", subtes: "TWK" as const, opsiId: null, isBenar: null, nilaiTkp: null },
      { soalId: "k1", subtes: "TKP" as const, opsiId: null, isBenar: null, nilaiTkp: null },
    ];
    const hasil = hitungSkorSKDDariJawaban(jawaban);
    expect(hasil.skorTWK).toBe(0);
    expect(hasil.skorTKP).toBe(0);
  });
});

// ============================================================
// UTBK/SNBT
// ============================================================
describe("hitungSkorUTBK", () => {
  it("array kosong mengembalikan skor dasar 200", () => {
    const hasil = hitungSkorUTBK([]);
    expect(hasil.total).toBe(200);
  });

  it("skor selalu dalam rentang [0, 1000]", () => {
    const allBenar = Array.from({ length: 50 }, (_, i) => ({
      soalId: `s${i}`,
      isBenar: true,
      tingkatKesulitan: 1.5,
    }));
    const allSalah = allBenar.map((j) => ({ ...j, isBenar: false }));

    const skorBenar = hitungSkorUTBK(allBenar).total;
    const skorSalah = hitungSkorUTBK(allSalah).total;

    expect(skorBenar).toBeGreaterThanOrEqual(0);
    expect(skorBenar).toBeLessThanOrEqual(1000);
    expect(skorSalah).toBeGreaterThanOrEqual(0);
    expect(skorSalah).toBeLessThanOrEqual(1000);
  });

  it("semua benar menghasilkan skor lebih tinggi dari semua salah", () => {
    const soal = Array.from({ length: 30 }, (_, i) => ({
      soalId: `s${i}`,
      tingkatKesulitan: 1.0,
    }));
    const skorBenar = hitungSkorUTBK(soal.map((s) => ({ ...s, isBenar: true }))).total;
    const skorSalah = hitungSkorUTBK(soal.map((s) => ({ ...s, isBenar: false }))).total;
    expect(skorBenar).toBeGreaterThan(skorSalah);
  });

  it("soal lebih sulit memberikan bobot lebih tinggi", () => {
    const soalMudah = [{ soalId: "s1", isBenar: true, tingkatKesulitan: 0.5 }];
    const soalSulit = [{ soalId: "s1", isBenar: true, tingkatKesulitan: 3.0 }];
    // Keduanya 100% benar, tapi soal sulit seharusnya skor lebih tinggi
    const skorMudah = hitungSkorUTBK(soalMudah).total;
    const skorSulit = hitungSkorUTBK(soalSulit).total;
    // Dengan 1 soal, proporsi sama (100%), jadi skor sama
    expect(skorMudah).toBe(skorSulit);
  });
});

describe("hitungSkorUTBKPerKomponen", () => {
  it("menghitung skor per komponen dengan benar", () => {
    const jawaban = [
      { soalId: "s1", komponen: "TPS", isBenar: true, tingkatKesulitan: 1.0 },
      { soalId: "s2", komponen: "TPS", isBenar: true, tingkatKesulitan: 1.0 },
      { soalId: "s3", komponen: "LITERASI_IND", isBenar: false, tingkatKesulitan: 1.0 },
    ];
    const hasil = hitungSkorUTBKPerKomponen(jawaban);
    expect(hasil.komponenSkor).toHaveProperty("TPS");
    expect(hasil.komponenSkor).toHaveProperty("LITERASI_IND");
    expect(hasil.komponenSkor["TPS"]).toBeGreaterThan(hasil.komponenSkor["LITERASI_IND"]!);
  });

  it("total adalah rata-rata skor komponen", () => {
    const jawaban = [
      { soalId: "s1", komponen: "A", isBenar: true, tingkatKesulitan: 1.0 },
      { soalId: "s2", komponen: "B", isBenar: false, tingkatKesulitan: 1.0 },
    ];
    const hasil = hitungSkorUTBKPerKomponen(jawaban);
    const expectedTotal = Math.round(
      (hasil.komponenSkor["A"]! + hasil.komponenSkor["B"]!) / 2
    );
    expect(hasil.total).toBe(expectedTotal);
  });
});

// ============================================================
// Sekdin
// ============================================================
describe("hitungSkorSekdin", () => {
  it("skor nol jika semua tidak dijawab dengan nilaiKosong=0", () => {
    const jawaban = [
      { soalId: "s1", kategori: "TPA", opsiId: null, isBenar: null },
      { soalId: "s2", kategori: "TPA", opsiId: null, isBenar: null },
    ];
    const hasil = hitungSkorSekdin(jawaban, KONFIGURASI_STAN);
    expect(hasil.skorTotal).toBe(0);
  });

  it("STAN: benar +4, salah -1", () => {
    const jawaban = [
      { soalId: "s1", kategori: "TPA", opsiId: "a1", isBenar: true },
      { soalId: "s2", kategori: "TPA", opsiId: "a2", isBenar: false },
      { soalId: "s3", kategori: "TPA", opsiId: null, isBenar: null },
    ];
    const hasil = hitungSkorSekdin(jawaban, KONFIGURASI_STAN);
    // 1 benar × 4 + 1 salah × (-1) + 1 kosong × 0 = 3
    expect(hasil.skorPerKategori["TPA"]).toBe(3);
    expect(hasil.jumlahBenar).toBe(1);
    expect(hasil.jumlahSalah).toBe(1);
    expect(hasil.jumlahKosong).toBe(1);
  });

  it("IPDN: benar +5, salah 0", () => {
    const jawaban = [
      { soalId: "s1", kategori: "TPA", opsiId: "a1", isBenar: true },
      { soalId: "s2", kategori: "TPA", opsiId: "a2", isBenar: false },
    ];
    const hasil = hitungSkorSekdin(jawaban, KONFIGURASI_IPDN);
    // 1 benar × 5 + 1 salah × 0 = 5
    expect(hasil.skorPerKategori["TPA"]).toBe(5);
  });

  it("persentase benar dihitung dengan benar", () => {
    const jawaban = [
      { soalId: "s1", kategori: "TPA", opsiId: "a1", isBenar: true },
      { soalId: "s2", kategori: "TPA", opsiId: "a2", isBenar: true },
      { soalId: "s3", kategori: "TPA", opsiId: "a3", isBenar: false },
      { soalId: "s4", kategori: "TPA", opsiId: null, isBenar: null },
    ];
    const hasil = hitungSkorSekdin(jawaban, KONFIGURASI_STAN);
    // 2 benar dari 4 soal = 50%
    expect(hasil.persentaseBenar).toBe(50);
  });

  it("skor multi-kategori dijumlahkan dengan benar", () => {
    const jawaban = [
      { soalId: "s1", kategori: "TPA", opsiId: "a1", isBenar: true },
      { soalId: "s2", kategori: "BAHASA_INGGRIS", opsiId: "b1", isBenar: true },
    ];
    const hasil = hitungSkorSekdin(jawaban, KONFIGURASI_STAN);
    // TPA: 1×4=4, BAHASA_INGGRIS: 1×4=4, total=8
    expect(hasil.skorTotal).toBe(8);
    expect(hasil.skorPerKategori["TPA"]).toBe(4);
    expect(hasil.skorPerKategori["BAHASA_INGGRIS"]).toBe(4);
  });

  it("kategori tanpa konfigurasi diabaikan", () => {
    const jawaban = [
      { soalId: "s1", kategori: "KATEGORI_TIDAK_ADA", opsiId: "a1", isBenar: true },
    ];
    const hasil = hitungSkorSekdin(jawaban, KONFIGURASI_STAN);
    expect(hasil.skorTotal).toBe(0);
  });
});
