import styles from "./text-collection.module.css";

export function TextCollection() {
  return (
    <main className={styles.fixture}>
      <h1>Text collection</h1>
      <ol className={styles.samples}>
        <li data-test="text-sample">
          Alpha<span hidden> detail</span>
        </li>
        <li data-test="text-sample">Beta</li>
      </ol>
    </main>
  );
}
