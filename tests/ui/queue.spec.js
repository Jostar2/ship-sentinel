import { expect, test } from "@playwright/test";

test("scenario queue filters by saved view and search before opening a workspace item", async ({ page }) => {
  await page.addInitScript(() => window.localStorage.clear());
  await page.goto("/app/index.html?v=queue-flow");

  await page.locator(".queue-chip", { hasText: "드리프트" }).click();
  await expect(page.getByRole("button", { name: /SCN-002/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /SCN-003/ })).toBeVisible();

  await page.getByRole("textbox").fill("빈 장바구니");
  await expect(page.getByRole("button", { name: /SCN-003/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /SCN-002/ })).toHaveCount(0);

  await page.getByRole("button", { name: /SCN-003/ }).click();
  await expect(page.getByRole("heading", { name: "빈 장바구니 예외 처리" })).toBeVisible();
  await expect(page.getByText("SCN-003", { exact: true })).toBeVisible();
});
