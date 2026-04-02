import { expect, test } from "@playwright/test";

test("fast path undo removes the created draft and restores capture state", async ({ page }) => {
  await page.addInitScript(() => window.localStorage.clear());
  await page.goto("/app/index.html?v=undo-flow");

  await page.getByRole("button", { name: /버그 초안 생성/ }).click();
  await expect(page.getByText("BUG-002", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "되돌리기" })).toBeEnabled();

  await page.getByRole("button", { name: "되돌리기" }).click();

  await expect(page.getByText("BUG-002", { exact: true })).toHaveCount(0);
  await expect(page.getByText("버그 등록됨")).toHaveCount(0);
  await expect(page.locator(".fast-path-panel").getByText("수집됨", { exact: true }).first()).toBeVisible();
});
