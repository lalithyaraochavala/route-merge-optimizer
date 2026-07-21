import { formatCount, formatInr, formatKm } from "@/lib/format";
import type { StrategyResult } from "@/lib/types";

interface KpiCardsProps {
  strategy: StrategyResult;
}

export function KpiCards({ strategy }: KpiCardsProps) {
  const tripsSaved = strategy.trips_before - strategy.trips_after;

  const cards = [
    {
      label: "Routes before → after",
      value: `${formatCount(strategy.trips_before)} → ${formatCount(strategy.trips_after)}`,
      accent: "text-foreground",
    },
    {
      label: "Routes saved",
      value: formatCount(tripsSaved),
      accent: tripsSaved > 0 ? "text-accent-route" : "text-foreground-muted",
    },
    {
      label: "Cost saved",
      value: formatInr(strategy.cost_saved),
      accent: strategy.cost_saved > 0 ? "text-accent-save" : "text-foreground-muted",
    },
    {
      label: "Distance saved",
      value: formatKm(strategy.distance_saved_km),
      accent: strategy.distance_saved_km > 0 ? "text-accent-save" : "text-foreground-muted",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-xl border border-panel-border bg-panel px-5 py-4"
        >
          <p className="mb-2 font-[family-name:var(--font-body)] text-xs uppercase tracking-wide text-foreground-muted">
            {card.label}
          </p>
          <p
            className={`font-[family-name:var(--font-data)] text-xl font-semibold sm:text-2xl ${card.accent}`}
          >
            {card.value}
          </p>
        </div>
      ))}
    </div>
  );
}
