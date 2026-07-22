"use client";

import { useMemo, useState, type MouseEvent } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from "react-simple-maps";
import worldTopology from "world-atlas/countries-110m.json";
import type { StrategyName } from "@/lib/types";
import type { ZoneRollup } from "@/lib/zoneRollup";

interface MapViewProps {
  zones: ZoneRollup[];
  selectedStrategy: StrategyName;
}

const MIN_RADIUS = 2;
const MAX_RADIUS = 14;
const MIN_INNER_RADIUS = 1;
const MAX_INNER_RADIUS = 8;

function sqrtScale(value: number, max: number, minR: number, maxR: number): number {
  if (max <= 0) return minR;
  return minR + (maxR - minR) * Math.sqrt(value / max);
}

interface Hovered {
  zone: ZoneRollup;
  x: number;
  y: number;
}

export function MapView({ zones, selectedStrategy }: MapViewProps) {
  const [hovered, setHovered] = useState<Hovered | null>(null);

  const maxTripsAfter = useMemo(
    () => Math.max(1, ...zones.map((z) => z.trips_after[selectedStrategy])),
    [zones, selectedStrategy],
  );
  const maxReturns = useMemo(
    () => Math.max(1, ...zones.map((z) => z.returns_simulated)),
    [zones],
  );

  // Round, easy-to-read reference values for the legend rather than the
  // raw max/min, which would produce awkward labels like "~13 routes."
  const legendTicks = useMemo(() => {
    const roundToNice = (n: number) => {
      if (n <= 10) return Math.max(5, Math.round(n / 5) * 5);
      if (n <= 50) return Math.round(n / 10) * 10;
      return Math.round(n / 25) * 25;
    };
    const high = roundToNice(maxTripsAfter);
    const low = roundToNice(Math.max(1, Math.round(high / 4)));
    return [low, high];
  }, [maxTripsAfter]);

  function handleMarkerMove(zone: ZoneRollup, e: MouseEvent<SVGCircleElement>) {
    const container = e.currentTarget.closest("[data-map-container]") as HTMLElement | null;
    const rect = container?.getBoundingClientRect();
    if (!rect) return;
    setHovered({ zone, x: e.clientX - rect.left, y: e.clientY - rect.top });
  }

  return (
    <section id="map" className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h2 className="mb-2 font-[family-name:var(--font-display)] text-xl font-bold text-foreground sm:text-2xl">
        Real order density, by zone
      </h2>
      <p className="mb-6 max-w-2xl font-[family-name:var(--font-body)] text-sm text-foreground-muted">
        Every marker is a real geo-cluster of delivery drop points. Outer
        (teal) size is routes needed under the strategy selected below —
        switch strategies to see it shrink. Inner (amber) size is simulated
        return volume. Scroll to zoom, drag to pan, hover a marker for
        details.
      </p>

      <div
        data-map-container
        className="relative h-[420px] overflow-hidden rounded-xl border border-panel-border bg-[#0d1015] sm:h-[480px] md:h-[560px]"
        onMouseLeave={() => setHovered(null)}
      >
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{ center: [82.5, 22.5], scale: 1000 }}
          width={800}
          height={800}
          style={{ width: "100%", height: "100%" }}
        >
          <ZoomableGroup center={[82.5, 22.5]} zoom={1} minZoom={1} maxZoom={6}>
            <Geographies geography={worldTopology}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const isIndia = geo.properties.name === "India";
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={isIndia ? "#26313f" : "#171d26"}
                      stroke={isIndia ? "#3d4c60" : "#232b38"}
                      strokeWidth={isIndia ? 0.75 : 0.5}
                      style={{
                        default: { outline: "none" },
                        hover: { outline: "none" },
                        pressed: { outline: "none" },
                      }}
                    />
                  );
                })
              }
            </Geographies>
            {zones.map((zone) => {
              const outerRadius = sqrtScale(
                zone.trips_after[selectedStrategy],
                maxTripsAfter,
                MIN_RADIUS,
                MAX_RADIUS,
              );
              const innerRadius = Math.min(
                outerRadius - 0.5,
                sqrtScale(zone.returns_simulated, maxReturns, MIN_INNER_RADIUS, MAX_INNER_RADIUS),
              );
              return (
                <Marker key={zone.zone_id} coordinates={[zone.lng, zone.lat]}>
                  <circle
                    r={outerRadius}
                    fill="#45d6c4"
                    fillOpacity={0.4}
                    stroke="#45d6c4"
                    strokeWidth={0.5}
                    onMouseMove={(e) => handleMarkerMove(zone, e)}
                    onMouseLeave={() => setHovered(null)}
                  />
                  {innerRadius > 0 && (
                    <circle
                      r={innerRadius}
                      fill="#f5a623"
                      fillOpacity={0.85}
                      pointerEvents="none"
                    />
                  )}
                </Marker>
              );
            })}
          </ZoomableGroup>
        </ComposableMap>

        {hovered && (
          <div
            className="pointer-events-none absolute z-10 max-w-[240px] rounded-lg border border-panel-border bg-panel px-3 py-2 shadow-lg"
            style={{ left: hovered.x + 14, top: hovered.y + 14 }}
          >
            <p className="font-[family-name:var(--font-display)] text-sm font-semibold text-foreground">
              {hovered.zone.zone_id}
            </p>
            <p className="mt-1 font-[family-name:var(--font-data)] text-xs text-foreground-muted">
              {hovered.zone.deliveries} real deliveries
            </p>
            <p className="font-[family-name:var(--font-data)] text-xs text-accent-save">
              {hovered.zone.returns_simulated} simulated returns
            </p>
            <p className="mt-1 font-[family-name:var(--font-data)] text-xs text-accent-route">
              {hovered.zone.trips_after[selectedStrategy]} routes needed (
              {selectedStrategy})
            </p>
          </div>
        )}

        <div className="pointer-events-none absolute bottom-3 left-3 flex items-end gap-4 rounded-lg border border-panel-border bg-panel/90 px-3 py-2 backdrop-blur">
          {legendTicks.map((tick) => {
            const r = sqrtScale(tick, maxTripsAfter, MIN_RADIUS, MAX_RADIUS);
            return (
              <div key={tick} className="flex flex-col items-center gap-1">
                <svg width={MAX_RADIUS * 2 + 4} height={MAX_RADIUS * 2 + 4}>
                  <circle
                    cx={MAX_RADIUS + 2}
                    cy={MAX_RADIUS + 2}
                    r={r}
                    fill="#45d6c4"
                    fillOpacity={0.4}
                    stroke="#45d6c4"
                    strokeWidth={0.5}
                  />
                </svg>
                <span className="font-[family-name:var(--font-data)] text-[10px] text-foreground-muted">
                  ~{tick} routes
                </span>
              </div>
            );
          })}
          <div className="flex flex-col items-center gap-1">
            <svg width={MAX_RADIUS * 2 + 4} height={MAX_RADIUS * 2 + 4}>
              <circle
                cx={MAX_RADIUS + 2}
                cy={MAX_RADIUS + 2}
                r={MAX_INNER_RADIUS * 0.7}
                fill="#f5a623"
                fillOpacity={0.85}
              />
            </svg>
            <span className="font-[family-name:var(--font-data)] text-[10px] text-foreground-muted">
              returns
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
