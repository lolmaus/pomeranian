import { Link } from "@tanstack/react-router";
import { fixturePackages } from "./fixtures/packages";
import styles from "./catalog.module.css";

export function Catalog() {
  return (
    <main className={styles.catalog}>
      <header className={styles.header}>
        <p className={styles.brand}>pomeranian.</p>
        <h1 className={styles.title}>Fixture catalog</h1>
        <p>Choose a page object and open an isolated example.</p>
      </header>
      {fixturePackages.map((pkg) => (
        <section key={pkg.id} className={styles.package}>
          <h2>{pkg.label}</h2>
          {pkg.objects.map((object) => (
            <section key={object.id} className={styles.object}>
              <h3>{object.label}</h3>
              <ul className={styles.scenarios}>
                {object.scenarios.map((scenario) => (
                  <li key={scenario.id}>
                    <Link
                      to="/fixtures/$package/$object/$scenario"
                      params={{ package: pkg.id, object: object.id, scenario: scenario.id }}
                      className={styles.link}
                    >
                      {scenario.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </section>
      ))}
    </main>
  );
}
