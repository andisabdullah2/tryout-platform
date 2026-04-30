import { test, expect } from "@playwright/test";

/**
 * E2E Tests: Alur Registrasi
 */
test.describe("Registrasi Pengguna Baru", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/register");
  });

  test("halaman registrasi dapat diakses", async ({ page }) => {
    await expect(page).toHaveTitle(/daftar|registrasi/i);
    await expect(page.getByRole("heading", { name: /daftar|buat akun/i })).toBeVisible();
  });

  test("form registrasi memiliki semua field yang diperlukan", async ({ page }) => {
    await expect(page.getByLabel(/nama/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password|kata sandi/i)).toBeVisible();
  });

  test("validasi: password kurang dari 8 karakter menampilkan error", async ({ page }) => {
    await page.getByLabel(/nama/i).fill("Test User");
    await page.getByLabel(/email/i).fill("test@example.com");
    await page.getByLabel(/password|kata sandi/i).fill("short");
    await page.getByRole("button", { name: /daftar|register/i }).click();

    // Error validasi harus muncul
    await expect(
      page.getByText(/minimal 8|at least 8/i)
    ).toBeVisible({ timeout: 5000 });
  });

  test("validasi: email tidak valid menampilkan error", async ({ page }) => {
    await page.getByLabel(/nama/i).fill("Test User");
    await page.getByLabel(/email/i).fill("bukan-email");
    await page.getByLabel(/password|kata sandi/i).fill("Password123!");
    await page.getByRole("button", { name: /daftar|register/i }).click();

    await expect(
      page.getByText(/email tidak valid|invalid email/i)
    ).toBeVisible({ timeout: 5000 });
  });

  test("link ke halaman login tersedia", async ({ page }) => {
    const loginLink = page.getByRole("link", { name: /masuk|login|sudah punya akun/i });
    await expect(loginLink).toBeVisible();
    await loginLink.click();
    await expect(page).toHaveURL(/\/login/);
  });
});
