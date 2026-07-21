"""Two independent one-dimensional sensitivity sweeps (not a 2D grid):

- overlap_rate, holding CUSTOMER_LINK_RATE at its default, against the
  `proximity` (same-area merge) strategy — the flagship, highest-opportunity
  strategy.
- customer_link_rate, holding overlap_rate at its default
  (CENTRAL_OVERLAP_RATE), against the `customer` (same-customer merge)
  strategy — closes the same transparency gap for that strategy's one
  unobserved assumption.
"""

import pandas as pd

from src import config
from src.pipeline.return_overlap import apply_return_overlap
from src.pipeline.simulate_strategies import simulate_strategies


def compute_sensitivity(clusters: pd.DataFrame) -> list[dict]:
    rows = []
    for rate in config.SENSITIVITY_OVERLAP_RATES:
        with_returns = apply_return_overlap(clusters, overlap_rate=rate)
        strategies = simulate_strategies(with_returns)
        proximity = strategies["proximity"]
        trips_saved = proximity["trips_before"] - proximity["trips_after"]
        rows.append({"overlap_rate": rate, "trips_saved": trips_saved})
    return rows


def compute_customer_link_sensitivity(clusters: pd.DataFrame) -> list[dict]:
    with_returns = apply_return_overlap(clusters, overlap_rate=config.CENTRAL_OVERLAP_RATE)
    rows = []
    for rate in config.CUSTOMER_LINK_SENSITIVITY_RATES:
        strategies = simulate_strategies(with_returns, customer_link_rate=rate)
        customer = strategies["customer"]
        trips_saved = customer["trips_before"] - customer["trips_after"]
        rows.append({"customer_link_rate": rate, "trips_saved": trips_saved})
    return rows
