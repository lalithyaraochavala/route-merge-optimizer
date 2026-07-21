"""Simulate three dispatch strategies over the zone/day clusters.

For each zone/day, D deliveries and R simulated returns start out as
D + R independent trips (the `baseline` strategy: no merging at all).

- `proximity` (same-area merge): any delivery and any return sharing a
  zone and day can be combined into one trip, regardless of customer.
  Up to min(D, R) pairs can merge.
- `customer` (same-customer merge): a stricter subset of the proximity
  opportunities — only pairs that also happen to belong to the same
  customer (config.CUSTOMER_LINK_RATE of the proximity-mergeable pairs).

Each merge removes exactly one trip. Cost/distance saved per merge is
derived from that zone/day's real average trip distance and the cost
model in config.py.
"""

import pandas as pd

from src import config


def _cost_and_distance_per_merge(avg_trip_distance_km: pd.Series):
    detour = config.MERGE_DETOUR_FACTOR
    distance_saved = avg_trip_distance_km * (2 - detour)
    cost_saved = config.FIXED_COST_PER_TRIP_INR + config.COST_PER_KM_INR * distance_saved
    return cost_saved, distance_saved


def simulate_strategies(clusters_with_returns: pd.DataFrame) -> dict:
    d = clusters_with_returns.copy()
    D = d["deliveries"]
    R = d["returns_simulated"]

    d["trips_before"] = D + R
    proximity_mergeable = pd.concat([D, R], axis=1).min(axis=1)
    customer_mergeable = (proximity_mergeable * config.CUSTOMER_LINK_RATE).round().astype(int)

    per_merge_cost, per_merge_distance = _cost_and_distance_per_merge(d["avg_trip_distance_km"])

    strategies = {}
    mergeable_by_strategy = {
        "baseline": pd.Series(0, index=d.index),
        "customer": customer_mergeable,
        "proximity": proximity_mergeable,
    }
    for name, mergeable in mergeable_by_strategy.items():
        trips_after = d["trips_before"] - mergeable
        strategies[name] = {
            "trips_before": int(d["trips_before"].sum()),
            "trips_after": int(trips_after.sum()),
            "cost_saved": round(float((mergeable * per_merge_cost).sum()), 2),
            "distance_saved_km": round(float((mergeable * per_merge_distance).sum()), 1),
        }

    return strategies
