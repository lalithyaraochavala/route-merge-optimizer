export interface Cluster {
  zone_id: string;
  lat: number;
  lng: number;
  deliveries: number;
  returns_simulated: number;
  date: string;
}

export type StrategyName = "baseline" | "customer" | "proximity";

export interface StrategyResult {
  trips_before: number;
  trips_after: number;
  cost_saved: number;
  distance_saved_km: number;
}

export interface OverlapSensitivityPoint {
  overlap_rate: number;
  trips_saved: number;
}

export interface CustomerLinkSensitivityPoint {
  customer_link_rate: number;
  trips_saved: number;
}

export interface ZoneStrategy {
  zone_id: string;
  trips_after: Record<StrategyName, number>;
}

export interface Results {
  strategies: Record<StrategyName, StrategyResult>;
  sensitivity: OverlapSensitivityPoint[];
  customer_link_sensitivity: CustomerLinkSensitivityPoint[];
  zone_strategies: ZoneStrategy[];
  generated_at: string;
  data_source_note: string;
}
