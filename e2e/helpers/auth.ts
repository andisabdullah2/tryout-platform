import type { Page } from "@playwright/test";

/**
 * Helper: Login sebagai peserta demo
 */
export async function loginAsPeserta(page: Page) {
  await page.goto("/login");
  await page.getByLabel(/email/i).fill("peserta@tryout-platform.com");
  await page.getByLabel(/password|kata sandi/i).fill("Peserta@12345");
  await page.getByRole("button", { name: /masuk|login/i }).click();
  await page.waitForURL("**/dashboard");
}

/**
 * Helper: Login sebagai admin demo
 */
export async function loginAsAdmin(page: Page) {
  await page.goto("/login");
  await page.getByLabel(/email/i).fill("admin@tryout-platform.com");
  await page.getByLabel(/password|kata sandi/i).fill("Admin@12345");
  await page.getByRole("button", { name: /masuk|login/i }).click();
  await page.waitForURL("**/dashboard");
}

/**
 * Helper: Logout
 */
export async function logout(page: Page) {
  await page.getByRole("button", { name: /logout|keluar/i }).click();
  await page.waitForURL("**/login");
}
