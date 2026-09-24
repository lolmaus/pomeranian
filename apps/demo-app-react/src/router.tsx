import {
  createRootRoute,
  createRoute,
  createRouter,
  lazyRouteComponent,
  notFound,
  Outlet,
} from "@tanstack/react-router";
import { Suspense } from "react";
import { fixturePackages } from "./fixtures/packages";

function NotFound() {
  return (
    <main>
      <h1>Fixture not found</h1>
      <p>No scenario is registered at this address.</p>
    </main>
  );
}

const rootRoute = createRootRoute({ component: Outlet, notFoundComponent: NotFound });
const catalogRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: lazyRouteComponent(() => import("./catalog"), "Catalog"),
});
const fixtureRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/fixtures/$package/$object/$scenario",
  remountDeps: ({ params }) => [params.package, params.object, params.scenario],
  beforeLoad: ({ params }) => {
    const scenario = fixturePackages
      .find((pkg) => pkg.id === params.package)
      ?.objects.find((object) => object.id === params.object)
      ?.scenarios.find((entry) => entry.id === params.scenario);
    if (!scenario) throw notFound();
    return { scenario };
  },
  component: FixtureView,
});

function FixtureView() {
  const { scenario } = fixtureRoute.useRouteContext();
  const Component = scenario.component;
  return (
    <Suspense fallback={<p>Loading fixture…</p>}>
      <Component />
    </Suspense>
  );
}

export const router = createRouter({
  routeTree: rootRoute.addChildren([catalogRoute, fixtureRoute]),
});
