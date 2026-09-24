import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { stripVTControlCharacters } from "node:util";
import type { JSONReport } from "@playwright/test/reporter";

const report: JSONReport = JSON.parse(
  await readFile(new URL("./test-results/report.json", import.meta.url), "utf8"),
);

for (const { title, name, matcher, timeout } of [
  {
    title: "intentional named text mismatch for report verification",
    name: " Counter report ",
    matcher: "expect(locator).toHaveText(expected) failed",
    timeout: "500ms",
  },
  {
    title: "intentional fallback negation mismatch for report verification",
    name: '[data-test="counter"]',
    matcher: "expect(locator).not.toHaveText(expected) failed",
    timeout: "60ms",
  },
]) {
  await test(`${title}: named click and native failure detail reach the actual report`, () => {
    const spec = report.suites
      .flatMap((suite) => suite.specs)
      .find((entry) => entry.title === title);
    assert.ok(spec, `The browser suite must execute ${title}`);
    const browserTest = spec.tests[0];
    assert.equal(browserTest?.expectedStatus, "failed");
    const result = browserTest.results[0];
    assert.equal(result?.status, "failed");
    assert.ok(result.error?.message, "The intentional failure must retain its error message");
    const message = stripVTControlCharacters(result.error.message);
    assert.ok(message.includes(name), "The name must retain its original text");
    assert.ok(message.includes(matcher), "The native assertion and polarity must be identified");
    assert.match(message, /Received:\s+"Count: 0"/);
    assert.match(message, /unexpected value "Count: 0"/);
    assert.ok(message.includes(timeout), "The selected assertion timeout must be reported");
    const click = result.steps?.find(
      (step) => step.title.includes(name) && /click/i.test(step.title),
    );
    assert.ok(click, "The action must have a named Playwright step");
    assert.equal(
      click.error,
      undefined,
      "The trial click must succeed before the intended mismatch",
    );
  });
}
