/**
 * Property Tests: Kalkulasi Diskon Kode Promo
 *
 * Property 13: Kalkulasi Diskon Kode Promo
 */

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { applyPromoDiscount } from "@/lib/payment/promo";

describe("Property 13: Kalkulasi Diskon Kode Promo", () => {
  it("diskon nominal: finalAmount = max(0, harga - diskon)", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1000, max: 10_000_000 }),
        fc.integer({ min: 0, max: 1_000_000 }),
        (harga, diskon) => {
          const result = applyPromoDiscount(harga, { tipe: "NOMINAL", nilai: diskon });
          expect(result.finalAmount).toBe(Math.max(0, harga - diskon));
          expect(result.diskonDiterapkan).toBe(Math.min(diskon, harga));
        }
      )
    );
  });

  it("diskon nominal tidak pernah menghasilkan nilai negatif", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 10_000_000 }),
        fc.integer({ min: 0, max: 20_000_000 }),
        (harga, diskon) => {
          const result = applyPromoDiscount(harga, { tipe: "NOMINAL", nilai: diskon });
          expect(result.finalAmount).toBeGreaterThanOrEqual(0);
        }
      )
    );
  });

  it("diskon persentase: finalAmount = round(harga * (1 - persen/100))", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1000, max: 10_000_000 }),
        fc.integer({ min: 0, max: 100 }),
        (harga, persen) => {
          const result = applyPromoDiscount(harga, { tipe: "PERSEN", nilai: persen });
          const expected = Math.max(0, harga - Math.round(harga * (persen / 100)));
          expect(result.finalAmount).toBe(expected);
          expect(result.finalAmount).toBeGreaterThanOrEqual(0);
        }
      )
    );
  });

  it("diskon 0% tidak mengubah harga", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1000, max: 10_000_000 }),
        (harga) => {
          const result = applyPromoDiscount(harga, { tipe: "PERSEN", nilai: 0 });
          expect(result.finalAmount).toBe(harga);
          expect(result.diskonDiterapkan).toBe(0);
        }
      )
    );
  });

  it("diskon 100% menghasilkan harga 0", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1000, max: 10_000_000 }),
        (harga) => {
          const result = applyPromoDiscount(harga, { tipe: "PERSEN", nilai: 100 });
          expect(result.finalAmount).toBe(0);
          expect(result.diskonDiterapkan).toBe(harga);
        }
      )
    );
  });

  it("diskon nominal lebih besar dari harga menghasilkan 0", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1000, max: 1_000_000 }),
        fc.integer({ min: 1, max: 1_000_000 }),
        (harga, extra) => {
          const diskon = harga + extra;
          const result = applyPromoDiscount(harga, { tipe: "NOMINAL", nilai: diskon });
          expect(result.finalAmount).toBe(0);
          expect(result.diskonDiterapkan).toBe(harga);
        }
      )
    );
  });

  it("finalAmount + diskonDiterapkan = harga asli (untuk nominal)", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1000, max: 10_000_000 }),
        fc.integer({ min: 0, max: 10_000_000 }),
        (harga, diskon) => {
          const result = applyPromoDiscount(harga, { tipe: "NOMINAL", nilai: diskon });
          expect(result.finalAmount + result.diskonDiterapkan).toBe(harga);
        }
      )
    );
  });
});
