import { test, expect } from "@playwright/test";

test("home page loads", async ({ page }) => {
  await page.goto("https://app-web-coordinaci-n-soclean.vercel.app");
  await expect(page).toHaveTitle(/SoClean/);
});
