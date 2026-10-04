import { useEffect, useRef, useState } from "react";
import styles from "./counter.module.css";

export type CounterExampleProps = { title: string; delayUpdates?: boolean; replaceable?: boolean };

export function CounterExample({
  title,
  delayUpdates = false,
  replaceable = false,
}: CounterExampleProps) {
  const [count, setCount] = useState(0);
  const [pending, setPending] = useState(false);
  const [generation, setGeneration] = useState(0);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  function increment() {
    if (delayUpdates) {
      setPending(true);
      timer.current = window.setTimeout(() => {
        setCount((current) => current + 1);
        setPending(false);
      }, 250);
    } else {
      setCount((current) => current + 1);
    }
  }

  return (
    <main className={styles.fixture}>
      <h1 className={styles.heading}>{title}</h1>
      <button
        key={generation}
        className={styles.counter}
        data-test="counter"
        disabled={pending}
        onClick={increment}
      >
        Count: {count}
      </button>
      {replaceable && (
        <button
          className={styles.replace}
          data-test="replace-counter"
          onClick={() => setGeneration((current) => current + 1)}
        >
          Replace button
        </button>
      )}
    </main>
  );
}
