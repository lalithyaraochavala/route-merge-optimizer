"""Single entrypoint: clean -> cluster -> simulate -> export.

Run with: python -m src.run_pipeline
"""

from src import config
from src.pipeline.clean_data import load_and_clean
from src.pipeline.export_json import export_clusters, export_results
from src.pipeline.geo_clusters import compute_clusters
from src.pipeline.return_overlap import apply_return_overlap
from src.pipeline.sensitivity import compute_customer_link_sensitivity, compute_sensitivity
from src.pipeline.simulate_strategies import compute_zone_strategy_breakdown, simulate_strategies


def main():
    df = load_and_clean()
    print(f"cleaned rows: {len(df)}")

    clusters = compute_clusters(df)
    print(f"zone/day clusters: {len(clusters)}")

    clusters_with_returns = apply_return_overlap(clusters)
    export_clusters(clusters_with_returns)
    print(f"wrote {config.CLUSTERS_OUTPUT_PATH}")

    strategies = simulate_strategies(clusters_with_returns)
    sensitivity = compute_sensitivity(clusters)
    customer_link_sensitivity = compute_customer_link_sensitivity(clusters)
    zone_strategies = compute_zone_strategy_breakdown(clusters_with_returns)
    export_results(strategies, sensitivity, customer_link_sensitivity, zone_strategies)
    print(f"wrote {config.RESULTS_OUTPUT_PATH}")
    print(f"  zone_strategies rows: {len(zone_strategies)}")

    for name, s in strategies.items():
        saved = s["trips_before"] - s["trips_after"]
        print(
            f"  {name}: trips {s['trips_before']} -> {s['trips_after']} "
            f"(-{saved}), cost_saved=₹{s['cost_saved']:,.0f}, "
            f"distance_saved={s['distance_saved_km']:,.0f}km"
        )


if __name__ == "__main__":
    main()
