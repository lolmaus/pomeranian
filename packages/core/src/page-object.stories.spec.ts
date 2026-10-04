import { PageObject } from "@pomeranian/core/page-object";
import { expect, test } from "@playwright/test";

test("a core page object created before mounting resolves the live counter", async ({
  page,
  mount,
}) => {
  const Counter = PageObject.create(page, '[data-test="counter"]', { name: "Core counter" });

  await mount("core/page-object/Counter");
  expect(Counter.page).toBe(page);
  expect(Counter.name).toBe("Core counter");
  await expect(Counter.locator).toHaveText("Count: 0");
  await Counter.locator.click();
  await expect(Counter.locator).toHaveText("Count: 1");
});
