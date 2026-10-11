# First Element_PO: API evidence

Research date: 2026-09-23. The [planning record](first-element-po-requirements.md)
owns accepted choices and open decisions. This note establishes supporting facts;
it does not adopt a construction architecture or Playwright version.

## Locator and assertion behavior

Locators resolve the current DOM for each action, including after a rerender.
Single-element operations such as `click()` reject multiple matches; collection
operations can intentionally address several. A locator can therefore represent
a target without freezing the matching element at creation time.
[Locator behavior and strictness](https://playwright.dev/docs/locators#strictness).

`locator.click(options?)` returns `Promise<void>` and performs Playwright's
actionability checks. Options include button, modifiers, position, force, trial,
and timeout. Omitting a wrapper timeout preserves Playwright's configured action
timeout; a wrapper's own preliminary count or visibility checks would add behavior
instead of simply delegating.
[Click reference](https://playwright.dev/docs/api/class-locator#locator-click).

`expect(locator).toHaveText(expected, options?)` returns `Promise<void>`. It accepts
a string, regular expression, or array of those. Strings use normalized whitespace;
regular expressions match the actual text without that normalization. Arrays
require matching element count and order. Options include `ignoreCase`,
`useInnerText`, and timeout. Text assertions retry; their timeout is separate from
the action timeout.
[Text assertion reference](https://playwright.dev/docs/api/class-locatorassertions#locator-assertions-to-have-text),
[retrying assertions](https://playwright.dev/docs/test-assertions#auto-retrying-assertions).

Negation does not uniformly turn absence into success. Official Playwright tests
establish the following behavior when zero elements continue to match:

| Assertion input              | Positive `toHaveText`               | Negated `not.toHaveText`            |
| ---------------------------- | ----------------------------------- | ----------------------------------- |
| String or regular expression | Retries, then fails if still absent | Retries, then fails if still absent |
| Nonempty array               | Retries, then fails if still empty  | Passes                              |
| Empty array                  | Passes                              | Retries, then fails if still empty  |

The tests explicitly cover missing scalar negation and both array forms.
[Official text assertion tests](https://github.com/microsoft/playwright/blob/main/tests/page/expect-to-have-text.spec.ts).
Scalar expectations use strict single-element resolution; multiple matches fail
with a strictness error for either polarity, rather than acting like missing
elements or becoming success under negation. Arrays compare the collection
without scalar strictness; negation can succeed on a count, order, or text
mismatch. No preliminary presence/count assertion is needed to obtain these
delegated semantics.
[Frame assertion implementation](https://github.com/microsoft/playwright/blob/main/packages/playwright-core/src/server/frames.ts),
[strictness-error test](https://github.com/microsoft/playwright/blob/main/tests/page/expect-misc.spec.ts#L573).

The current documentation includes features marked as introduced in 1.62, such as
assertion cancellation and click scrolling controls. These are observations about
the current docs, not requirements for this slice. The adopted package's public
types must establish its actual options.

## Configured expect and reporting

The author selected no configured-expect injection for this slice; the facts
below explain that boundary. `expect.configure()` returns an instance with its
own defaults. Soft assertions record a test failure while allowing execution to
continue. An API accepting such an instance could not promise to throw for every
failed assertion.
[Configured expect and soft assertions](https://playwright.dev/docs/test-assertions#expectconfigure).

Source inspection shows that an instance's timeout takes precedence over the
runner's configured timeout. Calling that instance with a custom message preserves
its timeout, soft flag, and matcher definitions, but replaces its configured
message. Calling a separately imported default `expect` cannot recover another
instance's configuration. An extended instance can also replace a built-in
matcher, so preserving the instance preserves that override too. The default
import still uses the test runner's expect timeout; it does not inherit a separate
configured instance merely because the developer uses that instance elsewhere.
[Expect implementation](https://github.com/microsoft/playwright/blob/main/packages/playwright/src/matchers/expect.ts).

`test.step(title, body)` supplies a report name, supports nested steps, and returns
the callback's result. `box: true` attributes failures to the step call; by default
the internal failure location remains visible. A wrapper's call site may itself
be inside library code. An explicit step timeout adds another deadline.
[Step reference](https://playwright.dev/docs/api/class-test#test-step).

The implementation requires an active Playwright test and rethrows errors from
the callback. Inference: wrapping a supplied configured `expect` in a step does
not replace that instance, and a soft assertion that records failure without
throwing does not become a thrown error merely because a step surrounds it.
[Step implementation](https://github.com/microsoft/playwright/blob/main/packages/playwright/src/common/testType.ts).

## Construction constraints

An explicit TypeScript `this` parameter can describe the constructor on which a
static factory is called. Combining it with a generic construct signature can
preserve a concrete subclass return type; the temporary check below verified
this narrow pattern.
[Typed this parameters](https://www.typescriptlang.org/docs/handbook/2/functions.html#declaring-this-in-a-function),
[construct signatures](https://www.typescriptlang.org/docs/handbook/2/functions.html#construct-signatures).

Base fields initialize before the base constructor; subclass fields initialize
after that constructor returns and before the subclass constructor body. Thus
base-constructor discovery cannot observe completed subclass fields. A factory
can inspect the completed instance after `new this(...)` returns. The timing fact
does not settle how parent and child objects attach, validate, or inherit context.
[Class initialization order](https://www.typescriptlang.org/docs/handbook/2/classes.html#initialization-order).

## Executed evidence and limits

A temporary TypeScript file used this factory signature:

```ts
static create<Instance extends ElementLike>(
  this: new (target: string) => Instance,
  target: string,
): Instance {
  return new this(target);
}
```

The repository's TypeScript 7.0.2 accepted an inherited factory returning a concrete
subclass with its subclass-only method. Three `@ts-expect-error` probes also passed:
the base result has no subclass method, a required extra constructor argument is
incompatible, and a protected constructor cannot satisfy this public construct
signature. These are limitations of the checked signature, not proof that every
alternative factory design has those limitations.

Executed from the repository root, with exit code 0:

```sh
./node_modules/.bin/tsc --noEmit --strict --target ES2023 --module NodeNext /tmp/pomeranian-first-element-factory.ts
```

The temporary input was removed afterward.

### Protected-constructor follow-up

A second TypeScript 7.0.2 check established that a public constructor is not
necessary for inherited factory inference. The overload below combines the
subclass prototype with `typeof Base`, while its implementation operates on the
base type. TypeScript exposes the overload to callers, not the implementation
signature. A protected constructor prevents external construction of the base
and a subclass that inherits it, while allowing extension.
[Overload signatures](https://www.typescriptlang.org/docs/handbook/2/functions.html#overload-signatures-and-the-implementation-signature),
[protected constructors](https://www.typescriptlang.org/docs/handbook/classes.html#understanding-protected).

The check inferred the concrete subclass without a result annotation, rejected
external `new`, and rejected an additional required fourth constructor argument.
It **did not reject every incompatible constructor**: a subclass could require
the previously optional third argument while inheriting a factory that omits it.
Trying to mark that call with `@ts-expect-error` failed with TS2578 (unused
directive), confirming the compiler accepts it. Constructor parameter comparisons
are excluded from strict function-parameter variance checks.
[Strict function types and constructor exception](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-6.html#strict-function-types).

A subclass can also explicitly declare a public constructor; the base's
`protected` modifier does not prohibit that. The pattern therefore demonstrates
factory-only access for the checked base/inheriting subclass, not universal
enforcement over arbitrary subclasses. The overload's return declaration also
does not prove that every future implementation returns the right subclass;
`new this(...)` is the relevant behavior to preserve and test. Any postconstruction
inspection happens after subclass field initialization, as described above.

This is the complete second input. `PageLike` is a local stand-in; the check does
not test Playwright's `Page` declaration. The final accepted call deliberately
retains the constructor-compatibility limitation as reproducible evidence.

```ts
export interface PageLike {
  readonly id: string;
}

export interface Options {
  label?: string;
}

export class Base {
  page: PageLike;
  target: string;

  protected constructor(page: PageLike, target: string, options?: Options) {
    this.page = page;
    this.target = target;
  }

  static create<Instance extends Base>(
    this: { prototype: Instance } & typeof Base,
    page: PageLike,
    target: string,
    options?: Options,
  ): Instance;
  static create(page: PageLike, target: string, options?: Options): Base {
    return new this(page, target, options);
  }
}

export class Counter extends Base {
  increment(): number {
    return 1;
  }
}

export const page: PageLike = { id: "page" };
export const counter = Counter.create(page, "counter", { label: "counter" });
export const typedCounter: Counter = counter;
export const result: number = counter.increment();
export const base: Base = Base.create(page, "base");

// @ts-expect-error The protected base constructor is not public.
new Base(page, "base");
// @ts-expect-error The inherited constructor remains protected.
new Counter(page, "counter");
// @ts-expect-error The base result does not expose the subclass method.
base.increment();

export class ExtraRequired extends Base {
  extra: number;

  protected constructor(
    page: PageLike,
    target: string,
    options: Options | undefined,
    extra: number,
  ) {
    super(page, target, options);
    this.extra = extra;
  }
}

// @ts-expect-error The inherited factory cannot supply required extra arguments.
ExtraRequired.create(page, "counter");

export class RequiredOptions extends Base {
  protected constructor(page: PageLike, target: string, options: Options) {
    super(page, target, options);
  }
}

// Accepted despite the subclass requiring options: a compiler safety limit.
RequiredOptions.create(page, "counter");
```

Saving that block to `/tmp/pomeranian-protected-factory.ts`, the following command
passed with exit code 0. The temporary file was removed after verification.

```sh
./node_modules/.bin/tsc --noEmit --strict --target ES2023 --module NodeNext /tmp/pomeranian-protected-factory.ts
```

These research probes installed no dependencies and executed no browser,
Playwright runner, parented-object, runtime, or package compatibility checks.
Official source links above target the moving `main` branch. The separate
[retained browser prototype](https://github.com/lolmaus/pomeranian/blob/fc2b7122c39a737a7701e1ec0c261e0893d780b1/packages/lib-essential/prototype-first-element-po/README.md)
subsequently verified the selected runtime behavior against Playwright 1.63.0 on
Node 22.23.3 and Chromium; its findings and limits are recorded there. Production
acceptance remains separate work.
