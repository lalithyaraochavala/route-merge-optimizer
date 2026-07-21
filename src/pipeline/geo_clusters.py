"""Compute real geo-clusters of order density by area/day."""

import pandas as pd

from src import config


def _slugify(area: str) -> str:
    return area.lower().replace(" ", "-").replace("/", "-")


def compute_clusters(df: pd.DataFrame, grid_size: float = config.GRID_SIZE_DEG) -> pd.DataFrame:
    d = df.copy()
    d["grid_lat"] = (d["Drop_Latitude"] / grid_size).round() * grid_size
    d["grid_lng"] = (d["Drop_Longitude"] / grid_size).round() * grid_size

    grouped = (
        d.groupby(["Area", "grid_lat", "grid_lng", "Order_Date"])
        .agg(
            lat=("Drop_Latitude", "mean"),
            lng=("Drop_Longitude", "mean"),
            deliveries=("Order_ID", "count"),
            avg_trip_distance_km=("trip_distance_km", "mean"),
        )
        .reset_index()
    )

    grouped["zone_id"] = (
        grouped["Area"].map(_slugify)
        + "-"
        + grouped["grid_lat"].round(1).astype(str)
        + "_"
        + grouped["grid_lng"].round(1).astype(str)
    )
    grouped["date"] = grouped["Order_Date"].dt.strftime("%Y-%m-%d")

    return grouped[
        ["zone_id", "Area", "lat", "lng", "deliveries", "avg_trip_distance_km", "date"]
    ].rename(columns={"Area": "area"})
