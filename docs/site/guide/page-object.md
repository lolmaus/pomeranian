# Locator-backed page objects

`PageObject` is the core base class for selector-based construction and locator
access. Import it and `PageObjectOptions` from `@pomeranian/core/page-object`.
These exports belong to the private, unreleased workspace.

The hierarchy is `PageObjectNode → PageObject → Element_PO`.
[PageObjectNode](page-object-node.md) owns page context, resolved names, and
action-step reporting. `PageObject` adds target validation, selector fallback
naming, lazy locator construction, and the factory inherited by
[Element_PO](element-po.md). Element actions and text assertions live in
`Element_PO`.

## Create and access a locator

```ts
import { expect, test } from "@playwright/test";
import { PageObject } from "@pomeranian/core/page-object";

test("reads a counter", async ({ page }) => {
  const Counter = PageObject.create(page, '[data-test="counter"]', { name: "Counter" });

  await page.goto("http://127.0.0.1:3000/counter");
  await expect(Counter.locator).toHaveText("Count: 0");
});
```

`create(page, target, options?)` is synchronous and requires no matching DOM.
The target must be a nonblank selector string. Invalid targets throw a
descriptive `TypeError`; Playwright owns selector syntax validation. The locator
resolves current DOM matches when used, including after element replacement.

`PageObjectOptions` accepts an optional `name`. An omitted or `undefined` name
uses the selector text; any other supplied value must be a nonblank string.
Valid selector and name text is preserved, including whitespace. Public `page`,
`name`, and `locator` properties are read-only, while the Playwright objects
remain usable.

## Inherited creation

Construction is protected. The factory creates the class on which it is called,
so `Element_PO.create(...)` returns an `Element_PO` with its element operations.
Subclasses that inherit the constructor also inherit concrete factory typing.
`Element_POOptions` remains an alias of `PageObjectOptions` for existing imports.

This factory is not a general custom-constructor protocol. Additional required
constructor parameters are unsupported, and TypeScript does not reject every
incompatible custom constructor, such as one making optional options required.
Class-default targets, flexible target inputs, nesting, and derivation remain
later work.

`PageObject` has a DOM locator contract. Future subjects without their own DOM
element can extend `PageObjectNode` directly rather than inheriting locator or
element-operation requirements.
