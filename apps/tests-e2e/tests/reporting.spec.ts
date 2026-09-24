import { test } from "@playwright/test";
import { Element_PO } from "@pomeranian/lib-essential/element-po";

test("intentional named text mismatch for report verification", async ({ page }) => {
  test.fail(true, "reporting.test.mts verifies the exact native mismatch and configured timeout");
  const Counter = Element_PO.create(page, '[data-test="counter"]', { name: " Counter report " });
  await page.goto("/");
  await Counter.click({ trial: true });
  await Counter.shouldHaveText("Never");
});

test("intentional fallback negation mismatch for report verification", async ({ page }) => {
  test.fail(
    true,
    "reporting.test.mts verifies the exact native negated mismatch and per-call timeout",
  );
  const Counter = Element_PO.create(page, '[data-test="counter"]');
  await page.goto("/");
  await Counter.click({ trial: true });
  await Counter.shouldNotHaveText("Count: 0", { timeout: 60 });
});
