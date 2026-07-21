import { SegmentedControl } from "./SegmentedControl";
import { formatCount } from "@/lib/format";
import type { CustomerLinkSensitivityPoint, OverlapSensitivityPoint } from "@/lib/types";

interface SensitivityControlsProps {
  overlapSensitivity: OverlapSensitivityPoint[];
  customerLinkSensitivity: CustomerLinkSensitivityPoint[];
  overlapRate: number;
  onOverlapRateChange: (rate: number) => void;
  customerLinkRate: number;
  onCustomerLinkRateChange: (rate: number) => void;
}

export function SensitivityControls({
  overlapSensitivity,
  customerLinkSensitivity,
  overlapRate,
  onOverlapRateChange,
  customerLinkRate,
  onCustomerLinkRateChange,
}: SensitivityControlsProps) {
  const overlapPoint = overlapSensitivity.find((p) => p.overlap_rate === overlapRate);
  const customerLinkPoint = customerLinkSensitivity.find(
    (p) => p.customer_link_rate === customerLinkRate,
  );

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <div className="rounded-xl border border-panel-border bg-panel p-5">
        <p className="mb-1 font-[family-name:var(--font-body)] text-sm font-medium text-foreground">
          Return-overlap rate
        </p>
        <p className="mb-4 font-[family-name:var(--font-body)] text-xs text-foreground-muted">
          Assumption: what share of a zone&apos;s deliveries also have a
          return that day. Drives the <em>same-area merge</em> strategy.
        </p>
        <SegmentedControl
          ariaLabel="Return-overlap rate"
          value={String(overlapRate)}
          onChange={(v) => onOverlapRateChange(Number(v))}
          options={overlapSensitivity.map((p) => ({
            value: String(p.overlap_rate),
            label: `${Math.round(p.overlap_rate * 100)}%`,
          }))}
        />
        {overlapPoint && (
          <p className="mt-4 font-[family-name:var(--font-data)] text-lg text-accent-route">
            {formatCount(overlapPoint.trips_saved)} routes saved
          </p>
        )}
      </div>

      <div className="rounded-xl border border-panel-border bg-panel p-5">
        <p className="mb-1 font-[family-name:var(--font-body)] text-sm font-medium text-foreground">
          Same-customer link rate
        </p>
        <p className="mb-4 font-[family-name:var(--font-body)] text-xs text-foreground-muted">
          Assumption: what share of same-area delivery/return pairs also
          share a customer. Drives the <em>same-customer merge</em>{" "}
          strategy.
        </p>
        <SegmentedControl
          ariaLabel="Same-customer link rate"
          value={String(customerLinkRate)}
          onChange={(v) => onCustomerLinkRateChange(Number(v))}
          options={customerLinkSensitivity.map((p) => ({
            value: String(p.customer_link_rate),
            label: `${Math.round(p.customer_link_rate * 100)}%`,
          }))}
        />
        {customerLinkPoint && (
          <p className="mt-4 font-[family-name:var(--font-data)] text-lg text-accent-route">
            {formatCount(customerLinkPoint.trips_saved)} routes saved
          </p>
        )}
      </div>
    </div>
  );
}
