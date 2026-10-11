import assert from "node:assert/strict";
import { test } from "node:test";
import { PageObject } from "@pomeranian/core/page-object";
import { Element_PO } from "@pomeranian/lib-essential/element-po";

await test("the inherited factory constructs an Element_PO with its own operations", () => {
  const page = { locator: () => ({}) };
  const Counter: Element_PO = Reflect.apply(Element_PO.create.bind(Element_PO), undefined, [
    page,
    '[data-test="counter"]',
  ]);

  assert.ok(Counter instanceof Element_PO);
  assert.ok(Counter instanceof PageObject);
  assert.equal(typeof Counter.click, "function");
  assert.equal(typeof Counter.shouldHaveText, "function");
  assert.equal(typeof Counter.shouldNotHaveText, "function");
});
