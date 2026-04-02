import { expect, test } from "@playwright/test";

test("selected evidence can promote into a bug draft from the fast path", async ({ page }) => {
  await page.addInitScript(() => window.localStorage.clear());
  await page.goto("/app/index.html?v=fast-path");

  await page.getByRole("button", { name: /acme-checkout-014/ }).click();
  await page.getByRole("button", { name: /EVD-021/ }).click();
  await page.getByRole("button", { name: "버그 초안 생성" }).click();

  await expect(page.getByText("BUG-002", { exact: true })).toBeVisible();
  await expect(page.getByText("초안 / 높음")).toBeVisible();
  await expect(page.locator(".fast-path-panel").getByText("버그 등록됨", { exact: true }).first()).toBeVisible();
});
