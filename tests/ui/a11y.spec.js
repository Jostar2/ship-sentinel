import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("main app shell has no serious accessibility violations", async ({ page }) => {
  await page.goto("/app/index.html?v=a11y");

  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();

  const seriousOrWorse = results.violations.filter((item) =>
    ["serious", "critical"].includes(item.impact || "")
  );

  expect(seriousOrWorse).toEqual([]);
});
