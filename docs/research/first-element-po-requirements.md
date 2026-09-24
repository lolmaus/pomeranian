# First ad-hoc Element_PO requirements

Status: the author approved the final scope, specification, public test seams,
and single implementation-ticket breakdown on 2026-09-24. Implementation follows
[specification #38](https://github.com/lolmaus/pomeranian/issues/38) in
[ticket #39](https://github.com/lolmaus/pomeranian/issues/39). The API choices below
were selected on 2026-09-23 and passed the isolated prototype.

Validation work: [first Element_PO factory and assertions #37](https://github.com/lolmaus/pomeranian/issues/37).

## Agreed example and API spellings

The first example is a counter button. A developer creates its page object before
navigation, navigates to the React demo, asserts `Count: 0`, clicks the button,
and asserts `Count: 1`. The added negative text method also checks that the old
value no longer matches. Creating the object must not require matching DOM
elements.

The author selected `Element_PO.create(page, target, options?)` as the creation
shape to validate. Creation accepts an optional `name`, used in action steps and
assertion failures. Omitting it uses the target text as the name.

Actions use `Counter.click(options?)`, forwarding Playwright's behavior without
adding an automatic post-click assertion. Text assertions use
`Counter.shouldHaveText(expected, options?)`, performing an explicit retrying
assertion. The author supplied this spelling in place of the proposed matcher
property. The slice also includes `Counter.shouldNotHaveText(expected, options?)`,
delegating to the negated Playwright text assertion. All three operations return
`Promise<void>`, so a developer awaits each operation separately.

Both text assertions accept Playwright's full string, regular-expression, and
ordered-array input forms, and forward its assertion options. They use standard
Playwright Test `expect`, including its project-configured assertion timeout.
Creation does not accept a custom `expect` instance in this slice; a developer can
use one directly with `.locator`.

An ad-hoc page object exposes read-only `.page` and `.locator` properties for
Playwright behavior that Pomeranian has not wrapped. The properties cannot be
reassigned; their values remain usable Playwright objects.

## Existing requirements

The [roadmap](../../ROADMAP.md) and
[full project vision](https://github.com/lolmaus/pomeranian/issues/1#issuecomment-5762543354)
establish these constraints:

- Direct use with Playwright Test needs no Root or parent. An outermost page
  object is not implicitly a Root.
- Construction does not navigate, wait, or require DOM matches. Page objects
  can represent zero, one, or multiple elements; actions preserve Playwright's
  strict matching behavior.
- This slice includes its implementation, documentation in the existing site,
  meaningful tests, React demo, and separate Playwright E2E suite. The demo
  contains no Playwright logic and uses `data-test` hooks.
- The author narrowed this slice's behavior verification to the latest supported
  Node 22 patch and Chromium. This replaces the prior requirement to execute this
  slice on every supported consumer Node LTS major. Passing TypeScript checks
  alone still does not establish runtime behavior; the chosen environment needs
  actual browser execution.
- Construction must be validated against the future requirements for reusable
  classes, parented objects, and derivation before its shared interface is fixed.
  Those investigations do not expand this slice's delivered behavior.
- Release publication and distribution-format decisions remain separate work.

The [old API decision](https://github.com/lolmaus/pomeranian/issues/3#issuecomment-5762545727)
and [old prototype ticket](https://github.com/lolmaus/pomeranian/issues/4#issuecomment-5762546625)
were abandoned when release-first planning was replaced. Their unanswered
recommendations are not accepted requirements.

## Approved scope details

The first target input is a selector string. Missing, non-string, empty, and
whitespace-only targets fail synchronously with TypeError. A supplied name value
must be a nonblank string; an omitted or undefined optional name uses the fallback.
Valid text is preserved, and selector parsing remains Playwright's responsibility.
The class belongs in lib-essential, with no new shared core abstraction required.

## Agreed verification

The public page-object interface is the main test surface. The browser
checks exercise the React counter through `create`, `click`, `shouldHaveText`, and
`shouldNotHaveText`, including creation before navigation, later DOM replacement,
assertion retries, and strict-action failures for multiple matches. Additional
cases cover the agreed scalar/array input forms, negation behavior, and options.

Focused colocated unit tests cover Pomeranian-owned behavior such as
construction validation and naming, where meaningful without a browser. Type
checks would exercise the public calls, operation return types, and read-only
properties. No test needs to inspect private fields or reproduce Playwright's
implementation.

The documentation example and E2E example use the same agreed counter
workflow. Report inspection verifies that both explicit names and the
target-text fallback appear in action steps and assertion failures.

The supported Node LTS majors on the research date are 22 and 24; 26 is still
Current. The author explicitly selected **Node 22 and Chromium only** for this
slice's behavior tests. The repository authoring runtime remains separately
pinned; this decision does not supply behavior evidence for other environments or
change the later packed-artifact verification requirement. Sources:
[Node release status](https://nodejs.org/en/about/previous-releases) and
[Playwright browser projects](https://playwright.dev/docs/browsers#configure-browsers).

The [API evidence](first-element-po-api.md) records official behavior and the
limits of the initial TypeScript probe. The
[retained browser prototype](https://github.com/lolmaus/pomeranian/blob/fc2b7122c39a737a7701e1ec0c261e0893d780b1/packages/lib-essential/prototype-first-element-po/README.md)
passed TypeScript checks and four browser probes on Node 22.23.3, Playwright
1.63.0, and Chromium 153.0.8010.12. It covers the selected operations, lazy matching,
native failure/option behavior, names, and read-only access at both the type and
runtime levels. Its HTML counter is an isolated fixture; production React and
workspace integration remain implementation work.

The factory can preserve inherited concrete types and completed subclass fields.
TypeScript still permits a subclass to require an otherwise optional constructor
argument. This is a documented limit for later reusable-class design, not a promise
of arbitrary custom-constructor support. The prototype did not validate the draft
invalid-input policy, nested objects, Root, derivation, or published artifacts.

## Approved implementation slice

One implementation ticket delivers the complete counter workflow: the
concrete `Element_PO`, React fixture, unit/type/E2E coverage, runtime verification,
workspace and CI test commands, and behavior documentation. The workspace and
documentation prerequisites are already complete. Specification, test-seam, and
ticket approval were recorded before implementation began.

The package is `lib-essential`, consistent with the project vision's classification
of `Element_PO` as an essential object. Its exported subpath is `element-po`.
The current example needs no shared abstraction in `core`, which retains its
scaffold until shared behavior is required.
