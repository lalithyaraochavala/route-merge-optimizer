"use client";

import { useMemo } from "react";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import worldTopology from "world-atlas/countries-110m.json";
import type { StrategyName } from "@/lib/types";
import type { ZoneRollup } from "@/lib/zoneRollup";

interface MapViewProps {
  zones: ZoneRollup[];
  selectedStrategy: StrategyName;
}

const MIN_RADIUS = 2;
const MAX_RADIUS = 14;

function sqrtScale(value: number, max: number): number {
  if (max <= 0) return MIN_RADIUS;
  return MIN_RADIUS + (MAX_RADIUS - MIN_RADIUS) * Math.sqrt(value / max);
}

export function MapView({ zones, selectedStrategy }: MapViewProps) {
  const maxTripsAfter = useMemo(
    () => Math.max(1, ...zones.map((z) => z.trips_after[selectedStrategy])),
    [zones, selectedStrategy],
  );

  return (
    <section id="map" className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h2 className="mb-2 font-[family-name:var(--font-display)] text-xl font-bold text-foreground sm:text-2xl">
        Real order density, by zone
      </h2>
      <p className="mb-6 max-w-2xl font-[family-name:var(--font-body)] text-sm text-foreground-muted">
        Every marker is a real geo-cluster of delivery drop points. Marker
        size is how many routes that zone needs under the strategy selected
        below — switch strategies to see it shrink.
      </p>
      <div className="overflow-hidden rounded-xl border border-panel-border bg-panel">
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{ center: [82.5, 22.5], scale: 1000 }}
          width={800}
          height={720}
          style={{ width: "100%", height: "auto" }}
        >
          <Geographies geography={worldTopology}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="#1f2733"
                  stroke="#2a3241"
                  strokeWidth={0.5}
                  style={{
                    default: { outline: "none" },
                    hover: { outline: "none" },
                    pressed: { outline: "none" },
                  }}
                />
              ))
            }
          </Geographies>
          {zones.map((zone) => {
            const radius = sqrtScale(zone.trips_after[selectedStrategy], maxTripsAfter);
            return (
              <Marker key={zone.zone_id} coordinates={[zone.lng, zone.lat]}>
                <circle
                  r={radius}
                  fill="#45d6c4"
                  fillOpacity={0.55}
                  stroke="#45d6c4"
                  strokeWidth={0.5}
                >
                  <title>
                    {zone.zone_id}: {zone.deliveries} deliveries,{" "}
                    {zone.returns_simulated} simulated returns —{" "}
                    {zone.trips_after[selectedStrategy]} routes needed (
                    {selectedStrategy})
                  </title>
                </circle>
              </Marker>
            );
          })}
        </ComposableMap>
      </div>
    </section>
  );
}
