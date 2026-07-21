"""Tunable assumptions for the pipeline. Every number here that isn't
derived from the raw Kaggle data is a labeled assumption, not a fact —
see the README methodology section for the reasoning behind each one.
"""

# Real delivery coordinates in the dataset that fall outside this box are
# GPS artifacts (a known issue in this dataset: some rows have store
# coordinates truncated to 0.0, 0.0) and are dropped during cleaning.
INDIA_LAT_RANGE = (6.0, 38.0)
INDIA_LNG_RANGE = (68.0, 98.0)

# Degrees per geo-cluster grid cell (~22km at this latitude). Deliveries
# are binned into cells by drop location, then grouped by (area, cell, date)
# to form the real, data-derived "zones" used throughout the pipeline.
GRID_SIZE_DEG = 0.2

# --- Synthetic return-overlap layer (the one assumption doc 05 flags as
# not observed in the data: which customers also have a return that day) ---

# Central assumption used for clusters.json and the headline strategy
# numbers in results.json. The sensitivity sweep below shows how far the
# results move if this assumption is wrong.
CENTRAL_OVERLAP_RATE = 0.25
SENSITIVITY_OVERLAP_RATES = [0.15, 0.25, 0.35]

# Of the delivery/return pairs that share a zone and day (proximity-mergeable),
# only some plausibly belong to the *same customer* (a stricter condition).
# This fraction converts "same-area" merge opportunities into the smaller
# "same-customer" merge opportunity set.
CUSTOMER_LINK_RATE = 0.5

# --- Cost model ---
# Fixed dispatch overhead per independent trip (rider time, handling), INR.
FIXED_COST_PER_TRIP_INR = 35.0
# Variable cost per km driven, INR.
COST_PER_KM_INR = 6.0
# A merged 2-stop trip travels more than a 1-stop trip but less than two
# separate trips combined. 1.3 means the merged trip's distance is 130% of
# a single-stop trip's distance (i.e. a 30% detour to add the second stop).
MERGE_DETOUR_FACTOR = 1.3

RANDOM_SEED = 42

RAW_DATA_PATH = "data/raw/amazon_delivery.csv"
CLUSTERS_OUTPUT_PATH = "dashboard/public/data/clusters.json"
RESULTS_OUTPUT_PATH = "dashboard/public/data/results.json"

DATA_SOURCE_NOTE = (
    "Delivery locations and volumes are real (Kaggle Amazon Delivery Dataset, "
    "sujalsuthar/amazon-delivery-dataset). Return linkage is a labeled "
    "assumption, not observed data."
)
