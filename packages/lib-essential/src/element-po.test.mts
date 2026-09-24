import assert from "node:assert/strict";
import { test } from "node:test";
import { Element_PO } from "@pomeranian/lib-essential/element-po";

await test("a missing target fails synchronously as an invalid declaration", () => {
  assert.throws(() => Reflect.apply(Element_PO.create.bind(Element_PO), undefined, [undefined]), {
    name: "TypeError",
    message: /target.*nonblank string/i,
  });
});

await test("malformed or blank targets fail synchronously as invalid declarations", () => {
  for (const target of [undefined, null, false, 42, {}, [], "", " \t\n"]) {
    assert.throws(
      () => Reflect.apply(Element_PO.create.bind(Element_PO), undefined, [undefined, target]),
      { name: "TypeError", message: /target.*nonblank string/i },
      `invalid target: ${JSON.stringify(target)}`,
    );
  }
});

await test("creation exposes the supplied page and lazy locator without allowing reassignment", () => {
  const locator = {};
  const page = { locator: () => locator };
  const Counter: Element_PO = Reflect.apply(Element_PO.create.bind(Element_PO), undefined, [
    page,
    '[data-test="counter"]',
  ]);

  assert.equal(Counter.page, page);
  assert.equal(Counter.locator, locator);
  assert.equal(Reflect.set(Counter, "page", {}), false);
  assert.equal(Reflect.set(Counter, "locator", {}), false);
  assert.equal(Counter.page, page);
  assert.equal(Counter.locator, locator);
});

await test("a provided name must be a nonblank string", () => {
  const page = { locator: () => ({}) };
  for (const name of [null, false, 42, {}, [], "", " \t\n"]) {
    assert.throws(
      () =>
        Reflect.apply(Element_PO.create.bind(Element_PO), undefined, [
          page,
          '[data-test="counter"]',
          { name },
        ]),
      { name: "TypeError", message: /name.*nonblank string/i },
      `invalid name: ${JSON.stringify(name)}`,
    );
  }
});

await test("omitted options, omitted names, and undefined names allow creation", () => {
  const page = { locator: () => ({}) };
  for (const options of [undefined, {}, { name: undefined }]) {
    const Counter: Element_PO = Reflect.apply(Element_PO.create.bind(Element_PO), undefined, [
      page,
      '[data-test="counter"]',
      options,
    ]);
    assert.equal(Counter.page, page);
  }
});

await test("a valid target retains its original text in the public locator", () => {
  const page = { locator: (target: string) => ({ toString: () => target }) };
  const Counter: Element_PO = Reflect.apply(Element_PO.create.bind(Element_PO), undefined, [
    page,
    ' [data-test="counter"] ',
  ]);
  assert.equal(Counter.locator.toString(), ' [data-test="counter"] ');
});
