import { expect, test } from "@playwright/test";
import { Element_PO } from "@pomeranian/lib-essential/element-po";

test("a page object created before mounting operates the React counter", async ({
  page,
  mount,
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

  await mount("lib-essential/element-po/Counter");
  await Counter.shouldHaveText("Count: 0");
  await Counter.click();
  await Counter.shouldHaveText("Count: 1");
  await Counter.shouldNotHaveText("Count: 0");
});

test("click forwards trial and waits for a disabled counter to become actionable", async ({
  page,
  mount,
}) => {
  const Counter = Element_PO.create(page, '[data-test="counter"]');
  await mount("lib-essential/element-po/Counter", { delayUpdates: true });
  expect(await Counter.click({ trial: true })).toBeUndefined();
  await Counter.shouldHaveText("Count: 0");

  await Counter.click();
  await expect(Counter.locator).toBeDisabled();
  await Counter.click({ timeout: 1500 });
  await Counter.shouldHaveText("Count: 2", { timeout: 1500 });
});

test("both text assertions retry while React finishes a delayed update", async ({
  page,
  mount,
}) => {
  const Counter = Element_PO.create(page, '[data-test="counter"]');
  await mount("lib-essential/element-po/Counter", { delayUpdates: true });

  await Counter.click();
  await Counter.shouldHaveText("Count: 1", { timeout: 1500 });
  await Counter.click();
  await Counter.shouldNotHaveText("Count: 1", { timeout: 1500 });
  await Counter.shouldHaveText(/Count: 2/);
});

test("the same object resolves a replacement button", async ({ page, mount }) => {
  const Counter = Element_PO.create(page, '[data-test="counter"]');
  await mount("lib-essential/element-po/Counter", { replaceable: true });
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
  mount,
}) => {
  const Samples = Element_PO.create(page, '[data-test="text-sample"]');
  const First = Element_PO.create(page, '[data-test="text-sample"]:first-child');
  await mount("lib-essential/element-po/TextCollection");

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
  mount,
}) => {
  const Samples = Element_PO.create(page, '[data-test="text-sample"]');
  await mount("lib-essential/element-po/TextCollection");

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

test("zero matches retain the native scalar and array distinction", async ({ page, mount }) => {
  const Missing = Element_PO.create(page, '[data-test="absent"]');
  await mount("lib-essential/element-po/TextCollection");

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
  test("story: intentional named text mismatch for report verification", async ({
    page,
    mount,
  }) => {
    test.fail(
      true,
      "reporting.stories.test.mts verifies the exact native mismatch and configured timeout",
    );
    const Counter = Element_PO.create(page, '[data-test="counter"]', { name: " Counter report " });
    await mount("lib-essential/element-po/Counter");
    await Counter.click({ trial: true });
    await Counter.shouldHaveText("Never");
  });

  test("story: intentional fallback negation mismatch for report verification", async ({
    page,
    mount,
  }) => {
    test.fail(
      true,
      "reporting.stories.test.mts verifies the exact native negated mismatch and per-call timeout",
    );
    const Counter = Element_PO.create(page, '[data-test="counter"]');
    await mount("lib-essential/element-po/Counter");
    await Counter.click({ trial: true });
    await Counter.shouldNotHaveText("Count: 0", { timeout: 60 });
  });
});
