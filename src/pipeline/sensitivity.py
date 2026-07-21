"""Sweep the return-overlap assumption across a range and report how
trips-saved under the `proximity` (same-area merge) strategy — the
flagship, highest-opportunity strategy — moves in response.
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
