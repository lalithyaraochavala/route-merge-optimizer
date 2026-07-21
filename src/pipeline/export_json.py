"""Write clusters.json and results.json.

results.json follows doc 05's schema with one deliberate addition:
`customer_link_sensitivity`, a second one-dimensional sweep alongside the
originally-specified `sensitivity` array. See the README methodology
section for why.
"""

import json
from datetime import datetime, timezone

import pandas as pd

from src import config


def export_clusters(clusters_with_returns: pd.DataFrame, path: str = config.CLUSTERS_OUTPUT_PATH):
    records = clusters_with_returns[
        ["zone_id", "lat", "lng", "deliveries", "returns_simulated", "date"]
    ].copy()
    records["lat"] = records["lat"].round(6)
    records["lng"] = records["lng"].round(6)
    records["deliveries"] = records["deliveries"].astype(int)
    records["returns_simulated"] = records["returns_simulated"].astype(int)

    with open(path, "w") as f:
        json.dump(records.to_dict(orient="records"), f, indent=2)


def export_results(
    strategies: dict,
    sensitivity: list[dict],
    customer_link_sensitivity: list[dict],
    path: str = config.RESULTS_OUTPUT_PATH,
):
    payload = {
        "strategies": strategies,
        "sensitivity": sensitivity,
        "customer_link_sensitivity": customer_link_sensitivity,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "data_source_note": config.DATA_SOURCE_NOTE,
    }
    with open(path, "w") as f:
        json.dump(payload, f, indent=2)
