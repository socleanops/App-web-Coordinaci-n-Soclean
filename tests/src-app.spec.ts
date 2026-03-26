import { test, expect } from "@playwright/test";

test("home page loads", async ({ page }) => {
  await page.goto("https://app-web-coordinaci-n-soclean.vercel.app");

  await expect(page).toHaveTitle(/SoClean/);
});
test("login works", async ({ page }) => {
  await page.goto("https://app-web-coordinaci-n-soclean.vercel.app/login");

  await page.fill('input[name="email"]', "test@soclean.com");
  await page.fill('input[name="password"]', "123456");

  await page.click('button[type="submit"]');

  await expect(page).toHaveURL(/dashboard/);
});
