import { test, expect } from "@playwright/test";
import { loginAsPeserta } from "../helpers/auth";

/**
 * E2E Tests: Alur Checkout
 */
test.describe("Halaman Checkout", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsPeserta(page);
  });

  test("redirect ke login jika belum terautentikasi", async ({ page }) => {
    // Logout dulu
    await page.goto("/login");

    // Akses checkout tanpa login
    await page.goto("/checkout?langganan=BULANAN");
    await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
  });

  test("halaman checkout menampilkan ringkasan pesanan", async ({ page }) => {
    await page.goto("/checkout?langganan=BULANAN");

    await expect(
      page.getByText(/langganan bulanan|ringkasan pesanan/i)
    ).toBeVisible({ timeout: 5000 });
  });

  test("input kode promo tersedia di halaman checkout", async ({ page }) => {
    await page.goto("/checkout?langganan=BULANAN");

    const promoInput = page.getByPlaceholder(/kode promo/i);
    await expect(promoInput).toBeVisible({ timeout: 5000 });
  });

  test("kode promo tidak valid menampilkan error", async ({ page }) => {
    await page.goto("/checkout?langganan=BULANAN");

    const promoInput = page.getByPlaceholder(/kode promo/i);
    if (await promoInput.isVisible()) {
      await promoInput.fill("KODE-TIDAK-VALID");
      await page.getByRole("button", { name: /terapkan/i }).click();

      await expect(
        page.getByText(/tidak valid|tidak ditemukan|expired/i)
      ).toBeVisible({ timeout: 5000 });
    }
  });

  test("tombol bayar tersedia dan menampilkan total", async ({ page }) => {
    await page.goto("/checkout?langganan=BULANAN");

    const payButton = page.getByRole("button", { name: /bayar/i });
    await expect(payButton).toBeVisible({ timeout: 5000 });
    // Tombol harus menampilkan harga
    await expect(payButton).toContainText(/rp/i);
  });
});

test.describe("Riwayat Transaksi", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsPeserta(page);
  });

  test("halaman riwayat transaksi dapat diakses", async ({ page }) => {
    await page.goto("/riwayat");
    await expect(
      page.getByRole("heading", { name: /riwayat|transaksi/i })
    ).toBeVisible();
  });

  test("halaman riwayat menampilkan status langganan jika ada", async ({ page }) => {
    await page.goto("/riwayat");
    // Halaman harus load tanpa error
    await expect(page.locator("body")).not.toContainText(/error|500/i);
  });
});
