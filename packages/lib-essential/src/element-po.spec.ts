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

test("text assertions accept strings, regular expressions, ordered arrays and display options", async ({
  page,
}) => {
  const Samples = Element_PO.create(page, '[data-test="text-sample"]');
  const First = Element_PO.create(page, '[data-test="text-sample"]:first-child');
  await page.goto(elementFixtureUrls["text-collection"]);

  await Samples.shouldHaveText(["Alpha detail", /^Beta$/]);
  await First.shouldHaveText("Alpha detail");
  await First.shouldHaveText(/alpha DETAIL/, { ignoreCase: true });
  await Samples.shouldHaveText([/alpha/, "beta"], { ignoreCase: true, useInnerText: true });
  await Samples.shouldNotHaveText(["Beta", "Alpha"], { useInnerText: true });
  await First.shouldNotHaveText(/gamma/);
  await First.shouldNotHaveText("Alpha detail", { useInnerText: true });
  await expect(Samples.shouldHaveText(["Beta", "Alpha detail"], { timeout: 60 })).rejects.toThrow(
    /- Expected[\s\S]*\+ Received[\s\S]*Alpha detail[\s\S]*Beta[\s\S]*locator resolved to 2 elements/,
  );
});

test("scalar text and click operations retain native strictness on multiple matches", async ({
  page,
}) => {
  const Samples = Element_PO.create(page, '[data-test="text-sample"]');
  await page.goto(elementFixtureUrls["text-collection"]);

  await expect(Samples.shouldHaveText("Alpha detail")).rejects.toThrow(
    /strict mode violation:[\s\S]*resolved to 2 elements/,
  );
  await expect(Samples.shouldNotHaveText("other")).rejects.toThrow(
    /strict mode violation:[\s\S]*resolved to 2 elements/,
  );
  await expect(Samples.click()).rejects.toThrow(
    /strict mode violation:[\s\S]*resolved to 2 elements/,
  );
});

test("zero matches retain the native scalar and array distinction", async ({ page }) => {
  const Missing = Element_PO.create(page, '[data-test="absent"]');
  await page.goto(elementFixtureUrls["text-collection"]);

  await Missing.shouldHaveText([]);
  await Missing.shouldNotHaveText(["absent"]);
  await expect(Missing.shouldHaveText("absent", { timeout: 60 })).rejects.toThrow(
    /element\(s\) not found/,
  );
  await expect(Missing.shouldNotHaveText("absent", { timeout: 60 })).rejects.toThrow(
    /element\(s\) not found/,
  );
  await expect(Missing.shouldHaveText(["absent"], { timeout: 60 })).rejects.toThrow(
    /locator resolved to 0 elements/,
  );
  await expect(Missing.shouldNotHaveText([], { timeout: 60 })).rejects.toThrow(
    /locator resolved to 0 elements/,
  );
  await expect(Missing.click({ timeout: 60 })).rejects.toThrow(
    /locator.click: Timeout 60ms exceeded/,
  );
});

test.describe("Element_PO reporting", () => {
  test("intentional named text mismatch for report verification", async ({ page }) => {
    test.fail(true, "reporting.test.mts verifies the exact native mismatch and configured timeout");
    const Counter = Element_PO.create(page, '[data-test="counter"]', { name: " Counter report " });
    await page.goto(elementFixtureUrls.counter);
    await Counter.click({ trial: true });
    await Counter.shouldHaveText("Never");
  });

  test("intentional fallback negation mismatch for report verification", async ({ page }) => {
    test.fail(
      true,
      "reporting.test.mts verifies the exact native negated mismatch and per-call timeout",
    );
    const Counter = Element_PO.create(page, '[data-test="counter"]');
    await page.goto(elementFixtureUrls.counter);
    await Counter.click({ trial: true });
    await Counter.shouldNotHaveText("Count: 0", { timeout: 60 });
  });
});
