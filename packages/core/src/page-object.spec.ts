import { PageObject } from "@pomeranian/core/page-object";
import { pageObjectFixtureUrls } from "@pomeranian/demo-app-react/fixture-addresses/core/page-object";
import { expect, test } from "@playwright/test";

test("a core page object created before navigation resolves the live counter", async ({ page }) => {
  const Counter = PageObject.create(page, '[data-test="counter"]', { name: "Core counter" });

  await page.goto(pageObjectFixtureUrls.counter);
  expect(Counter.page).toBe(page);
  expect(Counter.name).toBe("Core counter");
  await expect(Counter.locator).toHaveText("Count: 0");
  await Counter.locator.click();
  await expect(Counter.locator).toHaveText("Count: 1");
});
