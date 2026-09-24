import { elementFixtureUrls } from "@pomeranian/demo-app-react/fixture-addresses/lib-essential/element-po";
import { expect, test } from "@playwright/test";
import { Element_PO } from "@pomeranian/lib-essential/element-po";

test("a page object created before navigation operates the React counter", async ({
  page,
  browser,
  browserName,
}, testInfo) => {
  expect(process.versions.node.split(".")[0]).toBe("22");
  expect(browserName).toBe("chromium");
  testInfo.annotations.push({
    type: "runtime",
    description: `Node ${process.version}; Chromium ${browser.version()}`,
  });
  const Counter = Element_PO.create(page, '[data-test="counter"]', { name: "Counter" });

  await page.goto(elementFixtureUrls.counter);
  await Counter.shouldHaveText("Count: 0");
  await Counter.click();
  await Counter.shouldHaveText("Count: 1");
  await Counter.shouldNotHaveText("Count: 0");
});

test("click forwards trial and waits for a disabled counter to become actionable", async ({
  page,
}) => {
  const Counter = Element_PO.create(page, '[data-test="counter"]');
  await page.goto(elementFixtureUrls["delayed-counter"]);
  expect(await Counter.click({ trial: true })).toBeUndefined();
  await Counter.shouldHaveText("Count: 0");

  await Counter.click();
  await expect(Counter.locator).toBeDisabled();
  await Counter.click({ timeout: 1500 });
  await Counter.shouldHaveText("Count: 2", { timeout: 1500 });
});

test("both text assertions retry while React finishes a delayed update", async ({ page }) => {
  const Counter = Element_PO.create(page, '[data-test="counter"]');
  await page.goto(elementFixtureUrls["delayed-counter"]);

  await Counter.click();
  await Counter.shouldHaveText("Count: 1", { timeout: 1500 });
  await Counter.click();
  await Counter.shouldNotHaveText("Count: 1", { timeout: 1500 });
  await Counter.shouldHaveText(/Count: 2/);
});

test("the same object resolves a replacement button", async ({ page }) => {
  const Counter = Element_PO.create(page, '[data-test="counter"]');
  await page.goto(elementFixtureUrls["replaceable-counter"]);
  await Counter.click();
  await Counter.shouldHaveText("Count: 1");
  await Counter.locator.evaluate((element) =>
    element.setAttribute("data-observed-node", "original"),
  );

  await page.getByRole("button", { name: "Replace button" }).click({ timeout: 500 });

  await expect(Counter.locator).not.toHaveAttribute("data-observed-node", "original");
  await Counter.shouldHaveText("Count: 1");
  await Counter.click();
  await Counter.shouldHaveText("Count: 2");
});
