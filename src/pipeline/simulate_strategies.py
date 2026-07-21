"""Simulate three dispatch strategies over the zone/day clusters.

Carriers already batch same-zone/day deliveries into multi-stop routes of
up to `config.ROUTE_CAPACITY` stops — that batching is not the thing under
test. What's dispatched separately today is the *return* pickups: at
baseline, a zone/day's R simulated returns are batched into their own
route(s), on top of the delivery route(s) already going there.

For each zone/day:
    delivery_routes = ceil(D / ROUTE_CAPACITY)
    return_routes   = ceil(R / ROUTE_CAPACITY)   (baseline, dispatched separately)
    trips_before     = delivery_routes + return_routes

The merge strategies instead slot returns into whatever unused capacity
("slack") is left on the delivery routes already being dispatched, so
fewer (or zero) separate return routes are needed:

- `proximity` (same-area merge): any return sharing a zone and day can
  fill slack on the delivery routes there, regardless of customer.
- `customer` (same-customer merge): a stricter subset of that slack —
  each proximity-mergeable pair independently has a `customer_link_rate`
  chance of also sharing a customer, since not every return in the zone
  belongs to a customer who also received a delivery there that day.

Because route counts are quantized (a route is only actually avoided once
a zone/day's returns fully clear via `ceil`), applying `customer_link_rate`
as a deterministic round() on every row makes whole cohorts of low-volume
zone/days flip in lockstep at whatever rate crosses their rounding
threshold — most visibly the ~23% of zone/days with exactly one simulated
return, which either all clear or all don't depending on which side of 0.5
`round(1 * customer_link_rate)` lands on. That produces a sharp,
misleading step in the customer_link_rate sensitivity sweep rather than a
trend that reflects the assumption. Instead, each proximity-mergeable pair
is resolved independently via a seeded binomial draw, so the sweep moves
smoothly in aggregate across ~3,000+ zone/days instead of jumping when one
large cohort crosses a rounding boundary together.

Only whole return routes actually avoided count as trips saved; cost and
distance saved are valued at that zone/day's real average trip distance,
per route avoided.
"""

import numpy as np
import pandas as pd

from src import config


def _cost_and_distance_per_route(avg_trip_distance_km: pd.Series):
    cost = config.FIXED_COST_PER_TRIP_INR + config.COST_PER_KM_INR * avg_trip_distance_km
    return cost, avg_trip_distance_km


def simulate_strategies(
    clusters_with_returns: pd.DataFrame,
    customer_link_rate: float = config.CUSTOMER_LINK_RATE,
    seed: int = config.RANDOM_SEED,
) -> dict:
    d = clusters_with_returns.copy()
    D = d["deliveries"]
    R = d["returns_simulated"]
    cap = config.ROUTE_CAPACITY

    delivery_routes = np.ceil(D / cap).astype(int)
    return_routes_baseline = np.ceil(R / cap).astype(int)
    d["trips_before"] = delivery_routes + return_routes_baseline

    slack = delivery_routes * cap - D
    proximity_mergeable = np.minimum(R, slack)
    rng = np.random.default_rng(seed)
    customer_mergeable = rng.binomial(proximity_mergeable.to_numpy(), customer_link_rate)

    per_route_cost, per_route_distance = _cost_and_distance_per_route(d["avg_trip_distance_km"])

    strategies = {}
    mergeable_by_strategy = {
        "baseline": pd.Series(0, index=d.index),
        "customer": customer_mergeable,
        "proximity": proximity_mergeable,
    }
    for name, mergeable in mergeable_by_strategy.items():
        remaining_returns = R - mergeable
        return_routes_after = np.ceil(remaining_returns / cap).astype(int)
        trips_after = delivery_routes + return_routes_after
        trips_saved = d["trips_before"] - trips_after

        strategies[name] = {
            "trips_before": int(d["trips_before"].sum()),
            "trips_after": int(trips_after.sum()),
            "cost_saved": round(float((trips_saved * per_route_cost).sum()), 2),
            "distance_saved_km": round(float((trips_saved * per_route_distance).sum()), 1),
        }

    return strategies
