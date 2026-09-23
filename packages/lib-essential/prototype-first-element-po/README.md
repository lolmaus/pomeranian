# First Element_PO API prototype

**Throwaway design evidence, never production source.** This isolated package
answers whether the selected ad-hoc factory and explicit text assertions preserve
Playwright behavior while leaving a viable path for later subclasses. It belongs
on `prototype/first-element-po-api`, outside `main`.

The question requires actual TypeScript and browser behavior, so the artifact is
a small runnable Playwright experiment. Its HTML counter is a local fixture, not
the React demo that the implementation slice will deliver.

## Run

From this directory, select Node **22.23.3** and pnpm **12.5.1**. Install once:

```sh
pnpm install --frozen-lockfile
pnpm exec playwright install --with-deps chromium
```

Then run the complete experiment with one command:

```sh
pnpm run prototype
```

The command typechecks and runs four Chromium probes. It prints every wrapper
step and the observed outcome of each deliberate failure. `REPORT FAIL` and
`OBSERVE ... FAIL` are expected evidence; the run should finish with **4 passed**.
The ignored `probe-report.json` contains Playwright's full report. Dependencies,
browser artifacts and result files are not retained in Git.

## Verdict

The proposed shape works for the selected slice:

```ts
const Counter = Element_PO.create(page, '[data-test="counter"]', { name: "Counter" });
await page.goto("https://prototype.invalid/");
await Counter.shouldHaveText("Count: 0");
await Counter.click();
await Counter.shouldHaveText("Count: 1");
await Counter.shouldNotHaveText("Count: 0");
```

Creation is synchronous before navigation and matching DOM. The same locator
survives replacement of the button. All operations resolve to `undefined`;
click has no automatic assertion. Getter-only `.page` and `.locator` retain their
values when `Reflect.set` attempts assignment, and TypeScript rejects assignment.
Their returned Playwright objects remain usable normally.

Text arguments are taken from Playwright's native matcher type. Strings, regular
expressions, ordered mixed arrays, `ignoreCase`, `useInnerText`, retrying positive
and negative assertions, and per-call timeouts worked. Trial click forwarded
without dispatching a click. Standard `expect` inherited the configured 180ms
assertion timeout; explicit 40ms overrides were preserved. Explicit names and
selector-text fallback appeared in operation steps and assertion errors. The
prototype's protected `name` field is an implementation detail, not a proposed
additional public property.

The browser compared these results directly with native operations:

| Selection and operation                            | Wrapper and native result |
| -------------------------------------------------- | ------------------------- |
| No matches, scalar positive text                   | Fail                      |
| No matches, scalar negative text                   | Fail                      |
| No matches, negative nonempty array                | Pass                      |
| No matches, positive empty array                   | Pass                      |
| No matches, negative empty array                   | Fail                      |
| Multiple matches, scalar positive or negative text | Strict-mode failure       |
| Multiple matches, ordered matching array           | Pass                      |
| Multiple matches, click                            | Strict-mode failure       |
| No matches, click                                  | Timeout failure           |

No additional existence assertion is needed or desirable for native parity.

## Construction findings and limits

The protected constructor prevents direct construction. The inherited factory
returns the concrete subclass type and actually constructs that subclass; its
fields initialize after the base constructor. A compatible subclass constructor
passes typechecking. An additional required constructor argument is rejected.

**Limitation:** TypeScript accepts a subclass that makes the optional third
constructor argument required. The inherited factory can still omit it. The
factory therefore does not guarantee arbitrary custom-constructor compatibility;
later subclass design must preserve the constructor contract or settle a stronger
construction mechanism. This prototype makes no promise about nested objects,
parent-aware targets, discovery after initialization, Root or derivation.

Empty/invalid targets, blank names, runtime validation of wrong argument types,
and any proposed `TypeError` policy were not investigated. The proposal for such
validation still needs its own approval and implementation coverage. Custom
expect instances, non-Chromium engines, other Node majors, React integration,
packaged output and a release matrix are also outside this experiment.

## Captured execution evidence

Verified on **2026-09-23**, Linux x64:

- Node **22.23.3**, the latest Node 22 patch at verification according to the
  [official version index](https://nodejs.org/dist/latest-v22.x/SHASUMS256.txt).
  The downloaded Linux x64 archive matched SHA256
  `df450af89261115ef9f9e3830c3eeb2cc9213b63c720b1af623cb5dcbe2e02de` from the
  [versioned checksum manifest](https://nodejs.org/dist/v22.23.3/SHASUMS256.txt).
- Playwright **1.63.0**, pinned from the
  [official npm package metadata](https://registry.npmjs.org/@playwright/test/1.63.0).
  Its matching Chromium was **153.0.8010.12**, revision **1243**.
- TypeScript **7.0.2**, Node declarations **22.20.4**, pnpm **12.5.1**.
- `pnpm exec tsc --noEmit`: passed, including all positive type probes and every
  `@ts-expect-error` probe. The narrower optional-argument limitation also compiled,
  confirming the documented gap.
- `pnpm run prototype`: typecheck and all four browser probes passed. Representative
  observed default-timeout failures took 186ms wrapped / 183ms native; explicit
  failures took 43ms / 42ms. These are observations, not timing guarantees.

The verification environment used a Node runtime, dependency store and Chromium
download under `/tmp`. Existing extracted browser system libraries were supplied
through `LD_LIBRARY_PATH`; no system package installation was necessary. Chromium
required permission to start processes outside the restricted execution sandbox.
The default sandbox attempt failed during browser launch, before any probe ran.
