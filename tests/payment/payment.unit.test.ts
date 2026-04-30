/**
 * Unit Tests: Payment Service
 * Covers: verifikasi signature Midtrans, kalkulasi diskon promo
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import crypto from "crypto";
import { applyPromoDiscount } from "@/lib/payment/promo";
import { verifyMidtransSignature } from "@/lib/payment/midtrans";

// ============================================================
// Verifikasi Signature Midtrans
// ============================================================
describe("verifyMidtransSignature", () => {
  const SERVER_KEY = "test-server-key-12345";

  beforeEach(() => {
    // Mock environment variable
    vi.stubEnv("MIDTRANS_SERVER_KEY", SERVER_KEY);
  });

  function buildSignature(orderId: string, statusCode: string, grossAmount: string): string {
    return crypto
      .createHash("sha512")
      .update(`${orderId}${statusCode}${grossAmount}${SERVER_KEY}`)
      .digest("hex");
  }

  it("mengembalikan true untuk signature yang valid", () => {
    const orderId = "TRX-ABC123";
    const statusCode = "200";
    const grossAmount = "150000.00";
    const signature = buildSignature(orderId, statusCode, grossAmount);

    expect(verifyMidtransSignature(orderId, statusCode, grossAmount, signature)).toBe(true);
  });

  it("mengembalikan false untuk signature yang salah", () => {
    const orderId = "TRX-ABC123";
    const statusCode = "200";
    const grossAmount = "150000.00";
    const wrongSignature = "invalid-signature-hash";

    expect(verifyMidtransSignature(orderId, statusCode, grossAmount, wrongSignature)).toBe(false);
  });

  it("mengembalikan false jika orderId berbeda", () => {
    const statusCode = "200";
    const grossAmount = "150000.00";
    const signature = buildSignature("TRX-ORIGINAL", statusCode, grossAmount);

    expect(verifyMidtransSignature("TRX-DIFFERENT", statusCode, grossAmount, signature)).toBe(false);
  });

  it("mengembalikan false jika grossAmount berbeda", () => {
    const orderId = "TRX-ABC123";
    const statusCode = "200";
    const signature = buildSignature(orderId, statusCode, "150000.00");

    expect(verifyMidtransSignature(orderId, statusCode, "200000.00", signature)).toBe(false);
  });

  it("signature bersifat case-sensitive", () => {
    const orderId = "TRX-ABC123";
    const statusCode = "200";
    const grossAmount = "150000.00";
    const signature = buildSignature(orderId, statusCode, grossAmount);
    const upperSignature = signature.toUpperCase();

    // SHA-512 hex adalah lowercase, uppercase tidak valid
    expect(verifyMidtransSignature(orderId, statusCode, grossAmount, upperSignature)).toBe(false);
  });

  it("signature berbeda untuk setiap kombinasi parameter unik", () => {
    const sig1 = buildSignature("TRX-001", "200", "100000.00");
    const sig2 = buildSignature("TRX-002", "200", "100000.00");
    const sig3 = buildSignature("TRX-001", "201", "100000.00");
    const sig4 = buildSignature("TRX-001", "200", "200000.00");

    const signatures = [sig1, sig2, sig3, sig4];
    const uniqueSignatures = new Set(signatures);
    expect(uniqueSignatures.size).toBe(4);
  });
});

// ============================================================
// Kalkulasi Diskon Promo
// ============================================================
describe("applyPromoDiscount", () => {
  // Diskon Nominal
  describe("tipe NOMINAL", () => {
    it("mengurangi harga dengan nilai nominal", () => {
      const result = applyPromoDiscount(100000, { tipe: "NOMINAL", nilai: 20000 });
      expect(result.finalAmount).toBe(80000);
      expect(result.diskonDiterapkan).toBe(20000);
    });

    it("tidak menghasilkan nilai negatif jika diskon > harga", () => {
      const result = applyPromoDiscount(50000, { tipe: "NOMINAL", nilai: 100000 });
      expect(result.finalAmount).toBe(0);
      expect(result.diskonDiterapkan).toBe(50000); // dibatasi oleh harga
    });

    it("diskon 0 tidak mengubah harga", () => {
      const result = applyPromoDiscount(100000, { tipe: "NOMINAL", nilai: 0 });
      expect(result.finalAmount).toBe(100000);
      expect(result.diskonDiterapkan).toBe(0);
    });

    it("finalAmount + diskonDiterapkan = harga asli", () => {
      const harga = 250000;
      const diskon = 75000;
      const result = applyPromoDiscount(harga, { tipe: "NOMINAL", nilai: diskon });
      expect(result.finalAmount + result.diskonDiterapkan).toBe(harga);
    });

    it("diskon tepat sama dengan harga menghasilkan 0", () => {
      const result = applyPromoDiscount(100000, { tipe: "NOMINAL", nilai: 100000 });
      expect(result.finalAmount).toBe(0);
      expect(result.diskonDiterapkan).toBe(100000);
    });
  });

  // Diskon Persentase
  describe("tipe PERSEN", () => {
    it("menghitung diskon 50% dengan benar", () => {
      const result = applyPromoDiscount(100000, { tipe: "PERSEN", nilai: 50 });
      expect(result.finalAmount).toBe(50000);
      expect(result.diskonDiterapkan).toBe(50000);
    });

    it("diskon 0% tidak mengubah harga", () => {
      const result = applyPromoDiscount(100000, { tipe: "PERSEN", nilai: 0 });
      expect(result.finalAmount).toBe(100000);
      expect(result.diskonDiterapkan).toBe(0);
    });

    it("diskon 100% menghasilkan harga 0", () => {
      const result = applyPromoDiscount(100000, { tipe: "PERSEN", nilai: 100 });
      expect(result.finalAmount).toBe(0);
      expect(result.diskonDiterapkan).toBe(100000);
    });

    it("diskon 10% dari Rp 150.000 = Rp 15.000", () => {
      const result = applyPromoDiscount(150000, { tipe: "PERSEN", nilai: 10 });
      expect(result.diskonDiterapkan).toBe(15000);
      expect(result.finalAmount).toBe(135000);
    });

    it("diskon 25% dari Rp 299.000 dibulatkan dengan benar", () => {
      const result = applyPromoDiscount(299000, { tipe: "PERSEN", nilai: 25 });
      const expectedDiskon = Math.round(299000 * 0.25);
      expect(result.diskonDiterapkan).toBe(expectedDiskon);
      expect(result.finalAmount).toBe(299000 - expectedDiskon);
    });

    it("finalAmount selalu non-negatif", () => {
      const result = applyPromoDiscount(1000, { tipe: "PERSEN", nilai: 100 });
      expect(result.finalAmount).toBeGreaterThanOrEqual(0);
    });
  });

  // Edge cases
  describe("edge cases", () => {
    it("harga 0 dengan diskon nominal menghasilkan 0", () => {
      const result = applyPromoDiscount(0, { tipe: "NOMINAL", nilai: 50000 });
      expect(result.finalAmount).toBe(0);
      expect(result.diskonDiterapkan).toBe(0);
    });

    it("harga 0 dengan diskon persen menghasilkan 0", () => {
      const result = applyPromoDiscount(0, { tipe: "PERSEN", nilai: 50 });
      expect(result.finalAmount).toBe(0);
      expect(result.diskonDiterapkan).toBe(0);
    });

    it("harga besar dengan diskon kecil dihitung dengan benar", () => {
      const result = applyPromoDiscount(10_000_000, { tipe: "NOMINAL", nilai: 1000 });
      expect(result.finalAmount).toBe(9_999_000);
      expect(result.diskonDiterapkan).toBe(1000);
    });
  });
});
