interface StatDonutProps {
  value: number;
  total: number;
  label?: string;
  sublabel?: string;
  size?: number;
}

export const StatDonut = ({ value, total, label = 'Solved', sublabel, size = 140 }: StatDonutProps) => {
  const pct = total > 0 ? Math.min(1, value / total) : 0;
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - pct);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-2xl font-bold text-foreground">
          {value}
          <span className="text-sm text-muted-foreground font-normal">/{total}</span>
        </div>
        <div className="text-xs text-primary font-medium">{label}</div>
        {sublabel && <div className="text-[10px] text-muted-foreground mt-0.5">{sublabel}</div>}
      </div>
    </div>
  );
};
