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
# "same-customer" merge opportunity set. Equally unobserved as overlap_rate
# above, so it gets the same sensitivity-sweep treatment (see
# CUSTOMER_LINK_SENSITIVITY_RATES) rather than sitting as a silent constant
# behind the "customer" strategy's headline number.
CUSTOMER_LINK_RATE = 0.5
CUSTOMER_LINK_SENSITIVITY_RATES = [0.3, 0.5, 0.7]

# --- Route batching ---
# Carriers already batch same-zone/day deliveries into multi-stop routes
# rather than dispatching one vehicle per delivery. A route holds up to
# this many stops. Returns are dispatched as their own batched route(s) at
# baseline; the merge strategies instead slot returns into unused capacity
# on the delivery routes already going to that zone.
ROUTE_CAPACITY = 10

# --- Cost model ---
# Fixed dispatch overhead per route (rider time, handling), INR.
FIXED_COST_PER_TRIP_INR = 35.0
# Variable cost per km driven, INR.
COST_PER_KM_INR = 6.0

RANDOM_SEED = 42

RAW_DATA_PATH = "data/raw/amazon_delivery.csv"
CLUSTERS_OUTPUT_PATH = "dashboard/public/data/clusters.json"
RESULTS_OUTPUT_PATH = "dashboard/public/data/results.json"

DATA_SOURCE_NOTE = (
    "Delivery locations and volumes are real (Kaggle Amazon Delivery Dataset, "
    "sujalsuthar/amazon-delivery-dataset). Return linkage is a labeled "
    "assumption, not observed data."
)
