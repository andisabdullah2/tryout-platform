import { test, expect } from "@playwright/test";

/**
 * E2E Tests: Alur Login
 */
test.describe("Login Pengguna", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
  });

  test("halaman login dapat diakses", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /masuk|login/i })).toBeVisible();
  });

  test("form login memiliki field email dan password", async ({ page }) => {
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password|kata sandi/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /masuk|login/i })).toBeVisible();
  });

  test("login dengan kredensial salah menampilkan error", async ({ page }) => {
    await page.getByLabel(/email/i).fill("salah@example.com");
    await page.getByLabel(/password|kata sandi/i).fill("SalahPassword123");
    await page.getByRole("button", { name: /masuk|login/i }).click();

    await expect(
      page.getByText(/salah|tidak valid|invalid|error/i)
    ).toBeVisible({ timeout: 5000 });
  });

  test("link lupa password tersedia", async ({ page }) => {
    const forgotLink = page.getByRole("link", { name: /lupa|forgot/i });
    await expect(forgotLink).toBeVisible();
  });

  test("link ke halaman registrasi tersedia", async ({ page }) => {
    const registerLink = page.getByRole("link", { name: /daftar|register|buat akun/i });
    await expect(registerLink).toBeVisible();
  });

  test("redirect ke dashboard setelah login berhasil", async ({ page }) => {
    await page.getByLabel(/email/i).fill("peserta@tryout-platform.com");
    await page.getByLabel(/password|kata sandi/i).fill("Peserta@12345");
    await page.getByRole("button", { name: /masuk|login/i }).click();

    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
  });
});
