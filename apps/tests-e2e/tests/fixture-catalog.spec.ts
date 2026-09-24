import { expect, test } from "@playwright/test";
import { elementFixtureUrls } from "@pomeranian/demo-app-react/fixture-addresses/lib-essential/element-po";

function counterAppearance(element: HTMLElement | SVGElement) {
  const style = getComputedStyle(element);
  return {
    color: style.color,
    background: style.backgroundColor,
    font: style.font,
    padding: style.padding,
  };
}

test("the catalog opens an isolated counter through a client-side transition", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "lib-essential", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Element_PO", exact: true })).toBeVisible();
  const documentMarker = await page.evaluate(() => {
    const marker = crypto.randomUUID();
    document.documentElement.dataset.documentMarker = marker;
    return marker;
  });
  await page.getByRole("link", { name: "Counter", exact: true }).click();
  await expect(page).toHaveURL(elementFixtureUrls.counter);
  await expect(page.getByRole("button")).toHaveText("Count: 0");
  await expect(page.getByRole("link")).toHaveCount(0);
  await expect(page.locator("html")).toHaveAttribute("data-document-marker", documentMarker);
});

test("every registered scenario has a catalog link and a reloadable direct address", async ({
  page,
}) => {
  for (const [label, url] of [
    ["Counter", elementFixtureUrls.counter],
    ["Delayed counter", elementFixtureUrls["delayed-counter"]],
    ["Replaceable counter", elementFixtureUrls["replaceable-counter"]],
    ["Text collection", elementFixtureUrls["text-collection"]],
  ]) {
    await page.goto("/");
    await expect(page.getByRole("link", { name: label, exact: true })).toHaveAttribute("href", url);
    await page.goto(url);
    await expect(page.getByRole("heading", { name: label, exact: true })).toBeVisible();
    await page.reload();
    await expect(page.getByRole("heading", { name: label, exact: true })).toBeVisible();
    await expect(page.getByRole("link")).toHaveCount(0);
  }
});

test("back and forward navigation remounts fixtures without leaking catalog or neighboring styles", async ({
  page,
}) => {
  await page.goto(elementFixtureUrls.counter);
  const initialAppearance = await page.getByRole("button").evaluate(counterAppearance);
  await page.goto("/");
  await page.getByRole("link", { name: "Counter", exact: true }).click();
  await page.getByRole("button").click();
  await expect(page.getByRole("button")).toHaveText("Count: 1");
  await page.goBack();
  await expect(page.getByRole("heading", { name: "Fixture catalog" })).toBeVisible();
  await page.goForward();
  await expect(page.getByRole("button")).toHaveText("Count: 0");
  await page.goBack();
  await page.getByRole("link", { name: "Text collection", exact: true }).click();
  await expect(page.getByRole("listitem")).toHaveCount(2);
  await page.goBack();
  await page.getByRole("link", { name: "Counter", exact: true }).click();
  await expect(page.getByRole("button")).toHaveText("Count: 0");
  await expect(page.getByRole("listitem")).toHaveCount(0);
  const returnedAppearance = await page.getByRole("button").evaluate(counterAppearance);
  expect(returnedAppearance).toEqual(initialAppearance);
});

test("leaving a pending delayed counter and returning starts a fresh fixture", async ({ page }) => {
  await page.clock.install();
  await page.goto("/");
  await page.getByRole("link", { name: "Delayed counter", exact: true }).click();
  await page.getByRole("button").click();
  await expect(page.getByRole("button")).toBeDisabled();
  await page.goBack();
  await page.getByRole("link", { name: "Delayed counter", exact: true }).click();
  await expect(page.getByRole("button")).toBeEnabled();
  await page.clock.fastForward(500);
  await expect(page.getByRole("button")).toHaveText("Count: 0");
});

test("unknown fixture addresses fail explicitly instead of opening another example", async ({
  page,
}) => {
  for (const path of [
    "/fixtures/lib-essential/element-po/missing",
    "/fixtures/missing/element-po/counter",
    "/missing",
  ]) {
    await page.goto(path);
    await expect(page.getByRole("heading", { name: "Fixture not found" })).toBeVisible();
    await expect(page.locator('[data-test="counter"]')).toHaveCount(0);
  }
});
