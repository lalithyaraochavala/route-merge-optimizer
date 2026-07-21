const SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "map", label: "Map" },
  { id: "results", label: "Results" },
  { id: "methodology", label: "Methodology" },
];

export function Nav() {
  return (
    <nav className="sticky top-0 z-50 border-b border-panel-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
        <span className="font-[family-name:var(--font-display)] text-sm font-bold text-foreground">
          Route Merge Optimizer
        </span>
        <div className="flex flex-wrap gap-x-5 gap-y-1">
          {SECTIONS.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="font-[family-name:var(--font-body)] text-sm text-foreground-muted transition-colors hover:text-accent-route"
            >
              {s.label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}
