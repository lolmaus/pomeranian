import type {} from "@pomeranian/tests-e2e/story";
import { expect, test } from "@playwright/test";

test("props update without losing state and a fresh mount starts over", async ({ mount }) => {
  const story = await mount("tests-e2e/harness/Session", { label: "First" });
  // oxlint-disable-next-line playwright/prefer-web-first-assertions -- Mount must commit before returning, without assertion retries.
  expect(await story.textContent()).toBe("First: 0");
  await story.getByRole("button", { name: "First: 0" }).click();
  await story.update({ label: "Updated" });
  // oxlint-disable-next-line playwright/prefer-web-first-assertions -- Update must commit before returning, without assertion retries.
  expect(await story.textContent()).toBe("Updated: 1");

  const fresh = await mount("tests-e2e/harness/Session", { label: "Fresh" });
  await expect(fresh.getByRole("button")).toHaveText("Fresh: 0");
});

test("unmount removes rendered content and cleans up effects", async ({ page, mount }) => {
  const story = await mount("tests-e2e/harness/Session", { label: "Active" });
  await expect(page.locator("body")).toHaveAttribute("data-story-active", "true");
  await story.unmount();
  await expect(story).toBeEmpty();
  await expect(page.locator("body")).not.toHaveAttribute("data-story-active");
  await story.unmount();
  await story.update({ label: "Again" });
  await expect(story.getByRole("button")).toHaveText("Again: 0");
});

test("unknown files and exports reject with their story IDs", async ({ mount }) => {
  await expect(mount("core/missing/Counter")).rejects.toThrow(
    "Unknown story: core/missing/Counter",
  );
  await expect(mount("core/page-object/Missing")).rejects.toThrow(
    "Unknown story: core/page-object/Missing",
  );
});

test("React render errors reject mounting", async ({ mount }) => {
  await expect(mount("tests-e2e/harness/Session", { label: "Broken", fail: true })).rejects.toThrow(
    "story render failed",
  );
});

test("React render errors reject updates and allow a new instance", async ({ page, mount }) => {
  const story = await mount("tests-e2e/harness/Session", { label: "Healthy" });
  await story.getByRole("button").click();
  await expect(story.update({ label: "Broken", fail: true })).rejects.toThrow(
    "story render failed",
  );
  await expect(page.locator("body")).not.toHaveAttribute("data-story-active");
  await story.update({ label: "Recovered" });
  await expect(story).toHaveText("Recovered: 0");
});

test("changing stories on the same page cleans up the previous instance", async ({
  page,
  mount,
}) => {
  await mount("tests-e2e/harness/Session", { label: "Active" });
  await page.evaluate(async () => {
    await window.mount({ story: "core/page-object/Counter" });
  });
  await expect(page.locator("body")).not.toHaveAttribute("data-story-active");
  await expect(page.getByRole("button")).toHaveText("Count: 0");
});
