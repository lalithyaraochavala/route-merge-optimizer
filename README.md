# route-merge-optimizer

## Methodology notes

(Partial — the full case study write-up lands in Phase 6. This section
tracks deliberate deviations from the original spec as they happen.)

### `results.json` schema deviation: `customer_link_sensitivity`

Doc 05 originally specified a single `sensitivity` array, sweeping
`overlap_rate` against the `proximity` strategy. That leaves
`CUSTOMER_LINK_RATE` (`src/config.py`) — the fraction of same-zone/day
delivery-return pairs assumed to also share a customer — as a hardcoded,
unswept assumption sitting inside the `customer` strategy's headline
number, with none of the transparency treatment `overlap_rate` gets.

Since `CUSTOMER_LINK_RATE` is equally unobserved data (not published
anywhere, no different in kind from `overlap_rate`), `results.json` now
also includes `customer_link_sensitivity`: a second, independent
one-dimensional sweep — `overlap_rate` held at its default
(`CENTRAL_OVERLAP_RATE = 0.25`), `CUSTOMER_LINK_RATE` varied across
0.3/0.5/0.7 — reporting `trips_saved` for the `customer` strategy at each
value. This is deliberately *not* a 2D grid crossing both assumptions;
each sweep holds the other assumption at its central value.

```json
"customer_link_sensitivity": [
  { "customer_link_rate": 0.3, "trips_saved": number },
  { "customer_link_rate": 0.5, "trips_saved": number },
  { "customer_link_rate": 0.7, "trips_saved": number }
]
```

### Why the sweep uses a binomial draw, not deterministic rounding

The first version of this sweep applied `customer_link_rate` with a plain
`round()` per zone/day, and the result was a cliff, not a trend: 68 → 97 →
881 trips saved across 0.3/0.5/0.7. The cause was structural, not a typo —
route counts are quantized (a return route is only actually avoided once
a zone/day's returns fully clear via `ceil`), and ~23% of zone/day clusters
have exactly one simulated return. For those, whether anything gets saved
at all reduces to `round(1 × customer_link_rate)`, which is 0 at both 0.3
and 0.5 (Python rounds 0.5 to even) and 1 at 0.7 — so nearly a quarter of
all clusters flipped from "saves nothing" to "saves a full route"
simultaneously at the same threshold, producing a jump that had nothing
to do with the assumption actually being more or less true.

Fixed by resolving each proximity-mergeable pair independently via a
seeded binomial draw (`rng.binomial(proximity_mergeable, customer_link_rate)`)
instead of rounding the same fraction identically across every row. The
sweep now moves smoothly — 333 → 581 → 895 — because ~3,000 independent
draws average out instead of thousands of identical rows crossing a
rounding boundary in lockstep.

### `results.json` schema deviation: `zone_strategies`

Doc 05's `results.json` only specifies aggregate strategy totals — one
number per strategy, dataset-wide. That's enough for the KPI cards, but
it means the map (which renders `clusters.json`'s per-zone data) has no
way to visually react to the strategy toggle: there's no per-zone
"how many trips does this zone need under the customer/proximity
strategy" figure to drive marker size against.

`results.json` now also includes `zone_strategies`: for every `zone_id`,
`trips_after` under each of the three strategies, summed across all
dates for that zone (the same zone_id grouping the map already uses when
it rolls clusters.json's per zone/day rows up to one marker per zone).
Deliberately keyed by `zone_id` only, with no lat/lng/deliveries
duplicated — the frontend joins this against its own `zone_id` rollup of
`clusters.json` rather than the pipeline repeating that geography in two
places. `strategies` (the aggregate totals) is unchanged; this is
additive.

```json
"zone_strategies": [
  {
    "zone_id": string,
    "trips_after": { "baseline": number, "customer": number, "proximity": number }
  },
  ...
]
```
