# Share context and locator-backed construction in core

The author revised PR #40's hierarchy on 2026-10-04 to
`PageObjectNode → PageObject → Element_PO`. Abstract `PageObjectNode` owns page
context, public read-only names, and protected step reporting; core's `PageObject`
owns selector validation, fallback naming, locator construction/access, and the
inherited concrete-class factory. `Element_PO` in lib-essential defines element
actions and assertions. This replaces the 2026-09-30 decision to defer
`PageObject`: locator-backed construction is a substantive core responsibility,
so the class is not an empty layer. `PageObjectGroup` remains deferred, and this
change does not deliver group construction or application-tree behavior.

Future page objects may represent subjects without their own DOM elements, such
as individual diagram nodes drawn inside a canvas. They can extend
`PageObjectNode` directly without inheriting the locator contract of `PageObject`
or the text-assertion semantics of `Element_PO`. SVG nodes
already inherit from DOM `Element`, and the canvas surface itself remains an
element; the reason for the current separation is ownership of construction in
core, rather than a promise that every future subject has a DOM locator.
The canvas-subject example is an architectural possibility, not a delivered API
or a commitment to implement canvas support. See
[SVGElement](https://developer.mozilla.org/en-US/docs/Web/API/SVGElement),
[canvas rendering contexts](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Basic_usage#the_rendering_context),
and [Playwright's canvas-position click example](https://playwright.dev/docs/api/class-locator#locator-click).
