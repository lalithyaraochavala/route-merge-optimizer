export function formatInr(value: number): string {
  return `₹${Math.round(value).toLocaleString("en-IN")}`;
}

export function formatKm(value: number): string {
  return `${Math.round(value).toLocaleString("en-IN")} km`;
}

export function formatCount(value: number): string {
  return value.toLocaleString("en-IN");
}

export function formatPercent(rate: number): string {
  return `${Math.round(rate * 100)}%`;
}
