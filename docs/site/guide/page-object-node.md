# Shared page-object foundation

`PageObjectNode` provides page access, naming, and action-step reporting for page
objects and targetless groups. It is an abstract class exported from
`@pomeranian/core/page-object-node` in the private, unreleased workspace.

The locator-backed [PageObject](page-object.md) extends this base with factory
creation and locator access. [Element_PO](element-po.md) extends `PageObject`
with element actions and assertions.

## Construction and properties

The protected constructor accepts `(page: Page, name: string)`. A subclass owns
its construction and supplies the Playwright page and resolved name; the base
provides no static factory and cannot be constructed directly.

A name must be a nonblank string. Invalid names throw a synchronous `TypeError`;
valid names retain their original text, including surrounding whitespace. The
base has no selector from which to infer a default. `PageObject` supplies its
selector fallback when an explicit name is omitted or `undefined`.

The public read-only `page` and `name` properties expose the supplied page and
resolved name. They cannot be reassigned. The Playwright page remains usable;
it is not frozen.

The base does not create a locator, navigate, wait, or require DOM matches.

## Action steps

Subclass methods can call the protected `step(action, body)` helper. It creates
a Playwright Test step named by prefixing the action with the node's name;
for example, a node named `Counter` reports action `click` as `Counter.click`.

The callback can return a value or a promise. The helper returns a promise of
that result and preserves callback failures. It adds no independent timeout or
automatic assertion. Operations using it require an active Playwright Test test.

`Element_PO.click()` uses this helper. Its text assertions use the inherited
name for failure diagnostics while retaining element-specific Playwright
assertion behavior.

## Extension boundaries

`PageObjectNode` is the shared foundation, with no element target or locator
contract. A future object could represent an individual diagram node drawn
inside a canvas without inheriting element text assertions. SVG nodes and the
canvas surface itself are DOM elements and fit the element-object model.

`PageObject` supplies the locator-backed foundation in core. A separate
`PageObjectGroup` class remains deferred until it has distinct responsibilities.
Group construction APIs, nested declarations, Root, and custom target or
constructor conventions remain later work. Canvas subjects illustrate an
extension possibility; canvas support is not currently provided.
