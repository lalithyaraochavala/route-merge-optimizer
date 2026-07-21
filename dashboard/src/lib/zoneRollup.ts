import type { Cluster, StrategyName, ZoneStrategy } from "./types";

export interface ZoneRollup {
  zone_id: string;
  lat: number;
  lng: number;
  deliveries: number;
  returns_simulated: number;
  trips_after: Record<StrategyName, number>;
}

// Aggregates clusters.json's per zone/day rows into one point per zone_id
// (same grouping the pipeline uses for zone_strategies), then joins in the
// per-strategy trips_after figures so the map can react to the strategy
// toggle.
export function rollupZones(
  clusters: Cluster[],
  zoneStrategies: ZoneStrategy[],
): ZoneRollup[] {
  const byZone = new Map<
    string,
    { lat: number; lng: number; deliveries: number; returns_simulated: number }
  >();

  for (const c of clusters) {
    const existing = byZone.get(c.zone_id);
    if (existing) {
      existing.deliveries += c.deliveries;
      existing.returns_simulated += c.returns_simulated;
    } else {
      byZone.set(c.zone_id, {
        lat: c.lat,
        lng: c.lng,
        deliveries: c.deliveries,
        returns_simulated: c.returns_simulated,
      });
    }
  }

  const tripsAfterByZone = new Map(zoneStrategies.map((z) => [z.zone_id, z.trips_after]));

  return Array.from(byZone.entries())
    .map(([zone_id, agg]) => {
      const trips_after = tripsAfterByZone.get(zone_id);
      if (!trips_after) return null;
      return { zone_id, ...agg, trips_after };
    })
    .filter((z): z is ZoneRollup => z !== null);
}
