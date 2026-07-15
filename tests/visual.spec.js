import { expect, test } from "@playwright/test";

test("desktop overview @visual", async ({ page }) => {
  await page.goto("/#v=2&l=5432100000000000000000000000000000&lang=zh&n=Alex");
  await expect(page).toHaveScreenshot("overview.png", { animations: "disabled", fullPage: true });
});

test("English detail card @visual", async ({ page }) => {
  await page.goto("/#v=2&l=5432100000000000000000000000000000&lang=en&n=Alex");
  await page.locator(".map-label").nth(7).click();
  await expect(page).toHaveScreenshot("english-detail.png", { animations: "disabled", fullPage: true });
});

