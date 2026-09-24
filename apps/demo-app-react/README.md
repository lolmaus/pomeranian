# React interaction fixture

This private React application supplies real browser behavior for Pomeranian's
Playwright suite. It is not deployed or included in the documentation website.
Its HTML exposes `data-test` hooks; page objects and Playwright code live in
`apps/tests-e2e`.

After the root frozen installation, run from the repository root:

```sh
pnpm run demo:dev
pnpm run demo:build
pnpm run demo:preview
```

Development supports live updates. Preview serves the latest production build;
build first and rebuild after source changes. Stop either server with Ctrl-C.
The E2E suite builds and starts its own production preview automatically.

The counter has a delayed-update toggle and a button that replaces its DOM node
while preserving the count. The text garden supplies an ordered collection and a
hidden text fragment for native text-matching checks.

React source uses the shared browser-react TypeScript environment and React lint
profile. Vite and lint configuration use the shared Node environment and base lint
profile. Both leaves participate in discovery, linting and typechecking.
