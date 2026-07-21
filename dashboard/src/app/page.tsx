"use client";

import { useMemo, useState } from "react";
import { ErrorFallback } from "@/components/ErrorFallback";
import { Hero } from "@/components/Hero";
import { KpiCards } from "@/components/KpiCards";
import { MapView } from "@/components/MapView";
import { Methodology } from "@/components/Methodology";
import { Nav } from "@/components/Nav";
import { SensitivityControls } from "@/components/SensitivityControls";
import { StrategyToggle } from "@/components/StrategyToggle";
import { useDashboardData } from "@/lib/useDashboardData";
import { rollupZones } from "@/lib/zoneRollup";
import type { StrategyName } from "@/lib/types";

export default function Home() {
  const data = useDashboardData();
  const [strategy, setStrategy] = useState<StrategyName>("baseline");
  const [overlapRate, setOverlapRate] = useState(0.25);
  const [customerLinkRate, setCustomerLinkRate] = useState(0.5);

  const zones = useMemo(() => {
    if (data.status !== "ready") return [];
    return rollupZones(data.clusters, data.results.zone_strategies);
  }, [data]);

  const dayCount = useMemo(() => {
    if (data.status !== "ready") return 0;
    return new Set(data.clusters.map((c) => c.date)).size;
  }, [data]);

  if (data.status === "loading") {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="font-[family-name:var(--font-body)] text-foreground-muted">
          Loading…
        </p>
      </div>
    );
  }

  if (data.status === "error") {
    return <ErrorFallback />;
  }

  const { results } = data;
  const totalDeliveries = zones.reduce((sum, z) => sum + z.deliveries, 0);

  return (
    <>
      <Nav />
      <main className="flex-1">
        <Hero
          totalDeliveries={totalDeliveries}
          zoneCount={zones.length}
          dayCount={dayCount}
        />

        <MapView zones={zones} selectedStrategy={strategy} />

        <section id="results" className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <h2 className="mb-2 font-[family-name:var(--font-display)] text-xl font-bold text-foreground sm:text-2xl">
            Dispatch strategy results
          </h2>
          <p className="mb-6 max-w-2xl font-[family-name:var(--font-body)] text-sm text-foreground-muted">
            Toggle strategies to see the trade-off — numbers below (and the
            map above) update live from the precomputed simulation.
          </p>
          <div className="mb-6">
            <StrategyToggle value={strategy} onChange={setStrategy} />
          </div>
          <div className="mb-10">
            <KpiCards strategy={results.strategies[strategy]} />
          </div>

          <h3 className="mb-2 font-[family-name:var(--font-display)] text-lg font-bold text-foreground">
            Sensitivity
          </h3>
          <p className="mb-6 max-w-2xl font-[family-name:var(--font-body)] text-sm text-foreground-muted">
            Two of this study&apos;s numbers rest on assumptions that
            aren&apos;t in the public data. Both are shown as a range, not a
            single number — only 3 precomputed values exist per assumption,
            so these are stepped controls, not continuous sliders.
          </p>
          <SensitivityControls
            overlapSensitivity={results.sensitivity}
            customerLinkSensitivity={results.customer_link_sensitivity}
            overlapRate={overlapRate}
            onOverlapRateChange={setOverlapRate}
            customerLinkRate={customerLinkRate}
            onCustomerLinkRateChange={setCustomerLinkRate}
          />
        </section>

        <Methodology
          dataSourceNote={results.data_source_note}
          generatedAt={results.generated_at}
        />
      </main>
    </>
  );
}
