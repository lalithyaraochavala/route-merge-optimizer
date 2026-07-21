"use client";

import { useEffect, useState } from "react";
import type { Cluster, Results } from "./types";

type DashboardData =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; clusters: Cluster[]; results: Results };

export function useDashboardData(): DashboardData {
  const [data, setData] = useState<DashboardData>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [clustersRes, resultsRes] = await Promise.all([
          fetch("/data/clusters.json"),
          fetch("/data/results.json"),
        ]);
        if (!clustersRes.ok || !resultsRes.ok) {
          throw new Error("data fetch failed");
        }
        const [clusters, results] = await Promise.all([
          clustersRes.json() as Promise<Cluster[]>,
          resultsRes.json() as Promise<Results>,
        ]);
        if (!cancelled) {
          setData({ status: "ready", clusters, results });
        }
      } catch {
        if (!cancelled) {
          setData({ status: "error" });
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return data;
}
