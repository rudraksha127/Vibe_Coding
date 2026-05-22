import type { CSSProperties } from "react";

type MetricRingProps = {
  value: number;
  label: string;
};

export function MetricRing({ value, label }: MetricRingProps) {
  const angle = Math.max(0, Math.min(100, value)) * 3.6;

  const style = { "--angle": `${angle}deg` } as CSSProperties & Record<"--angle", string>;

  return (
    <div className="metric-ring" style={style}>
      <div>
        <strong>{value}</strong>
        <span>{label}</span>
      </div>
    </div>
  );
}
