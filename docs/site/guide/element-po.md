# Use an ad-hoc Element_PO

`Element_PO` represents elements selected from a Playwright page. Create one
directly in a test to click an element and check its text, without a Root or a
page-object tree.

This guide describes the unreleased implementation in Pomeranian's private
workspace. Its public entry point is `@pomeranian/lib-essential/element-po`.

## Verify a counter

Assume your application has a button with `data-test="counter"`. Its text starts
at `Count: 0` and increments when clicked. Replace the illustrative URL below
with your application's counter page.

```ts
import { test } from "@playwright/test";
import { Element_PO } from "@pomeranian/lib-essential/element-po";

test("increments the counter", async ({ page }) => {
  const Counter = Element_PO.create(page, '[data-test="counter"]', {
    name: "Counter",
  });

  await page.goto("http://127.0.0.1:3000/counter");

  await Counter.shouldHaveText("Count: 0");
  await Counter.click();
  await Counter.shouldHaveText("Count: 1");
  await Counter.shouldNotHaveText("Count: 0");
});
```

Creation is synchronous. It does not navigate, wait, or look for matching DOM
elements, so `Counter` can be created before navigation. Each operation resolves
the current matches through a Playwright locator. The same page object remains
usable if the application replaces the button with a new matching element.

The three operations return `Promise<void>`. Await them separately; their results
are not page objects to chain further operations onto. Run operations inside an
active Playwright Test test.

## Create and name an object

Use `Element_PO.create(page, target, options?)`, where `page` is a Playwright
`Page`, `target` is a selector string, and `options` accepts an optional `name`.

The name identifies the object in action steps and assertion failure diagnostics.
If `name` is omitted or `undefined`, the selector text supplies the name. Valid
names and selectors are preserved as supplied, including surrounding whitespace.
Exact report wording is not part of the interface.

Creation throws a descriptive `TypeError` for a missing, non-string, empty, or
whitespace-only target. A name other than `undefined` must be a nonblank string.
These are declaration errors, distinct from a valid selector that currently
matches no elements. Selector syntax validation remains Playwright's
responsibility.

Targets currently accept selector strings. Locator inputs, target factories,
reusable subclass APIs, and nested page objects are not available yet.

## Click an element

`click(options?)` delegates to
[Playwright's locator click](https://playwright.dev/docs/api/class-locator#locator-click),
including its options and actionability checks. For example:

```ts
await Counter.click({ timeout: 2_000 });
```

A click requires exactly one matching element. Playwright waits for an absent
element and for applicable actionability conditions, and rejects multiple matches
with a strictness error. Options such as `force` and `trial` retain their native
meaning.

A successful click does not assert an application outcome. Check the expected
change explicitly with a following assertion, as in the counter example.

## Assert text

`shouldHaveText(expected, options?)` delegates to Playwright's retrying
`toHaveText` assertion. `shouldNotHaveText(expected, options?)` delegates to its
negated form, `not.toHaveText`.

Both methods accept the full native expected-value forms:

| Expected value                          | Meaning                                                               |
| --------------------------------------- | --------------------------------------------------------------------- |
| String                                  | Compare one element's text, normalizing whitespace.                   |
| Regular expression                      | Match one element's text without string whitespace normalization.     |
| Array of strings or regular expressions | Compare the matching elements' texts in order, including their count. |

```ts
await Counter.shouldHaveText(/^Count: \d+$/);
await Counter.shouldNotHaveText("Count: 0", { timeout: 2_000 });

const Labels = Element_PO.create(page, '[data-test="label"]');
await Labels.shouldHaveText(["Ready", /^Count: \d+$/]);
await Labels.shouldNotHaveText(["Loading", "Count: 0"]);
```

Negating an array negates the whole collection comparison. A difference in count,
order, or text can satisfy it; it does not require every element's text to differ.

Both methods forward Playwright's assertion options, including `timeout`,
`ignoreCase`, and `useInnerText`. See the
[native text assertion reference](https://playwright.dev/docs/api/class-locatorassertions#locator-assertions-to-have-text)
for their meanings.

### Missing and multiple matches

String and regular-expression assertions require one matching element for either
polarity. Multiple matches cause a strictness error. Arrays compare the whole
collection instead.

Negation does not make every absent target pass. If no elements match and that
absence persists:

| Expected value               | `shouldHaveText`     | `shouldNotHaveText`  |
| ---------------------------- | -------------------- | -------------------- |
| String or regular expression | Retries, then fails. | Retries, then fails. |
| Nonempty array               | Retries, then fails. | Passes.              |
| Empty array                  | Passes.              | Retries, then fails. |

Use an empty array when the assertion is that the collection has no matches:

```ts
const Errors = Element_PO.create(page, '[data-test="error"]');
await Errors.shouldHaveText([]);
```

An assertion failure retains Playwright's failure reason and diagnostic detail
alongside the page object's name.

### Timeouts

The text methods use standard Playwright Test `expect`, including the test
runner's configured assertion timeout. A per-call `timeout` overrides that
default for the assertion. Clicks retain Playwright's action timeout behavior;
assertion and action timeouts are separate settings.

Pomeranian adds no independent deadline. A separately configured `expect`
instance does not change the built-in text methods' defaults.

## Use the underlying Playwright objects

The read-only `page` and `locator` properties expose the original Playwright page
and the object's locator. You can call their normal methods; you cannot reassign
these properties. The objects themselves are not frozen.

Use `locator` for unwrapped operations or a custom expectation instance:

```ts
import { expect, test } from "@playwright/test";
import { Element_PO } from "@pomeranian/lib-essential/element-po";

const expectSlow = expect.configure({ timeout: 10_000 });

test("shows the counter", async ({ page }) => {
  const Counter = Element_PO.create(page, '[data-test="counter"]');

  await Counter.page.goto("http://127.0.0.1:3000/counter");
  await expectSlow(Counter.locator).toHaveText("Count: 0");
});
```

Creation does not accept an `expect` instance. The direct assertion above uses
`expectSlow` and its own configuration.
