import { SegmentedControl } from "./SegmentedControl";
import type { StrategyName } from "@/lib/types";

const OPTIONS: { value: StrategyName; label: string }[] = [
  { value: "baseline", label: "Baseline (no merge)" },
  { value: "customer", label: "Same-customer merge" },
  { value: "proximity", label: "Same-area merge" },
];

interface StrategyToggleProps {
  value: StrategyName;
  onChange: (value: StrategyName) => void;
}

export function StrategyToggle({ value, onChange }: StrategyToggleProps) {
  return (
    <SegmentedControl
      options={OPTIONS}
      value={value}
      onChange={onChange}
      ariaLabel="Dispatch strategy"
    />
  );
}
