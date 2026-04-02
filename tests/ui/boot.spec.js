import { expect, test } from "@playwright/test";

test("main app shell boots without fallback", async ({ page }) => {
  await page.goto("/app/index.html?v=ui-test");
  await expect(page.getByRole("heading", { name: "QA Session이 설계보다 빠르게 움직이는 검수 콘솔" })).toBeVisible();
  await expect(page.getByText("Ship Sentinel Fallback")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "QA Session" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Overview" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Deliverables" })).toBeVisible();
});
