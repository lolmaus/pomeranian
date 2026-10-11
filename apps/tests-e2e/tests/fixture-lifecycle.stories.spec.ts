import type {} from "@pomeranian/tests-e2e/story";
import { expect, test } from "@playwright/test";

test("opening a story through a client-side transition isolates its content", async ({
  page,
  mount,
}) => {
  await mount("tests-e2e/harness/Session", { label: "Previous" });
  const marker = await page.evaluate(() => {
    const value = crypto.randomUUID();
    document.documentElement.dataset.documentMarker = value;
    return value;
  });

  await page.evaluate(() => window.mount({ story: "lib-essential/element-po/element-po/Counter" }));

  await expect(page.locator("html")).toHaveAttribute("data-document-marker", marker);
  await expect(page.locator("#root")).toHaveText("Count: 0");
  await expect(page.getByRole("link")).toHaveCount(0);
  await expect(page.locator("body")).not.toHaveAttribute("data-story-active");
});

test("every migrated fixture scenario mounts again after reloading the harness", async ({
  page,
  mount,
}) => {
  for (const request of [
    {
      story: "core/page-object/page-object/Counter",
      props: {},
      selector: '[data-test="counter"]',
      text: "Count: 0",
    },
    {
      story: "lib-essential/element-po/element-po/Counter",
      props: {},
      selector: '[data-test="counter"]',
      text: "Count: 0",
    },
    {
      story: "lib-essential/element-po/element-po/Counter",
      props: { delayUpdates: true },
      selector: '[data-test="counter"]',
      text: "Count: 0",
    },
    {
      story: "lib-essential/element-po/element-po/Counter",
      props: { replaceable: true },
      selector: '[data-test="counter"]',
      text: "Count: 0",
    },
    {
      story: "lib-essential/element-po/element-po/TextCollection",
      props: {},
      selector: '[data-test="text-sample"]',
      text: ["Alpha detail", "Beta"],
    },
  ]) {
    await mount(request.story, request.props);
    await expect(page.locator(request.selector)).toHaveText(request.text);
    await page.reload();
    await expect(page.locator("#root")).toBeEmpty();
    await page.evaluate(({ story, props }) => window.mount({ story, props }), request);
    await expect(page.locator(request.selector)).toHaveText(request.text);
    await expect(page.getByRole("link")).toHaveCount(0);
  }
});

test("switching away and back remounts fixtures without leaking neighboring styles", async ({
  page,
  mount,
}) => {
  await mount("lib-essential/element-po/element-po/Counter");
  const counter = page.locator('[data-test="counter"]');
  const appearance = () =>
    counter.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        color: style.color,
        background: style.backgroundColor,
        font: style.font,
        padding: style.padding,
      };
    });
  const original = await appearance();
  await counter.click();
  await expect(counter).toHaveText("Count: 1");

  await page.evaluate(() => window.mount({ story: "tests-e2e/harness/StyledNeighbor" }));
  await expect(counter).toHaveCount(0);
  await expect(page.getByRole("button")).toHaveCSS("padding", "40px");
  await page.evaluate(() =>
    window.mount({ story: "lib-essential/element-po/element-po/TextCollection" }),
  );
  await expect(page.getByRole("listitem")).toHaveCount(2);
  await page.evaluate(() => window.mount({ story: "lib-essential/element-po/element-po/Counter" }));

  await expect(counter).toHaveText("Count: 0");
  await expect(page.getByRole("listitem")).toHaveCount(0);
  expect(await appearance()).toEqual(original);
});

test("leaving a pending delayed story and returning starts a fresh fixture", async ({
  page,
  mount,
}) => {
  await page.clock.install();
  await mount("lib-essential/element-po/element-po/Counter", { delayUpdates: true });
  const counter = page.locator('[data-test="counter"]');
  await counter.click();
  await expect(counter).toBeDisabled();
  await page.evaluate(() =>
    window.mount({ story: "lib-essential/element-po/element-po/TextCollection" }),
  );
  await page.evaluate(() =>
    window.mount({
      story: "lib-essential/element-po/element-po/Counter",
      props: { delayUpdates: true },
    }),
  );
  await expect(counter).toBeEnabled();
  await page.clock.fastForward(500);
  await expect(counter).toHaveText("Count: 0");
});

test("unknown story addresses fail explicitly without opening another fixture", async ({
  page,
  mount,
}) => {
  for (const story of [
    "lib-essential/element-po/element-po/Missing",
    "missing/element-po/Counter",
    "missing",
  ]) {
    await expect(mount(story)).rejects.toThrow(`Unknown story: ${story}`);
    await expect(page.locator("#root")).toBeEmpty();
    await expect(page.locator('[data-test="counter"]')).toHaveCount(0);
  }
});
