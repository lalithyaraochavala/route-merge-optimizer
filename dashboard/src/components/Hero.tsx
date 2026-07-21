import { formatCount } from "@/lib/format";

interface HeroProps {
  totalDeliveries: number;
  zoneCount: number;
  dayCount: number;
}

export function Hero({ totalDeliveries, zoneCount, dayCount }: HeroProps) {
  return (
    <section
      id="overview"
      className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-16 sm:px-6 sm:py-24"
    >
      <h1 className="max-w-3xl font-[family-name:var(--font-display)] text-3xl font-bold leading-tight text-foreground sm:text-4xl md:text-5xl">
        Somewhere in an Indian city today, a delivery van and a returns-pickup
        van drove down the same street, on the same day, as two separate
        trips.
      </h1>
      <p className="max-w-2xl font-[family-name:var(--font-body)] text-base text-foreground-muted sm:text-lg">
        A data-driven case study testing whether merging same-day delivery
        and return trips cuts last-mile logistics waste — real order geodata,
        one clearly-labeled assumption, results shown as a range.
      </p>
      <div className="flex flex-wrap items-baseline gap-2 rounded-xl border border-panel-border bg-panel px-5 py-4">
        <span className="font-[family-name:var(--font-data)] text-2xl font-semibold text-accent-route sm:text-3xl">
          {formatCount(totalDeliveries)}
        </span>
        <span className="font-[family-name:var(--font-body)] text-sm text-foreground-muted">
          real deliveries analyzed across {formatCount(zoneCount)} zones and{" "}
          {dayCount} days
        </span>
      </div>
      <a
        href="#map"
        className="font-[family-name:var(--font-body)] text-sm text-foreground-muted transition-colors hover:text-accent-route"
      >
        ↓ scroll to explore
      </a>
    </section>
  );
}
