/**
 * Property Tests: Validasi Kata Sandi dan Penguncian Akun
 *
 * Property 2: Validasi Panjang Kata Sandi
 * Property 3: Penguncian Akun Setelah Login Gagal
 */

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import {
  validatePassword,
  isAccountLocked,
  calculateLockUntil,
  MAX_LOGIN_ATTEMPTS,
  LOCK_DURATION_MINUTES,
} from "@/lib/auth/validation";

describe("Property 2: Validasi Panjang Kata Sandi", () => {
  it("kata sandi dengan panjang < 8 karakter selalu ditolak", () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 0, maxLength: 7 }),
        (password) => {
          const result = validatePassword(password);
          expect(result.valid).toBe(false);
          expect(result.lengthValid).toBe(false);
          expect(result.error).toContain("minimal 8 karakter");
        }
      )
    );
  });

  it("kata sandi dengan panjang >= 8 karakter diterima dari sisi validasi panjang", () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 8, maxLength: 128 }),
        (password) => {
          const result = validatePassword(password);
          expect(result.lengthValid).toBe(true);
        }
      )
    );
  });

  it("batas tepat: panjang 7 ditolak, panjang 8 diterima", () => {
    const sevenChars = "abcdefg";
    const eightChars = "abcdefgh";

    expect(validatePassword(sevenChars).valid).toBe(false);
    expect(validatePassword(eightChars).lengthValid).toBe(true);
  });

  it("string kosong selalu ditolak", () => {
    const result = validatePassword("");
    expect(result.valid).toBe(false);
    expect(result.lengthValid).toBe(false);
  });
});

describe("Property 3: Penguncian Akun Setelah Login Gagal", () => {
  it("akun tidak terkunci jika lockedUntil null", () => {
    fc.assert(
      fc.property(
        fc.constant(null),
        (lockedUntil) => {
          expect(isAccountLocked(lockedUntil)).toBe(false);
        }
      )
    );
  });

  it("akun terkunci jika lockedUntil di masa depan", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 3600 * 1000 }), // 1ms - 1 jam ke depan
        (msInFuture) => {
          const lockedUntil = new Date(Date.now() + msInFuture);
          expect(isAccountLocked(lockedUntil)).toBe(true);
        }
      )
    );
  });

  it("akun tidak terkunci jika lockedUntil sudah lewat", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 3600 * 1000 }), // 1ms - 1 jam yang lalu
        (msInPast) => {
          const lockedUntil = new Date(Date.now() - msInPast);
          expect(isAccountLocked(lockedUntil)).toBe(false);
        }
      )
    );
  });

  it("calculateLockUntil menghasilkan waktu 15 menit ke depan", () => {
    const before = Date.now();
    const lockUntil = calculateLockUntil();
    const after = Date.now();

    const expectedMs = LOCK_DURATION_MINUTES * 60 * 1000;
    const lockMs = lockUntil.getTime();

    expect(lockMs).toBeGreaterThanOrEqual(before + expectedMs);
    expect(lockMs).toBeLessThanOrEqual(after + expectedMs + 100); // toleransi 100ms
  });

  it("MAX_LOGIN_ATTEMPTS adalah 5", () => {
    expect(MAX_LOGIN_ATTEMPTS).toBe(5);
  });

  it("LOCK_DURATION_MINUTES adalah 15", () => {
    expect(LOCK_DURATION_MINUTES).toBe(15);
  });

  it("akun yang baru dikunci pasti terkunci", () => {
    fc.assert(
      fc.property(
        fc.constant(undefined),
        () => {
          const lockUntil = calculateLockUntil();
          expect(isAccountLocked(lockUntil)).toBe(true);
        }
      )
    );
  });
});
