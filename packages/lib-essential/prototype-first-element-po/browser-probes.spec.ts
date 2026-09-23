// THROWAWAY experiments. These deliberately observe failure paths as well as success.
import assert from "node:assert/strict";
import { expect, test } from "@playwright/test";
import { Element_PO } from "./element-po.prototype.ts";

export type Outcome = { passed: boolean; message: string };

async function observe(label: string, operation: () => Promise<void>): Promise<Outcome> {
  const started = performance.now();
  try {
    await operation();
    console.log(`OBSERVE ${label}: PASS (${Math.round(performance.now() - started)}ms)`);
    return { passed: true, message: "" };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.log(
      `OBSERVE ${label}: FAIL (${Math.round(performance.now() - started)}ms) ${message.split("\n").filter(Boolean).slice(0, 3).join(" | ")}`,
    );
    return { passed: false, message };
  }
}

test("counter is created before navigation; click and retry follow replacement", async ({
  page,
  browser,
}) => {
  assert.equal(process.versions.node.split(".")[0], "22");
  console.log(`VERSIONS Node ${process.version}; Chromium ${browser.version()}`);
  const Counter = Element_PO.create(page, '[data-test="counter"]', { name: "Counter" });
  assert.equal(page.url(), "about:blank");
  assert.equal(await Counter.locator.count(), 0);
  assert.equal(Counter.page, page);
  const originalLocator = Counter.locator;
  assert.equal(Reflect.set(Counter, "page", null), false);
  assert.equal(Reflect.set(Counter, "locator", page.locator("different")), false);
  assert.equal(Counter.page, page);
  assert.equal(Counter.locator, originalLocator);

  await page.route("https://prototype.invalid/", (route) =>
    route.fulfill({
      contentType: "text/html",
      body: `<button data-test="counter">Count: 0</button>
      <script>
        document.addEventListener('click', event => {
          if (!event.target.matches('[data-test="counter"]')) return;
          const count = Number(event.target.textContent.split(': ')[1]) + 1;
          setTimeout(() => {
            document.querySelector('[data-test="counter"]').outerHTML =
              '<button data-test="counter">Count: ' + count + '</button>';
          }, 80);
        });
      </script>`,
    }),
  );
  await page.goto("https://prototype.invalid/");
  assert.equal(await Counter.shouldHaveText("Count: 0"), undefined);
  assert.equal(await Counter.click({ trial: true }), undefined);
  await Counter.shouldHaveText("Count: 0");
  assert.equal(await Counter.click(), undefined);
  await Counter.shouldHaveText("Count: 1");
  await Counter.click();
  await Counter.shouldHaveText(/Count: 2/);
  assert.equal(await Counter.shouldNotHaveText("Count: 1"), undefined);

  class SpecializedCounter extends Element_PO {
    readonly initializedAfterSuper = this.name;
    async increment(): Promise<void> {
      await this.click();
    }
  }
  const Specialized = SpecializedCounter.create(page, '[data-test="counter"]', {
    name: "Specialized",
  });
  assert.ok(Specialized instanceof SpecializedCounter);
  assert.equal(Specialized.initializedAfterSuper, "Specialized");
  await Specialized.increment();
  await Specialized.shouldHaveText("Count: 3");
});

test("native text forms and options, collections, negation and retries", async ({ page }) => {
  await page.setContent("<p>ONE<span hidden>hidden</span></p><p>TWO</p>");
  const Items = Element_PO.create(page, "p", { name: "Items" });
  await Items.shouldHaveText(["one", /two/], { ignoreCase: true, useInnerText: true });
  await Items.shouldNotHaveText(["two", "one"], { ignoreCase: true, useInnerText: true });
  const First = Element_PO.create(page, "p:first-child");
  await First.shouldHaveText("ONEhidden");
  await First.shouldHaveText(/one/, { ignoreCase: true, useInnerText: true });
  await page.evaluate(() => {
    setTimeout(() => {
      document.querySelector("p")!.textContent = "CHANGED";
    }, 80);
  });
  await First.shouldNotHaveText("ONEhidden", { timeout: 500 });
  await First.shouldHaveText("changed", { ignoreCase: true });
});

test("missing and multiple targets preserve native pass/fail behavior", async ({ page }) => {
  await page.setContent("<p>one</p><p>two</p>");
  const Missing = Element_PO.create(page, "#absent", { name: "Missing" });
  const Many = Element_PO.create(page, "p", { name: "Many" });
  const cases: [string, boolean, () => Promise<void>, () => Promise<void>][] = [
    [
      "missing scalar positive",
      false,
      () => Missing.shouldHaveText("x", { timeout: 40 }),
      () => expect(Missing.locator).toHaveText("x", { timeout: 40 }),
    ],
    [
      "missing scalar negative",
      false,
      () => Missing.shouldNotHaveText("x", { timeout: 40 }),
      () => expect(Missing.locator).not.toHaveText("x", { timeout: 40 }),
    ],
    [
      "missing nonempty array negative",
      true,
      () => Missing.shouldNotHaveText(["x"]),
      () => expect(Missing.locator).not.toHaveText(["x"]),
    ],
    [
      "missing empty array positive",
      true,
      () => Missing.shouldHaveText([]),
      () => expect(Missing.locator).toHaveText([]),
    ],
    [
      "missing empty array negative",
      false,
      () => Missing.shouldNotHaveText([], { timeout: 40 }),
      () => expect(Missing.locator).not.toHaveText([], { timeout: 40 }),
    ],
    [
      "multiple scalar positive",
      false,
      () => Many.shouldHaveText("one", { timeout: 40 }),
      () => expect(Many.locator).toHaveText("one", { timeout: 40 }),
    ],
    [
      "multiple scalar negative",
      false,
      () => Many.shouldNotHaveText("other", { timeout: 40 }),
      () => expect(Many.locator).not.toHaveText("other", { timeout: 40 }),
    ],
    [
      "multiple array positive",
      true,
      () => Many.shouldHaveText(["one", /two/]),
      () => expect(Many.locator).toHaveText(["one", /two/]),
    ],
    [
      "multiple click",
      false,
      () => Many.click({ timeout: 40 }),
      () => Many.locator.click({ timeout: 40 }),
    ],
    [
      "missing click",
      false,
      () => Missing.click({ timeout: 40 }),
      () => Missing.locator.click({ timeout: 40 }),
    ],
  ];
  for (const [label, expected, wrapped, native] of cases) {
    const result = await observe(`${label} wrapper`, wrapped);
    const nativeResult = await observe(`${label} native`, native);
    assert.equal(result.passed, expected, label);
    assert.equal(result.passed, nativeResult.passed, label);
    if (label.startsWith("multiple") && !expected) {
      assert.match(result.message, /strict mode violation/);
      assert.match(nativeResult.message, /strict mode violation/);
    }
  }
});

test("names appear in assertion errors and project/per-call timeouts survive wrapping", async ({
  page,
}) => {
  await page.setContent('<button data-test="counter">Count: 0</button>');
  const Named = Element_PO.create(page, '[data-test="counter"]', { name: "Counter" });
  const Fallback = Element_PO.create(page, '[data-test="counter"]');
  const defaultResult = await observe("project timeout wrapper", () =>
    Named.shouldHaveText("wrong"),
  );
  const nativeDefault = await observe("project timeout native", () =>
    expect(Named.locator).toHaveText("wrong"),
  );
  assert.equal(defaultResult.passed, false);
  assert.equal(nativeDefault.passed, false);
  assert.match(defaultResult.message, /Counter: shouldHaveText/);
  assert.match(defaultResult.message, /180ms/);
  assert.match(nativeDefault.message, /180ms/);
  const overrideResult = await observe("explicit timeout wrapper", () =>
    Fallback.shouldNotHaveText("Count: 0", { timeout: 40 }),
  );
  const nativeOverride = await observe("explicit timeout native", () =>
    expect(Fallback.locator).not.toHaveText("Count: 0", { timeout: 40 }),
  );
  assert.equal(overrideResult.passed, false);
  assert.equal(nativeOverride.passed, false);
  assert.ok(overrideResult.message.includes('[data-test="counter"]: shouldNotHaveText'));
  assert.match(overrideResult.message, /40ms/);
  assert.match(nativeOverride.message, /40ms/);
  await Fallback.click();
});
