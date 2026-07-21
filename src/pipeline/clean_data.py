"""Load the raw Kaggle CSV and clean it into a well-typed DataFrame."""

import numpy as np
import pandas as pd

from src import config

STRIP_COLUMNS = ["Area", "Vehicle", "Traffic", "Weather", "Category"]
EARTH_RADIUS_KM = 6371.0


def haversine_km(lat1, lng1, lat2, lng2):
    lat1, lng1, lat2, lng2 = map(np.radians, [lat1, lng1, lat2, lng2])
    dlat = lat2 - lat1
    dlng = lng2 - lng1
    a = np.sin(dlat / 2) ** 2 + np.cos(lat1) * np.cos(lat2) * np.sin(dlng / 2) ** 2
    return 2 * EARTH_RADIUS_KM * np.arcsin(np.sqrt(a))


def load_and_clean(raw_path: str = config.RAW_DATA_PATH) -> pd.DataFrame:
    df = pd.read_csv(raw_path)

    for col in STRIP_COLUMNS:
        df[col] = df[col].astype(str).str.strip()
    # The raw file encodes missing Traffic/Weather as the literal string
    # "NaN" (with trailing whitespace, stripped above) rather than a blank
    # cell, so pandas doesn't parse it as a real null on read.
    df.loc[df["Traffic"].isin(["NaN", "nan"]), "Traffic"] = np.nan
    df.loc[df["Weather"].isin(["NaN", "nan"]), "Weather"] = np.nan

    df["Order_Date"] = pd.to_datetime(df["Order_Date"], format="%Y-%m-%d")

    lat_lo, lat_hi = config.INDIA_LAT_RANGE
    lng_lo, lng_hi = config.INDIA_LNG_RANGE
    valid_coords = (
        df["Store_Latitude"].between(lat_lo, lat_hi)
        & df["Store_Longitude"].between(lng_lo, lng_hi)
        & df["Drop_Latitude"].between(lat_lo, lat_hi)
        & df["Drop_Longitude"].between(lng_lo, lng_hi)
    )
    dropped = len(df) - int(valid_coords.sum())
    print(
        f"clean_data: dropping {dropped}/{len(df)} rows with invalid GPS "
        f"coordinates ({dropped / len(df) * 100:.1f}%)"
    )
    df = df[valid_coords].copy()

    df["trip_distance_km"] = haversine_km(
        df["Store_Latitude"],
        df["Store_Longitude"],
        df["Drop_Latitude"],
        df["Drop_Longitude"],
    )

    df = df.drop_duplicates(subset="Order_ID").reset_index(drop=True)
    return df
