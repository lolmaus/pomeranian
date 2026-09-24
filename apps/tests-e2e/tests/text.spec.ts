import { expect, test } from "@playwright/test";
import { Element_PO } from "@pomeranian/lib-essential/element-po";

test("text assertions accept strings, regular expressions, ordered arrays and display options", async ({
  page,
}) => {
  const Samples = Element_PO.create(page, '[data-test="text-sample"]');
  const First = Element_PO.create(page, '[data-test="text-sample"]:first-child');
  await page.goto("/");

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
  await page.goto("/");

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
  await page.goto("/");

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
