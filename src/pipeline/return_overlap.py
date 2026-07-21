"""Apply the parameterized synthetic return-overlap assumption.

Return-delivery customer linkage isn't public data, so for every
zone/day we simulate how many of that zone's deliveries also have a
return picked up that day, by drawing from a binomial distribution at
the given overlap rate. This is the one variable in the whole pipeline
that is not observed — everything else (deliveries, locations, dates)
comes straight from the Kaggle dataset.
"""

import numpy as np
import pandas as pd

from src import config


def apply_return_overlap(
    clusters: pd.DataFrame,
    overlap_rate: float = config.CENTRAL_OVERLAP_RATE,
    seed: int = config.RANDOM_SEED,
) -> pd.DataFrame:
    rng = np.random.default_rng(seed)
    d = clusters.copy()
    d["returns_simulated"] = rng.binomial(d["deliveries"].to_numpy(), overlap_rate)
    return d
