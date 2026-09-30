# Share page-object foundations through PageObjectNode

Page objects and targetless groups share page context and naming/reporting needs,
so the author approved a `PageObjectNode` base for `Element_PO` in PR #40. Separate
`PageObjectGroup` and `PageObject` classes are deferred until they have distinct
responsibilities, avoiding empty layers in the public inheritance hierarchy.
The abstract base belongs in core and exposes public read-only page and name
access plus protected construction and step reporting. Concrete classes own
construction; this extraction does not introduce group construction or
application-tree behavior.

Future page objects may represent subjects without their own DOM elements, such
as individual diagram nodes drawn inside a canvas. They can extend
`PageObjectNode` without inheriting element locator or text-assertion semantics;
a further common abstraction should follow actual shared behavior. SVG nodes
already inherit from DOM `Element`, and the canvas surface itself remains an
element, so neither alone justifies separating `PageObject` from `Element_PO`.
The canvas-subject example is an architectural possibility, not a delivered API
or a commitment to implement canvas support. See
[SVGElement](https://developer.mozilla.org/en-US/docs/Web/API/SVGElement),
[canvas rendering contexts](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Basic_usage#the_rendering_context),
and [Playwright's canvas-position click example](https://playwright.dev/docs/api/class-locator#locator-click).
