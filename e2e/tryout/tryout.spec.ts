import { test, expect } from "@playwright/test";
import { loginAsPeserta } from "../helpers/auth";

/**
 * E2E Tests: Alur Tryout
 */
test.describe("Katalog dan Detail Tryout", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsPeserta(page);
  });

  test("halaman katalog tryout dapat diakses", async ({ page }) => {
    await page.goto("/tryout");
    await expect(page.getByRole("heading", { name: /katalog tryout/i })).toBeVisible();
  });

  test("filter kategori berfungsi", async ({ page }) => {
    await page.goto("/tryout");

    // Klik filter CPNS
    await page.getByRole("link", { name: /cpns/i }).click();
    await expect(page).toHaveURL(/kategori=CPNS_SKD/);
  });

  test("pencarian tryout berfungsi", async ({ page }) => {
    await page.goto("/tryout");

    const searchInput = page.getByPlaceholder(/cari paket tryout/i);
    await searchInput.fill("SKD");
    await page.getByRole("button", { name: /cari/i }).click();

    await expect(page).toHaveURL(/q=SKD/);
  });

  test("halaman detail tryout dapat diakses", async ({ page }) => {
    await page.goto("/tryout");

    // Klik paket tryout pertama
    const firstCard = page.getByRole("link").filter({ hasText: /tryout/i }).first();
    if (await firstCard.isVisible()) {
      await firstCard.click();
      await expect(page.getByRole("heading")).toBeVisible();
    }
  });
});

test.describe("Sesi Tryout", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsPeserta(page);
  });

  test("halaman konfirmasi mulai tryout menampilkan informasi paket", async ({ page }) => {
    // Navigasi ke paket gratis pertama
    await page.goto("/tryout");
    const freeCard = page.locator("text=Gratis").first();

    if (await freeCard.isVisible()) {
      // Klik card yang mengandung "Gratis"
      await freeCard.locator("..").locator("..").click();

      // Cek halaman detail
      await expect(page.getByText(/mulai tryout|ulangi tryout/i)).toBeVisible({ timeout: 5000 });
    }
  });

  test("halaman sesi tryout memiliki timer", async ({ page }) => {
    // Navigasi ke sesi tryout yang aktif (jika ada)
    await page.goto("/tryout");

    // Cek apakah ada sesi aktif di dashboard
    await page.goto("/dashboard");
    const activeSession = page.getByText(/lanjutkan tryout/i);

    if (await activeSession.isVisible()) {
      await activeSession.click();
      // Timer harus terlihat
      await expect(page.getByText(/\d+:\d+/)).toBeVisible({ timeout: 5000 });
    }
  });
});
