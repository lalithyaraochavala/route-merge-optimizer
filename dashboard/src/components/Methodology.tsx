interface MethodologyProps {
  dataSourceNote: string;
  generatedAt: string;
}

export function Methodology({ dataSourceNote, generatedAt }: MethodologyProps) {
  return (
    <section
      id="methodology"
      className="mx-auto max-w-6xl px-4 py-16 sm:px-6"
    >
      <h2 className="mb-4 font-[family-name:var(--font-display)] text-xl font-bold text-foreground sm:text-2xl">
        Methodology &amp; assumptions
      </h2>
      <div className="grid grid-cols-1 gap-6 rounded-xl border border-panel-border bg-panel p-6 md:grid-cols-2">
        <div className="flex flex-col gap-3">
          <p className="font-[family-name:var(--font-body)] text-sm text-foreground">
            {dataSourceNote}
          </p>
          <ul className="list-disc space-y-2 pl-5 font-[family-name:var(--font-body)] text-sm text-foreground-muted">
            <li>
              Delivery locations, dates, and volumes come from the Kaggle
              Amazon Delivery Dataset (real order-level geodata).
            </li>
            <li>
              Zones are real geo-clusters — deliveries binned by drop
              location into ~22km grid cells and grouped by day.
            </li>
            <li>
              Return-delivery customer linkage is not public data, so it is
              simulated via a parameterized <em>return-overlap rate</em>{" "}
              (central assumption 25%, swept 15–35% above).
            </li>
            <li>
              Whether a same-area pair also shares a customer is likewise
              simulated via a <em>customer-link rate</em> (central
              assumption 50%, swept 30–70% above).
            </li>
            <li>
              Deliveries are already batched into multi-stop routes (up to
              10 stops); only return pickups are dispatched separately at
              baseline. Merge strategies slot returns into existing route
              capacity instead.
            </li>
          </ul>
        </div>
        <div className="flex flex-col justify-between gap-4">
          <p className="font-[family-name:var(--font-body)] text-sm text-foreground-muted">
            Every number on this page is derived from the pipeline in this
            repo — nothing is hardcoded to a specific narrative outcome.
            Full source, including every assumption above, is public.
          </p>
          <div className="flex flex-col gap-2">
            <a
              href="https://github.com/lalithyaraochavala/route-merge-optimizer"
              target="_blank"
              rel="noopener noreferrer"
              className="font-[family-name:var(--font-body)] text-sm text-accent-route underline underline-offset-2"
            >
              View full source on GitHub →
            </a>
            <p className="font-[family-name:var(--font-data)] text-xs text-foreground-muted">
              Data generated {new Date(generatedAt).toISOString().slice(0, 10)}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
