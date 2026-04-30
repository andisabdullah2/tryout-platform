/**
 * Validasi autentikasi
 */

export interface PasswordValidationResult {
  valid: boolean;
  lengthValid: boolean;
  error?: string;
}

/**
 * Validasi panjang kata sandi
 *
 * Property 2: Validasi Panjang Kata Sandi
 * - Kata sandi < 8 karakter selalu ditolak
 * - Kata sandi >= 8 karakter diterima (dari sisi validasi panjang)
 */
export function validatePassword(password: string): PasswordValidationResult {
  const lengthValid = password.length >= 8;

  if (!lengthValid) {
    return {
      valid: false,
      lengthValid: false,
      error: "Kata sandi harus minimal 8 karakter",
    };
  }

  return {
    valid: true,
    lengthValid: true,
  };
}

export interface EmailValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validasi format email
 */
export function validateEmail(email: string): EmailValidationResult {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const valid = emailRegex.test(email);

  if (!valid) {
    return {
      valid: false,
      error: "Format email tidak valid",
    };
  }

  return { valid: true };
}

/**
 * Cek apakah akun terkunci
 */
export function isAccountLocked(lockedUntil: Date | null): boolean {
  if (!lockedUntil) return false;
  return new Date() < lockedUntil;
}

/**
 * Hitung waktu kunci akun (15 menit dari sekarang)
 */
export function calculateLockUntil(): Date {
  const lockDuration = 15 * 60 * 1000; // 15 menit dalam ms
  return new Date(Date.now() + lockDuration);
}

export const MAX_LOGIN_ATTEMPTS = 5;
export const LOCK_DURATION_MINUTES = 15;
