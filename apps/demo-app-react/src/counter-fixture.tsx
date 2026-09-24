import { useState } from "react";

export function CounterFixture() {
  const [count, setCount] = useState(0);
  const [generation, setGeneration] = useState(0);
  const [delayUpdates, setDelayUpdates] = useState(false);
  const [pending, setPending] = useState(false);

  function increment() {
    if (delayUpdates) {
      setPending(true);
      setTimeout(() => {
        setCount((current) => current + 1);
        setPending(false);
      }, 250);
    } else {
      setCount((current) => current + 1);
    }
  }

  return (
    <main>
      <header className="masthead">
        <span className="brand">
          pomeranian<span aria-hidden="true">.</span>
        </span>
        <span className="badge">React fixture</span>
      </header>
      <section className="counter-layout" aria-labelledby="counter-heading">
        <div className="intro">
          <p className="eyebrow">One small interaction</p>
          <h1 id="counter-heading">
            Every click
            <br />
            counts.
          </h1>
          <p>Start at zero. Add one. Watch the same little button tell a new story.</p>
        </div>
        <div className="counter-card">
          <span className="card-label">Your counter</span>
          <button
            key={generation}
            className="counter"
            data-test="counter"
            disabled={pending}
            onClick={increment}
          >
            Count: {count}
          </button>
          <p>Click the button to add one.</p>
          <label className="toggle">
            <input
              type="checkbox"
              checked={delayUpdates}
              onChange={(event) => setDelayUpdates(event.target.checked)}
            />
            Delay updates
          </label>
          <button
            className="secondary"
            data-test="replace-counter"
            onClick={() => setGeneration(generation + 1)}
          >
            Replace button
          </button>
        </div>
      </section>
      <section className="text-garden" aria-labelledby="text-heading">
        <div>
          <p className="eyebrow">A little collection</p>
          <h2 id="text-heading">Text garden</h2>
          <p>Two labels, in a deliberate order.</p>
        </div>
        <ol className="samples">
          <li data-test="text-sample">
            Alpha<span hidden> detail</span>
          </li>
          <li data-test="text-sample">Beta</li>
        </ol>
      </section>
      <footer>A small playground for dependable interactions.</footer>
    </main>
  );
}
